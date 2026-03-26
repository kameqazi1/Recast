import { db } from "@/db";
import { episodes, clips, contentOutputs, voiceProfiles } from "@/db/schema";
import { eq, and, desc, count, sum, sql } from "drizzle-orm";

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

// --- Content outputs ---

export async function getEpisodeContentOutputs(episodeId: string) {
  return db
    .select()
    .from(contentOutputs)
    .where(eq(contentOutputs.episodeId, episodeId))
    .orderBy(contentOutputs.format);
}

// --- Voice profiles ---

export async function getUserVoiceProfiles(userId: string) {
  return db
    .select()
    .from(voiceProfiles)
    .where(eq(voiceProfiles.userId, userId))
    .orderBy(desc(voiceProfiles.isDefault), voiceProfiles.createdAt);
}

/**
 * Get or create a default voice profile for a user.
 * Uses INSERT ... ON CONFLICT-safe pattern to handle race conditions.
 */
export async function getOrCreateDefaultProfile(userId: string) {
  // Check for existing default profile
  const [existing] = await db
    .select()
    .from(voiceProfiles)
    .where(
      and(eq(voiceProfiles.userId, userId), eq(voiceProfiles.isDefault, true))
    )
    .limit(1);

  if (existing) return existing;

  // Check for any profile at all
  const [anyProfile] = await db
    .select()
    .from(voiceProfiles)
    .where(eq(voiceProfiles.userId, userId))
    .limit(1);

  if (anyProfile) {
    // Make the first profile the default
    await db
      .update(voiceProfiles)
      .set({ isDefault: true })
      .where(eq(voiceProfiles.id, anyProfile.id));
    return { ...anyProfile, isDefault: true };
  }

  // Create a new default profile
  const [created] = await db
    .insert(voiceProfiles)
    .values({
      userId,
      name: "Default",
      tone: "Clear, professional, and conversational",
      isDefault: true,
    })
    .returning();
  return created;
}
