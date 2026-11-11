"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { LeetCodeBreakdown, LeetCodeSubmissionItem } from "@/content/achievements";
import {
  assertDevCodingStatProvenance,
  formatAsOfDateTime,
  formatRelativeAge,
} from "@/lib/coding-stats-core";
import { Icon } from "@/components/icon";
import { useCountUp } from "@/components/motion/use-count-up";

interface LeetCodeWidgetProps {
  stats: LeetCodeBreakdown | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  syncNote?: string | null;
  className?: string;
}

function formatRelativeTime(timestamp: string, nowMs: number | null): string {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return "Recently";
  const date = new Date(ts * 1000);
  const stableDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
  if (nowMs === null) return stableDate;

  const now = Math.floor(nowMs / 1000);
  const diffSec = Math.max(0, now - ts);
  const diffHours = Math.floor(diffSec / 3600);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours < 1) return "Just now";
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return stableDate;
}

function LeetCodeCenterCount({ target }: { target: number }) {
  const countRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(target, 600, visible);

  useEffect(() => {
    const element = countRef.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <span ref={countRef} className="leetcode-center-count tabular-nums">{count}</span>;
}

export function LeetCodeWidget({
  stats,
  onRefresh,
  isRefreshing = false,
  syncNote = null,
  className = "",
}: LeetCodeWidgetProps) {
  const [activeSegment, setActiveSegment] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [activePattern, setActivePattern] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);

  // M3 Shared Sliding Indicator state and refs
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const groupRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  if (stats) {
    assertDevCodingStatProvenance(stats, "LeetCodeWidget");
  }

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [stats?.fetchedAt]);

  const updateIndicator = useCallback(() => {
    const btn = buttonRefs.current.get(activeSegment);
    const container = groupRef.current;
    if (!btn || !container) return;
    setIndicatorStyle({
      left: btn.offsetLeft,
      width: btn.offsetWidth,
    });
  }, [activeSegment]);

  useEffect(() => {
    updateIndicator();
    const handleResize = () => updateIndicator();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator, stats?.total, stats?.easy.count, stats?.medium.count, stats?.hard.count]);

  if (!stats) {
    return null;
  }

  // Single-source bucket totals guarantee card, ring, filter chips, and bars never diverge.
  const bucketTotal = stats.easy.count + stats.medium.count + stats.hard.count;
  const totalCount = bucketTotal > 0 || stats.total === 0 ? bucketTotal : stats.total;
  const totalDisplay = `${totalCount}`;

  // Active target count for animated focal number
  const targetCount =
    activeSegment === "easy"
      ? stats.easy.count
      : activeSegment === "medium"
        ? stats.medium.count
        : activeSegment === "hard"
          ? stats.hard.count
          : totalCount;

  // SVG Geometry for Expressive Donut Progress Ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const gap = 8;
  const arcLength = (count: number) => (totalCount > 0 ? Math.max(0, (count / totalCount) * circumference - gap) : 0);
  const easyLen = arcLength(stats.easy.count);
  const medLen = arcLength(stats.medium.count);
  const hardLen = arcLength(stats.hard.count);

  const easyOffset = -gap / 2;
  const medOffset = -(easyLen + gap + gap / 2);
  const hardOffset = -(easyLen + gap + medLen + gap + gap / 2);

  const getHighlightText = () => {
    switch (activeSegment) {
      case "easy":
        return `Easy: ${stats.easy.count} problems (${stats.easy.percentage}%) — foundational constructs, data access & rapid implementation.`;
      case "medium":
        return `Medium: ${stats.medium.count} problems (${stats.medium.percentage}%) — core interview sweet spot covering optimal multi-phase algorithm design.`;
      case "hard":
        return `Hard: ${stats.hard.count} problems (${stats.hard.percentage}%) — advanced constraint bounding, complex graph modeling & competitive dynamic programming.`;
      default:
        return `${totalDisplay} solved problems across Easy (${stats.easy.count}), Medium (${stats.medium.count}), and Hard (${stats.hard.count}) buckets.`;
    }
  };

  const recentList: readonly LeetCodeSubmissionItem[] = stats.recentSubmissions ?? [];

  const segments = [
    { id: "all" as const, label: `All (${totalDisplay})`, dotClass: "" },
    { id: "easy" as const, label: `Easy (${stats.easy.count})`, dotClass: "dot-easy" },
    { id: "medium" as const, label: `Med (${stats.medium.count})`, dotClass: "dot-medium" },
    { id: "hard" as const, label: `Hard (${stats.hard.count})`, dotClass: "dot-hard" },
  ];

  const isLive = stats.source === "live";
  const ageLabel =
    stats.source === "cache"
      ? stats.fetchedAt
        ? `Cached · As of ${formatAsOfDateTime(stats.fetchedAt)}`
        : "Cached"
      : stats.fetchedAt
        ? nowMs !== null
          ? `Synced · ${formatRelativeAge(stats.fetchedAt, nowMs)}`
          : `Synced · As of ${formatAsOfDateTime(stats.fetchedAt)}`
        : "Synced · Hourly";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const ids: Array<"all" | "easy" | "medium" | "hard"> = ["all", "easy", "medium", "hard"];
    const curIdx = ids.indexOf(activeSegment);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = ids[(curIdx + 1) % ids.length];
      setActiveSegment(next);
      buttonRefs.current.get(next)?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = ids[(curIdx - 1 + ids.length) % ids.length];
      setActiveSegment(prev);
      buttonRefs.current.get(prev)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveSegment("all");
      buttonRefs.current.get("all")?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveSegment("hard");
      buttonRefs.current.get("hard")?.focus();
    }
  };

  return (
    <div className={`leetcode-widget ${className}`} aria-label="Interactive LeetCode Problem Solving Breakdown">
      {/* Widget Header with Truthful Sync Status Chip */}
      <div className="leetcode-header">
        <div className="leetcode-header-title">
          <div className="leetcode-eyebrow-row">
            <span className="leetcode-eyebrow">
              <Icon name="code" className="leetcode-icon-inline" /> Problem Solving Analytics
            </span>
            <span
              className={`leetcode-live-badge m3-assist-chip ${isLive ? "is-live-source" : "is-cache-source"}`}
              title="Hourly synchronization with LeetCode GraphQL API (3600s cache)"
            >
              <span className={`live-pulse-dot ${isLive ? "pulse-active" : "is-cached-dot"}`} aria-hidden="true" />
              <span suppressHydrationWarning>{syncNote ?? ageLabel}</span>
            </span>
            {onRefresh ? (
              <button
                type="button"
                className="leetcode-refresh-button m3-assist-chip"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label={isRefreshing ? "Refreshing coding statistics" : "Refresh coding statistics"}
              >
                <Icon name="spark" className="leetcode-icon-inline" />
                <span>{isRefreshing ? "Syncing…" : "Refresh"}</span>
              </button>
            ) : null}
          </div>
          <h3>LeetCode Problem Distribution</h3>
        </div>

        {/* M3 Connected Segmented Button Group with Shared Morphing Indicator */}
        <div
          ref={groupRef}
          className="leetcode-segmented-group"
          data-scroll-region
          role="radiogroup"
          aria-label="Difficulty Filter"
          data-active-segment={activeSegment}
          onKeyDown={handleKeyDown}
        >
          <span
            className={`leetcode-segmented-indicator indicator-${activeSegment}`}
            style={{
              transform: `translateX(${indicatorStyle.left}px)`,
              width: `${indicatorStyle.width}px`,
            }}
            aria-hidden="true"
          />

          {segments.map((seg) => (
            <button
              key={seg.id}
              ref={(el) => {
                if (el) buttonRefs.current.set(seg.id, el);
                else buttonRefs.current.delete(seg.id);
              }}
              type="button"
              role="radio"
              aria-checked={activeSegment === seg.id}
              tabIndex={activeSegment === seg.id ? 0 : -1}
              className={`segmented-button segment-${seg.id} ${activeSegment === seg.id ? "is-selected" : ""}`}
              onClick={() => setActiveSegment(seg.id)}
            >
              {seg.dotClass ? <span className={`segmented-dot ${seg.dotClass}`} aria-hidden="true" /> : null}
              <span className="segmented-label">{seg.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Expressive Progress Ring + Linear Difficulty Progress Bars */}
      <div className="leetcode-main-layout">
        <div className="leetcode-chart-col">
          <div className="leetcode-donut-wrapper" style={{ outline: "none", border: "none" }}>
            <svg
              className="leetcode-donut-svg"
              viewBox="0 0 140 140"
              aria-label={`Donut chart showing ${totalDisplay} solved: ${stats.easy.count} Easy, ${stats.medium.count} Medium, ${stats.hard.count} Hard`}
              role="img"
              focusable={false}
              style={{ outline: "none", border: "none" }}
            >
              <circle
                className="leetcode-donut-track"
                cx="70"
                cy="70"
                r={radius}
                strokeWidth="12"
              />
              <circle
                className={`leetcode-donut-segment segment-easy ${
                  activeSegment === "easy" || activeSegment === "all" ? "segment-active" : "segment-dimmed"
                }`}
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={activeSegment === "easy" ? "15" : "12"}
                strokeLinecap="round"
                strokeDasharray={`${easyLen} ${circumference}`}
                strokeDashoffset={easyOffset}
              />
              <circle
                className={`leetcode-donut-segment segment-medium ${
                  activeSegment === "medium" || activeSegment === "all" ? "segment-active" : "segment-dimmed"
                }`}
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={activeSegment === "medium" ? "15" : "12"}
                strokeLinecap="round"
                strokeDasharray={`${medLen} ${circumference}`}
                strokeDashoffset={medOffset}
              />
              <circle
                className={`leetcode-donut-segment segment-hard ${
                  activeSegment === "hard" || activeSegment === "all" ? "segment-active" : "segment-dimmed"
                }`}
                cx="70"
                cy="70"
                r={radius}
                strokeWidth={activeSegment === "hard" ? "15" : "12"}
                strokeLinecap="round"
                strokeDasharray={`${hardLen} ${circumference}`}
                strokeDashoffset={hardOffset}
              />
            </svg>

            <div className="leetcode-donut-center" aria-hidden="true">
              <LeetCodeCenterCount target={targetCount} />
              <span className="leetcode-center-label">
                {activeSegment === "all" ? "Solved" : `${activeSegment.toUpperCase()}`}
              </span>
            </div>
          </div>

          <p className="leetcode-summary-caption">{getHighlightText()}</p>
        </div>

        {/* Difficulty Rows with Expressive Linear Progress Indicators */}
        <div className="leetcode-bars-col">
          {/* Easy Row */}
          <div
            className={`leetcode-bar-card ${activeSegment === "easy" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "easy" ? "all" : "easy")}
            role="button"
            tabIndex={0}
            aria-pressed={activeSegment === "easy"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "easy" ? "all" : "easy");
            }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-easy" aria-hidden="true" />
                <span className="leetcode-bar-difficulty">Easy</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong className="tabular-nums">{stats.easy.count}</strong>
                <span className="leetcode-bar-pct tabular-nums">{stats.easy.percentage}%</span>
              </div>
            </div>
            <div className="leetcode-progress-track">
              <div
                className="leetcode-progress-fill fill-easy"
                style={{ width: `${stats.easy.percentage}%` }}
              />
            </div>
          </div>

          {/* Medium Row */}
          <div
            className={`leetcode-bar-card ${activeSegment === "medium" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "medium" ? "all" : "medium")}
            role="button"
            tabIndex={0}
            aria-pressed={activeSegment === "medium"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "medium" ? "all" : "medium");
            }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-medium" aria-hidden="true" />
                <span className="leetcode-bar-difficulty">Medium</span>
                <span className="leetcode-badge-sweetspot">{stats.medium.tagLabel}</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong className="tabular-nums">{stats.medium.count}</strong>
                <span className="leetcode-bar-pct tabular-nums">{stats.medium.percentage}%</span>
              </div>
            </div>
            <div className="leetcode-progress-track">
              <div
                className="leetcode-progress-fill fill-medium"
                style={{ width: `${stats.medium.percentage}%` }}
              />
            </div>
          </div>

          {/* Hard Row */}
          <div
            className={`leetcode-bar-card ${activeSegment === "hard" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "hard" ? "all" : "hard")}
            role="button"
            tabIndex={0}
            aria-pressed={activeSegment === "hard"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "hard" ? "all" : "hard");
            }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-hard" aria-hidden="true" />
                <span className="leetcode-bar-difficulty">Hard</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong className="tabular-nums">{stats.hard.count}</strong>
                <span className="leetcode-bar-pct tabular-nums">{stats.hard.percentage}%</span>
              </div>
            </div>
            <div className="leetcode-progress-track">
              <div
                className="leetcode-progress-fill fill-hard"
                style={{ width: `${stats.hard.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Alternative Table for Screen Readers */}
      <table className="sr-only">
        <caption>LeetCode Problem Solving Statistics</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Solved</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Easy</th>
            <td>{stats.easy.count}</td>
            <td>{stats.easy.percentage}%</td>
          </tr>
          <tr>
            <th scope="row">Medium</th>
            <td>{stats.medium.count}</td>
            <td>{stats.medium.percentage}%</td>
          </tr>
          <tr>
            <th scope="row">Hard</th>
            <td>{stats.hard.count}</td>
            <td>{stats.hard.percentage}%</td>
          </tr>
          <tr>
            <th scope="row">Total</th>
            <td>{totalDisplay}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>

      {/* Algorithmic Patterns Section with Leading Morphing Shapes */}
      {stats.patterns.length ? (
        <div className="leetcode-patterns-section">
          <div className="leetcode-patterns-header">
            <h4>Signature Algorithmic Patterns</h4>
            <span className="leetcode-patterns-subtitle patterns-subtitle">
              Deep practice focus across dynamic problem topologies
            </span>
          </div>
          <div className="leetcode-pattern-grid leetcode-patterns-grid">
            {stats.patterns.map((pattern, idx) => (
              <div
                key={pattern.title}
                className={`leetcode-pattern-card pattern-card ${activePattern === idx ? "pattern-card-active" : ""}`}
                onClick={() => setActivePattern(activePattern === idx ? null : idx)}
                role="button"
                tabIndex={0}
                aria-expanded={activePattern === idx}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setActivePattern(activePattern === idx ? null : idx);
                  }
                }}
              >
                <div className="leetcode-pattern-top pattern-card-top">
                  <div className="pattern-leading-cluster">
                    <span className="pattern-index-badge">0{idx + 1}</span>
                    <span className="leetcode-pattern-tag pattern-tag">{pattern.tag}</span>
                  </div>
                </div>
                <h5 className="leetcode-pattern-title">{pattern.title}</h5>
                <p className="leetcode-pattern-desc">{pattern.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recently Solved Questions List */}
      {recentList.length ? (
        <div className="leetcode-recent-section">
          <div className="leetcode-recent-header">
            <h4>Recent accepted submissions</h4>
            <span className="leetcode-recent-count recent-subtitle">Latest accepted algorithmic solutions</span>
          </div>
          <div className="leetcode-recent-list" role="list">
            {recentList.slice(0, 10).map((item) => (
              <div key={`${item.titleSlug}-${item.timestamp}`} className="leetcode-recent-item m3-list-item" role="listitem">
                <div className="leetcode-recent-info">
                  <div className="recent-leading-shape leetcode-recent-status" aria-hidden="true">
                    <span className="recent-status-icon">✓</span>
                  </div>
                  <span className="leetcode-recent-title recent-title">{item.title}</span>
                </div>
                <div className="leetcode-recent-meta">
                  <span className="leetcode-recent-time recent-time" suppressHydrationWarning>
                    {formatRelativeTime(item.timestamp, nowMs)}
                  </span>
                  <a
                    href={`https://leetcode.com/problems/${item.titleSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recent-link-button leetcode-recent-icon"
                    aria-label={`View ${item.title} on LeetCode (external)`}
                  >
                    <span className="action-state-layer" />
                    <Icon name="arrow-up-right" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
