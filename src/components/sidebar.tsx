"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Film,
  BarChart3,
  Settings,
  User,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/episodes", label: "Episodes", icon: Mic },
  { href: "/dashboard/clips", label: "Clips", icon: Film },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-low flex flex-col py-8 px-4 z-50">
      {/* Brand */}
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <Film size={16} className="text-background" />
        </div>
        <div>
          <h1 className="text-xl font-display font-black tracking-tighter text-primary">
            Recast
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">
            Professional Suite
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary font-bold bg-surface-high"
                  : "text-text-muted hover:text-text hover:bg-surface-high"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-8 border-t border-outline/10 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-text hover:bg-surface-high rounded-lg text-sm transition-colors"
        >
          <User size={18} />
          <span>Profile</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-text hover:bg-surface-high rounded-lg text-sm transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
