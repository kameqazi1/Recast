import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/queries";
import { Film, Scissors, Clock, Share2 } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stats = await getDashboardStats(userId);

  // Episode status breakdown
  const statusCounts = await db
    .select({ status: episodes.status, count: count() })
    .from(episodes)
    .where(eq(episodes.userId, userId))
    .groupBy(episodes.status);

  const statusMap = Object.fromEntries(
    statusCounts.map((s) => [s.status, s.count])
  );

  return (
    <>
      <section className="mb-8">
        <span className="label-md text-primary mb-3 block">Insights</span>
        <h2 className="font-display text-4xl font-black tracking-tighter text-text">
          Analytics
        </h2>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard icon={Film} label="Total Episodes" value={stats.totalEpisodes.toLocaleString()} />
        <StatCard icon={Scissors} label="Clips Generated" value={stats.clipsGenerated.toLocaleString()} />
        <StatCard icon={Clock} label="Minutes Transcribed" value={stats.minutesTranscribed.toLocaleString()} />
        <StatCard icon={Share2} label="Total Exports" value={stats.totalExports.toLocaleString()} />
      </section>

      {/* Status Breakdown */}
      <section className="bg-surface-low rounded-xl p-8">
        <h3 className="font-display text-xl font-bold mb-6">Episode Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Completed", key: "completed", color: "bg-success" },
            { label: "Processing", key: "processing", color: "bg-primary" },
            { label: "Uploading", key: "uploading", color: "bg-warning" },
            { label: "Failed", key: "failed", color: "bg-error" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-2xl font-display font-bold text-text">
                  {statusMap[item.key] || 0}
                </p>
                <p className="text-xs text-text-muted">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Averages */}
      {stats.totalEpisodes > 0 && (
        <section className="bg-surface-low rounded-xl p-8 mt-4">
          <h3 className="font-display text-xl font-bold mb-6">Averages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-text-muted text-sm">Clips per episode</p>
              <p className="text-2xl font-display font-bold text-text mt-1">
                {stats.totalEpisodes > 0
                  ? (stats.clipsGenerated / stats.totalEpisodes).toFixed(1)
                  : "0"}
              </p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Avg. minutes per episode</p>
              <p className="text-2xl font-display font-bold text-text mt-1">
                {stats.totalEpisodes > 0
                  ? (stats.minutesTranscribed / stats.totalEpisodes).toFixed(1)
                  : "0"}
              </p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Export rate</p>
              <p className="text-2xl font-display font-bold text-text mt-1">
                {stats.clipsGenerated > 0
                  ? `${((stats.totalExports / stats.clipsGenerated) * 100).toFixed(0)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
