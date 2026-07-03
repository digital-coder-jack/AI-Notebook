"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface SidebarContextValue {
  /** Desktop: expanded vs 72px rail */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile drawer open state */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Active nav item id */
  activeId: string;
  setActiveId: (id: string) => void;
  /** Command palette */
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  isMobile: boolean;
  /** Theme */
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "ainb.sidebar";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState("dashboard");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted state (remember sidebar state across sessions)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.collapsed === "boolean") setCollapsed(saved.collapsed);
        if (typeof saved.activeId === "string") setActiveId(saved.activeId);
        if (saved.theme === "light" || saved.theme === "dark")
          setTheme(saved.theme);
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ collapsed, activeId, theme })
      );
    } catch {
      /* storage may be unavailable */
    }
  }, [collapsed, activeId, theme, hydrated]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  // Global keyboard shortcuts: Ctrl/Cmd+K palette, Ctrl/Cmd+B collapse, Esc close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isMobile) setDrawerOpen((v) => !v);
        else setCollapsed((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile]);

  // Close drawer automatically when switching to desktop
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      drawerOpen,
      openDrawer,
      closeDrawer,
      activeId,
      setActiveId,
      paletteOpen,
      setPaletteOpen,
      isMobile,
      theme,
      toggleTheme,
    }),
    [
      collapsed,
      toggleCollapsed,
      drawerOpen,
      openDrawer,
      closeDrawer,
      activeId,
      paletteOpen,
      isMobile,
      theme,
      toggleTheme,
    ]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
