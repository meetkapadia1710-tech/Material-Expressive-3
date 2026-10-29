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
  const [nativeTransitions, setNativeTransitions] = useState(false);
  const [intent, setIntent] = useState(initialIntent);

  useEffect(() => {
    setNativeTransitions(typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === "function");
    const onIntent = (event: Event) => setIntent((event as RouteIntentEvent).detail);
    window.addEventListener("portfolio:route-intent", onIntent);
    return () => window.removeEventListener("portfolio:route-intent", onIntent);
  }, []);

  const duration = reduced ? 0.01 : readMotionMilliseconds("--motion-duration-card", 400) / 1000;
  const ease = readMotionBezier("--motion-project-spatial-easing", [0.38, 1.21, 0.22, 1]);
  const variants = {
    enter: (route: RouteIntent) => reduced || route.shared ? { opacity: 1, x: 0 } : { opacity: 0, x: route.direction * 14 },
    center: { opacity: 1, x: 0, transition: { duration, ease } },
    exit: (route: RouteIntent) => reduced || route.shared ? { opacity: 1, x: 0, transition: { duration: 0 } } : { opacity: 0, x: route.direction * -14, transition: { duration, ease } },
  };

  if (nativeTransitions) return <div className="route-transition-surface">{children}</div>;

  return <div className="route-transition-stack">
    <AnimatePresence initial={false} mode="popLayout" custom={intent}>
      <motion.div key={pathname} className="route-transition-surface" custom={intent} variants={variants} initial="enter" animate="center" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  </div>;
}
