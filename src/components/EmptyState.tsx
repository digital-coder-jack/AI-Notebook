"use client";

import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a React hook for debouncing input",
  "Give me a 7-day workout plan",
  "Summarize the plot of Inception",
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
        <Sparkles size={28} />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-100">
        How can I help you today?
      </h1>
      <p className="mb-8 max-w-md text-sm text-gray-400">
        Ask anything — responses stream in real time with full markdown support.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-userbubble/40 px-4 py-3 text-left text-sm text-gray-200 transition-colors hover:bg-sidebarHover"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
