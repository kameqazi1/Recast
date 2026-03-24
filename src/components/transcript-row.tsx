interface TranscriptRowProps {
  timestamp: string;
  speaker: string;
  speakerType: "host" | "guest";
  text: string;
}

export function TranscriptRow({
  timestamp,
  speaker,
  speakerType,
  text,
}: TranscriptRowProps) {
  return (
    <div className="group flex gap-8">
      <div className="w-16 pt-1">
        <span className="text-[11px] font-bold font-mono text-primary-dim opacity-40 group-hover:opacity-100 transition-opacity tabular-nums">
          {timestamp}
        </span>
      </div>
      <div className="flex-1 space-y-2">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            speakerType === "host" ? "text-primary" : "text-secondary"
          }`}
        >
          {speaker}
        </span>
        <p className="text-lg font-light text-text leading-relaxed">
          &ldquo;{text}&rdquo;
        </p>
      </div>
    </div>
  );
}
