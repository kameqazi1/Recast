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
import { notifyAdmin } from "@/lib/notify";

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
  const estimatedMinutes = Math.max(1, Math.ceil((fileSize || 0) / 1024 / 1024));
  const deepgramCheck = await checkDeepgramUsage(estimatedMinutes);

  if (!inngestCheck.allowed || !deepgramCheck.allowed) {
    // Save episode but don't start processing — email admin
    const [updated] = await db
      .update(episodes)
      .set({
        fileUrl: key,
        fileSize: fileSize || null,
        status: "uploading",
        updatedAt: new Date(),
      })
      .where(and(eq(episodes.id, episodeId), eq(episodes.userId, userId)))
      .returning();

    const blockedService = !inngestCheck.allowed ? inngestCheck : deepgramCheck;

    await notifyAdmin({
      subject: `${blockedService.service} Limit — Processing Paused`,
      message: `Episode "${updated?.title}" was uploaded but processing is paused because ${blockedService.service} is near the free tier limit.`,
      details: {
        "Episode": updated?.title || episodeId,
        "Episode ID": episodeId,
        "Service": blockedService.service,
        "Current usage": `${blockedService.current} ${blockedService.unit}`,
        "Free tier limit": `${blockedService.limit} ${blockedService.unit}`,
        "User ID": userId,
      },
    });

    return Response.json({
      episode: updated,
      message: "Upload complete. Processing will begin shortly.",
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
