"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock3, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_ITEMS } from "@/lib/navigation";
import { useSidebar } from "./SidebarProvider";

const RECENT_SEARCHES = [
  "Physics chapter 4 summary",
  "Mind map: World War II",
  "Pomodoro stats",
];

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setActiveId } = useSidebar();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS.slice(0, 8);
    return ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(q)).slice(
      0,
      10
    );
  }, [query]);

  useEffect(() => {
    if (paletteOpen) {
      setQuery("");
      setCursor(0);
      // focus after mount animation
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [paletteOpen]);

  useEffect(() => setCursor(0), [query]);

  const select = (id: string) => {
    setActiveId(id);
    setPaletteOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      e.preventDefault();
      select(results[cursor].id);
    }
  };

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-line/70 bg-surface-overlay/95 shadow-soft backdrop-blur-2xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-line/60 px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search notes, notebooks, AI history, commands…"
                aria-label="Search"
                className="min-h-[52px] w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md bg-line/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                ESC
              </kbd>
            </div>

            <div className="sidebar-scroll max-h-[46vh] overflow-y-auto p-2">
              {/* Recent searches when idle */}
              {!query && (
                <div className="px-2 pb-1 pt-2">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Recent searches
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {RECENT_SEARCHES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-1.5 rounded-full border border-line/60 px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                      >
                        <Clock3 className="h-3 w-3" aria-hidden />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                {query ? "Results" : "Quick navigation"}
              </p>

              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-ink-faint">
                  No results for “{query}”
                </p>
              )}

              <ul role="listbox" aria-label="Search results">
                {results.map((item, i) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === cursor}
                      onClick={() => select(item.id)}
                      onMouseEnter={() => setCursor(i)}
                      className={cn(
                        "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-left text-[13px] font-medium transition-colors",
                        i === cursor
                          ? "bg-accent-blue/12 text-ink ring-1 ring-inset ring-accent-blue/25"
                          : "text-ink-muted"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          item.aiGlow && "text-accent-purple"
                        )}
                        aria-hidden
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.aiGlow && (
                        <Sparkles
                          className="h-3.5 w-3.5 text-accent-purple/70"
                          aria-hidden
                        />
                      )}
                      {i === cursor && (
                        <ArrowRight
                          className="h-3.5 w-3.5 text-accent-blue"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-4 border-t border-line/60 px-4 py-2.5 text-[10px] text-ink-faint">
              <span>
                <kbd className="rounded bg-line/60 px-1 font-mono">↑↓</kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="rounded bg-line/60 px-1 font-mono">↵</kbd> open
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-accent-purple" aria-hidden />
                AI-powered search
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
