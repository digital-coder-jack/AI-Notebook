"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import { ChatSession, Message, DEFAULT_MODEL } from "@/lib/types";

/**
 * AbortControllers live OUTSIDE the persisted store (they are not serializable).
 * We key them by chatId so we can guarantee:
 *   "Only ONE active streaming request at a time per chat"
 */
const controllers = new Map<string, AbortController>();

interface ChatState {
  sessions: ChatSession[];
  activeChatId: string | null;
  /** chatId -> true while a stream is in flight */
  streamingMap: Record<string, boolean>;

  // selectors
  getActiveChat: () => ChatSession | undefined;

  // session actions
  createChat: (model?: string) => string;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  renameChat: (chatId: string, title: string) => void;
  setModel: (chatId: string, model: string) => void;

  // message actions
  addMessage: (chatId: string, message: Message) => void;
  appendToMessage: (chatId: string, messageId: string, chunk: string) => void;
  finalizeMessage: (chatId: string, messageId: string, opts?: { error?: boolean }) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  removeMessagesFrom: (chatId: string, messageId: string) => void;

  // streaming control
  registerController: (chatId: string, controller: AbortController) => void;
  abortStream: (chatId: string) => void;
  isStreaming: (chatId: string) => boolean;
}

function touch(session: ChatSession): ChatSession {
  return { ...session, updatedAt: Date.now() };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeChatId: null,
      streamingMap: {},

      getActiveChat: () => {
        const { sessions, activeChatId } = get();
        return sessions.find((s) => s.id === activeChatId);
      },

      createChat: (model = DEFAULT_MODEL) => {
        const id = nanoid();
        const now = Date.now();
        const session: ChatSession = {
          id,
          title: "New chat",
          messages: [],
          model,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeChatId: id,
        }));
        return id;
      },

      switchChat: (chatId) => set({ activeChatId: chatId }),

      deleteChat: (chatId) => {
        // make sure no orphan stream keeps running
        get().abortStream(chatId);
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== chatId);
          let activeChatId = state.activeChatId;
          if (activeChatId === chatId) {
            activeChatId = sessions[0]?.id ?? null;
          }
          return { sessions, activeChatId };
        });
      },

      renameChat: (chatId, title) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === chatId ? touch({ ...s, title }) : s
          ),
        })),

      setModel: (chatId, model) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === chatId ? touch({ ...s, model }) : s
          ),
        })),

      addMessage: (chatId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== chatId) return s;
            const messages = [...s.messages, message];
            // auto-title from first user message
            const title =
              s.title === "New chat" && message.role === "user"
                ? message.content.slice(0, 40) || "New chat"
                : s.title;
            return touch({ ...s, messages, title });
          }),
        })),

      // Functional updates only -> safe against concurrent chunk arrivals.
      appendToMessage: (chatId, messageId, chunk) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id !== chatId
              ? s
              : {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, content: m.content + chunk }
                      : m
                  ),
                }
          ),
        })),

      finalizeMessage: (chatId, messageId, opts) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id !== chatId
              ? s
              : touch({
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, streaming: false, error: opts?.error ?? false }
                      : m
                  ),
                })
          ),
        })),

      removeMessage: (chatId, messageId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id !== chatId
              ? s
              : { ...s, messages: s.messages.filter((m) => m.id !== messageId) }
          ),
        })),

      removeMessagesFrom: (chatId, messageId) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== chatId) return s;
            const idx = s.messages.findIndex((m) => m.id === messageId);
            if (idx === -1) return s;
            return { ...s, messages: s.messages.slice(0, idx) };
          }),
        })),

      registerController: (chatId, controller) => {
        // Enforce single active stream per chat: kill any previous one first.
        const prev = controllers.get(chatId);
        if (prev) prev.abort();
        controllers.set(chatId, controller);
        set((state) => ({
          streamingMap: { ...state.streamingMap, [chatId]: true },
        }));
      },

      abortStream: (chatId) => {
        const controller = controllers.get(chatId);
        if (controller) {
          controller.abort();
          controllers.delete(chatId);
        }
        set((state) => {
          const next = { ...state.streamingMap };
          delete next[chatId];
          return { streamingMap: next };
        });
      },

      isStreaming: (chatId) => !!get().streamingMap[chatId],
    }),
    {
      name: "ai-chat-store",
      storage: createJSONStorage(() => localStorage),
      // never persist transient streaming state
      partialize: (state) => ({
        sessions: state.sessions,
        activeChatId: state.activeChatId,
      }),
    }
  )
);
