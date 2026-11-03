"use client";

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import { Icon, type IconName } from "@/components/icon";

interface SectionDestination {
  id: string;
  label: string;
  icon: IconName;
}

const destinations: SectionDestination[] = [
  { id: "achievement-experience", label: "Experience", icon: "school" },
  { id: "achievement-hackathons", label: "Hackathons", icon: "trophy" },
  { id: "achievement-certifications", label: "Certifications", icon: "check" },
  { id: "achievement-coding", label: "Coding Profiles", icon: "code" },
  { id: "achievement-github", label: "GitHub Activity", icon: "github" },
];

const FIRST_ID = destinations[0].id;

/**
 * Compute the active section from current scroll position.
 * Scans sections from bottom to top and returns the first whose
 * top edge has passed the activation line.
 * - At page top → first section
 * - At page bottom → last section
 */
function getActiveSectionFromScroll(
  sectionIds: string[],
  activationLineY: number
): string {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  // At the very top of the page: always first section
  if (scrollY < 40) return sectionIds[0];

  // At the very bottom of the page: always last section
  if (scrollY + winHeight >= docHeight - 40) return sectionIds[sectionIds.length - 1];

  // Walk sections in reverse order; return the last one whose top is above the activation line
  let best = sectionIds[0];
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const elTop = rect.top + scrollY;
    if (elTop <= scrollY + activationLineY + 8) {
      best = id;
    }
  }
  return best;
}

