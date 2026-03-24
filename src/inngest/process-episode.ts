import { inngest } from "@/lib/inngest";
import { db } from "@/db";
import { episodes, clips } from "@/db/schema";
import { eq } from "drizzle-orm";
import { deepgram } from "@/lib/deepgram";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";
import {
  checkDeepgramUsage,
  checkInngestUsage,
  incrementUsage,
} from "@/lib/usage-guard";
import { notifyAdmin } from "@/lib/notify";

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
            "Limit": `${inngestCheck.limit}`,
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

    // Step 3: Transcribe with Deepgram
    const transcript = await step.run("transcribe", async () => {
      // Estimate duration (will be refined after transcription)
      const deepgramCheck = await checkDeepgramUsage(5); // assume 5 min minimum
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
            "Limit": `${deepgramCheck.limit}`,
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

      // Track actual usage
      const words = (response as any)?.results?.channels?.[0]?.alternatives?.[0]?.words;
      const durationSeconds = words?.slice(-1)?.[0]?.end || 0;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      await incrementUsage("deepgramMinutes", durationMinutes);

      return {
        text:
          (response as any)?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "",
        duration: Math.round(durationSeconds),
        utterances: (response as any)?.results?.utterances || [],
      };
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

    // Step 5: Detect clips (simple heuristic — find long utterances with keywords)
    const detectedClips = await step.run("detect-clips", async () => {
      const utterances = transcript.utterances as Array<{
        start: number;
        end: number;
        transcript: string;
        confidence: number;
        speaker: number;
      }>;

      if (!utterances.length) return [];

      // Find high-confidence segments that are 15-120 seconds long
      const candidates: Array<{
        title: string;
        startTime: number;
        endTime: number;
        confidence: number;
      }> = [];

      // Group consecutive utterances into potential clips
      let clipStart = utterances[0].start;
      let clipText = "";
      let clipConfidence = 0;
      let utteranceCount = 0;

      for (const utt of utterances) {
        const clipDuration = utt.end - clipStart;

        if (clipDuration > 120 || (clipDuration > 30 && utt.start - (clipStart + clipText.length / 10) > 5)) {
          // Save current clip if long enough
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
          // Start new clip
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

      // Return top 5 by confidence
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

    // Step 7: Mark episode as completed
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
