import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { episodes, clips, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deepgram } from "@/lib/deepgram";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";
import {
  checkDeepgramUsage,
  checkInngestUsage,
  checkLLMUsage,
  incrementUsage,
  incrementLLMUsage,
} from "@/lib/usage-guard";
import { notifyAdmin } from "@/lib/notify";
import { generateContent, type ContentFormat } from "@/lib/llm";
import { getOrCreateDefaultProfile } from "@/lib/queries";

// Processing pipeline:
//
//  episode/process event
//       │
//       ▼
//  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐
//  │ check-usage  │───►│ get-signed  │───►│  transcribe  │
//  │              │    │    -url     │    │  (10min max)  │
//  └─────────────┘    └─────────────┘    └──────┬───────┘
//                                               │
//       ┌───────────────────────────────────────┘
//       ▼
//  ┌──────────────┐    ┌──────────────┐
//  │ save-         │───►│ detect-clips │
//  │ transcript   │    │  (5min max)  │
//  └──────────────┘    └──────┬───────┘
//                             │
//       ┌─────────────────────┘
//       ▼
//  ┌──────────────┐    ┌────────────────────────────────┐
//  │ save-clips   │───►│ generate-content (fan-out)     │
//  └──────────────┘    │  ├── blog_post    (90s max)    │
//                      │  ├── tweet_thread (60s max)    │
//                      │  ├── show_notes   (60s max)    │
//                      │  └── newsletter   (60s max)    │
//                      └────────────┬───────────────────┘
//                                   │
//                                   ▼
//                           ┌──────────────┐
//                           │ mark-complete │
//                           └──────────────┘

const CONTENT_FORMATS: ContentFormat[] = [
  "blog_post",
  "tweet_thread",
  "show_notes",
  "newsletter",
];