export function AchievementsScrollNav() {
  const [activeSection, setActiveSection] = useState<string>(FIRST_ID);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const navWrapperRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const activeSectionRef = useRef<string>(FIRST_ID);

  // Click-lock: while locked, scroll-spy ignores intermediate sections
  const clickLockRef = useRef<{
    targetId: string;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);

  const isReducedMotion = useRef(false);

  // Sync activeSection ref so closures always read fresh value
  const setActive = useCallback((id: string) => {
    if (activeSectionRef.current === id) return;
    activeSectionRef.current = id;
    setActiveSection(id);
  }, []);

  // ─── Indicator position ───────────────────────────────────────────
  const updateIndicator = useCallback(() => {
    const btn = buttonRefs.current.get(activeSectionRef.current);
    const container = groupRef.current;
    if (!btn || !container) return;
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    });
  }, []);

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeSection, updateIndicator]);

  // ─── Scroll active chip into view on mobile ───────────────────────
  const scrollChipIntoView = useCallback((id: string) => {
    const btn = buttonRefs.current.get(id);
    if (btn) {
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, []);

  // ─── Compute activation line from real DOM heights ────────────────
  const getActivationLineY = useCallback((): number => {
    // Header: look for the main sticky header element
    const header = document.querySelector<HTMLElement>("header[class*='site-header'], .site-header, header.header, [data-header]");
    const headerH = header ? header.offsetHeight : 80;
    // Nav pill
    const navWrapper = navWrapperRef.current;
    const navH = navWrapper ? navWrapper.offsetHeight : 52;
    return headerH + navH + 16; // extra 16px breathing room
  }, []);

  // ─── rAF-throttled scroll handler ────────────────────────────────
  useEffect(() => {
    isReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const sectionIds = destinations.map((d) => d.id);
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;

        // Update scroll progress bar
        const scrollY = window.scrollY;
        const totalDocHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress =
          totalDocHeight > 0 ? Math.min(1, Math.max(0, scrollY / totalDocHeight)) : 0;
        setScrollProgress(progress);

        // If click-locked, don't update active section via scroll-spy
        if (clickLockRef.current) {
          // Check if scroll has settled near the target (within 60px)
          const target = document.getElementById(clickLockRef.current.targetId);
          if (target) {
            const activationLineY = getActivationLineY();
            const targetTop = target.getBoundingClientRect().top + scrollY;
            const expectedScrollY = Math.max(0, targetTop - activationLineY + 8);
            if (Math.abs(scrollY - expectedScrollY) < 80) {
              // Settled — release lock and confirm active
              if (clickLockRef.current.timer) {
                clearTimeout(clickLockRef.current.timer);
              }
              const lockedId = clickLockRef.current.targetId;
              clickLockRef.current = null;
              setActive(lockedId);
              scrollChipIntoView(lockedId);
            }
          }
          return;
        }

        // Normal scroll-spy
        const activationLineY = getActivationLineY();
        const newActive = getActiveSectionFromScroll(sectionIds, activationLineY);
        if (newActive !== activeSectionRef.current) {
          setActive(newActive);
          scrollChipIntoView(newActive);
        }
      });
    };

    // Subscribe to Lenis if available, else fallback to native scroll
    let lenisUnsubscribe: (() => void) | null = null;
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.on === "function") {
        lenis.on("scroll", handleScroll);
        lenisUnsubscribe = () => lenis.off("scroll", handleScroll);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Run once on mount

    // Release click lock on any user-initiated scroll (wheel, touchmove, keyboard)
    const releaseOnUserScroll = () => {
      if (clickLockRef.current) {
        if (clickLockRef.current.timer) clearTimeout(clickLockRef.current.timer);
        clickLockRef.current = null;
      }
    };
    window.addEventListener("wheel", releaseOnUserScroll, { passive: true });
    window.addEventListener("touchmove", releaseOnUserScroll, { passive: true });
    window.addEventListener("keydown", releaseOnUserScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", releaseOnUserScroll);
      window.removeEventListener("touchmove", releaseOnUserScroll);
      window.removeEventListener("keydown", releaseOnUserScroll);
      if (lenisUnsubscribe) lenisUnsubscribe();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [setActive, scrollChipIntoView, getActivationLineY]);

  // ─── Hash on load ─────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    const dest = destinations.find((d) => d.id === hash);
    if (dest) {
      setActive(dest.id);
      scrollChipIntoView(dest.id);
    }
  }, [setActive, scrollChipIntoView]);

  // ─── Indicator resize observer ────────────────────────────────────
  useEffect(() => {
    const ro = new ResizeObserver(() => updateIndicator());
    if (groupRef.current) ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, [updateIndicator]);

  // ─── Scroll to section ───────────────────────────────────────────
  const scrollToSection = useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      // Lock active immediately to prevent intermediate chip flashing
      setActive(id);
      scrollChipIntoView(id);

      // Set click lock with a generous timeout fallback (1.5s)
      if (clickLockRef.current?.timer) clearTimeout(clickLockRef.current.timer);
      const timer = setTimeout(() => {
        clickLockRef.current = null;
      }, 1500);
      clickLockRef.current = { targetId: id, timer };

      // Compute scroll offset accounting for activation line
      const activationLineY = getActivationLineY();
      const targetRect = target.getBoundingClientRect();
      const scrollMarginTop =
        parseInt(getComputedStyle(target).scrollMarginTop || "0", 10) || 0;
      const effectiveOffset = Math.max(activationLineY, scrollMarginTop);
      const targetScrollY =
        window.scrollY + targetRect.top - effectiveOffset + 8;
      const clampedScrollY = Math.max(0, targetScrollY);

      // Use Lenis if available, otherwise native
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lenis = typeof window !== "undefined" ? (window as any).__lenis : null;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(clampedScrollY, {
          duration: isReducedMotion.current ? 0 : 0.9,
        });
      } else {
        window.scrollTo({
          top: clampedScrollY,
          behavior: isReducedMotion.current ? "auto" : "smooth",
        });
      }

      // Update URL hash (debounced to avoid interfering with scroll)
      if (typeof window !== "undefined" && window.history) {
        setTimeout(() => {
          window.history.replaceState(null, "", `#${id}`);
        }, 600);
      }
    },
    [setActive, scrollChipIntoView, getActivationLineY]
  );

  // ─── Keyboard navigation ─────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = destinations.findIndex(
      (d) => d.id === activeSectionRef.current
    );
    if (currentIndex === -1) return;

    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = (currentIndex + 1) % destinations.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (currentIndex - 1 + destinations.length) % destinations.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = destinations.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const dest = destinations[targetIndex];
      scrollToSection(dest.id);
      buttonRefs.current.get(dest.id)?.focus();
    }
  };

  return (
    <div
      ref={navWrapperRef}
      className="achievements-nav-wrapper achievements-nav-sticky"
      role="region"
      aria-label="Achievements section navigation"
    >
      <nav className="achievements-nav-pill" aria-label="Achievements sections">
        {/* Connected Segmented Group */}
        <div
          ref={groupRef}
          className="achievements-segmented-group"
          role="tablist"
          aria-orientation="horizontal"
          onKeyDown={handleKeyDown}
        >
          {/* Shared Sliding Active Pill Indicator */}
          <span
            className="nav-sliding-indicator"
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
            }}
            aria-hidden="true"
          />

          {destinations.map((dest) => {
            const isActive = activeSection === dest.id;
            return (
              <button
                key={dest.id}
                ref={(el) => {
                  if (el) buttonRefs.current.set(dest.id, el);
                  else buttonRefs.current.delete(dest.id);
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={dest.id}
                tabIndex={isActive ? 0 : -1}
                className={`nav-segment-button ${isActive ? "is-selected" : ""}`}
                onClick={() => scrollToSection(dest.id)}
              >
                <Icon name={dest.icon} className="nav-segment-icon" />
                <span className="nav-segment-label">{dest.label}</span>
              </button>
            );
          })}
        </div>

        {/* Embedded Scroll Progress Line */}
        <div
          className="pill-scroll-track"
          style={{ opacity: scrollProgress > 0.005 ? 1 : 0 }}
          aria-hidden="true"
        >
          <div
            className="pill-scroll-fill"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />
        </div>
      </nav>
    </div>
  );
}
