"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileText,
  Twitter,
  ListChecks,
  Mail,
  Copy,
  Download,
  Check,
  Wand2,
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

interface ContentOutput {
  id: string;
  format: string;
  content: string | null;
  wordCount: number | null;
  status: string;
  voiceProfileId: string | null;
}

const FORMAT_META: Record<string, { label: string; icon: typeof FileText }> = {
  blog_post: { label: "Blog Post", icon: FileText },
  tweet_thread: { label: "Tweet Thread", icon: Twitter },
  show_notes: { label: "Show Notes", icon: ListChecks },
  newsletter: { label: "Newsletter", icon: Mail },
};

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
  const [activeTab, setActiveTab] = useState<"transcript" | "clips" | "content" | "settings">("transcript");
  const [deleting, setDeleting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [contentOutputs, setContentOutputs] = useState<ContentOutput[]>([]);
  const [activeFormat, setActiveFormat] = useState<string>("blog_post");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regeneratingFormat, setRegeneratingFormat] = useState<string | null>(null);

  // Poll for content outputs
  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/episodes/${episode.id}/content`);
      if (res.ok) {
        const data = await res.json();
        setContentOutputs(data.outputs);
      }
    } catch { /* ignore polling errors */ }
  }, [episode.id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const hasActive = contentOutputs.some(
      (o) => o.status === "pending" || o.status === "generating"
    );
    if (!hasActive) return;

    let elapsed = 0;
    const maxDuration = 120000; // 2 min max polling
    const interval = setInterval(() => {
      elapsed += 5000;
      if (elapsed > maxDuration) {
        clearInterval(interval);
        return;
      }
      fetchContent();
    }, elapsed > 30000 ? 10000 : 5000); // backoff to 10s after 30s

    return () => clearInterval(interval);
  }, [contentOutputs, fetchContent]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/episodes/${episode.id}/generate`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchContent();
        setActiveTab("content");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (format: string) => {
    setRegeneratingFormat(format);
    try {
      await fetch(`/api/episodes/${episode.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      await fetchContent();
    } finally {
      setRegeneratingFormat(null);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (text: string, format: string) => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${episode.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${format}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeOutput = contentOutputs.find((o) => o.format === activeFormat);
  const hasContent = contentOutputs.length > 0;

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
          {episode.status === "completed" && !hasContent && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dim rounded-xl text-background font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Generate Content
            </button>
          )}
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
          {(["transcript", "clips", "content", "settings"] as const).map((tab) => (
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
              {tab === "content" && `Content${hasContent ? ` (${contentOutputs.filter(o => o.status === "completed").length})` : ""}`}
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

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-8">
            {!hasContent ? (
              <div className="text-center py-16">
                <Wand2 size={48} className="text-text-muted mx-auto mb-4 opacity-50" />
                <p className="text-text-muted text-lg mb-2">No content generated yet</p>
                <p className="text-text-muted text-sm mb-6">
                  {episode.status === "completed"
                    ? "Click \"Generate Content\" to create blog posts, tweets, show notes, and newsletters from this episode."
                    : "Content generation will be available after processing completes."}
                </p>
                {episode.status === "completed" && (
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dim rounded-xl text-background font-bold text-sm shadow-lg shadow-primary/30"
                  >
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    <span className="ml-2">Generate Content</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Format grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contentOutputs.map((output) => {
                    const meta = FORMAT_META[output.format] || { label: output.format, icon: FileText };
                    const Icon = meta.icon;
                    const isActive = activeFormat === output.format;
                    return (
                      <button
                        key={output.id}
                        onClick={() => setActiveFormat(output.format)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isActive
                            ? "bg-surface-high border-primary/30"
                            : "bg-surface-low border-outline/10 hover:border-outline/30"
                        }`}
                      >
                        <Icon size={20} className={isActive ? "text-primary mb-2" : "text-text-muted mb-2"} />
                        <div className="text-sm font-medium text-text">{meta.label}</div>
                        <div className="text-[11px] mt-1">
                          {output.status === "completed" && (
                            <span className="text-success">{output.wordCount} words</span>
                          )}
                          {output.status === "generating" && (
                            <span className="text-primary flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" /> Generating...
                            </span>
                          )}
                          {output.status === "failed" && (
                            <span className="text-error">Failed</span>
                          )}
                          {output.status === "pending" && (
                            <span className="text-text-muted">Pending</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Content viewer */}
                {activeOutput && (
                  <div className="bg-surface-low rounded-xl border border-outline/10 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-outline/10">
                      <span className="text-[11px] uppercase tracking-widest text-text-muted">
                        {FORMAT_META[activeOutput.format]?.label || activeOutput.format}
                      </span>
                      <div className="flex items-center gap-2">
                        {activeOutput.status === "completed" && (
                          <>
                            <button
                              onClick={() => handleRegenerate(activeOutput.format)}
                              disabled={regeneratingFormat === activeOutput.format}
                              className="text-[11px] text-primary hover:text-primary-dim flex items-center gap-1 transition-colors"
                            >
                              {regeneratingFormat === activeOutput.format ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <RefreshCw size={12} />
                              )}
                              Regenerate
                            </button>
                          </>
                        )}
                        {activeOutput.status === "failed" && (
                          <button
                            onClick={() => handleRegenerate(activeOutput.format)}
                            disabled={regeneratingFormat === activeOutput.format}
                            className="text-[11px] text-error hover:text-error/80 flex items-center gap-1"
                          >
                            <RefreshCw size={12} /> Retry
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      {activeOutput.status === "completed" && activeOutput.content ? (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-text leading-relaxed">
                          {activeOutput.content}
                        </div>
                      ) : activeOutput.status === "generating" ? (
                        <div className="text-center py-12">
                          <Loader2 size={24} className="animate-spin text-primary mx-auto mb-3" />
                          <p className="text-text-muted text-sm">Generating {FORMAT_META[activeOutput.format]?.label}...</p>
                        </div>
                      ) : activeOutput.status === "failed" ? (
                        <div className="text-center py-12">
                          <p className="text-error text-sm mb-2">Generation failed</p>
                          <p className="text-text-muted text-xs">Click Retry to try again</p>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-text-muted text-sm">Waiting to generate...</p>
                        </div>
                      )}
                    </div>

                    {activeOutput.status === "completed" && activeOutput.content && (
                      <div className="flex items-center gap-2 px-6 py-3 border-t border-outline/10">
                        <button
                          onClick={() => handleCopy(activeOutput.content!)}
                          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dim rounded-lg text-background text-xs font-bold flex items-center gap-1.5"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleDownload(activeOutput.content!, activeOutput.format)}
                          className="px-4 py-2 bg-surface-high rounded-lg text-text-muted text-xs font-medium border border-outline/20 hover:text-text flex items-center gap-1.5 transition-colors"
                        >
                          <Download size={14} /> Download .md
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
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
