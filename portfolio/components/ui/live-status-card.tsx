"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { MorphingShape } from "@/components/motion/morphing-shape";
import { profile } from "@/content/profile";
import type { AvailabilityConfig } from "@/content/types";
import {
  computeAvailabilityTime,
  getMsUntilNextMinute,
  type AvailabilityTimeSnapshot,
} from "@/lib/availability-time";

export interface LiveStatusCardProps {
  /** Override availability config (defaults to `profile.availability` in content layer). */
  availability?: AvailabilityConfig;
  /** Override location display label (defaults to `profile.location.label`). */
  locationLabel?: string;
  /** Optional navigation destination; when set, the entire card acts as one link. */
  href?: string;
  /** Accessible destination name when `href` is provided. */
  linkLabel?: string;
}

export function LiveStatusCard({
  availability = profile.availability,
  locationLabel = profile.location.label,
  href,
  linkLabel,
}: LiveStatusCardProps) {
  const [snapshot, setSnapshot] = useState<AvailabilityTimeSnapshot | null>(null);
  const [hasTicked, setHasTicked] = useState(false);
  const lastMinuteKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;

    const clearPending = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const syncClock = () => {
      const now = new Date();
      const next = computeAvailabilityTime(now, availability);
      if (lastMinuteKeyRef.current !== null && lastMinuteKeyRef.current !== next.minuteKey) {
        setHasTicked(true);
      }
      lastMinuteKeyRef.current = next.minuteKey;
      setSnapshot(next);
    };

    const scheduleNextMinute = () => {
      clearPending();
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      const delay = getMsUntilNextMinute(new Date());
      timeoutId = window.setTimeout(() => {
        syncClock();
        scheduleNextMinute();
      }, delay);
    };

    syncClock();
    scheduleNextMinute();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearPending();
      } else {
        syncClock();
        scheduleNextMinute();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearPending();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [availability]);

  const mounted = snapshot !== null;
  const isOnline = mounted ? snapshot.isOnline : false;
  const displayTime = mounted ? snapshot.timeStr : "--:-- --";
  const displayAbbr = mounted ? snapshot.abbr : availability.timeZoneAbbr;
  const displayOffset = mounted ? snapshot.offset : availability.timeZoneOffset;
  const displaySchedule = mounted
    ? snapshot.scheduleLabel
    : `${availability.timeZoneAbbr} (${availability.timeZoneOffset})`;
  const shapeMorphed = mounted ? snapshot.minute % 2 === 1 : false;

  const content = (
    <>
      {availability.open ? (
        <div className="live-status-header">
          <div className="live-status-chip">
            <span className="live-status-dot-wrap" aria-hidden="true">
              <span
                className={`live-status-dot${mounted && !isOnline ? " live-status-dot--resting" : ""}`}
              />
              {isOnline ? <span className="live-status-pulse" /> : null}
            </span>
            <span className="live-status-chip-label">{availability.statusLabel}</span>
          </div>
          {availability.period ? (
            <span className="live-status-period">
              <span aria-hidden="true">{availability.period}</span>
              <span className="sr-only">{`, ${availability.periodAccessibleLabel}`}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="live-status-body">
        <MorphingShape
          className="live-status-clock-badge"
          shape="roundedSquare"
          viewShape="scalloped"
          hoverShape="circle"
          focusShape="blob"
          pressShape="scalloped"
          morphed={shapeMorphed}
        >
          <Icon name="clock" />
        </MorphingShape>

        <div className="live-status-time-block">
          <div className="live-status-time-line">
            <time dateTime={mounted ? snapshot.iso : undefined} className="live-status-time">
              <span className="sr-only" aria-live="off">
                {mounted
                  ? `${availability.regionLabel}: ${displayTime}`
                  : availability.regionLabel}
              </span>
              <span
                aria-hidden="true"
                key={mounted ? snapshot.minuteKey : "placeholder"}
                className={`live-status-digits${hasTicked ? " live-status-digits--tick" : ""}`}
              >
                {displayTime}
              </span>
            </time>

            <span className="live-status-tz-group" title={`${displayAbbr} (${displayOffset})`}>
              <abbr title="Indian Standard Time" className="live-status-tz-abbr">
                {displayAbbr}
              </abbr>
              <span className="live-status-tz-offset">{displayOffset}</span>
            </span>
          </div>

          <p className="live-status-location">{locationLabel}</p>
          <p className="live-status-schedule">{displaySchedule}</p>
        </div>
      </div>

      {availability.responseCommitment ? (
        <footer className="live-status-footer">
          <div className="live-status-divider" role="separator" aria-hidden="true" />
          <div className="live-status-response-row">
            <span className="live-status-response-icon" aria-hidden="true">
              <Icon name="zap" />
            </span>
            <span>{availability.responseCommitment}</span>
          </div>
        </footer>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="live-status-card live-status-card--interactive"
        aria-label={linkLabel ?? "Availability and local time, open contact page"}
      >
        {content}
      </Link>
    );
  }

  return (
    <section className="live-status-card" aria-label="Availability and local time">
      {content}
    </section>
  );
}
