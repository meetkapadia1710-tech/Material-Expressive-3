"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";

// One observer handles all pages. Content remains visible without JavaScript,
// and the observer never removes it from the accessibility tree.
function Reveal({ pathname }: { pathname: string }) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || !("IntersectionObserver" in window)) return;
    const seen = new WeakSet<Element>();
    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        seen.add(entry.target);
        const element = entry.target as HTMLElement;
        if (element.contains(document.activeElement)) continue;
        const siblings = Array.from(element.parentElement?.children ?? []);
        const delay = Math.min(siblings.indexOf(element) % 4, 3) * 35;
        const animation = element.animate([{ opacity: 0.65, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 340, delay, easing: "cubic-bezier(.2,.75,.2,1)" });
        animations.set(element, animation);
        animation.onfinish = () => animations.delete(element);
      }
    }, { threshold: 0.08 });
    const main = document.querySelector("main");
    const selector = "section, .project-card, [data-project-slug], .achievement-entry, .coding-profile";
    const watch = (element: Element, initial = false) => {
      if (seen.has(element) || reduced.matches) return;
      if (initial && element.getBoundingClientRect().top < window.innerHeight) { seen.add(element); return; }
      observer.observe(element);
    };
    main?.querySelectorAll(selector).forEach((element) => watch(element, true));
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) watch(node);
      node.querySelectorAll(selector).forEach((element) => watch(element));
    })));
    if (main) mutations.observe(main, { childList: true, subtree: true });
    const onFocus = (event: FocusEvent) => { animations.forEach((animation, element) => { if (event.target instanceof Node && element.contains(event.target)) { animation.cancel(); animations.delete(element); } }); };
    main?.addEventListener("focusin", onFocus);
    const stopForReducedMotion = () => { if (reduced.matches) { observer.disconnect(); animations.forEach((animation) => animation.cancel()); animations.clear(); } };
    reduced.addEventListener("change", stopForReducedMotion);
    return () => { observer.disconnect(); mutations.disconnect(); main?.removeEventListener("focusin", onFocus); reduced.removeEventListener("change", stopForReducedMotion); animations.forEach((animation) => animation.cancel()); };
  }, [pathname]);
  return null;
}

export function MotionRuntime() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const initialPath = useRef(pathname);
  const historyNavigation = useRef(false);

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
      historyNavigation.current = false;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      document.querySelector("main")?.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0.88, transform: "translateY(-4px)" }], { duration: 120, easing: "ease-out" });
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
    initialPath.current = pathname;
    // Preserve Next.js back/forward restoration, while new routes start at the top.
    lenis.current?.resize();
    if (!historyNavigation.current && !location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    lenis.current?.scrollTo(window.scrollY, { immediate: true, force: true });
    historyNavigation.current = false;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    main?.getAnimations().forEach((animation) => animation.cancel());
    main?.animate([{ opacity: 0.8, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 240, easing: "cubic-bezier(.2,.75,.2,1)" });
  }, [pathname]);

  return <Reveal pathname={pathname} />;
}
