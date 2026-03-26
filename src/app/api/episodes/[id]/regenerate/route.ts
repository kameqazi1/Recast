import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { contentOutputs, voiceProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getEpisodeById } from "@/lib/queries";
import { checkLLMUsage, incrementLLMUsage } from "@/lib/usage-guard";
import { generateContent, type ContentFormat } from "@/lib/llm";

const VALID_FORMATS: ContentFormat[] = [
  "blog_post",
  "tweet_thread",
  "show_notes",
  "newsletter",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { format, voiceProfileId } = body as {
    format: string;
    voiceProfileId?: string;
  };

  if (!format || !VALID_FORMATS.includes(format as ContentFormat)) {
    return Response.json(
      { error: `Invalid format. Must be one of: ${VALID_FORMATS.join(", ")}` },
      { status: 400 }
    );
  }

  const episode = await getEpisodeById(id, userId);
  if (!episode) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  if (!episode.transcriptText) {
    return Response.json(
      { error: "Episode has no transcript." },
      { status: 400 }
    );
  }

  // Check usage
  const llmCheck = await checkLLMUsage(userId);
  if (!llmCheck.allowed) {
    return Response.json(
      {
        error: `Free tier limit reached (${llmCheck.current}/${llmCheck.limit} generations this month).`,
      },
      { status: 429 }
    );
  }

  // Resolve voice profile
  let voice = { tone: null as string | null, exampleOutput: null as string | null, avoidWords: null as string | null };
  if (voiceProfileId) {
    const [profile] = await db
      .select()
      .from(voiceProfiles)
      .where(
        and(
          eq(voiceProfiles.id, voiceProfileId),
          eq(voiceProfiles.userId, userId)
        )
      )
      .limit(1);

    if (!profile) {
      return Response.json(
        { error: "Voice profile not found" },
        { status: 404 }
      );
    }
    voice = {
      tone: profile.tone,
      exampleOutput: profile.exampleOutput,
      avoidWords: profile.avoidWords,
    };
  }

  // Find existing content output row for this format
  const existing = await db
    .select()
    .from(contentOutputs)
    .where(eq(contentOutputs.episodeId, id))
    .then((rows) => rows.find((r) => r.format === format));

  const outputId = existing?.id;

  if (outputId) {
    // Mark as regenerating
    await db
      .update(contentOutputs)
      .set({
        status: "generating",
        voiceProfileId: voiceProfileId || existing.voiceProfileId,
        updatedAt: new Date(),
      })
      .where(eq(contentOutputs.id, outputId));
  }

  // Generate in background
  (async () => {
    try {
      const result = await generateContent(
        episode.transcriptText!,
        format as ContentFormat,
        voice
      );

      if (outputId) {
        await db
          .update(contentOutputs)
          .set({
            content: result.content,
            wordCount: result.wordCount,
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(contentOutputs.id, outputId));
      } else {
        await db.insert(contentOutputs).values({
          episodeId: id,
          userId,
          format: format as ContentFormat,
          content: result.content,
          wordCount: result.wordCount,
          voiceProfileId: voiceProfileId || null,
          status: "completed",
        });
      }

      await incrementLLMUsage(userId);
    } catch {
      if (outputId) {
        await db
          .update(contentOutputs)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(contentOutputs.id, outputId));
      }
    }
  })();

  return Response.json({ success: true, message: "Regeneration started" });
}
