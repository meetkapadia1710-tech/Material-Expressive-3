"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type Lenis from "lenis";
import { readMotionMilliseconds, readMotionValue } from "./motion-tokens";
import { registerViewTransition, skipActiveViewTransition } from "./view-transition-coordinator";
import { interfaceCopy } from "@/content/interface";
import { navigation } from "@/content/profile";
import { projects } from "@/content/projects";

type RouteViewTransition = {
  skipTransition: () => void;
  finished: Promise<void>;
  ready?: Promise<void>;
  updateCallbackDone?: Promise<void>;
};
type RouteTransitionDocument = Document & { startViewTransition?: (update: () => void | Promise<void>) => RouteViewTransition };
type RouteIntent = { direction: 1 | -1; shared: boolean };

function routePosition(path: string) {
  const detail = path.match(/^\/projects\/[^/]+\/?$/);
  if (detail) return (navigation.findIndex((item) => item.href === "/projects") + 0.5);
  const index = navigation.findIndex((item) => item.href === path);
  return index < 0 ? 0 : index;
}

function isProjectCollectionDetailPair(from: string, to: string) {
  const isCollection = (path: string) => path === "/" || path === "/projects";
  const isDetail = (path: string) => /^\/projects\/[^/]+\/?$/.test(path);
  return (isDetail(from) && isCollection(to)) || (isCollection(from) && isDetail(to));
}

function projectCollectionOrigin(path: string) {
  return path === "/" ? "home" : path === "/projects" ? "catalog" : null;
}

