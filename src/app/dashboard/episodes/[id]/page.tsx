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
import { StatusBadge } from "@/components/status-badge";
import { TranscriptRow } from "@/components/transcript-row";

const transcriptData = [
  {
    timestamp: "00:00:12",
    speaker: "Host",
    speakerType: "host" as const,
    text: "Welcome back everyone. Today we're exploring the intersection of generative models and nonlinear editing. We've seen how Midjourney changed images, but video is the next frontier.",
  },
  {
    timestamp: "00:00:45",
    speaker: "Guest",
    speakerType: "guest" as const,
    text: "Exactly. The bottleneck has always been the render time and the manual selection of keyframes. What we're seeing now with Recast is the ability to semantically search your footage.",
  },
  {
    timestamp: "00:01:22",
    speaker: "Host",
    speakerType: "host" as const,
    text: "How does that impact the role of a traditional editor? Are we looking at a future where the AI suggests the cuts and the human just polishes the emotion?",
  },
];

export default function EpisodeDetailPage() {
  return (
    <div className="space-y-12">
      {/* Video Player Placeholder */}
      <section className="relative aspect-video rounded-xl overflow-hidden bg-surface-low border border-outline/10 shadow-2xl">
        <div className="absolute inset-0 bg-surface-highest" />
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex flex-col justify-end p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="relative h-1 w-full bg-surface-highest rounded-full overflow-hidden cursor-pointer group">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-primary to-primary-dim" />
              <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-3 w-3 bg-text rounded-full scale-0 group-hover:scale-100 transition-transform" />
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <button className="text-text hover:text-primary transition-colors">
                  <Play size={32} />
                </button>
                <div className="flex items-center gap-4 text-sm font-medium tabular-nums text-text-muted font-mono">
                  <span className="text-text">16:04</span>
                  <span>/</span>
                  <span>48:12</span>
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
            <StatusBadge status="processing" />
            <span className="text-text-muted text-xs font-medium">
              Oct 24, 2023 &bull; 48:12 duration
            </span>
          </div>
          <h1 className="font-display text-5xl font-black tracking-tighter leading-none text-text">
            The Future of AI in Video Editing
          </h1>
          <p className="text-text-muted text-lg leading-relaxed">
            In this episode, we dive deep into neural networks, automated color
            grading, and how creators are leveraging AI to shrink
            post-production workflows.
          </p>
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
            Clips
          </button>
          <button className="pb-4 text-sm font-medium tracking-tight text-text-muted hover:text-text transition-colors">
            Settings
          </button>
        </div>

        {/* Transcript + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Transcript */}
          <div className="lg:col-span-8 space-y-12">
            {transcriptData.map((row, i) => (
              <TranscriptRow key={i} {...row} />
            ))}
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
                  <span className="text-text-muted">Keywords detected</span>
                  <span className="font-bold text-text">24</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">
                    Speaker distribution
                  </span>
                  <span className="font-bold text-text">52% / 48%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-muted">Confidence score</span>
                  <span className="font-bold text-secondary">98.2%</span>
                </div>
              </div>
            </div>

            {/* Clip Suggestions */}
            <div className="space-y-4">
              <h3 className="label-md text-text-muted px-1">
                Top Clip Suggestions
              </h3>
              <div className="p-4 bg-surface-high hover:bg-surface-bright transition-colors rounded-xl border border-outline/10 flex gap-4 cursor-pointer">
                <div className="w-20 aspect-video rounded-lg bg-surface-highest flex-shrink-0" />
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-bold text-text">
                    AI vs. Humans
                  </span>
                  <span className="text-[10px] text-text-muted">
                    02:45 duration
                  </span>
                </div>
              </div>
            </div>
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
              The Future of AI in Video Editing
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
