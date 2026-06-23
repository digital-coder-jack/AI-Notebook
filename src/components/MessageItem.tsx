"use client";

import { useState } from "react";
import { Bot, User, Copy, Check, RefreshCw, Share2 } from "lucide-react";
import { Message } from "@/lib/types";
import { Markdown } from "./Markdown";

export function MessageItem({
  message,
  onRegenerate,
  canRegenerate,
}: {
  message: Message;
  onRegenerate: () => void;
  canRegenerate: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    const data = { title: "AI Chat", text: message.content };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(message.content);
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="animate-fadeInUp px-4 py-5 md:px-0">
      <div className="mx-auto flex max-w-3xl gap-4">
        {/* avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser ? "bg-indigo-500/90" : "bg-accent"
          }`}
        >
          {isUser ? <User size={17} /> : <Bot size={17} />}
        </div>

        {/* body */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-sm font-semibold text-gray-200">
            {isUser ? "You" : "Assistant"}
          </div>

          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-gray-100">
              {message.content}
            </p>
          ) : message.content.length === 0 && message.streaming ? (
            <TypingDots />
          ) : (
            <div className={message.streaming ? "streaming-cursor" : ""}>
              <Markdown content={message.content} />
            </div>
          )}

          {message.error && (
            <p className="mt-2 text-sm text-red-400">
              Something went wrong generating this response.
            </p>
          )}

          {/* action bar (hide while streaming) */}
          {!message.streaming && message.content.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-gray-400">
              <ActionButton
                label={copied ? "Copied" : "Copy"}
                onClick={handleCopy}
                icon={copied ? <Check size={15} /> : <Copy size={15} />}
              />
              <ActionButton
                label={shared ? "Copied link" : "Share"}
                onClick={handleShare}
                icon={shared ? <Check size={15} /> : <Share2 size={15} />}
              />
              {!isUser && canRegenerate && (
                <ActionButton
                  label="Regenerate"
                  onClick={onRegenerate}
                  icon={<RefreshCw size={15} />}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-sidebarHover hover:text-gray-100"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
