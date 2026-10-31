"use client";

import { useEffect, useRef, useState } from "react";
import Lanyard from "./Lanyard";
import { Icon } from "@/components/icon";
import { readMotionMilliseconds } from "./motion-tokens";

const minimumDisplayMs = 1800;
const targetDurationMs = 2200;

export function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
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

    let progressRaf: number | undefined;
    let exitTimer: number | undefined;
    let observer: MutationObserver | undefined;

    const startProgressTime = performance.now();
    const updateProgress = (now: number) => {
      const elapsed = now - startProgressTime;
      const raw = Math.min(100, Math.round((elapsed / targetDurationMs) * 100));
      setProgress((prev) => {
        const next = Math.max(prev, raw);
        if (next >= 100) {
          setIsReady(true);
          tryDismiss();
        }
        return next;
      });
      if (raw < 100 && !closing) {
        progressRaf = requestAnimationFrame(updateProgress);
      }
    };
    progressRaf = requestAnimationFrame(updateProgress);

    const hardTimer = window.setTimeout(
      () => dismissRef.current?.(true),
      Math.max(0, 3600 - (Date.now() - startedAt))
    );

    const clearTimers = () => {
      if (progressRaf !== undefined) cancelAnimationFrame(progressRaf);
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
      clearTimers();
      setProgress(100);
      setIsReady(true);
      if (urgent) root.dataset.introFast = "true";
      root.dataset.introExiting = "true";
      exitTimer = window.setTimeout(finish, urgent ? urgentExitMs : normalExitMs);
    };
    dismissRef.current = dismiss;

    const tryDismiss = () => {
      if (!closing && fontsReady && pageReady) {
        const remaining = Math.max(0, minimumDisplayMs - (Date.now() - startedAt));
        if (!remaining) {
          window.setTimeout(() => dismiss(), 300);
        }
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
      if ((event.key === "Escape" || (event.key === "Enter" && isReady)) && !closing) {
        event.preventDefault();
        event.stopPropagation();
        dismiss(true);
      }
    };
    const onReducedMotionChange = () => {
      if (reducedPreference.matches) dismiss(true);
    };

    document.addEventListener("keydown", onKeyDown, true);
    reducedPreference.addEventListener("change", onReducedMotionChange);
    skipRef.current?.focus({ preventScroll: true });

    return () => {
      clearTimers();
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      reducedPreference.removeEventListener("change", onReducedMotionChange);
      dismissRef.current = null;
    };
  }, [isReady]);

  return (
    <div id="portfolio-intro" className="intro-loader" aria-busy="true">
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Loading portfolio {progress}%
      </span>

      <div className="intro-loader-content">
        <div style={{ width: "100%", height: "600px" }} className="intro-loader-lanyard-wrapper">
          <Lanyard
            frontImage="/card-front.png"
            backImage="/card-back.png"
            strapImage="/band.png"
            imageFit="cover"
            cardColor="#ffffff"
            orientation="portrait"
            finish="glossy"
            cornerRadius={0.3}
            size={0.6}
            anchor="center"
            strapLength={0.5}
            strapColor="#111111"
            strapWidth={0.65}
            metal="silver"
            gravity={1}
            damping={0.5}
            elasticity={0.5}
            breeze={0.5}
            interactive
            intro
          />
        </div>

        <div className="intro-loader-meta" aria-hidden="true">
          <div className="intro-loader-number-row">
            <span className="intro-loader-number">{progress}</span>
            <span className="intro-loader-percent">%</span>
          </div>

          <div
            className="intro-loader-bar-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="intro-loader-bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <span className="intro-loader-caption">
            <Icon name="spark" />
            <span>{isReady ? "Ready · Swing card or press Enter" : "Initialising Material 3 Expressive..."}</span>
          </span>
        </div>
      </div>

      <button
        ref={skipRef}
        className="button button-secondary intro-loader-skip"
        type="button"
        onClick={() => dismissRef.current?.(true)}
      >
        <span>{isReady ? "Enter portfolio" : "Skip intro"}</span>
        <Icon name="arrow-up-right" />
      </button>
    </div>
  );
}
