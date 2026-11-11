"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, duration: number = 800, enabled: boolean = true): number {
  // Initialize with target so SSR static HTML always renders the truthful number.
  const [current, setCurrent] = useState<number>(target);
  const currentRef = useRef<number>(target);
  const hasAnimatedOnce = useRef<boolean>(false);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    if (!enabled) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches || target === 0) {
      hasAnimatedOnce.current = true;
      currentRef.current = target;
      setCurrent(target);
      return;
    }

    const startVal = hasAnimatedOnce.current ? currentRef.current : 0;
    hasAnimatedOnce.current = true;

    if (startVal === target) {
      setCurrent(target);
      return;
    }

    if (startVal === 0) {
      setCurrent(0);
    }

    let start: number | null = null;
    let animId = 0;
    const diff = target - startVal;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(startVal + diff * ease);
      currentRef.current = nextVal;
      setCurrent(nextVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        currentRef.current = target;
        setCurrent(target);
      }
    };

    const stopForReducedMotion = () => {
      if (!motionPreference.matches) return;
      cancelAnimationFrame(animId);
      currentRef.current = target;
      setCurrent(target);
    };
    motionPreference.addEventListener("change", stopForReducedMotion);
    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      motionPreference.removeEventListener("change", stopForReducedMotion);
    };
  }, [target, duration, enabled]);

  return enabled ? current : target;
}
