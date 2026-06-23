"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sessions = useChatStore((s) => s.sessions);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const createChat = useChatStore((s) => s.createChat);
  const switchChat = useChatStore((s) => s.switchChat);

  // Wait for zustand/persist to rehydrate from localStorage before rendering,
  // so the UI state stays in sync with the persisted chatId.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Guarantee a valid active chat exists.
  useEffect(() => {
    if (!hydrated) return;
    if (sessions.length === 0) {
      createChat();
    } else if (!activeChatId || !sessions.some((s) => s.id === activeChatId)) {
      switchChat(sessions[0].id);
    }
  }, [hydrated, sessions, activeChatId, createChat, switchChat]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-chatbg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-chatbg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
      </main>
    </div>
  );
}
