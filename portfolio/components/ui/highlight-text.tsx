"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "framer-motion";

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

export interface HighlightTextProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  text?: string;
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  highlightColor?: string;
  inView?: boolean;
  inViewMargin?: InViewMargin;
  inViewOnce?: boolean;
  transition?: Transition;
}

export function HighlightText({
  text,
  children,
  delay = 0,
  duration = 1.2,
  highlightColor,
  inView = true,
  inViewMargin = "0px",
  inViewOnce = true,
  transition,
  className = "",
  style,
  ...props
}: HighlightTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isIntersecting = useInView(ref, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const shouldAnimate = inView ? isIntersecting : true;

  const defaultBackground =
    highlightColor
      ? (highlightColor.includes("gradient")
          ? highlightColor
          : `linear-gradient(to right, ${highlightColor}, ${highlightColor})`)
      : "linear-gradient(120deg, color-mix(in srgb, var(--color-secondary, #E3F29C) 85%, transparent) 0%, color-mix(in srgb, var(--color-primary-container, #E9DDFF) 90%, transparent) 100%)";

  const effectiveTransition: Transition = transition ?? {
    duration: shouldReduceMotion ? 0.01 : duration,
    delay: shouldReduceMotion ? 0 : delay / 1000,
    ease: [0.22, 1, 0.36, 1],
  };

  const content = text ?? children;

  return (
    <motion.span
      ref={ref}
      className={`highlight-text ${className}`.trim()}
      initial={{
        backgroundSize: shouldReduceMotion ? "100% 100%" : "0% 100%",
      }}
      animate={
        shouldAnimate
          ? { backgroundSize: "100% 100%" }
          : { backgroundSize: "0% 100%" }
      }
      transition={effectiveTransition}
      style={{
        backgroundImage: defaultBackground,
        ...style,
      }}
      {...props}
    >
      {content}
    </motion.span>
  );
}
