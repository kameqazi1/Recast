import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRecentEpisodes } from "@/lib/queries";
import { StatusBadge } from "@/components/status-badge";
import { MoreHorizontal, Search } from "lucide-react";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function EpisodesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const episodes = await getRecentEpisodes(userId, 50);

  return (
    <>
      <section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="label-md text-primary mb-3 block">Library</span>
          <h2 className="font-display text-4xl font-black tracking-tighter text-text">
            All Episodes
          </h2>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search episodes..."
            className="w-full bg-black border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </section>

      {episodes.length > 0 ? (
        <section className="bg-surface-low rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-text-muted text-[10px] uppercase tracking-widest border-b border-outline/5">
                  <th className="px-8 py-4 font-bold">Episode Name</th>
                  <th className="px-8 py-4 font-bold">Date Uploaded</th>
                  <th className="px-8 py-4 font-bold">Duration</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {episodes.map((ep) => (
                  <tr key={ep.id} className="group hover:bg-surface-high transition-colors">
                    <td className="px-8 py-5">
                      <Link href={`/dashboard/episodes/${ep.id}`} className="flex items-center gap-4">
                        <div className="w-16 h-10 bg-surface-highest rounded-lg flex-shrink-0 overflow-hidden">
                          <div className="w-full h-full gradient-primary opacity-10" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                            {ep.title}
                          </p>
                          <p className="text-[10px] text-text-muted">ID: #{ep.id.slice(0, 8)}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-sm text-text-muted font-medium">
                      {ep.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-8 py-5 text-sm text-text-muted font-medium font-mono">
                      {formatDuration(ep.duration)}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={ep.status === "uploading" ? "processing" : ep.status as "processing" | "completed" | "failed"} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link href={`/dashboard/episodes/${ep.id}`} className="text-text-muted hover:text-text">
                        <MoreHorizontal size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="bg-surface-low rounded-xl p-16 text-center">
          <p className="text-text-muted text-lg mb-2">No episodes yet</p>
          <p className="text-text-muted/60 text-sm">Upload your first episode from the dashboard</p>
        </div>
      )}
    </>
  );
}
