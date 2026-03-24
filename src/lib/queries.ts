import { db } from "@/db";
import { episodes, clips } from "@/db/schema";
import { eq, desc, count, sum, sql } from "drizzle-orm";

export async function getDashboardStats(userId: string) {
  const [episodeCount] = await db
    .select({ count: count() })
    .from(episodes)
    .where(eq(episodes.userId, userId));

  const [clipCount] = await db
    .select({ count: count() })
    .from(clips)
    .where(eq(clips.userId, userId));

  const [minutesResult] = await db
    .select({ total: sum(episodes.duration) })
    .from(episodes)
    .where(eq(episodes.userId, userId));

  const [exportCount] = await db
    .select({ total: sum(clips.exported) })
    .from(clips)
    .where(eq(clips.userId, userId));

  const totalMinutes = Math.round(
    (Number(minutesResult?.total) || 0) / 60
  );

  return {
    totalEpisodes: episodeCount?.count || 0,
    clipsGenerated: clipCount?.count || 0,
    minutesTranscribed: totalMinutes,
    totalExports: Number(exportCount?.total) || 0,
  };
}

export async function getRecentEpisodes(userId: string, limit = 10) {
  return db
    .select()
    .from(episodes)
    .where(eq(episodes.userId, userId))
    .orderBy(desc(episodes.createdAt))
    .limit(limit);
}

export async function getEpisodeById(episodeId: string, userId: string) {
  const [episode] = await db
    .select()
    .from(episodes)
    .where(
      sql`${episodes.id} = ${episodeId} AND ${episodes.userId} = ${userId}`
    )
    .limit(1);
  return episode || null;
}

export async function getEpisodeClips(episodeId: string) {
  return db
    .select()
    .from(clips)
    .where(eq(clips.episodeId, episodeId))
    .orderBy(desc(clips.confidence));
}
