"use client";

import React from "react";
import { Cloud, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center py-2 text-ink-faint"
        aria-label="Online, synced"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
      </div>
    );
  }

  return (
    <footer
      className={cn(
        "mx-2 mb-2 flex items-center justify-between rounded-xl border border-line/40 bg-surface/30 px-3 py-2",
        "text-[10px] font-medium text-ink-faint"
      )}
    >
      <span className="flex items-center gap-1.5">
        <Cloud className="h-3 w-3 text-accent-cyan/80" aria-hidden />
        Cloud sync on
      </span>
      <span className="flex items-center gap-1.5">
        <Wifi className="h-3 w-3 text-emerald-400/80" aria-hidden />
        Online
      </span>
      <span className="font-mono">v2.4.0</span>
    </footer>
  );
}
