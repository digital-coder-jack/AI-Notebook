"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { MODELS } from "@/lib/types";

export function ModelSelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = MODELS.find((m) => m.id === value) ?? MODELS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:bg-sidebarHover disabled:opacity-50"
      >
        {current.label}
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 animate-fadeInUp rounded-xl border border-border bg-sidebar p-1.5 shadow-2xl">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onChange(m.id);
                setOpen(false);
              }}
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebarHover"
            >
              <span className="mt-0.5 w-4">
                {m.id === value && <Check size={16} className="text-accent" />}
              </span>
              <span>
                <span className="block text-sm font-medium text-gray-100">
                  {m.label}
                </span>
                <span className="block text-xs text-gray-400">
                  {m.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
