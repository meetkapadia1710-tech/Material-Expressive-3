"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon, type IconName } from "@/components/icon";

const sectionDestinations: { id: string; label: string; icon: IconName }[] = [
  { id: "achievement-experience", label: "Experience", icon: "school" },
  { id: "achievement-hackathons", label: "Hackathons", icon: "trophy" },
  { id: "achievement-certifications", label: "Certifications", icon: "check" },
  { id: "achievement-coding", label: "Coding Profiles", icon: "code" },
  { id: "achievement-github", label: "GitHub Activity", icon: "github" },
];

const headingGap = 24;
const landingTolerance = 12;
const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

function sectionHeading(id: string) {
  const section = document.getElementById(id);
  return section?.querySelector("h2") ?? section;
}

export function AchievementsScrollNav({ sectionIds }: { sectionIds: readonly string[] }) {
  const destinations = useMemo(
    () => sectionDestinations.filter(({ id }) => sectionIds.includes(id)),
    [sectionIds],
  );
  const firstId = destinations[0]?.id ?? "";
  const [active, setActive] = useState(firstId);
  const wrapper = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const progressTrack = useRef<HTMLDivElement>(null);
  const progressFill = useRef<HTMLDivElement>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const pending = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const activationLine = useRef(headingGap);
  const reducedMotion = useRef<MediaQueryList | null>(null);

  const updateIndicator = useCallback(() => {
    const link = links.current.get(active);
    const marker = indicator.current;
    if (!link || !marker) return;
    marker.style.width = `${link.offsetWidth}px`;
    marker.style.transform = `translateX(${link.offsetLeft}px)`;
  }, [active]);

  useLayoutEffect(() => {
    updateIndicator();
    const link = links.current.get(active);
    const row = group.current;
    if (link && row && row.scrollWidth > row.clientWidth) {
      row.scrollTo({
        left: link.offsetLeft - (row.clientWidth - link.offsetWidth) / 2,
        behavior: reducedMotion.current?.matches ? "instant" : "smooth",
      });
    }
  }, [active, updateIndicator]);

  const clearPending = useCallback(() => {
    window.clearTimeout(timer.current);
    pending.current = null;
  }, []);

  const track = useCallback(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    if (progressTrack.current && progressFill.current) {
      progressTrack.current.style.opacity = progress > 0.005 ? "1" : "0";
      progressFill.current.style.transform = `scaleX(${progress})`;
    }

    if (pending.current) {
      const targetTop = sectionHeading(pending.current)?.getBoundingClientRect().top;
      if (targetTop === undefined) clearPending();
      else if (Math.abs(targetTop - activationLine.current) <= landingTolerance ||
        (window.scrollY >= maxScroll - 1 && targetTop > activationLine.current)) {
        clearPending();
        return;
      } else return;
    }

    let current = firstId;
    const atBottom = maxScroll > 0 && window.scrollY >= maxScroll - 1;
    for (const { id } of destinations) {
      const heading = sectionHeading(id);
      if (!heading) continue;
      const top = heading.getBoundingClientRect().top;
      if (top <= activationLine.current + landingTolerance || (atBottom && top < window.innerHeight)) current = id;
    }
    setActive(current);
  }, [clearPending, destinations, firstId]);

  const jump = useCallback((id: string, instant = false, writeHash = true) => {
    const target = sectionHeading(id);
    if (!target) return;
    clearPending();
    pending.current = id;
    setActive(id);
    const hash = `#${id}`;
    if (writeHash && location.hash !== hash) history.replaceState(history.state, "", hash);
    window.scrollTo({
      top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - activationLine.current),
      behavior: instant || reducedMotion.current?.matches ? "instant" : "smooth",
    });
    timer.current = window.setTimeout(() => {
      clearPending();
      track();
    }, 1500);
  }, [clearPending, track]);

  useEffect(() => {
    reducedMotion.current = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const requestTrack = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; track(); });
    };
    const measure = () => {
      const nav = wrapper.current;
      const header = document.querySelector<HTMLElement>(".site-header");
      const headerStyle = header ? getComputedStyle(header) : null;
      const headerBottom =
        header && headerStyle && (headerStyle.position === "sticky" || headerStyle.position === "fixed")
          ? Math.max(0, header.getBoundingClientRect().bottom)
          : 0;
      const navStyle = nav ? getComputedStyle(nav) : null;
      const stickyHeight =
        nav && navStyle?.position === "sticky" ? nav.offsetHeight + (parseFloat(navStyle.top) || 0) : 0;
      const offset = Math.ceil(Math.max(headerBottom, stickyHeight) + headingGap);
      activationLine.current = offset;
      document.documentElement.style.setProperty("--achievements-scroll-offset", `${offset}px`);
      document.documentElement.style.scrollPaddingTop = `${offset}px`;
      requestTrack();
    };
    const onHash = () => {
      const id = location.hash.slice(1);
      if (links.current.has(id)) jump(id, true, false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!event.defaultPrevented && scrollKeys.has(event.key)) clearPending();
    };

    measure();
    onHash();
    const observer = new ResizeObserver(measure);
    if (wrapper.current) observer.observe(wrapper.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", requestTrack, { passive: true });
    window.addEventListener("hashchange", onHash);
    window.addEventListener("wheel", clearPending, { passive: true });
    window.addEventListener("touchmove", clearPending, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearPending();
      document.documentElement.style.removeProperty("--achievements-scroll-offset");
      document.documentElement.style.scrollPaddingTop = "";
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", requestTrack);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("wheel", clearPending);
      window.removeEventListener("touchmove", clearPending);
      window.removeEventListener("keydown", onKey);
    };
  }, [clearPending, jump, track]);

  useEffect(() => {
    const observer = new ResizeObserver(updateIndicator);
    if (group.current) observer.observe(group.current);
    const selected = links.current.get(active);
    if (selected) observer.observe(selected);
    return () => observer.disconnect();
  }, [active, updateIndicator]);

  function onArrow(event: KeyboardEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest("a");
    const index = destinations.findIndex(({ id }) => links.current.get(id) === link);
    if (index === -1) return;
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = destinations.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const step = event.key === "ArrowRight" ? 1 : -1;
      next = (index + step + destinations.length) % destinations.length;
    } else return;
    event.preventDefault();
    const id = destinations[next].id;
    links.current.get(id)?.focus({ preventScroll: true });
    jump(id);
  }

  return (
    <div ref={wrapper} className="achievements-nav-wrapper achievements-nav-sticky">
      <nav className="achievements-nav-pill" aria-label="Achievements sections">
        <div ref={group} className="achievements-segmented-group" data-scroll-region onKeyDown={onArrow}>
          <span ref={indicator} className="nav-sliding-indicator" aria-hidden="true" />
          {destinations.map(({ id, label, icon }) => (
            <a key={id} href={`#${id}`}
              ref={(link) => { if (link) links.current.set(id, link); else links.current.delete(id); }}
              aria-current={active === id ? "location" : undefined}
              className={`nav-segment-button${active === id ? " is-selected" : ""}`}
              onClick={(event) => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                jump(id);
              }}
            >
              <Icon name={icon} className="nav-segment-icon" />
              <span className="nav-segment-label">{label}</span>
            </a>
          ))}
        </div>
        <div ref={progressTrack} className="pill-scroll-track" aria-hidden="true" style={{ opacity: 0 }}>
          <div ref={progressFill} className="pill-scroll-fill" style={{ transform: "scaleX(0)" }} />
        </div>
      </nav>
    </div>
  );
}
