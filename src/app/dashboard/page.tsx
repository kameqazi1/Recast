import { Film, Scissors, Clock, Share2, PlusCircle } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { EpisodeTable } from "@/components/episode-table";

export default function DashboardPage() {
  return (
    <>
      {/* Welcome Header */}
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className="label-md text-primary mb-3 block">
            Workspace Overview
          </span>
          <h2 className="font-display text-5xl font-black tracking-tighter text-text leading-tight">
            Welcome back, <span className="text-primary">Alex</span>!
            <br />
            <span className="text-text-muted/60">
              Let&apos;s get your episodes into the spotlight.
            </span>
          </h2>
        </div>
        <div>
          <button className="gradient-primary text-background font-bold py-4 px-8 rounded-xl flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
          value="42"
          trend="+12%"
        />
        <StatCard
          icon={Scissors}
          label="Clips Generated"
          value="186"
          trend="+24%"
        />
        <StatCard
          icon={Clock}
          label="Minutes Transcribed"
          value="2,480"
          trend="Stable"
          trendPositive={false}
        />
        <StatCard
          icon={Share2}
          label="Total Exports"
          value="94"
          trend="+8%"
        />
      </section>

      {/* Episodes Table */}
      <EpisodeTable />
    </>
  );
}
