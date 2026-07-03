"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSidebar } from "./SidebarProvider";
import { SidebarContent } from "./SidebarContent";

export const SIDEBAR_EXPANDED = 280;
export const SIDEBAR_COLLAPSED = 72;

/**
 * Desktop sidebar — rounded floating container with subtle glass blur,
 * ambient glow, and a 300ms width collapse animation.
 */
export function DesktopSidebar() {
  const { collapsed } = useSidebar();

  return (
    <motion.aside
      aria-label="Sidebar"
      initial={false}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="relative z-40 hidden h-[calc(100dvh-24px)] shrink-0 lg:my-3 lg:ml-3 lg:block"
    >
      <div
        className="sidebar-glow relative h-full overflow-visible rounded-3xl border border-line/60 bg-surface-raised/80 shadow-soft backdrop-blur-xl"
      >
        <SidebarContent collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
