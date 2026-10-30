"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from "framer-motion";

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

export interface BlurTextProps extends React.HTMLAttributes<HTMLElement> {
  text?: string;
  children?: React.ReactNode;
  as?: React.ElementType;
  delay?: number;
  duration?: number;
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  inView?: boolean;
  inViewMargin?: InViewMargin;
  inViewOnce?: boolean;
  transition?: Transition;
}

export function BlurText({
  text,
  children,
  as: Tag = "span",
  delay = 45,
  duration = 0.55,
  animateBy = "words",
  direction = "bottom",
  inView = true,
  inViewMargin = "0px",
  inViewOnce = true,
  transition,
  className = "",
  style,
  ...props
}: BlurTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isIntersecting = useInView(ref, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const shouldAnimate = inView ? isIntersecting : true;

  const rawContent = text ?? (typeof children === "string" ? children : "");
  const segments = React.useMemo(() => {
    if (!rawContent) return [];
    if (animateBy === "characters") {
      return Array.from(rawContent);
    }
    return rawContent.split(/\s+/).filter(Boolean);
  }, [rawContent, animateBy]);

  if (!rawContent && children) {
    return (
      <Tag className={`blur-text ${className}`.trim()} style={style} {...props}>
        {children}
      </Tag>
    );
  }

  const yOffset = direction === "top" ? -10 : 10;

  return (
    <Tag
      ref={ref}
      className={`blur-text ${className}`.trim()}
      style={{ display: "inline-block", ...style }}
      {...props}
    >
      <span className="sr-only">{rawContent}</span>
      <span aria-hidden="true">
        {segments.map((segment, index) => {
          const itemDelay = shouldReduceMotion ? 0 : (index * delay) / 1000;
          return (
            <motion.span
              key={`${segment}-${index}`}
              className="blur-text-item"
              initial={
                shouldReduceMotion
                  ? { filter: "blur(0px)", opacity: 1, y: 0 }
                  : { filter: "blur(10px)", opacity: 0, y: yOffset }
              }
              animate={
                shouldAnimate || shouldReduceMotion
                  ? { filter: "blur(0px)", opacity: 1, y: 0 }
                  : { filter: "blur(10px)", opacity: 0, y: yOffset }
              }
              transition={
                transition ?? {
                  duration: shouldReduceMotion ? 0.01 : duration,
                  delay: itemDelay,
                  ease: [0.22, 1, 0.36, 1], // Material 3 Expressive spring curve
                }
              }
              style={{
                display: "inline-block",
                willChange: "transform, opacity, filter",
              }}
            >
              {segment}
              {animateBy === "words" && index < segments.length - 1 ? "\u00A0" : ""}
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}
