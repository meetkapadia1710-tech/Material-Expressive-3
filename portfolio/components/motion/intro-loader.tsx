"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { Icon } from "@/components/icon";
import { MorphingShape, type ShapeName } from "./morphing-shape";

const shapeSequence: ShapeName[] = ["roundedSquare", "scalloped", "circle", "blob"];
const minimumDisplayMs = 1200;
const normalExitMs = 280;
const reducedExitMs = 120;

export function IntroLoader() {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [showWordmark, setShowWordmark] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const dismissRef = useRef<((fast: boolean) => void) | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.introPending !== "true") return;

    let dismissed = false;
    let fontsReady = false;
    let pageReady = false;
    const startedAt = Number(root.dataset.introStarted) || Date.now();
    const reducedPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = reducedPreference.matches;
    const exitMs = reduced ? reducedExitMs : normalExitMs;
    let cycleTimer = 0;
    let markTimer = 0;
    let minimumTimer = 0;
    let hardTimer = 0;
    let exitTimer = 0;
    let observer: MutationObserver | undefined;

    const clearSequenceTimers = () => {
      window.clearInterval(cycleTimer);
      window.clearTimeout(markTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(hardTimer);
      observer?.disconnect();
    };

    const finish = () => {
      delete root.dataset.introPending;
      delete root.dataset.introExiting;
      delete root.dataset.introFast;
      delete root.dataset.introStarted;
      document.getElementById("main-content")?.removeAttribute("aria-busy");
      const heading = document.querySelector<HTMLElement>("#main-content h1") ?? document.getElementById("main-content");
      heading?.focus({ preventScroll: true });
    };

    const dismiss = (fast = false) => {
      if (dismissed) return;
      dismissed = true;
      clearSequenceTimers();
      setShowWordmark(true);
      if (fast) root.dataset.introFast = "true";
      root.dataset.introExiting = "true";
      exitTimer = window.setTimeout(finish, fast ? Math.min(exitMs, 140) : exitMs);
    };
    dismissRef.current = dismiss;

    const tryDismiss = () => {
      if (!dismissed && fontsReady && pageReady) {
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

    if (reduced) {
      setShowWordmark(true);
      cycleTimer = 0;
      minimumTimer = window.setTimeout(() => dismiss(), Math.max(0, 100 - (Date.now() - startedAt)));
    } else {
      cycleTimer = window.setInterval(() => setShapeIndex((index) => (index + 1) % shapeSequence.length), 240);
      markTimer = window.setTimeout(() => setShowWordmark(true), 930);
    }

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

    const hardLimit = reduced ? 170 : Math.max(0, 2700 - (Date.now() - startedAt));
    hardTimer = window.setTimeout(() => dismiss(true), hardLimit);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || dismissed) return;
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
      window.clearTimeout(exitTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      reducedPreference.removeEventListener("change", onReducedMotionChange);
      dismissRef.current = null;
    };
  }, []);

  return <div className="intro-loader" role="status" aria-live="polite" aria-label="Loading portfolio">
    <span className="sr-only">Loading portfolio</span>
    <div className="intro-loader-content">
      <MorphingShape className="intro-loader-shape" shape={shapeSequence[shapeIndex]} viewShape="scalloped" hoverShape="blob" focusShape="circle" pressShape="roundedSquare">
        <span className="intro-loader-mark" aria-hidden="true">{showWordmark ? profile.initials : <Icon name="spark" />}</span>
      </MorphingShape>
      <span className={`intro-loader-wordmark${showWordmark ? " is-visible" : ""}`} aria-hidden="true">{profile.displayName}.</span>
    </div>
    <button ref={skipRef} className="button button-secondary intro-loader-skip" type="button" onClick={() => dismissRef.current?.(true)}>Skip intro</button>
  </div>;
}
