"use client";

import React, { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSidebar } from "./SidebarProvider";

interface NavItemButtonProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  onContextMenu?: (e: React.MouseEvent, item: NavItem) => void;
}

export function NavItemButton({
  item,
  collapsed,
  onNavigate,
  onContextMenu,
}: NavItemButtonProps) {
  const { activeId, setActiveId } = useSidebar();
  const active = activeId === item.id;
  const ref = useRef<HTMLButtonElement>(null);
  const Icon = item.icon;

  /** Material-style ripple, spawned at the click position. */
  const spawnRipple = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    spawnRipple(e);
    setActiveId(item.id);
    onNavigate?.();
  };

  return (
    <Tooltip label={item.label} shortcut={item.shortcut} disabled={!collapsed}>
      <motion.button
        ref={ref}
        type="button"
        onClick={handleClick}
        onContextMenu={
          item.contextMenu && onContextMenu
            ? (e) => onContextMenu(e, item)
            : undefined
        }
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "ripple-host group relative flex w-full items-center rounded-xl text-left",
          "min-h-[44px] gap-3 px-3 py-2.5", // ≥44px touch target
          "transition-colors duration-200",
          collapsed && "justify-center px-0",
          active
            ? "text-ink"
            : "text-ink-muted hover:bg-line/40 hover:text-ink"
        )}
      >
        {/* Sliding active indicator (shared layout animation) */}
        {active && (
          <motion.span
            layoutId="sidebar-active-pill"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "absolute inset-0 rounded-xl",
              "bg-gradient-to-r from-accent-blue/15 via-accent-purple/10 to-transparent",
              "ring-1 ring-inset ring-accent-blue/25",
              item.aiGlow && "shadow-glow-ai"
            )}
            aria-hidden
          />
        )}
        {/* Left accent bar for the active item */}
        {active && (
          <motion.span
            layoutId="sidebar-active-bar"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-accent-blue to-accent-purple"
            aria-hidden
          />
        )}

        <span
          className={cn(
            "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-transform duration-300",
            "group-hover:rotate-[6deg]",
            active && "text-accent-blue",
            item.aiGlow && (active || undefined) && "text-accent-purple"
          )}
        >
          <Icon
            className={cn(
              "h-[18px] w-[18px]",
              item.aiGlow && "group-hover:ai-icon-glow",
              item.aiGlow && active && "ai-icon-glow"
            )}
            strokeWidth={active ? 2.2 : 1.8}
            aria-hidden
          />
        </span>

        {!collapsed && (
          <>
            <span className="relative z-10 flex-1 truncate text-[13px] font-medium tracking-[-0.01em]">
              {item.label}
            </span>
            {item.badge && <Badge badge={item.badge} className="relative z-10" />}
            {item.shortcut && !item.badge && (
              <kbd className="relative z-10 hidden rounded-md bg-line/50 px-1.5 py-0.5 font-mono text-[10px] text-ink-faint group-hover:inline-block">
                {item.shortcut}
              </kbd>
            )}
          </>
        )}

        {/* Collapsed badge dot */}
        {collapsed && item.badge && (
          <span
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-blue shadow-glow-blue"
            aria-hidden
          />
        )}
      </motion.button>
    </Tooltip>
  );
}
