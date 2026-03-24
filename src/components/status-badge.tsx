type Status = "processing" | "completed" | "failed";

const styles: Record<Status, { bg: string; text: string; dot: string }> = {
  processing: {
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
  },
  completed: {
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  failed: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
