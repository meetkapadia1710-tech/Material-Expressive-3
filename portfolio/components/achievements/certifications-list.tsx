"use client";

import { useState } from "react";
import type { Achievement } from "@/content/types";
import { achievementsPageCopy as copy } from "@/content/achievements";
import { Icon } from "@/components/icon";
import { CertificateModal } from "./certificate-modal";

export function CertificationsList({ certifications }: { certifications: Achievement[] }) {
  const [selectedCert, setSelectedCert] = useState<Achievement | null>(null);

  return (
    <>
      <div className="achievement-certification-list">
        {certifications.map((entry) => (
          <article
            className="achievement-entry certification-card"
            key={entry.id}
            tabIndex={0}
            role="article"
            aria-label={`${entry.title} credential details`}
          >
            {entry.dateLabel ? <p className="achievement-date">{entry.dateLabel}</p> : null}
            <h3>{entry.title}</h3>
            {entry.organization ? <p className="achievement-organization">{entry.organization}</p> : null}
            {entry.description ? <p className="achievement-description">{entry.description}</p> : null}

            {entry.skills?.length ? (
              <div className="credential-skills-preview">
                {entry.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="credential-skill-chip">{skill}</span>
                ))}
                {entry.skills.length > 3 ? (
                  <span className="credential-skill-more">+{entry.skills.length - 3}</span>
                ) : null}
              </div>
            ) : null}

            <div className="credential-actions-row">
              <button
                type="button"
                className="credential-view-btn"
                onClick={() => setSelectedCert(entry)}
                aria-haspopup="dialog"
              >
                View Credential Details
                <Icon name="spark" />
              </button>

              {entry.url ? (
                <a
                  className="text-link achievement-entry-link"
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {copy.entryLinkLabel}
                  <Icon name="arrow-up-right" />
                </a>
              ) : null}
            </div>

            {entry.documents?.length ? (
              <div className="achievement-documents">
                <p>{copy.documentsLabel}</p>
                <ul>
                  {entry.documents.map((document) => (
                    <li key={document.label}>
                      {document.url ? (
                        <a href={document.url} target="_blank" rel="noopener noreferrer">
                          {document.label}
                          <Icon name="arrow-up-right" />
                        </a>
                      ) : (
                        document.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <CertificateModal
        certificate={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </>
  );
}

