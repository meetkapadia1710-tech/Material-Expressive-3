"use client";
// cspell:words lerp

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export interface ScrollStackMilestone {
  id: string;
  label: string;
  shortLabel?: string;
  year?: string;
  icon?: string;
}

export interface ScrollStackItemProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  style?: CSSProperties;
}

export function ScrollStackItem({
  children,
  className = "",
  itemClassName = "",
  style,
}: ScrollStackItemProps) {
  const combinedClass = `scroll-stack-card ${className} ${itemClassName}`.trim();
  return (
    <div className={combinedClass} style={style}>
      {children}
    </div>
  );
}

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  milestones?: ScrollStackMilestone[];
  itemStackDistance?: number;
  baseScale?: number;
  itemScale?: number;
}

export function ScrollStack({
  children,
  className = "",
  style,
  milestones,
  itemStackDistance = 52,
  baseScale = 0.92,
  itemScale = 0.04,
}: ScrollStackProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardOffsetsRef = useRef<number[]>([]);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalCards = React.Children.count(children);

  // Measure natural offsets in flow once to eliminate layout thrashing during scroll
  const measureOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;
    cardOffsetsRef.current = cards.map((card) => card.offsetTop);
  }, []);

  // Pure GPU transform application (Zero DOM reads = zero layout reflows)
  const applyTransforms = useCallback(
    (scrollTop: number) => {
      const cards = cardsRef.current;
      const offsets = cardOffsetsRef.current;
      if (!cards.length) return;

      const stackTopBase = 12; // Base offset where cards start pinning
      let currentActive = 0;

      cards.forEach((card, i) => {
        if (!card) return;

        const initialOffsetTop = offsets[i] ?? (i * 260);
        const targetTop = stackTopBase + i * itemStackDistance;
        const distanceToPin = initialOffsetTop - scrollTop - targetTop;

        let translateY = 0;
        let scale = 1;
        let isPinned = false;

        if (distanceToPin <= 0) {
          // Card reached pin destination; lock it at targetTop
          translateY = targetTop - (initialOffsetTop - scrollTop);
          isPinned = true;
          currentActive = Math.max(currentActive, i);
        }

        // Proportional depth scale down when covered by subsequent cards
        const nextInitialOffset = offsets[i + 1];
        if (nextInitialOffset !== undefined && isPinned) {
          const nextTargetTop = stackTopBase + (i + 1) * itemStackDistance;
          const nextDistToPin = nextInitialOffset - scrollTop - nextTargetTop;

          const approachRange = 240;
          if (nextDistToPin < approachRange) {
            const progress = Math.max(0, Math.min(1, 1 - nextDistToPin / approachRange));
            const depthScale = baseScale + i * itemScale;
            scale = 1 - progress * (1 - depthScale);
          }
        }

        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        card.style.zIndex = String(i + 10);

        // Only mutate DOM attribute when state flips to prevent style recalculation
        const wasPinned = card.getAttribute("data-pinned") === "true";
        if (isPinned && !wasPinned) {
          card.setAttribute("data-pinned", "true");
        } else if (!isPinned && wasPinned) {
          card.removeAttribute("data-pinned");
        }
      });

      setActiveIndex((prev) => (prev !== currentActive ? currentActive : prev));
    },
    [baseScale, itemScale, itemStackDistance]
  );

  // Silky-smooth spring physics lerp loop (60fps/120fps)
  const startLerp = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const step = () => {
      const scroller = scrollerRef.current;
      if (!scroller) {
        isAnimatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      const target = targetScrollRef.current;
      const current = currentScrollRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.3) {
        currentScrollRef.current = target;
        scroller.scrollTop = target;
        applyTransforms(target);
        isAnimatingRef.current = false;
        rafIdRef.current = null;
        return;
      }

      // Snappy spring-lerp factor (0.20 provides instantaneous response with zero discrete stepping)
      currentScrollRef.current += diff * 0.20;
      scroller.scrollTop = currentScrollRef.current;
      applyTransforms(currentScrollRef.current);

      rafIdRef.current = requestAnimationFrame(step);
    };

    rafIdRef.current = requestAnimationFrame(step);
  }, [applyTransforms]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const scroller = scrollerRef.current;
    if (!scroller || !wrapper) return;

    const cardElements = Array.from(
      scroller.querySelectorAll<HTMLElement>(".scroll-stack-card")
    );
    cardsRef.current = cardElements;

    measureOffsets();
    currentScrollRef.current = scroller.scrollTop;
    targetScrollRef.current = scroller.scrollTop;
    applyTransforms(scroller.scrollTop);

    const onScroll = () => {
      if (!isAnimatingRef.current) {
        currentScrollRef.current = scroller.scrollTop;
        targetScrollRef.current = scroller.scrollTop;
        applyTransforms(scroller.scrollTop);
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });

    // Smooth momentum wheel interceptor: turns discrete 100px mouse notches into a fluid continuous glide
    const onWheel = (e: WheelEvent) => {
      const { deltaY } = e;
      if (deltaY === 0) return;

      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 0) return;

      if (!isAnimatingRef.current) {
        currentScrollRef.current = scroller.scrollTop;
        targetScrollRef.current = scroller.scrollTop;
      }

      const nextTarget = Math.max(0, Math.min(maxScroll, targetScrollRef.current + deltaY));
      const canScrollDown = deltaY > 0 && currentScrollRef.current < maxScroll - 1;
      const canScrollUp = deltaY < 0 && currentScrollRef.current > 1;

      if (canScrollDown || canScrollUp) {
        if (e.cancelable) {
          e.preventDefault();
        }
        targetScrollRef.current = nextTarget;
        startLerp();
      }
    };

    // Keyboard navigation when deck is focused
    const onKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) return;

      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 0) return;

      let delta = 0;
      if (e.key === "ArrowDown") delta = 80;
      else if (e.key === "ArrowUp") delta = -80;
      else if (e.key === "PageDown") delta = 220;
      else if (e.key === "PageUp") delta = -220;

      if (delta !== 0) {
        if (!isAnimatingRef.current) {
          currentScrollRef.current = scroller.scrollTop;
          targetScrollRef.current = scroller.scrollTop;
        }
        const nextTarget = Math.max(0, Math.min(maxScroll, targetScrollRef.current + delta));
        if (nextTarget !== currentScrollRef.current) {
          e.preventDefault();
          targetScrollRef.current = nextTarget;
          startLerp();
        }
      }
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    wrapper.addEventListener("keydown", onKeyDown);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measureOffsets();
            applyTransforms(scroller.scrollTop);
          })
        : null;
    resizeObserver?.observe(scroller);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      resizeObserver?.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      wrapper.removeEventListener("wheel", onWheel);
      wrapper.removeEventListener("keydown", onKeyDown);
    };
  }, [applyTransforms, children, measureOffsets, startLerp]);

  const scrollToMilestone = (index: number) => {
    const scroller = scrollerRef.current;
    const offsets = cardOffsetsRef.current;
    if (!scroller) return;

    const initialOffsetTop = offsets[index] ?? (index * 260);
    const targetTop = 12 + index * itemStackDistance;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    const scrollTarget = Math.max(0, Math.min(maxScroll, initialOffsetTop - targetTop + 2));

    if (!isAnimatingRef.current) {
      currentScrollRef.current = scroller.scrollTop;
    }
    targetScrollRef.current = scrollTarget;
    startLerp();
  };

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      role="region"
      aria-label="Interactive Journey Timeline Deck"
      className={`scroll-stack-wrapper ${className}`}
      style={style}
    >
      {/* Expressive M3 Connected Button Group Header */}
      <div className="scroll-stack-header">
        {milestones && milestones.length ? (
          <div className="scroll-stack-controls">
            <div
              className="scroll-stack-button-group"
              role="tablist"
              aria-label="Journey Milestones"
            >
              {milestones.map((milestone, idx) => {
                const isSelected = activeIndex === idx;
                const toneClass =
                  idx === 0
                    ? "tone-corporate"
                    : idx === 1
                    ? "tone-hackathon"
                    : "tone-systems";
                return (
                  <button
                    key={milestone.id}
                    type="button"
                    role="tab"
                    id={`milestone-tab-${milestone.id}`}
                    aria-selected={isSelected}
                    className={`scroll-stack-btn ${toneClass}${isSelected ? " active" : ""}`}
                    onClick={() => scrollToMilestone(idx)}
                  >
                    {milestone.icon ? (
                      <span className="scroll-stack-btn-icon" aria-hidden="true">
                        {milestone.icon}
                      </span>
                    ) : null}
                    <span className="scroll-stack-btn-content">
                      {milestone.year ? (
                        <span className="scroll-stack-btn-year">{milestone.year}</span>
                      ) : null}
                      <span className="scroll-stack-btn-label">
                        {milestone.shortLabel ?? milestone.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="scroll-stack-counter-chip"
              aria-label={`Milestone ${activeIndex + 1} of ${totalCards}`}
            >
              <span className="scroll-stack-pulse-dot" aria-hidden="true" />
              <span className="scroll-stack-counter-text">
                {activeIndex + 1} / {totalCards}
              </span>
            </div>
          </div>
        ) : (
          <div className="scroll-stack-dots" role="tablist" aria-label="Timeline Milestones">
            {Array.from({ length: totalCards }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`scroll-stack-dot${activeIndex === idx ? " active" : ""}`}
                onClick={() => scrollToMilestone(idx)}
                aria-label={`Jump to milestone ${idx + 1}`}
                aria-selected={activeIndex === idx}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Container with Smooth Virtual Stacking */}
      <div ref={scrollerRef} className="scroll-stack-container">
        <div className="scroll-stack-inner">
          {children}
          {/* Spacer allowing clean final milestone pinning */}
          <div className="scroll-stack-spacer" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default ScrollStack;
