"use client";

import { useEffect, useRef, useState } from "react";
import { useLanyardTheme } from "./lanyard-theme";
import { Icon } from "@/components/icon";
import { readMotionMilliseconds } from "./motion-tokens";

const progressDurationMs = 1100;
const holdAfterCompleteMs = 250;

function expressiveEase(t: number): number {
  return 1 - Math.pow(1 - t, 2.6);
}

function IntroPass() {
  const { frontImage } = useLanyardTheme();
  // The theme artwork is an inline SVG. The interactive WebGL pass opens from Home on demand.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="intro-loader-pass" src={frontImage} width={512} height={720} alt="" />;
}

export function IntroLoader() {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const skipRef = useRef<HTMLButtonElement>(null);
  const dismissRef = useRef<((urgent?: boolean) => void) | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.introPending !== "true") return;

    let closing = false;
    let progressTimer: number | undefined;
    let exitTimer: number | undefined;
    let autoDismissTimer: number | undefined;

    const normalExitMs = readMotionMilliseconds("--motion-duration-standard", 240);
    const urgentExitMs = readMotionMilliseconds("--motion-duration-fast", 180);

    const clearTimers = () => {
      if (progressTimer !== undefined) cancelAnimationFrame(progressTimer);
      if (autoDismissTimer !== undefined) window.clearTimeout(autoDismissTimer);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
    };

    const finish = () => {
      setFinished(true);
      try {
        sessionStorage.setItem("meet-portfolio-intro-seen-v3", "true");
      } catch {}
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

    const mountTime = performance.now();
    const tick = (now: number) => {
      if (closing) return;
      const elapsed = now - mountTime;
      const t = Math.min(1, elapsed / progressDurationMs);
      const pct = Math.min(100, Math.round(expressiveEase(t) * 100));
      setProgress(pct);

      if (pct < 100) {
        progressTimer = requestAnimationFrame(tick);
      } else {
        setIsReady(true);
        autoDismissTimer = window.setTimeout(() => {
          dismiss(false);
        }, holdAfterCompleteMs);
      }
    };

    progressTimer = requestAnimationFrame(tick);

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "Escape" || event.key === "Enter" || event.key === " ") && !closing) {
        event.preventDefault();
        event.stopPropagation();
        dismiss(true);
      }
    };

    const reducedPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedMotionChange = () => {
      if (reducedPreference.matches) dismiss(true);
    };

    document.addEventListener("keydown", onKeyDown, true);
    reducedPreference.addEventListener("change", onReducedMotionChange);
    skipRef.current?.focus({ preventScroll: true });

    return () => {
      clearTimers();
      document.removeEventListener("keydown", onKeyDown, true);
      reducedPreference.removeEventListener("change", onReducedMotionChange);
      dismissRef.current = null;
    };
  }, []);

  return (
    <div id="portfolio-intro" className="intro-loader" aria-busy="true">
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Loading portfolio {progress}%
      </span>

      <div className="intro-loader-content">
        <div className="intro-loader-lanyard-wrapper">
          {progress > 0 && !finished && <IntroPass />}
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
            <span>{isReady ? "Ready · Press Enter" : "Initialising Material 3 Expressive..."}</span>
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
