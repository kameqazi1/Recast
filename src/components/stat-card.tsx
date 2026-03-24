import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive = true,
}: StatCardProps) {
  return (
    <div className="bg-surface-low p-6 rounded-xl border border-transparent hover:border-outline/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon size={20} />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold tracking-wider ${
              trendPositive ? "text-success" : "text-text-muted"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="label-md text-text-muted mb-1">{label}</p>
      <h3 className="text-3xl font-display font-bold text-text">{value}</h3>
    </div>
  );
}
