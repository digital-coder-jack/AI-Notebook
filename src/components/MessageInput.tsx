"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

export function MessageInput({
  onSend,
  onStop,
  streaming,
  disabled,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming || disabled) return;
    onSend(text);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="bg-gradient-to-t from-chatbg via-chatbg to-transparent px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-userbubble px-4 py-2.5 shadow-lg transition-colors focus-within:border-gray-500">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled ? "Create a chat to get started…" : "Message AI Chat…"
            }
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-gray-100 placeholder-gray-500 outline-none disabled:cursor-not-allowed"
          />

          {streaming ? (
            <button
              onClick={onStop}
              title="Stop generating"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-black transition-transform hover:scale-105"
            >
              <Square size={16} className="fill-black" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              title="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          Press <kbd className="rounded bg-black/40 px-1">Enter</kbd> to send,{" "}
          <kbd className="rounded bg-black/40 px-1">Shift+Enter</kbd> for new
          line.
        </p>
      </div>
    </div>
  );
}
