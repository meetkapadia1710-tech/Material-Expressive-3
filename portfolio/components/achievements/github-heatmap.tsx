"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import type { GitHubCalendarData } from "@/lib/github-calendar";
import { githubFallbackCalendar } from "@/content/github-fallback";
import { Icon } from "@/components/icon";

interface GitHubHeatmapProps {
  initialData?: GitHubCalendarData;
  initialLive?: boolean;
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

export function GitHubHeatmap({ initialData = githubFallbackCalendar, initialLive = false }: GitHubHeatmapProps) {
  const [data, setData] = useState<GitHubCalendarData>(initialData);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [isLive, setIsLive] = useState(initialLive);
  const [lookupDate, setLookupDate] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const region = scrollRef.current;
    if (!region) return;
    region.scrollLeft = region.scrollWidth - region.clientWidth;
  }, []);

  const days = useMemo(() => data.weeks.flat(), [data.weeks]);
  const chartWidth = Math.max(0, data.weeks.length - 1) * cellStep + cellSize;
  const chartPaths = useMemo(() => {
    const levels = Array.from({ length: 5 }, () => "");
    data.weeks.forEach((week, column) => week.forEach((day, row) => {
      const x = column * cellStep + 1;
      const y = row * cellStep + 1;
      levels[day.level] += `M${x + 2} ${y}h6q2 0 2 2v6q0 2-2 2h-6q-2 0-2-2v-6q0-2 2-2z`;
    }));
    return levels;
  }, [data.weeks]);
  const lookup = lookupDate ? days.find((day) => day.date === lookupDate) : undefined;

  useEffect(() => {
    if (initialLive) return;
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
  }, [initialLive]);

  function showHoveredDay(event: PointerEvent<SVGSVGElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * chartWidth / bounds.width;
    const y = (event.clientY - bounds.top) * chartHeight / bounds.height;
    const column = Math.floor(x / cellStep);
    const row = Math.floor(y / cellStep);
    const day = x % cellStep < cellSize && y % cellStep < cellSize ? data.weeks[column]?.[row] : null;
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
            <h3>Continuous Contribution Heatmap</h3>
          </div>
          <span className="heatmap-live-badge" title={isLive ? "Synchronized hourly with GitHub activity" : "Cached snapshot"}>
            <span className={`live-pulse-dot ${isLive ? "pulse-active" : ""}`} />
            {isLive ? "GitHub Sync • Hourly" : "Cached Snapshot"}
          </span>
        </div>

        <p className="heatmap-scroll-hint" id="heatmap-scroll-hint">Scroll horizontally to see earlier weeks.</p>
        <div ref={scrollRef} className="heatmap-scroll-area" data-scroll-region onScroll={() => { if (hoveredDay) setHoveredDay(null); }} tabIndex={0} role="region" aria-label="Contribution calendar" aria-describedby="heatmap-scroll-hint">
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

        <div className="heatmap-date-lookup">
          <label htmlFor="heatmap-date">Look up a day</label>
          <input id="heatmap-date" type="date" min={days[0]?.date} max={days.at(-1)?.date} value={lookupDate} onChange={(event) => setLookupDate(event.target.value)} />
          <output htmlFor="heatmap-date" aria-live="polite">
            {lookupDate && (lookup ? `${lookup.count} contributions on ${formatDate(lookup.date)}` : "No calendar data for this date.")}
          </output>
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

