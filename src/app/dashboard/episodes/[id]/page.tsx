import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getEpisodeById, getEpisodeClips } from "@/lib/queries";
import { EpisodeDetailClient } from "./episode-detail-client";

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const [episode, clips] = await Promise.all([
    getEpisodeById(id, userId),
    getEpisodeClips(id),
  ]);

  if (!episode) notFound();

  return (
    <EpisodeDetailClient
      episode={{
        id: episode.id,
        title: episode.title,
        description: episode.description,
        duration: episode.duration || 0,
        status: episode.status,
        fileSize: episode.fileSize,
        transcriptText: episode.transcriptText,
        createdAt: episode.createdAt.toISOString(),
      }}
      clips={clips.map((c) => ({
        id: c.id,
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        confidence: c.confidence,
      }))}
    />
  );
}
