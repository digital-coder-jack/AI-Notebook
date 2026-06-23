"use client";

import { Menu, Plus } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useChat } from "@/lib/useChat";
import { ModelSelector } from "./ModelSelector";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

export function ChatWindow({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const activeChat = useChatStore((s) =>
    s.sessions.find((x) => x.id === s.activeChatId)
  );
  const streamingMap = useChatStore((s) => s.streamingMap);
  const setModel = useChatStore((s) => s.setModel);
  const createChat = useChatStore((s) => s.createChat);

  const { sendMessage, stop, regenerate } = useChat();

  const streaming = activeChat ? !!streamingMap[activeChat.id] : false;
  const hasMessages = !!activeChat && activeChat.messages.length > 0;

  const handleSend = (text: string) => {
    if (!activeChat) createChat();
    // sendMessage reads the active chat from the store (set synchronously above)
    sendMessage(text);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* top bar */}
      <header className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-sidebarHover md:hidden"
          >
            <Menu size={20} />
          </button>
          <ModelSelector
            value={activeChat?.model ?? "gpt-4o"}
            onChange={(m) => activeChat && setModel(activeChat.id, m)}
            disabled={streaming}
          />
        </div>

        <button
          onClick={() => createChat()}
          className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-sidebarHover md:hidden"
          title="New chat"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* body */}
      {hasMessages ? (
        <MessageList messages={activeChat!.messages} onRegenerate={regenerate} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <EmptyState onPick={handleSend} />
        </div>
      )}

      {/* composer */}
      <MessageInput
        onSend={handleSend}
        onStop={() => activeChat && stop(activeChat.id)}
        streaming={streaming}
      />
    </div>
  );
}
