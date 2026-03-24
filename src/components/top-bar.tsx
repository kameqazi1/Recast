import { Search, Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full flex justify-between items-center h-16 px-8 bg-background/70 backdrop-blur-xl text-sm">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Search episodes or clips..."
            className="w-full bg-black border-none rounded-full py-2 pl-10 pr-4 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-text-muted hover:text-text transition-opacity">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-high border border-outline/20" />
      </div>
    </header>
  );
}
