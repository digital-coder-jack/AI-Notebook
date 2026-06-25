'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearToken, getToken, setToken } from '@/lib/api';
import type { User } from '@/lib/types';

type Theme = 'light' | 'dark';

interface AppContextValue {
  user: User | null;
  loading: boolean;
  theme: Theme;
  toggleTheme: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme =
      (typeof window !== 'undefined' &&
        (window.localStorage.getItem('study_sphere_theme') as Theme)) ||
      'light';
    setTheme(storedTheme);

    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => setUserState(res.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('study_sphere_theme', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUserState(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.register(name, email, password);
      setToken(res.token);
      setUserState(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      loading,
      theme,
      toggleTheme,
      login,
      register,
      logout,
      setUser,
    }),
    [user, loading, theme, toggleTheme, login, register, logout, setUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
