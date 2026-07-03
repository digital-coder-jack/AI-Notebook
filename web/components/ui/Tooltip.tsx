"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Lightweight hover tooltip shown to the right of collapsed sidebar items.
 * Pure CSS positioning — no portal needed since the sidebar allows overflow.
 */
export function Tooltip({ label, shortcut, disabled, children }: TooltipProps) {
  const [open, setOpen] = useState(false);

  if (disabled) return <>{children}</>;

  return (
    <div
      className="relative flex w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute left-full top-1/2 z-[70] ml-3 -translate-y-1/2",
              "flex items-center gap-2 whitespace-nowrap rounded-xl border border-line/70",
              "bg-surface-overlay/95 px-3 py-1.5 text-xs font-medium text-ink shadow-soft backdrop-blur-xl"
            )}
          >
            {label}
            {shortcut && (
              <kbd className="rounded-md bg-line/70 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                {shortcut}
              </kbd>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
