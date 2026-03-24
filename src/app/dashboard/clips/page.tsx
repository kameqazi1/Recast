import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clips, episodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Play } from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function ClipsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const allClips = await db
    .select({
      id: clips.id,
      title: clips.title,
      startTime: clips.startTime,
      endTime: clips.endTime,
      confidence: clips.confidence,
      createdAt: clips.createdAt,
      episodeTitle: episodes.title,
      episodeId: clips.episodeId,
    })
    .from(clips)
    .innerJoin(episodes, eq(clips.episodeId, episodes.id))
    .where(eq(clips.userId, userId))
    .orderBy(desc(clips.createdAt))
    .limit(100);

  return (
    <>
      <section className="mb-8">
        <span className="label-md text-primary mb-3 block">Library</span>
        <h2 className="font-display text-4xl font-black tracking-tighter text-text">
          All Clips
        </h2>
      </section>

      {allClips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allClips.map((clip) => (
            <div
              key={clip.id}
              className="bg-surface-low rounded-xl overflow-hidden border border-transparent hover:border-outline/20 transition-all group"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-surface-highest relative flex items-center justify-center">
                <Play size={32} className="text-primary/50 group-hover:text-primary transition-colors" />
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-text-muted">
                  {formatTime(clip.endTime - clip.startTime)}
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
                  {clip.title}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  From: {clip.episodeTitle}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-text-muted font-mono">
                    {formatTime(clip.startTime)} — {formatTime(clip.endTime)}
                  </span>
                  {clip.confidence && (
                    <span className="text-[10px] text-secondary font-bold">
                      {clip.confidence}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-low rounded-xl p-16 text-center">
          <p className="text-text-muted text-lg mb-2">No clips yet</p>
          <p className="text-text-muted text-sm">
            Clips are auto-detected when episodes finish processing
          </p>
        </div>
      )}
    </>
  );
}
