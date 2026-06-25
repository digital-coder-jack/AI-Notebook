'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import type { Catalog } from '@/lib/types';

export default function SettingsPage() {
  const { user, loading, theme, toggleTheme, setUser, logout } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [defaultModelId, setDefaultModelId] = useState('lite-swift');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDefaultModelId(user.defaultModelId);
    }
  }, [user]);

  useEffect(() => {
    api.catalog().then(setCatalog).catch(() => setCatalog(null));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.updateProfile({ name, defaultModelId });
      setUser(res.user);
      setSaved(true);
    } finally {
      setSaving(false);
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
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <button
        className="btn-ghost"
        style={{ borderRadius: 8, padding: '8px 14px', marginBottom: 20 }}
        onClick={() => router.push('/chat')}
      >
        ← Back to chat
      </button>

      <h1 style={{ marginBottom: 20 }}>Settings</h1>

      <section className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Profile</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Name</label>
            <input
              className="field"
              style={{ marginTop: 6 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-dim)' }}>Email</label>
            <input className="field" style={{ marginTop: 6 }} value={user.email} disabled />
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Default Model</h2>
        <div style={{ display: 'grid', gap: 16 }}>
          {catalog?.plans.map((plan) => (
            <div key={plan.name}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 10 }}>
                {plan.description}
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {plan.models.map((m) => (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      background:
                        m.id === defaultModelId ? 'var(--surface-2)' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="model"
                      checked={m.id === defaultModelId}
                      onChange={() => setDefaultModelId(m.id)}
                    />
                    <span>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 12,
                          color: 'var(--text-dim)',
                        }}
                      >
                        {m.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Appearance</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
          <button
            className="btn-ghost"
            style={{ borderRadius: 8, padding: '8px 14px' }}
            onClick={toggleTheme}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          className="btn-ghost"
          style={{ borderRadius: 8, padding: '12px 18px' }}
          onClick={logout}
        >
          Log out
        </button>
        {saved && (
          <span style={{ alignSelf: 'center', color: '#3ba55d', fontSize: 14 }}>
            Saved ✓
          </span>
        )}
      </div>
    </main>
  );
}
