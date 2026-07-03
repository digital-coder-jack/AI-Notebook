"use client";

import { cn } from "@/lib/utils";
import type { NavBadge } from "@/lib/types";
import { Loader2 } from "lucide-react";

const VARIANT_STYLES: Record<NavBadge["variant"], string> = {
  count:
    "bg-line/80 text-ink-muted ring-1 ring-inset ring-line-strong/50",
  new: "bg-accent-cyan/15 text-accent-cyan ring-1 ring-inset ring-accent-cyan/30",
  ai: "bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 text-accent-purple ring-1 ring-inset ring-accent-purple/30",
  syncing:
    "bg-amber-400/15 text-amber-400 ring-1 ring-inset ring-amber-400/30",
  error: "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30",
  beta: "bg-accent-blue/15 text-accent-blue ring-1 ring-inset ring-accent-blue/30",
};

export function Badge({
  badge,
  className,
}: {
  badge: NavBadge;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center gap-1 rounded-full px-1.5 text-[10px] font-semibold leading-none tracking-wide",
        VARIANT_STYLES[badge.variant],
        className
      )}
      aria-label={`${badge.label} notification`}
    >
      {badge.variant === "syncing" && (
        <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden />
      )}
      {badge.label}
    </span>
  );
}
