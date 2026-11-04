"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { readMotionBezier, readMotionMilliseconds } from "./motion-tokens";

type RouteIntent = { direction: 1 | -1; shared: boolean };
type RouteIntentEvent = CustomEvent<RouteIntent>;

const initialIntent: RouteIntent = { direction: 1, shared: false };

export function RouteTransitionContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [nativeTransitions, setNativeTransitions] = useState<boolean | null>(null);
  const [initialPath] = useState(pathname);
  const [intent, setIntent] = useState(initialIntent);

  useEffect(() => {
    setNativeTransitions(typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === "function");
    const onIntent = (event: Event) => setIntent((event as RouteIntentEvent).detail);
    window.addEventListener("portfolio:route-intent", onIntent);
    return () => window.removeEventListener("portfolio:route-intent", onIntent);
  }, []);

  const animateFallback = nativeTransitions === false && !reduced;
  const duration = animateFallback ? readMotionMilliseconds("--motion-duration-card", 400) / 1000 : 0;
  const ease = animateFallback ? readMotionBezier("--motion-project-spatial-easing", [0.38, 1.21, 0.22, 1]) : undefined;
  const variants = {
    enter: (route: RouteIntent) => reduced || route.shared ? { opacity: 1, x: 0 } : { opacity: 0, x: route.direction * 14 },
    center: { opacity: 1, x: 0, transition: { duration, ease } },
    exit: (route: RouteIntent) => reduced || route.shared ? { opacity: 1, x: 0, transition: { duration: 0 } } : { opacity: 0, x: route.direction * -14, transition: { duration, ease } },
  };

  return <div className="route-transition-stack" data-route-ready={nativeTransitions !== null}>
    <AnimatePresence initial={false} mode={animateFallback ? "popLayout" : "sync"} custom={intent}>
      <motion.div key={animateFallback ? pathname : initialPath} className="route-transition-surface" custom={intent} variants={variants} initial={animateFallback ? "enter" : false} animate={animateFallback ? "center" : undefined} exit={animateFallback ? "exit" : undefined}>
        {children}
      </motion.div>
    </AnimatePresence>
  </div>;
}
