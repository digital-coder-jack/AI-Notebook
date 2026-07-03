"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenLine,
  Copy,
  FolderInput,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import type { NavItem } from "@/lib/types";

export interface ContextMenuState {
  x: number;
  y: number;
  item: NavItem;
}

const ACTIONS = [
  { id: "rename", label: "Rename", icon: PenLine },
  { id: "duplicate", label: "Duplicate", icon: Copy },
  { id: "move", label: "Move", icon: FolderInput },
  { id: "share", label: "Share", icon: Share2 },
  { id: "export", label: "Export", icon: Upload },
] as const;

export function ContextMenu({
  state,
  onClose,
}: {
  state: ContextMenuState | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [state, onClose]);

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          role="menu"
          aria-label={`Actions for ${state.item.label}`}
          className="fixed z-[90] w-48 rounded-2xl border border-line/70 bg-surface-overlay/95 p-1.5 shadow-soft backdrop-blur-xl"
          style={{
            left: Math.min(state.x, window.innerWidth - 200),
            top: Math.min(state.y, window.innerHeight - 280),
          }}
        >
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {state.item.label}
          </p>
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="menuitem"
              onClick={onClose}
              className="flex min-h-[38px] w-full items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium text-ink-muted transition-colors hover:bg-line/40 hover:text-ink"
            >
              <a.icon className="h-4 w-4" aria-hidden />
              {a.label}
            </button>
          ))}
          <div className="my-1 h-px bg-line/70" aria-hidden />
          <button
            type="button"
            role="menuitem"
            onClick={onClose}
            className="flex min-h-[38px] w-full items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
