"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mic,
  Film,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/episodes", label: "Episodes", icon: Mic },
  { href: "/dashboard/clips", label: "Clips", icon: Film },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-surface-low flex flex-col py-8 px-4 z-50 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand */}
        <div className="mb-12 px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          {/* Close button – mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-text-muted hover:text-text"
          >
            <X size={20} />
          </button>
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
                onClick={onClose}
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
        <div className="pt-8 border-t border-outline/10 px-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </aside>
    </>
  );
}
