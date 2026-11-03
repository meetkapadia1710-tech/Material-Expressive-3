"use client";

import { Icon, type IconName } from "@/components/icon";

export interface DocumentItem {
  label: string;
  url: string | null;
}

interface DocumentChipsProps {
  documents?: readonly DocumentItem[] | null;
  className?: string;
}

function getDocumentIcon(label: string): IconName {
  const lower = label.toLowerCase();
  if (lower.includes("github") || lower.includes("repo") || lower.includes("code") || lower.includes("submission")) {
    return "github";
  }
  if (lower.includes("case study") || lower.includes("case-study") || lower.includes("project") || lower.includes("demo")) {
    return "link";
  }
  if (
    lower.includes("verify") ||
    lower.includes("credential") ||
    lower.includes("competency") ||
    lower.includes("certified") ||
    lower.includes("certification")
  ) {
    return "check";
  }
  return "file";
}

export function DocumentChips({ documents, className = "" }: DocumentChipsProps) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className={`achievement-documents ${className}`}>
      <p className="achievement-documents-label">Documents & Verification</p>
      <ul className="achievement-doc-chips" role="list">
        {documents.map((doc) => {
          const isLink = Boolean(doc.url);
          const isExternal = Boolean(
            doc.url && (doc.url.startsWith("http://") || doc.url.startsWith("https://"))
          );
          const iconName = getDocumentIcon(doc.label);
          const ariaLabel = isExternal
            ? `${doc.label}, opens in a new tab`
            : doc.label;

          return (
            <li key={doc.label} className="achievement-doc-item" role="listitem">
              {isLink ? (
                <a
                  href={doc.url!}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="achievement-doc-chip is-link"
                  aria-label={ariaLabel}
                >
                  <Icon name={iconName} className="doc-chip-lead-icon" />
                  <span className="doc-chip-label">{doc.label}</span>
                  <Icon
                    name={isExternal ? "arrow-up-right" : "arrow-right"}
                    className="doc-chip-trail-icon"
                  />
                </a>
              ) : (
                <span className="achievement-doc-chip is-static" aria-label={ariaLabel}>
                  <Icon name={iconName} className="doc-chip-lead-icon" />
                  <span className="doc-chip-label">{doc.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
