"use client";

import { useEffect, useRef } from "react";

interface SwipeOptions {
  /** Fires when the user swipes right starting near the left screen edge. */
  onSwipeRightFromEdge?: () => void;
  /** Fires on a leftward swipe anywhere (used to close the drawer). */
  onSwipeLeft?: () => void;
  edgeWidth?: number;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Global touch-gesture hook powering the mobile drawer:
 * swipe right from the left edge opens, swipe left closes.
 */
export function useSwipe({
  onSwipeRightFromEdge,
  onSwipeLeft,
  edgeWidth = 32,
  threshold = 56,
  enabled = true,
}: SwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      const horizontal = Math.abs(dx) > Math.abs(dy) * 1.4;

      if (horizontal && Math.abs(dx) > threshold) {
        if (dx > 0 && start.current.x <= edgeWidth) {
          onSwipeRightFromEdge?.();
        } else if (dx < 0) {
          onSwipeLeft?.();
        }
      }
      start.current = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, edgeWidth, threshold, onSwipeRightFromEdge, onSwipeLeft]);
}
