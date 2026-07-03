"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NavSection, NavItem } from "@/lib/types";
import { NavItemButton } from "./NavItemButton";
import { cn } from "@/lib/utils";

interface NavSectionGroupProps {
  section: NavSection;
  collapsed: boolean;
  onNavigate?: () => void;
  onContextMenu?: (e: React.MouseEvent, item: NavItem) => void;
}

export function NavSectionGroup({
  section,
  collapsed,
  onNavigate,
  onContextMenu,
}: NavSectionGroupProps) {
  return (
    <section aria-label={section.title ?? section.id} className="w-full">
      {/* Section title / divider */}
      <div className={cn("px-3 pb-1 pt-4", collapsed && "px-2")}>
        <AnimatePresence initial={false} mode="wait">
          {!collapsed && section.title ? (
            <motion.h3
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              {section.title}
            </motion.h3>
          ) : (
            <motion.div
              key="divider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto h-px w-6 rounded-full bg-line"
              aria-hidden
            />
          )}
        </AnimatePresence>
      </div>

      <ul className="flex flex-col gap-0.5 px-2" role="list">
        {section.items.map((item) => (
          <li key={item.id}>
            <NavItemButton
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
              onContextMenu={onContextMenu}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
