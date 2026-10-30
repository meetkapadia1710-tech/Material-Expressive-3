"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Transition,
} from "framer-motion";

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

export interface TextGenerateEffectProps
  extends React.HTMLAttributes<HTMLElement> {
  text?: string;
  words?: string;
  children?: React.ReactNode;
  as?: React.ElementType;
  delay?: number;
  duration?: number;
  filter?: boolean;
  inView?: boolean;
  inViewMargin?: InViewMargin;
  inViewOnce?: boolean;
  transition?: Transition;
}

export function TextGenerateEffect({
  text,
  words,
  children,
  as: Tag = "span",
  delay = 0.04,
  duration = 0.45,
  filter = true,
  inView = true,
  inViewMargin = "0px",
  inViewOnce = true,
  transition,
  className = "",
  style,
  ...props
}: TextGenerateEffectProps) {
  const ref = React.useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isIntersecting = useInView(ref, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const shouldAnimate = inView ? isIntersecting : true;

  const rawContent =
    text ?? words ?? (typeof children === "string" ? children : "");

  const wordsArray = React.useMemo(() => {
    if (!rawContent) return [];
    return rawContent.split(/\s+/).filter(Boolean);
  }, [rawContent]);

  if (!rawContent && children) {
    return (
      <Tag
        className={`text-generate-effect ${className}`.trim()}
        style={style}
        {...props}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`text-generate-effect ${className}`.trim()}
      style={{ display: "inline", ...style }}
      {...props}
    >
      <span className="sr-only">{rawContent}</span>
      <span aria-hidden="true">
        {wordsArray.map((word, index) => {
          const itemDelay = shouldReduceMotion ? 0 : index * delay;
          return (
            <motion.span
              key={`${word}-${index}`}
              className="text-generate-word"
              initial={
                shouldReduceMotion
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: filter ? "blur(8px)" : "none" }
              }
              animate={
                shouldAnimate || shouldReduceMotion
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: filter ? "blur(8px)" : "none" }
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
                willChange: "opacity, filter",
              }}
            >
              {word}
              {index < wordsArray.length - 1 ? "\u00A0" : ""}
            </motion.span>
          );
        })}
      </span>
    </Tag>
  );
}

