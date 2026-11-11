"use client";

import { useEffect, useState } from "react";
import type { CodingProfile } from "@/content/achievements";
import {
  assertDevCodingStatProvenance,
  formatAsOfDate,
  formatAsOfDateTime,
  formatRelativeAge,
} from "@/lib/coding-stats-core";
import { Icon } from "@/components/icon";
import { MorphingShape, type ShapeName } from "@/components/motion/morphing-shape";

interface PlatformConfig {
  shape: ShapeName;
  hoverShape: ShapeName;
  pressShape: ShapeName;
  shortMark: string;
  badgeLabel: string;
}

const platformConfigs: Record<string, PlatformConfig> = {
  leetcode: {
    shape: "scalloped",
    hoverShape: "roundedSquare",
    pressShape: "circle",
    shortMark: "LC",
    badgeLabel: "LeetCode",
  },
  codechef: {
    shape: "diamond",
    hoverShape: "circle",
    pressShape: "roundedSquare",
    shortMark: "CC",
    badgeLabel: "CodeChef",
  },
  geeksforgeeks: {
    shape: "clover",
    hoverShape: "blob",
    pressShape: "scalloped",
    shortMark: "GFG",
    badgeLabel: "GeeksforGeeks",
  },
  github: {
    shape: "circle",
    hoverShape: "clover",
    pressShape: "blob",
    shortMark: "GH",
    badgeLabel: "GitHub",
  },
};

export function PlatformProfileCard({
  profile,
  labels,
}: {
  profile: CodingProfile & { href?: string | null; label?: string; provenance?: string };
  labels: {
    problemsLabel: string;
    ratingLabel: string;
    scoreLabel: string;
    updatedLabel: string;
  };
}) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [profile.fetchedAt, profile.updatedAt]);

  if (profile.provenance) {
    assertDevCodingStatProvenance(profile, `PlatformProfileCard(${profile.id})`);
  }

  const cfg = platformConfigs[profile.id] ?? {
    shape: "roundedSquare" as ShapeName,
    hoverShape: "circle" as ShapeName,
    pressShape: "blob" as ShapeName,
    shortMark: profile.id.slice(0, 2).toUpperCase(),
    badgeLabel: profile.label ?? profile.id,
  };

  const title = profile.label ?? cfg.badgeLabel;
  const timestampIso = profile.source === "manual" ? (profile.checkedAt ?? profile.updatedAt) : (profile.fetchedAt ?? profile.updatedAt);

  const renderStatus = () => {
    if (profile.source === "manual") {
      const checkedDate = formatAsOfDate(timestampIso);
      return (
        <p className="coding-updated coding-status-row">
          <span className="coding-source-badge coding-source-manual">Manual</span>
          {timestampIso ? (
            <time dateTime={timestampIso}>Checked {checkedDate}</time>
          ) : null}
        </p>
      );
    }

    if (profile.source === "cache" && timestampIso) {
      return (
        <p className="coding-updated coding-status-row">
          <span className="coding-source-badge coding-source-cache">Cached</span>
          <time dateTime={timestampIso}>As of {formatAsOfDateTime(timestampIso)}</time>
        </p>
      );
    }

    if (timestampIso) {
      const isIsoTimestamp = timestampIso.includes("T");
      const label = isIsoTimestamp && nowMs !== null
        ? formatRelativeAge(timestampIso, nowMs)
        : isIsoTimestamp
          ? `As of ${formatAsOfDateTime(timestampIso)}`
          : `${labels.updatedLabel} ${timestampIso}`;
      return (
        <p className="coding-updated coding-status-row">
          {profile.source === "live" ? (
            <span className="coding-source-badge coding-source-live">Live</span>
          ) : null}
          <time dateTime={timestampIso} suppressHydrationWarning>
            {label}
          </time>
        </p>
      );
    }

    if (profile.problemsSolved === null && profile.rating === null) {
      return (
        <p className="coding-updated coding-status-row">
          <span>Stats temporarily unavailable</span>
        </p>
      );
    }

    return null;
  };

  const innerContent = (
    <>
      <div className="coding-profile-header">
        <div className="coding-profile-leading">
          <MorphingShape
            className="platform-signature-shape"
            shape={cfg.shape}
            hoverShape={cfg.hoverShape}
            pressShape={cfg.pressShape}
            morphOnView={true}
          >
            <span className="platform-mark" aria-hidden="true">
              {cfg.shortMark}
            </span>
          </MorphingShape>
          <div className="platform-meta">
            <h3>{title}</h3>
            {profile.handle ? <p className="coding-handle">@{profile.handle}</p> : null}
          </div>
        </div>

        {profile.href ? (
          <span className="platform-action-button" aria-hidden="true">
            <span className="action-state-layer" />
            <Icon name="arrow-up-right" />
          </span>
        ) : null}
      </div>

      {profile.problemsSolved !== null || profile.rating !== null ? (
        <dl className="coding-metrics">
          {profile.problemsSolved !== null ? (
            <div>
              <dt>{labels.problemsLabel}</dt>
              <dd className="tabular-nums">
                {profile.problemsSolved}
                {profile.problemsQualifier}
              </dd>
            </div>
          ) : null}
          {profile.rating !== null ? (
            <div>
              <dt>{profile.linkId === "geeksforgeeks" ? labels.scoreLabel : labels.ratingLabel}</dt>
              <dd className="tabular-nums">{profile.rating}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {renderStatus()}
      {profile.href ? <span className="sr-only">, opens in a new tab</span> : null}
    </>
  );

  if (profile.href) {
    return (
      <a
        href={profile.href}
        target="_blank"
        rel="noopener noreferrer"
        className="coding-profile m3-platform-card coding-profile-link"
        data-platform-scheme={profile.id}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <article
      className="coding-profile m3-platform-card"
      data-platform-scheme={profile.id}
    >
      {innerContent}
    </article>
  );
}
