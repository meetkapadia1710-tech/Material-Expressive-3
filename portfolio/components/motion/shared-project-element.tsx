"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { readMotionBezier, readMotionMilliseconds } from "./motion-tokens";

export function ProjectTransitionGroup({ children }: { children: ReactNode }) {
  return <LayoutGroup id="portfolio-project-transition">{children}</LayoutGroup>;
}

export function useSharedProjectTransitionEnabled() {
  const [finePointer, setFinePointer] = useState(true);
  useEffect(() => {
    const query = matchMedia("(min-width: 481px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)");
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return finePointer;
}

type SharedProjectElementProps = {
  slug: string;
  element: "container" | "shape" | "title";
  as?: "div" | "article" | "span";
  className?: string;
  ariaHidden?: boolean;
  children: ReactNode;
};

export function SharedProjectElement({ slug, element, as = "div", className, ariaHidden, children }: SharedProjectElementProps) {
  const enabled = useSharedProjectTransitionEnabled();
  const sharedProps = {
    className,
    "aria-hidden": ariaHidden || undefined,
    layoutId: enabled ? `portfolio-project-${slug}-${element}` : undefined,
    transition: {
      layout: {
        duration: readMotionMilliseconds("--motion-duration-card", 400) / 1000,
        ease: readMotionBezier("--motion-project-spatial-easing", [0.38, 1.21, 0.22, 1]),
      },
    },
  };
  if (as === "span") return <motion.span {...sharedProps}>{children}</motion.span>;
  if (as === "article") return <motion.article {...sharedProps}>{children}</motion.article>;
  return <motion.div {...sharedProps}>{children}</motion.div>;
}
