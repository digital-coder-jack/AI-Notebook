"use client";

import { useState } from "react";
import {
  MessageSquarePlus,
  Trash2,
  MessageSquare,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useChatStore } from "@/store/chatStore";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const sessions = useChatStore((s) => s.sessions);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const streamingMap = useChatStore((s) => s.streamingMap);
  const createChat = useChatStore((s) => s.createChat);
  const switchChat = useChatStore((s) => s.switchChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const renameChat = useChatStore((s) => s.renameChat);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setDraft(title);
  };

  const commitEdit = () => {
    if (editingId && draft.trim()) renameChat(editingId, draft.trim());
    setEditingId(null);
  };

  return (
    <>
      {/* mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3">
          <button
            onClick={() => {
              createChat();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-gray-100 transition-colors hover:bg-sidebarHover"
          >
            <MessageSquarePlus size={18} />
            New chat
          </button>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          <p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Chats
          </p>

          {sessions.length === 0 && (
            <p className="px-2 py-3 text-sm text-gray-500">
              No conversations yet.
            </p>
          )}

          {sessions.map((s) => {
            const isActive = s.id === activeChatId;
            const isStreaming = !!streamingMap[s.id];
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  if (!isEditing) {
                    switchChat(s.id);
                    onClose();
                  }
                }}
                className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebarHover text-gray-100"
                    : "text-gray-300 hover:bg-sidebarHover/60"
                }`}
              >
                {isStreaming ? (
                  <Loader2 size={16} className="shrink-0 animate-spin text-accent" />
                ) : (
                  <MessageSquare size={16} className="shrink-0 text-gray-400" />
                )}

                {isEditing ? (
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="min-w-0 flex-1 rounded bg-black/40 px-1.5 py-0.5 text-sm outline-none ring-1 ring-accent"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                )}

                <div
                  className={`flex items-center gap-0.5 ${
                    isEditing ? "" : "opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isEditing ? (
                    <>
                      <button
                        onClick={commitEdit}
                        className="rounded p-1 hover:text-accent"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded p-1 hover:text-gray-100"
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(s.id, s.title)}
                        className="rounded p-1 text-gray-400 hover:text-gray-100"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteChat(s.id)}
                        className="rounded p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-3 text-xs text-gray-500">
          AI Chat · streaming demo
        </div>
      </aside>
    </>
  );
}
