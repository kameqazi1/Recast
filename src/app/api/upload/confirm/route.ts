import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  incrementR2Storage,
  checkInngestUsage,
  checkDeepgramUsage,
} from "@/lib/usage-guard";
import { inngest } from "@/lib/inngest";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { episodeId, key, fileSize } = await req.json();

  if (!episodeId || !key) {
    return Response.json(
      { error: "episodeId and key are required" },
      { status: 400 }
    );
  }

  // Track R2 storage usage
  if (fileSize) {
    await incrementR2Storage(fileSize);
  }

  // Check if we can run the processing pipeline
  const inngestCheck = await checkInngestUsage();
  // Estimate ~1 minute per MB as rough audio duration guess
  const estimatedMinutes = Math.max(1, Math.ceil((fileSize || 0) / 1024 / 1024));
  const deepgramCheck = await checkDeepgramUsage(estimatedMinutes);

  if (!inngestCheck.allowed || !deepgramCheck.allowed) {
    // Save episode but don't start processing — needs approval
    const [updated] = await db
      .update(episodes)
      .set({
        fileUrl: key,
        fileSize: fileSize || null,
        status: "uploading", // stays in uploading, not processing
        updatedAt: new Date(),
      })
      .where(and(eq(episodes.id, episodeId), eq(episodes.userId, userId)))
      .returning();

    const blockedService = !inngestCheck.allowed ? "Inngest" : "Deepgram";
    const check = !inngestCheck.allowed ? inngestCheck : deepgramCheck;

    return Response.json({
      episode: updated,
      warning: {
        type: "free_tier_limit",
        service: blockedService,
        message: `${blockedService} free tier limit approaching (${check.current}/${check.limit} ${check.unit}). Processing paused — approve to continue.`,
        requiresApproval: true,
      },
    });
  }

  // All clear — update episode and trigger processing
  const [updated] = await db
    .update(episodes)
    .set({
      fileUrl: key,
      fileSize: fileSize || null,
      status: "processing",
      updatedAt: new Date(),
    })
    .where(and(eq(episodes.id, episodeId), eq(episodes.userId, userId)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  // Trigger Inngest processing pipeline
  await inngest.send({
    name: "episode/process",
    data: {
      episodeId: updated.id,
      userId,
      fileUrl: key,
    },
  });

  return Response.json({ episode: updated });
}