function routeTitle(path: string) {
  const navItem = navigation.find((item) => item.href === path);
  if (navItem) return navItem.label;
  const match = path.match(/^\/projects\/([^/]+)\/?$/);
  if (match) return projects.find((project) => project.slug === match[1])?.name ?? "Project";
  return "Page";
}

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
  const router = useRouter();
  const lenis = useRef<Lenis | null>(null);
  const initialPath = useRef(pathname);
  const activePath = useRef(pathname);
  const historyNavigation = useRef(false);
  const pendingPath = useRef<{ pathname: string; resolve: () => void } | null>(null);
  const activeRouteTransition = useRef<RouteViewTransition | null>(null);
  const routeScrollPositions = useRef(new Map<string, number>());
  const announcement = useRef<HTMLParagraphElement>(null);

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
    const viewTransitionDocument = document as RouteTransitionDocument;
    const routeRoot = document.documentElement;
    const supportsViewTransitions = () => typeof viewTransitionDocument.startViewTransition === "function";

    const waitForPath = (targetPath: string) => new Promise<void>((resolve) => {
      pendingPath.current?.resolve();
      let timeout = 0;
      const finish = () => {
        window.clearTimeout(timeout);
        if (pendingPath.current?.resolve === finish) pendingPath.current = null;
        resolve();
      };
      timeout = window.setTimeout(finish, 900);
      pendingPath.current = { pathname: targetPath, resolve: finish };
    });

    const sendIntent = (from: string, to: string, shared: boolean) => {
      const fromPosition = routePosition(from);
      const toPosition = routePosition(to);
      const direction: 1 | -1 = fromPosition === toPosition ? 1 : toPosition > fromPosition ? 1 : -1;
      const intent: RouteIntent = { direction, shared };
      routeRoot.dataset.routeDirection = direction === 1 ? "forward" : "backward";
      window.dispatchEvent(new CustomEvent<RouteIntent>("portfolio:route-intent", { detail: intent }));
      return intent;
    };

    const runNativeTransition = (update: () => void | Promise<void>) => {
      if (!supportsViewTransitions()) return false;
      skipActiveViewTransition();
      routeRoot.dataset.routeTransition = "true";
      try {
        const transition = viewTransitionDocument.startViewTransition(async () => {
          try {
            await update();
          } catch {
            // Callback execution interrupted or skipped
          }
        });
        if (transition.ready) void transition.ready.catch(() => {});
        if (transition.updateCallbackDone) void transition.updateCallbackDone.catch(() => {});
        activeRouteTransition.current = transition;
        registerViewTransition("route", transition, () => { delete routeRoot.dataset.routeTransition; });
        void transition.finished.catch(() => {}).finally(() => {
          if (activeRouteTransition.current === transition) {
            activeRouteTransition.current = null;
            delete routeRoot.dataset.routeTransition;
          }
        });
        return true;
      } catch {
        delete routeRoot.dataset.routeTransition;
        return false;
      }
    };

    const pushRoute = (href: string, shared = false) => {
      const target = new URL(href, window.location.href);
      if (target.origin !== window.location.origin) return;
      const currentPath = activePath.current;
      const destination = `${target.pathname}${target.search}${target.hash}`;
      if (target.pathname === currentPath) {
        if (destination !== `${window.location.pathname}${window.location.search}${window.location.hash}`) router.push(destination, { scroll: false });
        return;
      }
      routeScrollPositions.current.set(currentPath, window.scrollY);
      historyNavigation.current = false;
      sendIntent(currentPath, target.pathname, shared);
      if (shared) routeRoot.dataset.projectOrigin = projectCollectionOrigin(currentPath) ?? "";

      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!shared && !reduced && supportsViewTransitions()) {
        const pathChange = waitForPath(target.pathname);
        const started = runNativeTransition(async () => {
          router.push(destination, { scroll: false });
          await pathChange;
        });
        if (started) return;
      }
      router.push(destination, { scroll: false });
    };

    const onNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target || link.download || link.hasAttribute("data-no-route-transition")) return;
      const target = new URL(link.href);
      if (target.origin !== window.location.origin || target.pathname === activePath.current) return;

      const canShare = matchMedia("(min-width: 481px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)").matches;
      const shared = link.hasAttribute("data-project-transition") && canShare && /^\/projects\/[^/]+\/?$/.test(target.pathname);
      routeScrollPositions.current.set(activePath.current, window.scrollY);
      historyNavigation.current = false;
      if (shared) {
        routeRoot.dataset.projectOrigin = projectCollectionOrigin(activePath.current) ?? "";
        sendIntent(activePath.current, target.pathname, true);
        link.closest(".project-card, [data-project-slug]")?.getAnimations().forEach((animation) => animation.cancel());
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      pushRoute(`${target.pathname}${target.search}${target.hash}`);
    };

    const onRouteRequest = (event: Event) => {
      const href = (event as CustomEvent<string>).detail;
      if (typeof href === "string") pushRoute(href);
    };

    const onPopState = () => {
      const from = activePath.current;
      const to = window.location.pathname;
      routeScrollPositions.current.set(from, window.scrollY);
      historyNavigation.current = true;
      const canShare = matchMedia("(min-width: 481px) and (pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)").matches;
      const pair = isProjectCollectionDetailPair(from, to);
      const enteringDetail = pair && projectCollectionOrigin(from) !== null;
      if (canShare && enteringDetail) routeRoot.dataset.projectOrigin = projectCollectionOrigin(from) ?? "";
      const sharedProjectNavigation = canShare && pair && (enteringDetail || routeRoot.dataset.projectOrigin === projectCollectionOrigin(to));
      sendIntent(from, to, sharedProjectNavigation);
      if (sharedProjectNavigation || matchMedia("(prefers-reduced-motion: reduce)").matches || !supportsViewTransitions()) return;
      const pathChange = waitForPath(to);
      runNativeTransition(() => pathChange);
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isAbort =
        (reason instanceof DOMException && reason.name === "AbortError") ||
        (typeof reason === "object" && reason !== null && (reason.name === "AbortError" || String(reason.message).includes("skipTransition") || String(reason.message).includes("Transition was skipped")));
      if (isAbort) {
        event.preventDefault();
        event.stopImmediatePropagation?.();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection, true);
    document.addEventListener("click", onNavigation, true);
    window.addEventListener("portfolio:route-request", onRouteRequest);
    window.addEventListener("popstate", onPopState, true);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
      document.removeEventListener("click", onNavigation, true);
      window.removeEventListener("portfolio:route-request", onRouteRequest);
      window.removeEventListener("popstate", onPopState, true);
      pendingPath.current?.resolve();
      try {
        activeRouteTransition.current?.skipTransition();
      } catch {}
      delete routeRoot.dataset.routeTransition;
    };
  }, [router]);

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
    activePath.current = pathname;
    const restoringHistory = historyNavigation.current;
    historyNavigation.current = false;
    const hash = window.location.hash;
    const main = document.getElementById("main-content");
    const heading = main?.querySelector<HTMLElement>("h1") ?? main;
    if (heading && !heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    if (announcement.current) announcement.current.textContent = interfaceCopy.routeChanged(routeTitle(pathname));

    const finish = () => {
      if (hash) {
        let target: HTMLElement | null = null;
        try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { target = null; }
        if (target) {
          target.setAttribute("tabindex", "-1");
          if (lenis.current) lenis.current.scrollTo(target, { offset: -36, immediate: true });
          else target.scrollIntoView();
          target.focus({ preventScroll: true });
        }
      } else if (restoringHistory) {
        lenis.current?.resize();
        const remembered = routeScrollPositions.current.get(pathname);
        if (remembered !== undefined) window.scrollTo({ top: remembered, behavior: "instant" });
        lenis.current?.scrollTo(window.scrollY, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
        lenis.current?.scrollTo(0, { immediate: true, force: true });
      }

      if (pendingPath.current?.pathname === pathname) pendingPath.current.resolve();
    };

    requestAnimationFrame(() => requestAnimationFrame(finish));
  }, [pathname]);

  return <><Reveal pathname={pathname} /><p ref={announcement} className="sr-only" aria-live="polite" aria-atomic="true" /></>;
}
