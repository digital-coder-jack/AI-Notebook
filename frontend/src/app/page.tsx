'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/chat' : '/auth');
  }, [user, loading, router]);

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
      Loading Study Sphere...
    </main>
  );
}
