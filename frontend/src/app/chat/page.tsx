'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import type { ChatMessage, ChatSession } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import ModelPicker from '@/components/ModelPicker';

export default function ChatPage() {
  const { user, loading } = useApp();
  const router = useRouter();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [modelId, setModelId] = useState('lite-swift');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setModelId(user.defaultModelId);
    }
  }, [user]);

  const refreshSessions = useCallback(async () => {
    const res = await api.listSessions();
    setSessions(res.sessions);
    return res.sessions;
  }, []);

  useEffect(() => {
    if (user) {
      refreshSessions().then((list) => {
        if (list.length > 0) {
          setActiveId(list[0].id);
        }
      });
    }
  }, [user, refreshSessions]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    api.getSession(activeId).then((res) => {
      setMessages(res.messages);
      setModelId(res.session.modelId);
    });
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  async function handleNewChat() {
    const res = await api.createSession(modelId);
    await refreshSessions();
    setActiveId(res.session.id);
    setMessages([]);
  }

  async function handleDelete(id: string) {
    await api.deleteSession(id);
    const list = await refreshSessions();
    if (id === activeId) {
      setActiveId(list.length ? list[0].id : null);
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    let sessionId = activeId;
    if (!sessionId) {
      const res = await api.createSession(modelId);
      sessionId = res.session.id;
      setActiveId(sessionId);
      await refreshSessions();
    }

    setInput('');
    setSending(true);

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content,
      modelId,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.sendMessage(sessionId, content, modelId);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        res.userMessage,
        res.assistantMessage,
      ]);
      await refreshSessions();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) {
    return (
      <main
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
        }}
      >
        Loading...
      </main>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
      />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <header
          style={{
            height: 60,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            background: 'var(--surface)',
          }}
        >
          <strong>{sessions.find((s) => s.id === activeId)?.title || 'New Chat'}</strong>
          <ModelPicker value={modelId} onChange={setModelId} />
        </header>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.length === 0 && !sending && (
            <div
              style={{
                margin: 'auto',
                textAlign: 'center',
                color: 'var(--text-dim)',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p>Ask anything to start studying.</p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className="fade-in"
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '70%',
                background:
                  m.role === 'user' ? 'var(--bubble-user)' : 'var(--bubble-ai)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                padding: '12px 16px',
                borderRadius: 14,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {m.content}
            </div>
          ))}

          {sending && (
            <div
              style={{
                alignSelf: 'flex-start',
                background: 'var(--bubble-ai)',
                color: 'var(--text-dim)',
                padding: '12px 16px',
                borderRadius: 14,
              }}
            >
              Thinking…
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          style={{
            borderTop: '1px solid var(--border)',
            padding: 16,
            display: 'flex',
            gap: 10,
            background: 'var(--surface)',
          }}
        >
          <input
            className="field"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
