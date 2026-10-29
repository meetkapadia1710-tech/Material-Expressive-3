"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { readMotionMilliseconds, readMotionValue } from "./motion-tokens";

// One observer handles all pages. Content remains visible without JavaScript,
// and the observer never removes it from the accessibility tree.
function Reveal({ pathname }: { pathname: string }) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    const seen = new WeakSet<Element>();
    const animations = new Map<Element, Animation[]>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        seen.add(entry.target);
        const element = entry.target as HTMLElement;
        if (element.matches("[data-morph-in-view]")) { element.dataset.morphed = "true"; continue; }
        if (element.contains(document.activeElement)) continue;
        const siblings = Array.from(element.parentElement?.children ?? []);
        const delay = Math.min(siblings.indexOf(element) % 4, 3) * readMotionMilliseconds("--motion-stagger-step", 35);
        const spatial = element.animate([{ transform: "translateY(12px)" }, { transform: "translateY(0)" }], {
          duration: readMotionMilliseconds("--motion-duration-reveal", 340), delay,
          easing: readMotionValue("--motion-project-content-easing", "cubic-bezier(.2,.75,.2,1)"),
        });
        const effects = element.animate([{ opacity: 0.65 }, { opacity: 1 }], {
          duration: readMotionMilliseconds("--motion-duration-reveal", 340), delay,
          easing: readMotionValue("--motion-project-content-easing", "cubic-bezier(.2,.75,.2,1)"),
        });
        const active = [spatial, effects];
        animations.set(element, active);
        const cleanFinished = () => {
          if (active.every((item) => item.playState === "finished" || item.playState === "idle")) animations.delete(element);
        };
        spatial.onfinish = cleanFinished;
        effects.onfinish = cleanFinished;
      }
    }, { threshold: 0.08 });
    const main = document.querySelector("main");
    const selector = "section, .project-card, [data-project-slug], .achievement-entry, .coding-profile, [data-morph-in-view]";
    const watch = (element: Element, initial = false) => {
      if (seen.has(element) || reduced.matches) return;
      if (initial && element.getBoundingClientRect().top < window.innerHeight) {
        seen.add(element);
        if (element.matches("[data-morph-in-view]")) (element as HTMLElement).dataset.morphed = "true";
        return;
      }
      observer.observe(element);
    };
    main?.querySelectorAll(selector).forEach((element) => watch(element, true));
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) watch(node);
      node.querySelectorAll(selector).forEach((element) => watch(element));
    })));
    if (main) mutations.observe(main, { childList: true, subtree: true });
    const onFocus = (event: FocusEvent) => { animations.forEach((items, element) => { if (event.target instanceof Node && element.contains(event.target)) { items.forEach((animation) => animation.cancel()); animations.delete(element); } }); };
    main?.addEventListener("focusin", onFocus);
    const stopForReducedMotion = () => { if (reduced.matches) { observer.disconnect(); animations.forEach((items) => items.forEach((animation) => animation.cancel())); animations.clear(); } };
    reduced.addEventListener("change", stopForReducedMotion);
    return () => { observer.disconnect(); mutations.disconnect(); main?.removeEventListener("focusin", onFocus); reduced.removeEventListener("change", stopForReducedMotion); animations.forEach((items) => items.forEach((animation) => animation.cancel())); };
  }, [pathname]);
  return null;
}

