import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

  // TODO: Trigger Inngest processing pipeline here

  return Response.json({ episode: updated });
}
