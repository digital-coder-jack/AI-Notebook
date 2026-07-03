"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Layers,
  Timer,
  Bot,
  Moon,
  Sun,
  ArrowUpRight,
} from "lucide-react";
import { AppShell, useSidebar } from "@/components/sidebar";

const STATS = [
  { label: "Notes created", value: "248", icon: FileText, tint: "text-accent-blue" },
  { label: "Flashcards mastered", value: "1,024", icon: Layers, tint: "text-accent-purple" },
  { label: "Focus hours", value: "36.5", icon: Timer, tint: "text-accent-cyan" },
  { label: "AI conversations", value: "89", icon: Bot, tint: "text-emerald-400" },
];

function Dashboard() {
  const { theme, toggleTheme } = useSidebar();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-purple">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI Notebook
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink lg:text-3xl">
            Good evening, Aarav
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your workspace is synced and ready. Press{" "}
            <kbd className="rounded-md bg-line/60 px-1.5 py-0.5 font-mono text-[11px]">
              Ctrl K
            </kbd>{" "}
            to search, or{" "}
            <kbd className="rounded-md bg-line/60 px-1.5 py-0.5 font-mono text-[11px]">
              Ctrl B
            </kbd>{" "}
            to toggle the sidebar.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-line/60 bg-surface-raised/70 text-ink-muted transition-colors hover:text-ink"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden />
          ) : (
            <Moon className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {STATS.map((s, i) => (
          <motion.article
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
            className="rounded-2.5xl border border-line/60 bg-surface-raised/70 p-4 backdrop-blur-sm transition-shadow hover:shadow-soft-sm lg:p-5"
          >
            <s.icon className={`h-5 w-5 ${s.tint}`} aria-hidden />
            <p className="mt-3 text-2xl font-bold tracking-tight text-ink">
              {s.value}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-ink-faint">
              {s.label}
            </p>
          </motion.article>
        ))}
      </div>

      {/* Feature highlight */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        aria-label="Sidebar feature overview"
        className="sidebar-glow relative mt-6 overflow-hidden rounded-3xl border border-line/60 bg-surface-raised/70 p-6 backdrop-blur-sm lg:p-8"
      >
        <h2 className="text-lg font-bold text-ink">
          A sidebar built like a premium AI workspace
        </h2>
        <ul className="mt-4 grid gap-2.5 text-sm text-ink-muted sm:grid-cols-2">
          {[
            "280px ↔ 72px collapse with 300ms spring easing",
            "Mobile drawer: swipe from edge, drag to close",
            "Ctrl+K command palette with recent searches",
            "Right-click context menus on notebooks",
            "AI section with subtle purple glow accents",
            "Sliding active indicator + ripple clicks",
            "Full keyboard navigation & ARIA labels",
            "State persistence across sessions",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue"
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>
      </motion.section>
    </div>
  );
}

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
