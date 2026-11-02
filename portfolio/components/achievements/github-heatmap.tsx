"use client";

import { useEffect, useState } from "react";
import type { GitHubCalendarData } from "@/lib/github-calendar";
import { githubFallbackCalendar } from "@/content/github-fallback";
import { Icon } from "@/components/icon";

interface GitHubHeatmapProps {
  initialData?: GitHubCalendarData;
}

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  } catch {
    return dateStr;
  }
}

export function GitHubHeatmap({ initialData = githubFallbackCalendar }: GitHubHeatmapProps) {
  const [data, setData] = useState<GitHubCalendarData>(initialData);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCalendar() {
      try {
        const res = await fetch("/api/github-calendar");
        if (!res.ok) return;
        const live = await res.json();
        if (cancelled || !live?.weeks?.length) return;
        setData(live);
        setIsLive(true);
      } catch {
        // Fallback already rendered
      }
    }

    fetchCalendar();
    return () => {
      cancelled = true;
    };
  }, []);

  const dayNames = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="github-heatmap-container" aria-label="GitHub Contribution Heatmap">
      {/* Metrics Row */}
      <div className="heatmap-metrics-row">
        <div className="heatmap-metric-card">
          <span className="metric-label">Contributions</span>
          <strong className="metric-value">{data.totalContributions}</strong>
          <span className="metric-sub">Past 365 days</span>
        </div>

        <div className="heatmap-metric-card">
          <span className="metric-label">Current Streak</span>
          <strong className="metric-value">
            {data.currentStreak} <span className="streak-unit">days</span>
          </strong>
          <span className="metric-sub">{data.currentStreak > 0 ? "🔥 Active now" : "Resting"}</span>
        </div>

        <div className="heatmap-metric-card">
          <span className="metric-label">Longest Streak</span>
          <strong className="metric-value">
            {data.longestStreak} <span className="streak-unit">days</span>
          </strong>
          <span className="metric-sub">Personal record</span>
        </div>

        <div className="heatmap-metric-card">
          <span className="metric-label">Busiest Day</span>
          <strong className="metric-value">
            {data.maxDay.count} <span className="streak-unit">commits</span>
          </strong>
          <span className="metric-sub">{formatDate(data.maxDay.date)}</span>
        </div>
      </div>

      {/* Heatmap Card */}
      <div className="heatmap-card">
        <div className="heatmap-card-header">
          <div className="heatmap-header-left">
            <span className="heatmap-eyebrow">
              <Icon name="github" className="heatmap-icon" /> Commit Activity Calendar
            </span>
            <h4>Continuous Contribution Heatmap</h4>
          </div>
          <span className="heatmap-live-badge" title={isLive ? "Synchronized hourly with GitHub activity" : "Cached snapshot"}>
            <span className={`live-pulse-dot ${isLive ? "pulse-active" : ""}`} />
            {isLive ? "GitHub Sync • Hourly" : "Cached Snapshot"}
          </span>
        </div>

        <div className="heatmap-scroll-area">
          <div className="heatmap-grid-wrapper">
            {/* Months Header */}
            <div className="heatmap-months-row">
              <div className="day-spacer" />
              <div className="months-track">
                {data.monthLabels.map((item, idx) => (
                  <span
                    key={`${item.month}-${idx}`}
                    className="month-label"
                    style={{ left: `${(item.weekIndex / data.weeks.length) * 100}%` }}
                  >
                    {item.month}
                  </span>
                ))}
              </div>
            </div>

            {/* Weeks & Days Grid */}
            <div className="heatmap-body">
              {/* Day of Week Labels */}
              <div className="heatmap-day-labels">
                {dayNames.map((d, i) => (
                  <span key={i} className="day-name">
                    {d}
                  </span>
                ))}
              </div>

              {/* 53 Columns */}
              <div className="heatmap-weeks">
                {data.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="heatmap-week-col">
                    {week.map((day) => (
                      <div
                        key={day.id || day.date}
                        className={`heatmap-day-cell level-${day.level}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredDay({
                            date: day.date,
                            count: day.count,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        role="gridcell"
                        aria-label={`${day.count} contributions on ${formatDate(day.date)}`}
                        tabIndex={0}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="heatmap-footer">
              <span className="heatmap-footer-note">Activity recorded across public repositories & PRs</span>
              <div className="heatmap-legend">
                <span>Less</span>
                <span className="legend-cell level-0" />
                <span className="legend-cell level-1" />
                <span className="legend-cell level-2" />
                <span className="legend-cell level-3" />
                <span className="legend-cell level-4" />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredDay ? (
          <div
            className="heatmap-tooltip"
            style={{
              position: "fixed",
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y - 8}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <strong>{hoveredDay.count === 0 ? "No" : hoveredDay.count} contribution{hoveredDay.count === 1 ? "" : "s"}</strong>
            <span>on {formatDate(hoveredDay.date)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