export const processEpisode = inngest.createFunction(
  {
    id: "process-episode",
    retries: 1,
    triggers: [{ event: "episode/process" }],
  },
  async ({ event, step }) => {
    const { episodeId, userId, fileUrl } = event.data;

    // Step 1: Pre-flight usage check
    await step.run("check-usage", async () => {
      const inngestCheck = await checkInngestUsage();
      if (!inngestCheck.allowed) {
        await notifyAdmin({
          subject: "Inngest Run Limit — Processing Blocked",
          message: `Episode processing was blocked because Inngest is near the free tier limit.`,
          details: {
            "Episode ID": episodeId,
            "Current runs": `${inngestCheck.current}`,
            Limit: `${inngestCheck.limit}`,
          },
        });
        throw new Error(
          `FREE_TIER_LIMIT: Inngest at ${inngestCheck.current}/${inngestCheck.limit} runs this month`
        );
      }
      await incrementUsage("inngestRuns", 1);
    });

    // Step 2: Generate a temporary signed URL for Deepgram to read the file
    const signedFileUrl = await step.run("get-signed-url", async () => {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileUrl,
      });
      return getSignedUrl(r2, command, { expiresIn: 3600 });
    });

    // Step 3: Transcribe with Deepgram (timeout: 10 minutes)
    const transcript = await step.run("transcribe", async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);

      try {
        const deepgramCheck = await checkDeepgramUsage(5);
        if (!deepgramCheck.allowed) {
          await db
            .update(episodes)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(episodes.id, episodeId));
          await notifyAdmin({
            subject: "Deepgram Minute Limit — Transcription Blocked",
            message: `Transcription for episode was blocked because Deepgram is near the free tier limit.`,
            details: {
              "Episode ID": episodeId,
              "Current minutes": `${deepgramCheck.current}`,
              Limit: `${deepgramCheck.limit}`,
            },
          });
          throw new Error(
            `FREE_TIER_LIMIT: Deepgram at ${deepgramCheck.current}/${deepgramCheck.limit} minutes this month`
          );
        }

        const response = await deepgram.listen.v1.media.transcribeUrl({
          url: signedFileUrl,
          model: "nova-2",
          smart_format: true,
          punctuate: true,
          diarize: true,
          paragraphs: true,
          utterances: true,
          detect_language: true,
        });

        const words =
          (response as any)?.results?.channels?.[0]?.alternatives?.[0]?.words;
        const durationSeconds = words?.slice(-1)?.[0]?.end || 0;
        const durationMinutes = Math.ceil(durationSeconds / 60);
        await incrementUsage("deepgramMinutes", durationMinutes);

        return {
          text:
            (response as any)?.results?.channels?.[0]?.alternatives?.[0]
              ?.transcript || "",
          duration: Math.round(durationSeconds),
          utterances: (response as any)?.results?.utterances || [],
        };
      } finally {
        clearTimeout(timeout);
      }
    });

    // Step 4: Update episode with transcript
    await step.run("save-transcript", async () => {
      await db
        .update(episodes)
        .set({
          transcriptText: transcript.text,
          duration: transcript.duration,
          updatedAt: new Date(),
        })
        .where(eq(episodes.id, episodeId));
    });

    // Step 5: Detect clips (timeout: 5 minutes)
    const detectedClips = await step.run("detect-clips", async () => {
      const utterances = transcript.utterances as Array<{
        start: number;
        end: number;
        transcript: string;
        confidence: number;
        speaker: number;
      }>;

      if (!utterances.length) return [];

      const candidates: Array<{
        title: string;
        startTime: number;
        endTime: number;
        confidence: number;
      }> = [];

      let clipStart = utterances[0].start;
      let clipText = "";
      let clipConfidence = 0;
      let utteranceCount = 0;

      for (const utt of utterances) {
        const clipDuration = utt.end - clipStart;

        if (
          clipDuration > 120 ||
          (clipDuration > 30 &&
            utt.start - (clipStart + clipText.length / 10) > 5)
        ) {
          if (clipDuration >= 15 && utteranceCount >= 2) {
            const title =
              clipText.slice(0, 60).trim() +
              (clipText.length > 60 ? "..." : "");
            candidates.push({
              title,
              startTime: Math.round(clipStart),
              endTime: Math.round(utt.start),
              confidence: Math.round((clipConfidence / utteranceCount) * 100),
            });
          }
          clipStart = utt.start;
          clipText = utt.transcript;
          clipConfidence = utt.confidence;
          utteranceCount = 1;
        } else {
          clipText += " " + utt.transcript;
          clipConfidence += utt.confidence;
          utteranceCount++;
        }
      }

      return candidates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    });

    // Step 6: Save clips to database
    await step.run("save-clips", async () => {
      if (detectedClips.length === 0) return;

      await db.insert(clips).values(
        detectedClips.map((clip) => ({
          episodeId,
          userId,
          title: clip.title,
          startTime: clip.startTime,
          endTime: clip.endTime,
          confidence: clip.confidence,
        }))
      );
    });

    // Step 7: Generate content (parallel fan-out for all 4 formats)
    await step.run("generate-content", async () => {
      if (!transcript.text) return;

      const llmCheck = await checkLLMUsage(userId);
      if (!llmCheck.allowed) return;

      const voiceProfile = await getOrCreateDefaultProfile(userId);

      // Create pending rows and capture their IDs keyed by format
      const insertedRows = await db
        .insert(contentOutputs)
        .values(
          CONTENT_FORMATS.map((format) => ({
            episodeId,
            userId,
            format,
            voiceProfileId: voiceProfile.id,
            status: "generating" as const,
          }))
        )
        .returning({ id: contentOutputs.id, format: contentOutputs.format });

      const rowByFormat = Object.fromEntries(
        insertedRows.map((r) => [r.format, r.id])
      );

      const voice = {
        tone: voiceProfile.tone,
        exampleOutput: voiceProfile.exampleOutput,
        avoidWords: voiceProfile.avoidWords,
      };

      // Generate all 4 formats in parallel
      const results = await Promise.allSettled(
        CONTENT_FORMATS.map(async (format) => {
          const result = await generateContent(transcript.text, format, voice);
          return { format, ...result };
        })
      );

      // Update each row based on result
      for (const result of results) {
        if (result.status === "fulfilled") {
          const { format, content, wordCount } = result.value;
          await db
            .update(contentOutputs)
            .set({
              content,
              wordCount,
              status: "completed",
              updatedAt: new Date(),
            })
            .where(eq(contentOutputs.id, rowByFormat[format]));
          await incrementLLMUsage(userId);
        } else {
          // Find the format from the promise index
          const idx = results.indexOf(result);
          const format = CONTENT_FORMATS[idx];
          await db
            .update(contentOutputs)
            .set({ status: "failed", updatedAt: new Date() })
            .where(eq(contentOutputs.id, rowByFormat[format]));
        }
      }
    });

    // Step 8: Mark episode as completed
    await step.run("mark-complete", async () => {
      await db
        .update(episodes)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(episodes.id, episodeId));
    });

    return {
      episodeId,
      transcriptLength: transcript.text.length,
      duration: transcript.duration,
      clipsDetected: detectedClips.length,
    };
  }
);
