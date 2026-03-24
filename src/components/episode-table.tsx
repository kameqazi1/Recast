import { StatusBadge } from "./status-badge";
import { MoreHorizontal, ArrowRight } from "lucide-react";

interface Episode {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: "processing" | "completed" | "failed";
}

const episodes: Episode[] = [
  {
    id: "RC-9904",
    title: "The Future of AI in Video Editing",
    date: "Oct 24, 2023",
    duration: "48:12",
    status: "processing",
  },
  {
    id: "RC-9892",
    title: "Designing for the Next Billion Users",
    date: "Oct 22, 2023",
    duration: "32:45",
    status: "completed",
  },
  {
    id: "RC-9881",
    title: "Morning Brew Interview Special",
    date: "Oct 20, 2023",
    duration: "1:15:00",
    status: "completed",
  },
  {
    id: "RC-9875",
    title: "Product Hunt Launch: Day 1",
    date: "Oct 19, 2023",
    duration: "14:02",
    status: "failed",
  },
];

export function EpisodeTable() {
  return (
    <section className="bg-surface-low rounded-xl overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-outline/10">
        <h4 className="font-display text-xl font-bold">Recent Episodes</h4>
        <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
          View All Episodes <ArrowRight size={14} />
        </button>
      </div>
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
              <tr
                key={ep.id}
                className="group hover:bg-surface-high transition-colors"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-surface-highest rounded-lg flex-shrink-0 overflow-hidden">
                      <div className="w-full h-full gradient-primary opacity-10" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                        {ep.title}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        ID: #{ep.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm text-text-muted font-medium">
                  {ep.date}
                </td>
                <td className="px-8 py-5 text-sm text-text-muted font-medium">
                  {ep.duration}
                </td>
                <td className="px-8 py-5">
                  <StatusBadge status={ep.status} />
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-text-muted hover:text-text">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
