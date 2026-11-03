"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import styles from "./live-status-card.module.css";

interface TimeState {
  timeStr: string;
  isDaytime: boolean;
  mounted: boolean;
}

export function LiveStatusCard() {
  const [timeState, setTimeState] = useState<TimeState>({
    timeStr: "02:00 AM",
    isDaytime: true,
    mounted: false,
  });

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const hourFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false,
      });

      const hour = parseInt(hourFormatter.format(now), 10);
      const isDay = hour >= 9 && hour < 22;

      setTimeState({
        timeStr: timeFormatter.format(now),
        isDaytime: isDay,
        mounted: true,
      });
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.card} aria-label="Current availability and local time">
      {/* Top row: Live beacon and availability */}
      <div className={styles.headerRow}>
        <div className={styles.statusBadge}>
          <span className={styles.pulseBeacon} aria-hidden="true">
            <span className={styles.pulseDot} />
            <span className={styles.pulseRing} />
          </span>
          <span className={styles.statusLabel}>Open to SDE & Full-Stack Internships</span>
        </div>
        <span className={styles.yearChip}>2026–2027</span>
      </div>

      {/* Main clock & location row */}
      <div className={styles.clockRow}>
        <div className={styles.clockDisplay}>
          <span className={styles.clockIcon} aria-hidden="true">
            <Icon name="clock" />
          </span>
          <div className={styles.timeStack}>
            <div className={styles.timeDigits}>
              <span className={styles.timeValue}>
                {timeState.mounted ? timeState.timeStr : "Live IST"}
              </span>
              <span className={styles.timezonePill}>IST • UTC+5:30</span>
            </div>
            <p className={styles.location}>
              <span>Ahmedabad, Gujarat, India</span>
              <span className={styles.dotDivider} aria-hidden="true">•</span>
              <span className={styles.dayStatus}>
                {timeState.mounted
                  ? timeState.isDaytime
                    ? "Active hours"
                    : "Resting hours (Replies morning IST)"
                  : "Indian Standard Time"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Response commitment */}
      <footer className={styles.footerRow}>
        <div className={styles.responseGuarantee}>
          <span className={styles.zapIcon} aria-hidden="true">
            <Icon name="zap" />
          </span>
          <span>Typical response time: within 24 hours</span>
        </div>
      </footer>
    </section>
  );
}

