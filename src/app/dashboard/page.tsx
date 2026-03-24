import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDashboardStats, getRecentEpisodes } from "@/lib/queries";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [stats, recentEpisodes] = await Promise.all([
    getDashboardStats(userId),
    getRecentEpisodes(userId),
  ]);

  return (
    <DashboardClient
      stats={stats}
      episodes={recentEpisodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        date: ep.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        duration: ep.duration
          ? `${Math.floor(ep.duration / 60)}:${String(ep.duration % 60).padStart(2, "0")}`
          : "—",
        status: ep.status as "processing" | "completed" | "failed",
      }))}
    />
  );
}
