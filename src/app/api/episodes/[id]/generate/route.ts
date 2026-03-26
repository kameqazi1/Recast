import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEpisodeById, getOrCreateDefaultProfile } from "@/lib/queries";
import { checkLLMUsage, incrementLLMUsage } from "@/lib/usage-guard";
import { generateContent, type ContentFormat } from "@/lib/llm";

const FORMATS: ContentFormat[] = [
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
  const episode = await getEpisodeById(id, userId);

  if (!episode) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  if (!episode.transcriptText) {
    return Response.json(
      { error: "Episode has no transcript. Processing must complete first." },
      { status: 400 }
    );
  }

  // Check if already generating
  const existing = await db
    .select()
    .from(contentOutputs)
    .where(eq(contentOutputs.episodeId, id));

  const hasActive = existing.some(
    (o) => o.status === "pending" || o.status === "generating"
  );
  if (hasActive) {
    return Response.json(
      { error: "Content is already being generated for this episode." },
      { status: 409 }
    );
  }

  // Check per-user usage
  const llmCheck = await checkLLMUsage(userId);
  if (!llmCheck.allowed) {
    return Response.json(
      {
        error: `Free tier limit reached (${llmCheck.current}/${llmCheck.limit} generations this month).`,
      },
      { status: 429 }
    );
  }

  const voiceProfile = await getOrCreateDefaultProfile(userId);

  // Delete any previous outputs for this episode (regenerate all)
  if (existing.length > 0) {
    for (const output of existing) {
      await db
        .delete(contentOutputs)
        .where(eq(contentOutputs.id, output.id));
    }
  }

  // Create pending rows
  const insertedRows = await db
    .insert(contentOutputs)
    .values(
      FORMATS.map((format) => ({
        episodeId: id,
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

  // Generate in background (don't await — return immediately so UI can poll)
  (async () => {
    const results = await Promise.allSettled(
      FORMATS.map(async (format) => {
        const result = await generateContent(
          episode.transcriptText!,
          format,
          voice
        );
        return { format, ...result };
      })
    );

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
        const idx = results.indexOf(result);
        const format = FORMATS[idx];
        await db
          .update(contentOutputs)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(contentOutputs.id, rowByFormat[format]));
      }
    }
  })();

  return Response.json({ success: true, message: "Content generation started" });
}
