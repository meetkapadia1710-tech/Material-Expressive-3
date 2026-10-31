"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type InViewMargin = NonNullable<Parameters<typeof useInView>[1]>["margin"];

export interface EncryptedTextProps extends React.HTMLAttributes<HTMLElement> {
  text?: string;
  children?: React.ReactNode;
  encryptedClassName?: string;
  revealedClassName?: string;
  revealDelayMs?: number;
  flipDelayMs?: number;
  charset?: string;
  as?: React.ElementType;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: InViewMargin;
  replayOnHover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~/\\";

export function EncryptedText({
  text,
  children,
  encryptedClassName = "m3-encrypted-scrambled",
  revealedClassName = "m3-encrypted-revealed",
  revealDelayMs = 50,
  flipDelayMs = 40,
  charset = DEFAULT_CHARSET,
  as: Tag = "span",
  inView = true,
  inViewOnce = true,
  inViewMargin = "-40px",
  replayOnHover = true,
  className = "",
  style,
  onMouseEnter,
  ...props
}: EncryptedTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const rawContent = text ?? (typeof children === "string" ? children : "");
  const shouldAnimate = inView ? isInView : true;

  const [revealedCount, setRevealedCount] = useState<number>(() =>
    shouldReduceMotion ? rawContent.length : 0
  );
  const [scrambledChars, setScrambledChars] = useState<string[]>(() =>
    rawContent.split("")
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealedCount(rawContent.length);
      setScrambledChars(rawContent.split(""));
    }
  }, [shouldReduceMotion, rawContent]);

  useEffect(() => {
    if (shouldReduceMotion || !shouldAnimate || !isMounted || !rawContent) {
      return;
    }

    setRevealedCount(0);
    let currentRevealed = 0;
    const totalLength = rawContent.length;

    const flipInterval = setInterval(() => {
      setScrambledChars((prev) => {
        const next = [...prev];
        for (let i = currentRevealed; i < totalLength; i++) {
          const char = rawContent[i];
          if (char === " " || char === "\n" || char === "\t") {
            next[i] = char;
          } else {
            const randomChar = charset[Math.floor(Math.random() * charset.length)];
            next[i] = randomChar;
          }
        }
        return next;
      });
    }, flipDelayMs);

    const revealInterval = setInterval(() => {
      currentRevealed += 1;
      setRevealedCount(currentRevealed);

      if (currentRevealed >= totalLength) {
        clearInterval(revealInterval);
        clearInterval(flipInterval);
        setScrambledChars(rawContent.split(""));
      }
    }, revealDelayMs);

    return () => {
      clearInterval(revealInterval);
      clearInterval(flipInterval);
    };
  }, [shouldAnimate, shouldReduceMotion, isMounted, rawContent, charset, revealDelayMs, flipDelayMs]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event);
    if (!replayOnHover || shouldReduceMotion || !rawContent) return;

    if (revealedCount >= rawContent.length) {
      setRevealedCount(0);
      let currentRevealed = 0;
      const totalLength = rawContent.length;

      const flipInterval = setInterval(() => {
        setScrambledChars((prev) => {
          const next = [...prev];
          for (let i = currentRevealed; i < totalLength; i++) {
            const char = rawContent[i];
            if (char === " " || char === "\n" || char === "\t") {
              next[i] = char;
            } else {
              const randomChar = charset[Math.floor(Math.random() * charset.length)];
              next[i] = randomChar;
            }
          }
          return next;
        });
      }, flipDelayMs);

      const revealInterval = setInterval(() => {
        currentRevealed += 1;
        setRevealedCount(currentRevealed);

        if (currentRevealed >= totalLength) {
          clearInterval(revealInterval);
          clearInterval(flipInterval);
          setScrambledChars(rawContent.split(""));
        }
      }, revealDelayMs);
    }
  };

  if (!isMounted || shouldReduceMotion || !rawContent) {
    return (
      <Tag
        ref={containerRef}
        className={`m3-encrypted-container ${className}`.trim()}
        style={{ display: "inline", ...style }}
        {...props}
      >
        <span className="sr-only">{rawContent}</span>
        <span aria-hidden="true" className={revealedClassName}>
          {rawContent}
        </span>
      </Tag>
    );
  }

  return (
    <Tag
      ref={containerRef}
      className={`m3-encrypted-container ${className}`.trim()}
      style={{ display: "inline", ...style }}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      <span className="sr-only">{rawContent}</span>
      <span aria-hidden="true" className="m3-encrypted-display">
        {rawContent.split("").map((char, index) => {
          const isRevealed = index < revealedCount;
          const displayChar = isRevealed ? char : (scrambledChars[index] ?? char);
          const charClass = isRevealed ? revealedClassName : encryptedClassName;

          return (
            <span
              key={index}
              className={`m3-encrypted-char ${charClass}`.trim()}
            >
              {displayChar}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

export function EncryptedTextDemoSecond() {
  return (
    <p className="mx-auto max-w-lg py-10 text-left">
      <EncryptedText
        text="Welcome to the Matrix, Neo."
        encryptedClassName="text-neutral-500"
        revealedClassName="dark:text-white text-black"
        revealDelayMs={50}
      />
    </p>
  );
}
