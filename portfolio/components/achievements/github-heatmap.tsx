"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { GitHubCalendarData, GitHubCalendarWithMeta } from "@/lib/github-calendar";
import { formatAsOfDateTime } from "@/lib/coding-stats-core";
import { Icon } from "@/components/icon";

type CalendarInput = GitHubCalendarData | GitHubCalendarWithMeta;

interface GitHubHeatmapProps {
  initialData: CalendarInput | null;
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

const cellSize = 12;
const cellStep = 15.5;
const chartHeight = 6 * cellStep + cellSize;
const dayNames = ["", "Mon", "", "Wed", "", "Fri", ""];

export function GitHubHeatmap({ initialData }: GitHubHeatmapProps) {
  const [data, setData] = useState(initialData);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const region = scrollRef.current;
    if (!region) return;
    region.scrollLeft = region.scrollWidth - region.clientWidth;
  }, [data]);

  const chartWidth = Math.max(0, (data?.weeks.length ?? 0) - 1) * cellStep + cellSize;
  const chartPaths = useMemo(() => {
    const levels = Array.from({ length: 5 }, () => "");
    data?.weeks.forEach((week, column) => week.forEach((day) => {
      const x = column * cellStep + 1;
      const y = new Date(day.date + "T00:00:00Z").getUTCDay() * cellStep + 1;
      levels[day.level] += `M${x + 2} ${y}h6q2 0 2 2v6q0 2-2 2h-6q-2 0-2-2v-6q0-2 2-2z`;
    }));
    return levels;
  }, [data]);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    async function fetchCalendar() {
      try {
        const res = await fetch("/api/github-calendar");
        if (!res.ok) return;
        const live = await res.json();
        if (cancelled || !live?.weeks?.length) return;
        setData(live);
      } catch {
        // Keep the unavailable state when the refresh fails.
      }
    }

    fetchCalendar();
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  function showHoveredDay(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * chartWidth / bounds.width;
    const y = (event.clientY - bounds.top) * chartHeight / bounds.height;
    const column = Math.floor(x / cellStep);
    const row = Math.floor(y / cellStep);
    const day = x % cellStep < cellSize && y % cellStep < cellSize
      ? data?.weeks[column]?.find((item) => new Date(item.date + "T00:00:00Z").getUTCDay() === row)
      : null;
    if (!day) {
      if (hoveredDay) setHoveredDay(null);
      return;
    }
    if (hoveredDay?.date === day.date) return;
    setHoveredDay({
      date: day.date, count: day.count,
      x: Math.max(100, Math.min(innerWidth - 100, event.clientX)),
      y: bounds.top + row * cellStep,
    });
  }

  if (!data) {
    return (
      <div className="heatmap-card">
        <h3>Continuous Contribution Heatmap</h3>
        <div className="heatmap-scroll-area" role="region" aria-label="Contribution calendar">
          <p role="status">GitHub contribution data is currently unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="github-heatmap-container" aria-label="GitHub Contribution Heatmap">
      {/* Metrics Row */}
      <div className="heatmap-metrics-row">
        <div className="heatmap-metric-card">
          <span className="metric-label">Contributions</span>
          <strong className="metric-value">{data.totalContributions}</strong>
          <span className="metric-sub">Calendar period</span>
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
            <h3>Continuous Contribution Heatmap</h3>
          </div>
          <span
            className="heatmap-live-badge"
            title={
              "source" in data && data.source === "cache"
                ? "Showing last cached GitHub calendar snapshot"
                : "Calendar data is revalidated hourly"
            }
          >
            <span
              className={`live-pulse-dot ${"source" in data && data.source === "cache" ? "is-cached-dot" : "pulse-active"}`}
            />
            {"source" in data && data.source === "cache" && "fetchedAt" in data
              ? `Cached · As of ${formatAsOfDateTime(data.fetchedAt)}`
              : "Calendar data from GitHub"}
          </span>
        </div>

        <p className="heatmap-scroll-hint" id="heatmap-scroll-hint">Scroll horizontally to see earlier weeks.</p>
        <div ref={scrollRef} className="heatmap-scroll-area" data-scroll-region onScroll={() => { if (hoveredDay) setHoveredDay(null); }} tabIndex={0} role="region" aria-label="Contribution calendar" aria-describedby="heatmap-scroll-hint">
          <div className="heatmap-grid-wrapper">
            {/* Months Header */}
            <div className="heatmap-months-row">
              <div className="day-spacer" />
              <div className="months-track" style={{ width: chartWidth }}>
                {data.monthLabels.map((item, idx) => (
                  <span
                    key={`${item.month}-${idx}`}
                    className="month-label"
                    style={{ left: item.weekIndex * cellStep }}
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

              <svg
                className="heatmap-weeks"
                width={chartWidth}
                height={chartHeight}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                aria-hidden="true"
                onPointerMove={showHoveredDay}
                onPointerLeave={() => setHoveredDay(null)}
              >
                {chartPaths.map((path, level) => <path key={level} className={`level-${level}`} d={path} />)}
              </svg>
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

