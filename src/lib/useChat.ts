"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chatStore";
import { streamChat, toApiMessages } from "@/lib/streamChat";
import { Message } from "@/lib/types";

/**
 * Encapsulates the full send/stream/stop/regenerate lifecycle.
 *
 * Race-condition & sync guarantees:
 *  - A stream is always bound to a specific `chatId` (captured up front),
 *    so chunks land in the right conversation even if the user switches chats.
 *  - registerController() aborts any in-flight request for that chat before
 *    starting a new one => only ONE active stream per chat.
 *  - Store updates are functional (state => newState) so overlapping chunk
 *    writes never clobber each other.
 */
export function useChat() {
  const {
    getActiveChat,
    addMessage,
    appendToMessage,
    finalizeMessage,
    removeMessagesFrom,
    registerController,
    abortStream,
  } = useChatStore();

  const runStream = useCallback(
    async (chatId: string, model: string, history: Message[]) => {
      // assistant placeholder
      const assistantId = nanoid();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        streaming: true,
        model,
      };
      addMessage(chatId, assistantMsg);

      const controller = new AbortController();
      registerController(chatId, controller); // aborts any previous stream

      try {
        await streamChat({
          messages: toApiMessages(history),
          model,
          signal: controller.signal,
          onChunk: (text) => appendToMessage(chatId, assistantId, text),
        });
        finalizeMessage(chatId, assistantId);
      } catch (err: any) {
        // AbortError = user pressed stop -> clean finalize, no error flag
        const aborted = err?.name === "AbortError";
        finalizeMessage(chatId, assistantId, { error: !aborted });
      } finally {
        abortStream(chatId); // clears streaming flag + controller
      }
    },
    [addMessage, appendToMessage, finalizeMessage, registerController, abortStream]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const chat = getActiveChat();
      if (!chat || !text.trim()) return;

      const userMsg: Message = {
        id: nanoid(),
        role: "user",
        content: text.trim(),
        createdAt: Date.now(),
      };
      addMessage(chat.id, userMsg);

      const history = [...chat.messages, userMsg];
      await runStream(chat.id, chat.model, history);
    },
    [getActiveChat, addMessage, runStream]
  );

  const stop = useCallback(
    (chatId: string) => {
      abortStream(chatId);
    },
    [abortStream]
  );

  /** Regenerate the assistant reply for a given assistant message. */
  const regenerate = useCallback(
    async (assistantMessageId: string) => {
      const chat = getActiveChat();
      if (!chat) return;

      const idx = chat.messages.findIndex((m) => m.id === assistantMessageId);
      if (idx === -1) return;

      // history = everything up to (and including) the user msg before it
      const history = chat.messages.slice(0, idx);
      // drop the old assistant message (and anything after)
      removeMessagesFrom(chat.id, assistantMessageId);

      await runStream(chat.id, chat.model, history);
    },
    [getActiveChat, removeMessagesFrom, runStream]
  );

  return { sendMessage, stop, regenerate };
}
