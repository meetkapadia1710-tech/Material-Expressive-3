"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, duration: number = 800, enabled: boolean = true): number {
  // Initialize with target so SSR static HTML always renders the truthful number
  const [current, setCurrent] = useState<number>(target);

  useEffect(() => {
    if (!enabled) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Start count-up on client mount
    setCurrent(0);

    let start: number | null = null;
    let animId: number;
    const startVal = 0;
    const diff = target - startVal;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startVal + diff * ease));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration, enabled]);

  return current;
}
