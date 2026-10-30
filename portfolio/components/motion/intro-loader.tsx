"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { Icon } from "@/components/icon";
import { MorphingShape, type ShapeName } from "./morphing-shape";
import { readMotionMilliseconds } from "./motion-tokens";

const shapeSequence: ShapeName[] = ["roundedSquare", "scalloped", "circle", "blob"];
const minimumDisplayMs = 1200;
const morphIntervalMs = 220;
const wordmarkAtMs = 900;

export function IntroLoader() {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [showMark, setShowMark] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const dismissRef = useRef<((urgent?: boolean) => void) | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.introPending !== "true") return;

    let closing = false;
    let fontsReady = false;
    let pageReady = false;
    const startedAt = Number(root.dataset.introStarted) || Date.now();
    const reducedPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const normalExitMs = readMotionMilliseconds("--motion-duration-standard", 240);
    const urgentExitMs = readMotionMilliseconds("--motion-duration-fast", 180);
    if (reducedPreference.matches) {
      delete root.dataset.introPending;
      delete root.dataset.introExiting;
      delete root.dataset.introFast;
      delete root.dataset.introStarted;
      const main = document.getElementById("main-content");
      main?.removeAttribute("aria-busy");
      requestAnimationFrame(() => main?.focus({ preventScroll: true }));
      return;
    }
    let minimumTimer: number | undefined;
    let exitTimer: number | undefined;
    let observer: MutationObserver | undefined;
    const cycleTimer = window.setInterval(() => setShapeIndex((index) => (index + 1) % shapeSequence.length), morphIntervalMs);
    const markTimer = window.setTimeout(() => {
      window.clearInterval(cycleTimer);
      setShowMark(true);
    }, wordmarkAtMs);
    const hardTimer = window.setTimeout(() => dismissRef.current?.(true), Math.max(0, 2700 - (Date.now() - startedAt)));

    const clearSequenceTimers = () => {
      window.clearInterval(cycleTimer);
      window.clearTimeout(markTimer);
      if (minimumTimer !== undefined) window.clearTimeout(minimumTimer);
      window.clearTimeout(hardTimer);
      observer?.disconnect();
    };

    const finish = () => {
      delete root.dataset.introPending;
      delete root.dataset.introExiting;
      delete root.dataset.introFast;
      delete root.dataset.introStarted;
      const main = document.getElementById("main-content");
      main?.removeAttribute("aria-busy");
      requestAnimationFrame(() => main?.focus({ preventScroll: true }));
    };

    const dismiss = (urgent = false) => {
      if (closing) return;
      closing = true;
      clearSequenceTimers();
      setShowMark(true);
      if (urgent) root.dataset.introFast = "true";
      root.dataset.introExiting = "true";
      exitTimer = window.setTimeout(finish, urgent ? urgentExitMs : normalExitMs);
    };
    dismissRef.current = dismiss;

    const tryDismiss = () => {
      if (!closing && fontsReady && pageReady) {
        const remaining = Math.max(0, minimumDisplayMs - (Date.now() - startedAt));
        if (!remaining) dismiss();
        else if (!minimumTimer) minimumTimer = window.setTimeout(() => dismiss(), remaining);
      }
    };

    const checkPage = () => {
      const main = document.getElementById("main-content");
      const rendered = main?.querySelector<HTMLElement>("h1") ?? main?.firstElementChild;
      if (rendered && rendered.getClientRects().length > 0) {
        pageReady = true;
        observer?.disconnect();
        tryDismiss();
      }
    };

    const main = document.getElementById("main-content");
    if (main) {
      observer = new MutationObserver(checkPage);
      observer.observe(main, { childList: true, subtree: true });
    }
    requestAnimationFrame(checkPage);
    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
      tryDismiss();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || closing) return;
      event.preventDefault();
      event.stopPropagation();
      dismiss(true);
    };
    const onReducedMotionChange = () => { if (reducedPreference.matches) dismiss(true); };
    document.addEventListener("keydown", onKeyDown, true);
    reducedPreference.addEventListener("change", onReducedMotionChange);
    skipRef.current?.focus({ preventScroll: true });

    return () => {
      clearSequenceTimers();
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      reducedPreference.removeEventListener("change", onReducedMotionChange);
      dismissRef.current = null;
    };
  }, []);

  return <div id="portfolio-intro" className="intro-loader" aria-busy="true">
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">Loading portfolio</span>
    <div className="intro-loader-content">
      <MorphingShape className="intro-loader-shape" shape={shapeSequence[shapeIndex]} viewShape="scalloped" hoverShape="blob" focusShape="circle" pressShape="roundedSquare">
        <span className="intro-loader-mark" aria-hidden="true">{showMark ? profile.initials : <Icon name="spark" />}</span>
      </MorphingShape>
      <span className={`intro-loader-wordmark${showMark ? " is-visible" : ""}`} aria-hidden="true">{profile.displayName}.</span>
    </div>
    <button ref={skipRef} className="button button-secondary intro-loader-skip" type="button" onClick={() => dismissRef.current?.(true)}>Skip intro</button>
  </div>;
}
