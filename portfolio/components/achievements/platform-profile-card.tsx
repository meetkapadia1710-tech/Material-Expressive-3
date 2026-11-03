"use client";

import type { CodingProfile } from "@/content/achievements";
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
  profile: CodingProfile & { href?: string | null; label?: string };
  labels: {
    problemsLabel: string;
    ratingLabel: string;
    scoreLabel: string;
    updatedLabel: string;
  };
}) {
  const cfg = platformConfigs[profile.id] ?? {
    shape: "roundedSquare" as ShapeName,
    hoverShape: "circle" as ShapeName,
    pressShape: "blob" as ShapeName,
    shortMark: profile.id.slice(0, 2).toUpperCase(),
    badgeLabel: profile.label ?? profile.id,
  };

  const primaryNumber = profile.problemsSolved !== null ? profile.problemsSolved : profile.rating;

  const metricLabel = profile.problemsSolved !== null
    ? labels.problemsLabel
    : profile.linkId === "geeksforgeeks"
    ? labels.scoreLabel
    : labels.ratingLabel;

  return (
    <article
      className="coding-profile m3-platform-card"
      data-platform-scheme={profile.id}
      tabIndex={0}
      aria-label={`${profile.label ?? profile.id} profile: ${primaryNumber ?? ""} ${metricLabel}`}
    >
      {/* Top row: Signature leading shape + identity + trailing icon action */}
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
            <h3>
              {profile.href ? (
                <a href={profile.href} target="_blank" rel="noopener noreferrer">
                  {profile.label ?? cfg.badgeLabel}
                  <Icon name="arrow-up-right" />
                </a>
              ) : (
                profile.label ?? cfg.badgeLabel
              )}
            </h3>
            {profile.handle ? <p className="coding-handle">@{profile.handle}</p> : null}
          </div>
        </div>

        {profile.href ? (
          <a
            href={profile.href}
            target="_blank"
            rel="noopener noreferrer"
            className="platform-action-button"
            aria-label={`Open ${profile.label ?? cfg.badgeLabel} profile (external)`}
          >
            <span className="action-state-layer" />
            <Icon name="arrow-up-right" />
          </a>
        ) : null}
      </div>

      {/* Primary & supporting metrics */}
      {profile.problemsSolved !== null || profile.rating !== null ? (
        <dl className="coding-metrics">
          {profile.problemsSolved !== null ? (
            <div>
              <dt>{labels.problemsLabel}</dt>
              <dd>
                {profile.problemsSolved}
                {profile.problemsQualifier}
              </dd>
            </div>
          ) : null}
          {profile.rating !== null ? (
            <div>
              <dt>{profile.linkId === "geeksforgeeks" ? labels.scoreLabel : labels.ratingLabel}</dt>
              <dd>{profile.rating}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {profile.updatedAt ? (
        <p className="coding-updated">
          {labels.updatedLabel}{" "}
          <time dateTime={profile.updatedAt}>{profile.updatedAt}</time>
        </p>
      ) : null}
    </article>
  );
}