export function MotionRuntime() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const initialPath = useRef(pathname);
  const historyNavigation = useRef(false);
  const projectNavigation = useRef(false);

  useEffect(() => {
    const eligible = matchMedia("(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)");
    let dispose: (() => void) | undefined;
    let generation = 0;
    const sync = async () => {
      const current = ++generation;
      dispose?.(); dispose = undefined;
      if (!eligible.matches) return;
      try { const { mountPointerEffects } = await import("./pointer-effects"); if (current === generation) dispose = mountPointerEffects(); }
      catch { /* Decorative enhancement: retain native controls if the chunk is unavailable. */ }
    };
    void sync(); eligible.addEventListener("change", sync);
    return () => { ++generation; dispose?.(); eligible.removeEventListener("change", sync); };
  }, []);

  useEffect(() => {
    const onNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target || link.download) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      const canShare = matchMedia("(min-width: 481px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)").matches;
      projectNavigation.current = link.hasAttribute("data-project-transition") && canShare && /^\/projects\/[^/]+\/?$/.test(url.pathname);
      if (projectNavigation.current) link.closest(".project-card, [data-project-slug]")?.getAnimations().forEach((animation) => animation.cancel());
      historyNavigation.current = false;
      if (projectNavigation.current) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const main = document.querySelector("main");
      const duration = readMotionMilliseconds("--motion-duration-route-exit", 120);
      main?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }], {
        duration, easing: readMotionValue("--motion-project-effects-easing", "ease-out"),
      });
      main?.animate([{ opacity: 1 }, { opacity: 0.88 }], {
        duration, easing: readMotionValue("--motion-project-effects-easing", "ease-out"),
      });
    };
    const onPopState = () => { historyNavigation.current = true; };
    document.addEventListener("click", onNavigation, true);
    window.addEventListener("popstate", onPopState);
    return () => { document.removeEventListener("click", onNavigation, true); window.removeEventListener("popstate", onPopState); };
  }, []);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const touch = matchMedia("(pointer: coarse)");
    let cleanup: (() => void) | undefined;
    let generation = 0;
    const setup = async () => {
      const current = ++generation;
      cleanup?.(); cleanup = undefined;
      if (reduced.matches || touch.matches) return;
      const [{ default: Lenis }, { frame, cancelFrame }] = await Promise.all([import("lenis"), import("framer-motion")]);
      if (current !== generation) return;
      const instance = new Lenis({ autoRaf: false, smoothWheel: true, stopInertiaOnNavigate: true });
      lenis.current = instance;
      const tick = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp);
      frame.update(tick, true);
      const onAnchor = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element | null)?.closest("a[href^='#']") as HTMLAnchorElement | null;
        if (!link || link.hash === "#main-content" || !link.hash) return;
        let target: HTMLElement | null = null;
        try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
        if (!target) return;
        event.preventDefault();
        history.pushState(null, "", link.hash);
        instance.scrollTo(target, { offset: -36 });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      };
      document.addEventListener("click", onAnchor);
      cleanup = () => { document.removeEventListener("click", onAnchor); cancelFrame(tick); instance.destroy(); if (lenis.current === instance) lenis.current = null; };
    };
    void setup();
    reduced.addEventListener("change", setup); touch.addEventListener("change", setup);
    return () => { ++generation; cleanup?.(); reduced.removeEventListener("change", setup); touch.removeEventListener("change", setup); };
  }, []);

  useEffect(() => {
    if (initialPath.current === pathname) return;
    const previousPath = initialPath.current;
    initialPath.current = pathname;
    const isCollection = (path: string) => path === "/" || path === "/projects";
    const isDetail = (path: string) => /^\/projects\/[^/]+\/?$/.test(path);
    const sharedHistoryNavigation = historyNavigation.current && ((isDetail(previousPath) && isCollection(pathname)) || (isCollection(previousPath) && isDetail(pathname)));
    const sharedProjectNavigation = projectNavigation.current || sharedHistoryNavigation;
    projectNavigation.current = false;
    // Preserve Next.js back/forward restoration, while new routes start at the top.
    lenis.current?.resize();
    if (!historyNavigation.current && !location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    lenis.current?.scrollTo(window.scrollY, { immediate: true, force: true });
    historyNavigation.current = false;
    if (sharedProjectNavigation || matchMedia("(prefers-reduced-motion: reduce)").matches) { historyNavigation.current = false; return; }
    const main = document.querySelector("main");
    main?.getAnimations().forEach((animation) => animation.cancel());
    const duration = readMotionMilliseconds("--motion-duration-standard", 240);
    main?.animate([{ transform: "translateY(8px)" }, { transform: "translateY(0)" }], {
      duration, easing: readMotionValue("--motion-project-content-easing", "cubic-bezier(.2,.75,.2,1)"),
    });
    main?.animate([{ opacity: 0.8 }, { opacity: 1 }], {
      duration, easing: readMotionValue("--motion-project-content-easing", "cubic-bezier(.2,.75,.2,1)"),
    });
  }, [pathname]);

  return <Reveal pathname={pathname} />;
}
