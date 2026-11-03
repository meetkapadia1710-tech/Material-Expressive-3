"use client";

import { useState } from "react";
import type { Achievement } from "@/content/types";
import { achievementsPageCopy as copy } from "@/content/achievements";
import { Icon, type IconName } from "@/components/icon";
import { MorphingShape, type ShapeName } from "@/components/motion/morphing-shape";
import { DocumentChips } from "./document-chips";
import { useToast } from "@/components/interface-controls";

interface AchievementCardProps {
  entry: Achievement;
  index: number;
  categoryLabel?: string;
  shape?: ShapeName;
  iconName?: IconName;
  tone?: "primary" | "secondary" | "tertiary";
  onViewDetails?: (entry: Achievement) => void;
  className?: string;
}

/**
 * Distinguishes true alphanumeric credential IDs (e.g. NVIDIA's "iCYD7o4TQD2sk23TRgpwJA")
 * from certificate or credential names (e.g. "Oracle Certified Professional").
 */
export function isRealCredentialId(id: string | null | undefined): boolean {
  if (!id) return false;
  if (/certificate|professional|workshop|degree/i.test(id)) return false;
  return /^[a-zA-Z0-9_-]{6,}$/.test(id);
}

/**
 * Truncates long credential IDs in the middle to prevent overflowing the meta chip row.
 */
export function truncateCredentialId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export function AchievementCard({
  entry,
  index,
  categoryLabel,
  shape = index % 2 === 0 ? "diamond" : "blob",
  iconName = index % 2 === 0 ? "trophy" : "spark",
  tone = index % 2 === 0 ? "secondary" : "tertiary",
  onViewDetails,
  className = "",
}: AchievementCardProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const chips = entry.technologies ?? entry.skills ?? [];
  const hasRealId = isRealCredentialId(entry.credentialId);
  const isCredentialName = Boolean(entry.credentialId && !hasRealId);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!entry.credentialId) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(entry.credentialId).then(() => {
        setCopied(true);
        toast("Credential ID copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <article
      className={`achievement-card tone-${tone} ${className}`}
      tabIndex={0}
      aria-label={`${entry.title} details`}
    >
      {/* 1. Header Slot: Leading Shape + Inline Meta Row */}
      <div className="achievement-card-header">
        <div className="achievement-card-shape-slot" aria-hidden="true">
          <MorphingShape
            className={`achievement-card-shape tone-${tone}`}
            shape={shape}
            hoverShape="circle"
            pressShape="roundedSquare"
            morphOnView={true}
          >
            <Icon name={iconName} className="achievement-card-shape-icon" />
          </MorphingShape>
        </div>

        <div className="achievement-card-meta">
          {categoryLabel ? (
            <span className="about-category-chip">{categoryLabel}</span>
          ) : null}
          {entry.dateLabel ? (
            <span className="about-date-chip">{entry.dateLabel}</span>
          ) : null}
          {hasRealId && entry.credentialId ? (
            <span className="achievement-id-chip m3-assist-chip" title={`Credential ID: ${entry.credentialId}`}>
              <span className="achievement-id-text">ID: {truncateCredentialId(entry.credentialId)}</span>
              <button
                type="button"
                className="achievement-id-copy-btn"
                onClick={handleCopyId}
                aria-label={`Copy full credential ID ${entry.credentialId}`}
                title="Copy credential ID"
              >
                <Icon name={copied ? "check" : "copy"} className="achievement-copy-icon" />
              </button>
            </span>
          ) : null}
          {isCredentialName && entry.credentialId ? (
            <span className="spotlight-constraint-badge">{entry.credentialId}</span>
          ) : null}
          {entry.timeConstraint ? (
            <span className="spotlight-constraint-badge">{entry.timeConstraint}</span>
          ) : null}
        </div>
      </div>

      {/* 2. Title Slot */}
      <div className="achievement-card-title-slot">
        <h3 className="achievement-card-title" title={entry.title}>
          {entry.title}
        </h3>
      </div>

      {/* 3. Organization / Issuer Slot */}
      <div className="achievement-card-org-slot">
        {entry.organization ? (
          <p className="achievement-card-org">{entry.organization}</p>
        ) : (
          <div className="achievement-slot-empty" aria-hidden="true" />
        )}
      </div>

      {/* 4. Description Slot (Consistent Clamping) */}
      <div className="achievement-card-desc-slot">
        {entry.description ? (
          <p className="achievement-card-desc" title={entry.description}>
            {entry.description}
          </p>
        ) : (
          <div className="achievement-slot-empty" aria-hidden="true" />
        )}
      </div>

      {/* 5. Skill / Stack Chips Slot */}
      <div className="achievement-card-tech-slot">
        {chips.length ? (
          <div className="spotlight-tech-row" role="list" aria-label="Covered skills and technologies">
            {chips.map((tech) => (
              <span key={tech} className="spotlight-tech-tag" role="listitem">
                {tech}
              </span>
            ))}
          </div>
        ) : (
          <div className="achievement-slot-empty" aria-hidden="true" />
        )}
      </div>

      {/* 6. Footer Slot: Actions & Document Chips Pinned to Bottom */}
      <div className="achievement-card-footer">
        {onViewDetails ? (
          <button
            type="button"
            className="credential-view-btn"
            onClick={() => onViewDetails(entry)}
            aria-haspopup="dialog"
          >
            <span>View Credential Details</span>
            <Icon name="spark" />
          </button>
        ) : null}

        {entry.documents?.length ? (
          <DocumentChips documents={entry.documents} />
        ) : null}

        {entry.url && !onViewDetails ? (
          <a
            className="text-link achievement-entry-link"
            href={entry.url}
            target={entry.url.startsWith("http") ? "_blank" : undefined}
            rel={entry.url.startsWith("http") ? "noopener noreferrer" : undefined}
            aria-label={`${copy.entryLinkLabel} for ${entry.title}, opens in a new tab`}
          >
            <span>{copy.entryLinkLabel}</span>
            <Icon name="arrow-up-right" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

