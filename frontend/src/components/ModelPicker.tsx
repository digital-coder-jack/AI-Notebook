'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Catalog } from '@/lib/types';

interface ModelPickerProps {
  value: string;
  onChange: (modelId: string) => void;
}

export default function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    api.catalog().then(setCatalog).catch(() => setCatalog(null));
  }, []);

  const current = catalog?.plans
    .flatMap((p) => p.models.map((m) => ({ ...m, plan: p.name })))
    .find((m) => m.id === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn-ghost"
        style={{ borderRadius: 8, padding: '8px 12px', fontSize: 14 }}
        onClick={() => setOpen((o) => !o)}
      >
        {current ? `${current.plan} · ${current.name}` : 'Select model'} ▾
      </button>

      {open && catalog && (
        <div
          className="card fade-in"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            width: 300,
            padding: 8,
            zIndex: 20,
            maxHeight: 420,
            overflowY: 'auto',
          }}
        >
          {catalog.plans.map((plan) => (
            <div key={plan.name} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                  padding: '8px 10px 4px',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {plan.name}
              </div>
              {plan.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background:
                      m.id === value ? 'var(--surface-2)' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: 'var(--text)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {m.description}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
