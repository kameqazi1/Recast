"use client";

import { useState } from "react";
import { Film, Scissors, Clock, Share2, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { EpisodeTableLive } from "@/components/episode-table-live";
import { UploadModal } from "@/components/upload-modal";

interface DashboardClientProps {
  stats: {
    totalEpisodes: number;
    clipsGenerated: number;
    minutesTranscribed: number;
    totalExports: number;
  };
  episodes: Array<{
    id: string;
    title: string;
    date: string;
    duration: string;
    status: "processing" | "completed" | "failed";
  }>;
}

export function DashboardClient({ stats, episodes }: DashboardClientProps) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      {/* Welcome Header */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className="label-md text-primary mb-3 block">
            Workspace Overview
          </span>
          <h2 className="font-display text-5xl font-black tracking-tighter text-text leading-tight">
            Your episodes,{" "}
            <span className="text-primary">amplified</span>.
          </h2>
        </div>
        <div>
          <button
            onClick={() => setUploadOpen(true)}
            className="gradient-primary text-background font-bold py-4 px-8 rounded-xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PlusCircle size={18} />
            <span>Upload Episode</span>
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard
          icon={Film}
          label="Total Episodes"
          value={stats.totalEpisodes.toLocaleString()}
        />
        <StatCard
          icon={Scissors}
          label="Clips Generated"
          value={stats.clipsGenerated.toLocaleString()}
        />
        <StatCard
          icon={Clock}
          label="Minutes Transcribed"
          value={stats.minutesTranscribed.toLocaleString()}
        />
        <StatCard
          icon={Share2}
          label="Total Exports"
          value={stats.totalExports.toLocaleString()}
        />
      </section>

      {/* Episodes Table */}
      {episodes.length > 0 ? (
        <EpisodeTableLive episodes={episodes} />
      ) : (
        <div className="bg-surface-low rounded-xl p-16 text-center">
          <p className="text-text-muted text-lg mb-4">No episodes yet</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="text-primary font-bold hover:underline"
          >
            Upload your first episode
          </button>
        </div>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
