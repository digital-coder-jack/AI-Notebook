"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { useSwipe } from "@/hooks/useSwipe";
import { SidebarContent } from "./SidebarContent";

/**
 * Mobile slide-in drawer (85% width, max 320px) with:
 * - swipe-right-from-edge to open, swipe-left / drag to close
 * - blurred overlay, tap-outside closes
 * - floating hamburger with safe-area support
 * - focus management for screen readers
 */
export function MobileDrawer() {
  const { drawerOpen, openDrawer, closeDrawer, isMobile } = useSidebar();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Global swipe gestures
  useSwipe({
    enabled: isMobile,
    onSwipeRightFromEdge: openDrawer,
    onSwipeLeft: () => drawerOpen && closeDrawer(),
  });

  // Lock body scroll while open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) closeDrawer();
  };

  return (
    <>
      {/* Floating hamburger — thumb-friendly bottom-left, safe-area aware */}
      {!drawerOpen && (
        <motion.button
          type="button"
          onClick={openDrawer}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          aria-label="Open navigation menu"
          className="safe-bottom safe-left fixed bottom-5 left-5 z-[80] grid h-[52px] w-[52px] place-items-center rounded-2xl border border-line/60 bg-surface-overlay/90 text-ink shadow-soft backdrop-blur-xl lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </motion.button>
      )}

      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Blurred overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeDrawer}
              aria-hidden
              className="fixed inset-0 z-[85] bg-black/55 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation drawer"
              tabIndex={-1}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.4, right: 0 }}
              onDragEnd={onDragEnd}
              className="safe-top safe-bottom safe-left fixed inset-y-0 left-0 z-[86] w-[85%] max-w-[320px] lg:hidden"
            >
              <div className="sidebar-glow relative m-2 flex h-[calc(100%-16px)] flex-col overflow-hidden rounded-3xl border border-line/60 bg-surface-raised/95 shadow-soft backdrop-blur-2xl">
                {/* Close button */}
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close navigation menu"
                  className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-line/50 hover:text-ink"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>

                <SidebarContent
                  collapsed={false}
                  onNavigate={closeDrawer}
                  showCollapseToggle={false}
                />

                {/* Drag handle hint */}
                <div
                  className="absolute right-1 top-1/2 h-12 w-1 -translate-y-1/2 rounded-full bg-line/70"
                  aria-hidden
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
