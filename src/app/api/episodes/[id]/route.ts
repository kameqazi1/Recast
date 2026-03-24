import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch episode to get file key
  const [episode] = await db
    .select()
    .from(episodes)
    .where(and(eq(episodes.id, id), eq(episodes.userId, userId)))
    .limit(1);

  if (!episode) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  // Delete file from R2 if it exists
  if (episode.fileUrl) {
    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: episode.fileUrl,
        })
      );
    } catch {
      // File might already be deleted, continue
    }
  }

  // Delete episode (clips cascade via foreign key)
  await db
    .delete(episodes)
    .where(and(eq(episodes.id, id), eq(episodes.userId, userId)));

  return Response.json({ success: true });
}
