"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Episode {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  status: string;
  fileSize: number | null;
  transcriptText: string | null;
  createdAt: string;
}

interface Clip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  confidence: number | null;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function EpisodeDetailClient({
  episode,
  clips,
}: {
  episode: Episode;
  clips: Clip[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"transcript" | "clips" | "settings">("transcript");
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this episode? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/episodes/${episode.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const handleRetry = async () => {
    setRetrying(true);
    await fetch("/api/upload/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        episodeId: episode.id,
        key: "",
        fileSize: episode.fileSize || 0,
      }),
    });
    router.refresh();
    setRetrying(false);
  };

  const transcriptLines = episode.transcriptText
    ? episode.transcriptText
        .split(/(?<=[.!?])\s+/)
        .filter((line) => line.trim().length > 0)
        .slice(0, 30)
    : [];

  const statusForBadge = (
    episode.status === "uploading" ? "processing" : episode.status
  ) as "processing" | "completed" | "failed";

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
                  <span>{formatDuration(episode.duration)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-text-muted" />
                  <div className="w-24 h-1 bg-surface-highest rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary-dim" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-text-muted">
                <button className="hover:text-text transition-colors"><Captions size={18} /></button>
                <button className="hover:text-text transition-colors"><Settings size={18} /></button>
                <button className="hover:text-text transition-colors"><Maximize size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode Info Header */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-4">
            <StatusBadge status={statusForBadge} />
            <span className="text-text-muted text-xs font-medium">
              {new Date(episode.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              &bull; {formatDuration(episode.duration)} duration
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
          {(episode.status === "failed" || episode.status === "uploading") && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="px-6 py-3 bg-surface-high rounded-xl text-primary font-bold text-sm border border-outline/20 hover:bg-surface-bright transition-colors flex items-center gap-2"
            >
              {retrying ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Retry Processing
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-3 bg-surface-high rounded-xl text-error font-bold text-sm border border-error/20 hover:bg-error/10 transition-colors flex items-center gap-2"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </section>

      {/* Tab Bar */}
      <section className="space-y-8">
        <div className="flex items-center gap-12 border-b border-outline/10">
          {(["transcript", "clips", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium tracking-tight transition-colors ${
                activeTab === tab
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {tab === "transcript" && "Transcript"}
              {tab === "clips" && `Clips (${clips.length})`}
              {tab === "settings" && "Settings"}
            </button>
          ))}
        </div>

        {/* Transcript Tab */}
        {activeTab === "transcript" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
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
                      <span className="text-[11px] font-bold font-mono text-text-muted opacity-70 group-hover:opacity-100 transition-opacity tabular-nums">
                        {formatTime(
                          Math.round(
                            (i / transcriptLines.length) * episode.duration
                          )
                        )}
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
                    ? "Transcription failed. Try retrying."
                    : "No transcript available."}
                </p>
              )}
            </div>

            {/* Side Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-6 bg-surface-low rounded-xl border border-outline/10">
                <h3 className="font-display text-lg font-bold mb-4">
                  Episode Analysis
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Duration</span>
                    <span className="font-bold text-text">
                      {formatDuration(episode.duration)}
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
                    <StatusBadge status={statusForBadge} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clips Tab */}
        {activeTab === "clips" && (
          <div>
            {clips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="bg-surface-low rounded-xl overflow-hidden border border-transparent hover:border-outline/20 transition-all group"
                  >
                    <div className="aspect-video bg-surface-highest relative flex items-center justify-center">
                      <Play
                        size={32}
                        className="text-primary/50 group-hover:text-primary transition-colors"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-text">
                        {formatTime(clip.endTime - clip.startTime)}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-text truncate group-hover:text-primary transition-colors">
                        {clip.title}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-text-muted font-mono">
                          {formatTime(clip.startTime)} —{" "}
                          {formatTime(clip.endTime)}
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
              <div className="text-center py-16">
                <p className="text-text-muted text-lg mb-2">No clips detected</p>
                <p className="text-text-muted text-sm">
                  {episode.status === "completed"
                    ? "This episode had no high-confidence clip segments."
                    : "Clips will appear after processing completes."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-lg space-y-6">
            <div>
              <label className="label-md text-text-muted block mb-2">
                Episode Title
              </label>
              <input
                type="text"
                defaultValue={episode.title}
                className="w-full bg-black border-none rounded-lg py-3 px-4 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/50"
                disabled
              />
            </div>
            <div>
              <label className="label-md text-text-muted block mb-2">
                Description
              </label>
              <textarea
                defaultValue={episode.description || ""}
                rows={4}
                className="w-full bg-black border-none rounded-lg py-3 px-4 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                disabled
              />
            </div>
            <div className="pt-4 border-t border-outline/10">
              <h3 className="text-sm font-bold text-error mb-3">Danger Zone</h3>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 bg-error/10 rounded-xl text-error font-bold text-sm border border-error/20 hover:bg-error/20 transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete Episode Permanently
              </button>
            </div>
          </div>
        )}
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
