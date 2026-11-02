"use client";

import { useEffect, useState } from "react";
import { leetCodeStats, type LeetCodeBreakdown, type LeetCodeSubmissionItem } from "@/content/achievements";
import { Icon } from "@/components/icon";

interface LeetCodeWidgetProps {
  stats?: LeetCodeBreakdown;
  className?: string;
}

function formatRelativeTime(timestamp: string): string {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return "Recently";
  const now = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, now - ts);
  const diffHours = Math.floor(diffSec / 3600);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 0) {
    if (diffHours < 1) return "Just now";
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  const date = new Date(ts * 1000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LeetCodeWidget({ stats: initialStats = leetCodeStats, className = "" }: LeetCodeWidgetProps) {
  const [currentStats, setCurrentStats] = useState<LeetCodeBreakdown>(initialStats);
  const [activeSegment, setActiveSegment] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [activePattern, setActivePattern] = useState<number | null>(null);
  const [isLiveSync, setIsLiveSync] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchLiveLeetCode() {
      try {
        const res = await fetch("/api/leetcode");
        if (!res.ok) return;
        const live = await res.json();
        if (cancelled || !live?.total) return;

        setCurrentStats((prev) => ({
          ...prev,
          total: live.total,
          totalDisplay: `${live.total}+`,
          easy: live.easy,
          medium: live.medium,
          hard: live.hard,
          recentSubmissions: live.recent?.length ? live.recent : prev.recentSubmissions,
        }));
        setIsLiveSync(true);
      } catch {
        // Fallback to static props smoothly
      }
    }

    fetchLiveLeetCode();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = currentStats;
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29

  const easyLen = (stats.easy.count / stats.total) * circumference;
  const medLen = (stats.medium.count / stats.total) * circumference;
  const hardLen = (stats.hard.count / stats.total) * circumference;

  const easyOffset = 0;
  const medOffset = -easyLen;
  const hardOffset = -(easyLen + medLen);

  const getHighlightText = () => {
    switch (activeSegment) {
      case "easy":
        return `Easy: ${stats.easy.count} problems (${stats.easy.percentage}%) — foundational constructs & rapid syntax implementation`;
      case "medium":
        return `Medium: ${stats.medium.count} problems (${stats.medium.percentage}%) — optimal technical interview standard & multi-phase algorithm design`;
      case "hard":
        return `Hard: ${stats.hard.count} problems (${stats.hard.percentage}%) — advanced constraint bounding, complex graph modeling & competitive DP`;
      default:
        return `${stats.totalDisplay} problems solved across core algorithmic domains with verified clean execution`;
    }
  };

  const recentList: readonly LeetCodeSubmissionItem[] = stats.recentSubmissions ?? [];

  return (
    <div className={`leetcode-widget ${className}`} aria-label="Interactive LeetCode Problem Solving Breakdown">
      <div className="leetcode-header">
        <div className="leetcode-header-title">
          <div className="leetcode-eyebrow-row">
            <span className="leetcode-eyebrow">
              <Icon name="code" className="leetcode-icon-inline" /> Problem Solving Analytics
            </span>
            <span className="leetcode-live-badge" title="Live synchronization with LeetCode GraphQL API">
              <span className={`live-pulse-dot ${isLiveSync ? "pulse-active" : ""}`} />
              {isLiveSync ? "Live LeetCode Sync" : "Verified Snapshot"}
            </span>
          </div>
          <h3>LeetCode Problem Distribution</h3>
        </div>
        <div className="leetcode-segment-filters" role="tablist" aria-label="Difficulty Filter">
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === "all"}
            className={`leetcode-filter-btn ${activeSegment === "all" ? "filter-active" : ""}`}
            onClick={() => setActiveSegment("all")}
          >
            All ({stats.totalDisplay})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === "easy"}
            className={`leetcode-filter-btn filter-easy ${activeSegment === "easy" ? "filter-active" : ""}`}
            onClick={() => setActiveSegment("easy")}
          >
            Easy ({stats.easy.count})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === "medium"}
            className={`leetcode-filter-btn filter-medium ${activeSegment === "medium" ? "filter-active" : ""}`}
            onClick={() => setActiveSegment("medium")}
          >
            Medium ({stats.medium.count})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === "hard"}
            className={`leetcode-filter-btn filter-hard ${activeSegment === "hard" ? "filter-active" : ""}`}
            onClick={() => setActiveSegment("hard")}
          >
            Hard ({stats.hard.count})
          </button>
        </div>
      </div>

      <div className="leetcode-main-layout">
        <div className="leetcode-chart-col">
          <div className="leetcode-donut-wrapper">
            <svg className="leetcode-donut-svg" viewBox="0 0 140 140" aria-hidden="true">
              <circle
                className="leetcode-donut-track"
                cx="70"
                cy="70"
                r={radius}
              />
              <circle
                className={`leetcode-donut-segment segment-easy ${activeSegment === "easy" || activeSegment === "all" ? "segment-active" : "segment-dimmed"}`}
                cx="70"
                cy="70"
                r={radius}
                strokeDasharray={`${easyLen} ${circumference - easyLen}`}
                strokeDashoffset={easyOffset}
                onClick={() => setActiveSegment("easy")}
              />
              <circle
                className={`leetcode-donut-segment segment-medium ${activeSegment === "medium" || activeSegment === "all" ? "segment-active" : "segment-dimmed"}`}
                cx="70"
                cy="70"
                r={radius}
                strokeDasharray={`${medLen} ${circumference - medLen}`}
                strokeDashoffset={medOffset}
                onClick={() => setActiveSegment("medium")}
              />
              <circle
                className={`leetcode-donut-segment segment-hard ${activeSegment === "hard" || activeSegment === "all" ? "segment-active" : "segment-dimmed"}`}
                cx="70"
                cy="70"
                r={radius}
                strokeDasharray={`${hardLen} ${circumference - hardLen}`}
                strokeDashoffset={hardOffset}
                onClick={() => setActiveSegment("hard")}
              />
            </svg>
            <div className="leetcode-donut-center">
              <span className="leetcode-center-count">{stats.totalDisplay}</span>
              <span className="leetcode-center-label">Solved</span>
            </div>
          </div>
          <p className="leetcode-summary-caption">{getHighlightText()}</p>
        </div>

        <div className="leetcode-bars-col">
          <div
            className={`leetcode-bar-card ${activeSegment === "easy" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "easy" ? "all" : "easy")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "easy" ? "all" : "easy"); }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-easy" />
                <span className="leetcode-bar-difficulty">Easy</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong>{stats.easy.count}</strong>
                <span className="leetcode-bar-pct">{stats.easy.percentage}%</span>
              </div>
            </div>
            <div className="leetcode-progress-track">
              <div
                className="leetcode-progress-fill fill-easy"
                style={{ width: `${stats.easy.percentage}%` }}
              />
            </div>
          </div>

          <div
            className={`leetcode-bar-card ${activeSegment === "medium" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "medium" ? "all" : "medium")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "medium" ? "all" : "medium"); }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-medium" />
                <span className="leetcode-bar-difficulty">Medium</span>
                <span className="leetcode-badge-sweetspot">Interview Target</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong>{stats.medium.count}</strong>
                <span className="leetcode-bar-pct">{stats.medium.percentage}%</span>
              </div>
            </div>
            <div className="leetcode-progress-track">
              <div
                className="leetcode-progress-fill fill-medium"
                style={{ width: `${stats.medium.percentage}%` }}
              />
            </div>
            {stats.medium.highlight ? (
              <p className="leetcode-bar-note">{stats.medium.highlight}</p>
            ) : null}
          </div>

          <div
            className={`leetcode-bar-card ${activeSegment === "hard" ? "bar-card-selected" : ""}`}
            onClick={() => setActiveSegment(activeSegment === "hard" ? "all" : "hard")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveSegment(activeSegment === "hard" ? "all" : "hard"); }}
          >
            <div className="leetcode-bar-header">
              <div className="leetcode-bar-label-group">
                <span className="leetcode-dot dot-hard" />
                <span className="leetcode-bar-difficulty">Hard</span>
              </div>
              <div className="leetcode-bar-metrics">
                <strong>{stats.hard.count}+</strong>
                <span className="leetcode-bar-pct">{stats.hard.percentage}%</span>
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

      {/* Algorithmic Patterns Section */}
      <div className="leetcode-patterns-section">
        <div className="leetcode-patterns-header">
          <h4>Favorite Algorithmic Patterns</h4>
          <span className="leetcode-patterns-subtitle">High-frequency paradigms applied across competitive sets</span>
        </div>
        <div className="leetcode-pattern-grid">
          {stats.patterns.map((pattern, index) => {
            const isHovered = activePattern === index;
            return (
              <div
                key={pattern.title}
                className={`leetcode-pattern-card ${isHovered ? "pattern-card-hovered" : ""}`}
                onMouseEnter={() => setActivePattern(index)}
                onMouseLeave={() => setActivePattern(null)}
                tabIndex={0}
                role="article"
                aria-label={`${pattern.title} algorithmic pattern`}
              >
                <div className="leetcode-pattern-top">
                  <span className="leetcode-pattern-tag">{pattern.tag}</span>
                  <span className="leetcode-pattern-index">0{index + 1}</span>
                </div>
                <h5 className="leetcode-pattern-title">{pattern.title}</h5>
                <p className="leetcode-pattern-desc">{pattern.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Recently Solved Questions Section */}
      {recentList.length ? (
        <div className="leetcode-recent-section">
          <div className="leetcode-recent-header">
            <h4>Recently Solved Questions</h4>
            <span className="leetcode-recent-count">{recentList.length} verified submissions</span>
          </div>
          <div className="leetcode-recent-list">
            {recentList.map((item) => (
              <a
                key={item.titleSlug}
                href={`https://leetcode.com/problems/${item.titleSlug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-recent-item"
              >
                <div className="leetcode-recent-info">
                  <span className="leetcode-recent-status" />
                  <span className="leetcode-recent-title">{item.title}</span>
                </div>
                <div className="leetcode-recent-meta">
                  <span className="leetcode-recent-time">{formatRelativeTime(item.timestamp)}</span>
                  <Icon name="arrow-up-right" className="leetcode-recent-icon" />
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
