"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Message } from "@/lib/types";
import { MessageItem } from "./MessageItem";

export function MessageList({
  messages,
  onRegenerate,
}: {
  messages: Message[];
  onRegenerate: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);

  // Track whether the user is pinned to the bottom. We only auto-scroll
  // when they already are, so we don't yank them up while they read history.
  const pinnedRef = useRef(true);

  const lastContent = messages[messages.length - 1]?.content ?? "";

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < 80;
    pinnedRef.current = atBottom;
    setShowJump(!atBottom);
  };

  // Auto-scroll on new content while pinned (handles streaming token updates).
  useEffect(() => {
    if (pinnedRef.current) scrollToBottom("auto");
  }, [messages.length, lastContent]);

  // Always jump to bottom when switching into a chat.
  useEffect(() => {
    pinnedRef.current = true;
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && !m.streaming)?.id;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        <div className="pb-6">
          {messages.map((m) => (
            <MessageItem
              key={m.id}
              message={m}
              canRegenerate={m.id === lastAssistantId}
              onRegenerate={() => onRegenerate(m.id)}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {showJump && (
        <button
          onClick={() => {
            pinnedRef.current = true;
            scrollToBottom("smooth");
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-sidebar p-2 text-gray-200 shadow-lg transition-colors hover:bg-sidebarHover"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}
