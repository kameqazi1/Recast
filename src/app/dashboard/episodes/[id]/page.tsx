import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getEpisodeById, getEpisodeClips } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";
import {
  Play,
  Volume2,
  Captions,
  Settings,
  Maximize,
  SkipBack,
  SkipForward,
  Pause,
  Sparkles,
  ChevronUp,
} from "lucide-react";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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

  const duration = episode.duration || 0;

  // Parse transcript into lines (simple split by sentences for display)
  const transcriptLines = episode.transcriptText
    ? episode.transcriptText
        .split(/(?<=[.!?])\s+/)
        .filter((line) => line.trim().length > 0)
        .slice(0, 20) // show first 20 sentences
    : [];

  return (
    <div className="space-y-12">
      {/* Video Player Placeholder */}
      <section className="relative aspect-video rounded-xl overflow-hidden bg-surface-low border border-outline/10 shadow-2xl">
        <div className="absolute inset-0 bg-surface-highest" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex flex-col justify-end p-8">
          <div className="space-y-6">
            <div className="relative h-1 w-full bg-surface-highest rounded-full overflow-hidden cursor-pointer group">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-primary to-primary-dim" />
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-3 w-3 bg-text rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button className="text-text hover:text-primary transition-colors">
                  <Play size={32} />
                </button>
                <div className="flex items-center gap-4 text-sm font-medium tabular-nums text-text-muted font-mono">
                  <span className="text-text">0:00</span>
                  <span>/</span>
                  <span>{formatDuration(duration)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-text-muted" />
                  <div className="w-24 h-1 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary-dim" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-text-muted">
                <button className="hover:text-text transition-colors">
                  <Captions size={18} />
                </button>
                <button className="hover:text-text transition-colors">
                  <Settings size={18} />
                </button>
                <button className="hover:text-text transition-colors">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode Info Header */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-4">
            <StatusBadge
              status={
                episode.status === "uploading"
                  ? "processing"
                  : (episode.status as "processing" | "completed" | "failed")
              }
            />
            <span className="text-text-muted text-xs font-medium">
              {episode.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              &bull; {formatDuration(duration)} duration
            </span>
          </div>
          <h1 className="font-display text-5xl font-black tracking-tighter leading-none text-text">
            {episode.title}
          </h1>
          {episode.description && (
            <p className="text-text-muted text-lg leading-relaxed">
              {episode.description}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-high rounded-xl text-primary font-bold text-sm border border-outline/20 hover:bg-surface-bright transition-colors">
            Share Episode
          </button>
          <button className="px-8 py-3 gradient-primary rounded-xl text-background font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            Download Master
          </button>
        </div>
      </section>

      {/* Tab Bar */}
      <section className="space-y-8">
        <div className="flex items-center gap-12 border-b border-outline/10">
          <button className="pb-4 text-sm font-bold tracking-tight text-primary border-b-2 border-primary">
            Transcript
          </button>
          <button className="pb-4 text-sm font-medium tracking-tight text-text-muted hover:text-text transition-colors">
            Clips ({clips.length})
          </button>
          <button className="pb-4 text-sm font-medium tracking-tight text-text-muted hover:text-text transition-colors">
            Settings
          </button>
        </div>

        {/* Transcript + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Transcript */}
          <div className="lg:col-span-8 space-y-8">
            {episode.status === "processing" || episode.status === "uploading" ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-text-muted">
                  {episode.status === "uploading"
                    ? "Waiting for upload to complete..."
                    : "Transcribing your episode..."}
                </p>
              </div>
            ) : transcriptLines.length > 0 ? (
              transcriptLines.map((line, i) => (
                <div key={i} className="group flex gap-8">
                  <div className="w-16 pt-1">
                    <span className="text-[11px] font-bold font-mono text-primary-dim opacity-40 group-hover:opacity-100 transition-opacity tabular-nums">
                      {formatTime(Math.round((i / transcriptLines.length) * duration))}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-light text-text leading-relaxed">
                      {line}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-center py-16">
                {episode.status === "failed"
                  ? "Transcription failed. Please try re-uploading."
                  : "No transcript available."}
              </p>
            )}
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-4 space-y-8">
            {/* Episode Analysis */}
            <div className="p-6 bg-surface-low rounded-xl border border-outline/10">
              <h3 className="font-display text-lg font-bold mb-4">
                Episode Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-bold text-text">
                    {formatDuration(duration)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Clips detected</span>
                  <span className="font-bold text-text">{clips.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">File size</span>
                  <span className="font-bold text-text">
                    {episode.fileSize
                      ? `${(episode.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Status</span>
                  <StatusBadge
                    status={
                      episode.status === "uploading"
                        ? "processing"
                        : (episode.status as "processing" | "completed" | "failed")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Clip Suggestions */}
            {clips.length > 0 && (
              <div className="space-y-4">
                <h3 className="label-md text-text-muted px-1">
                  Detected Clips
                </h3>
                {clips.slice(0, 5).map((clip) => (
                  <div
                    key={clip.id}
                    className="p-4 bg-surface-high hover:bg-surface-bright transition-colors rounded-xl border border-outline/10 flex gap-4 cursor-pointer"
                  >
                    <div className="w-20 aspect-video rounded-lg bg-surface-highest flex-shrink-0 flex items-center justify-center">
                      <Play size={14} className="text-primary" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-sm font-bold text-text truncate">
                        {clip.title}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatTime(clip.startTime)} — {formatTime(clip.endTime)}{" "}
                        ({formatDuration(clip.endTime - clip.startTime)})
                      </span>
                      {clip.confidence && (
                        <span className="text-[10px] text-secondary">
                          {clip.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Transport Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="glass-panel border border-outline/20 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center text-text-muted hover:text-text transition-colors">
              <SkipBack size={18} />
            </button>
            <button className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-background shadow-lg shadow-primary/30">
              <Pause size={22} />
            </button>
            <button className="h-10 w-10 flex items-center justify-center text-text-muted hover:text-text transition-colors">
              <SkipForward size={18} />
            </button>
          </div>
          <div className="flex-1 px-8 hidden sm:block">
            <div className="label-md text-center mb-1 text-text-muted">
              Currently Playing
            </div>
            <div className="text-sm font-bold text-center text-text truncate px-4">
              {episode.title}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center text-primary">
              <Sparkles size={18} />
            </button>
            <button className="h-10 w-10 flex items-center justify-center text-text-muted hover:text-text">
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
