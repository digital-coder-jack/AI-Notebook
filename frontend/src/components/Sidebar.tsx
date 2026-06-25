'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import type { ChatSession } from '@/lib/types';

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({
  sessions,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
}: SidebarProps) {
  const { user, theme, toggleTheme, logout } = useApp();
  const router = useRouter();

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        background: 'var(--sidebar)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          🎓
        </div>
        <strong style={{ fontSize: 17 }}>Study Sphere</strong>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <button
          className="btn"
          style={{ width: '100%' }}
          onClick={onNewChat}
        >
          + New Chat
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 10px',
        }}
      >
        {sessions.length === 0 && (
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              padding: 12,
              textAlign: 'center',
            }}
          >
            No conversations yet.
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 4,
              cursor: 'pointer',
              background:
                s.id === activeId ? 'var(--sidebar-2)' : 'transparent',
            }}
          >
            <span
              style={{
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {s.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
              }}
              aria-label="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 8px',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: user?.avatarColor || 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-ghost"
            style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 0', fontSize: 13 }}
            onClick={() => router.push('/settings')}
          >
            Settings
          </button>
          <button
            className="btn-ghost"
            style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 0', fontSize: 13 }}
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <button
          className="btn-ghost"
          style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 0', fontSize: 13 }}
          onClick={logout}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
