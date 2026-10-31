"use client";

import React, { useRef, useEffect, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
  useReducedMotion,
} from "framer-motion";

export interface MaskContainerProps {
  children?: ReactNode;
  revealText?: ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
  containerClassName?: string;
  textClassName?: string;
  revealTextClassName?: string;
}

export function MaskContainer({
  children,
  revealText,
  size = 0,
  revealSize = 380,
  className = "",
  containerClassName = "",
  textClassName = "",
  revealTextClassName = "",
}: MaskContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const radius = useMotionValue(size / 2);
  // Ensure the radius in the radial-gradient can NEVER be negative,
  // preventing CSS syntax rejection and full-background flash during exit overshoots.
  const clampedRadius = useTransform(radius, (r) => Math.max(0, r));

  const opacity = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const maskImage = useMotionTemplate`radial-gradient(circle ${clampedRadius}px at ${mouseX}px ${mouseY}px, black 98%, transparent 100%)`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animRadius: ReturnType<typeof animate> | null = null;
    let animOpacity: ReturnType<typeof animate> | null = null;
    let isInside = false;

    const onMove = (e: MouseEvent | PointerEvent | Touch) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(Math.round(e.clientX - rect.left));
      mouseY.set(Math.round(e.clientY - rect.top));
    };

    const onEnter = (e: MouseEvent | PointerEvent | Touch) => {
      if (isInside) return;
      isInside = true;
      const rect = el.getBoundingClientRect();
      mouseX.set(Math.round(e.clientX - rect.left));
      mouseY.set(Math.round(e.clientY - rect.top));

      animRadius?.stop();
      animOpacity?.stop();

      animRadius = animate(radius, revealSize / 2, {
        duration: shouldReduceMotion ? 0.01 : 0.36,
        ease: [0.38, 1.21, 0.22, 1], // Material 3 Expressive spring on entrance
      });
      animOpacity = animate(opacity, 1, {
        duration: shouldReduceMotion ? 0.01 : 0.2,
        ease: "easeOut",
      });
    };

    const onLeave = () => {
      if (!isInside) return;
      isInside = false;

      animRadius?.stop();
      animOpacity?.stop();

      animRadius = animate(radius, size / 2, {
        duration: shouldReduceMotion ? 0.01 : 0.28,
        ease: [0.2, 0.75, 0.2, 1], // Material 3 decelerate exit without negative overshoot
      });
      animOpacity = animate(opacity, 0, {
        duration: shouldReduceMotion ? 0.01 : 0.24,
        ease: "easeOut",
      });
    };

    const handlePointerMove = (e: PointerEvent) => onMove(e);
    const handlePointerEnter = (e: PointerEvent) => onEnter(e);
    const handlePointerLeave = () => onLeave();

    const handleMouseMove = (e: MouseEvent) => onMove(e);
    const handleMouseEnter = (e: MouseEvent) => onEnter(e);
    const handleMouseLeave = () => onLeave();

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0]);
    };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) onEnter(e.touches[0]);
    };
    const handleTouchEnd = () => onLeave();

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerenter", handlePointerEnter);
    el.addEventListener("pointerleave", handlePointerLeave);

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      animRadius?.stop();
      animOpacity?.stop();
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerenter", handlePointerEnter);
      el.removeEventListener("pointerleave", handlePointerLeave);
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [mouseX, mouseY, radius, opacity, revealSize, size, shouldReduceMotion]);

  const contentToReveal = revealText ?? children;

  return (
    <div
      ref={containerRef}
      className={`m3-mask-container ${containerClassName} ${className}`.trim()}
    >
      {/* Base Layer */}
      <div className={`m3-mask-base ${textClassName}`.trim()}>{children}</div>

      {/* Mask Reveal Layer */}
      <motion.div
        className={`m3-mask-reveal-layer ${revealTextClassName}`.trim()}
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          opacity,
        }}
        aria-hidden="true"
      >
        <div className="m3-mask-reveal-content">{contentToReveal}</div>
      </motion.div>
    </div>
  );
}

export function SVGMaskEffectDemo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`m3-mask-demo-wrapper ${className}`.trim()}>
      <MaskContainer
        revealSize={380}
        revealText={
          <div className="m3-mask-demo-text m3-mask-demo-reveal">
            <span className="m3-mask-spark" aria-hidden="true">
              ✦
            </span>
            <p>
              Crafting interfaces that feel{" "}
              <span className="m3-mask-highlight">natural</span>, responsive, and
              unmistakably <span className="m3-mask-highlight">expressive</span>.
              Engineered with{" "}
              <span className="m3-mask-highlight">Material 3 Expressive</span>{" "}
              tokens, fluid springs, and dynamic seed color harmony.
            </p>
          </div>
        }
        className="m3-mask-demo-card"
      >
        <div className="m3-mask-demo-text m3-mask-demo-base">
          <span className="m3-mask-spark" aria-hidden="true">
            ✳
          </span>
          <p>
            Crafting interfaces that feel natural, responsive, and unmistakably{" "}
            expressive. Engineered with Material 3 Expressive tokens, fluid
            springs, and dynamic seed color harmony.
          </p>
        </div>
      </MaskContainer>
    </div>
  );
}
