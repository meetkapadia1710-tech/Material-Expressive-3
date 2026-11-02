"use client";

import { useEffect, useRef } from "react";
import type { Achievement } from "@/content/types";
import { Icon } from "@/components/icon";

interface CertificateModalProps {
  certificate: Achievement | null;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!certificate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    modalRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [certificate, onClose]);

  if (!certificate) return null;

  return (
    <div
      className="cert-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="cert-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="cert-modal-close"
          onClick={onClose}
          aria-label="Close credential details"
        >
          <Icon name="close" />
        </button>

        <div className="cert-modal-header">
          <div className="cert-modal-badges">
            <span className="cert-org-badge">
              <Icon name="layers" className="cert-badge-icon" />
              {certificate.organization ?? "Credential"}
            </span>
            <span className="cert-status-badge">
              <span className="cert-status-dot" />
              Verified Credential
            </span>
          </div>

          <h3 id="cert-modal-title" className="cert-modal-title">
            {certificate.title}
          </h3>

          {certificate.dateLabel ? (
            <p className="cert-date-label">Issued: {certificate.dateLabel}</p>
          ) : null}
        </div>

        <div className="cert-modal-body">
          {certificate.credentialId ? (
            <div className="cert-field-group">
              <span className="cert-field-label">Credential ID</span>
              <code className="cert-code-val">{certificate.credentialId}</code>
            </div>
          ) : null}

          {certificate.description ? (
            <div className="cert-field-group">
              <span className="cert-field-label">Curriculum & Overview</span>
              <p className="cert-desc-text">{certificate.description}</p>
            </div>
          ) : null}

          {certificate.skills?.length ? (
            <div className="cert-field-group">
              <span className="cert-field-label">Competencies & Covered Technologies</span>
              <div className="cert-tags-row">
                {certificate.skills.map((skill) => (
                  <span key={skill} className="cert-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {certificate.documents?.length || certificate.url ? (
            <div className="cert-actions-group">
              <span className="cert-field-label">Verification Links & Documents</span>
              <div className="cert-action-buttons">
                {certificate.url ? (
                  <a
                    href={certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-primary-link"
                  >
                    Verify Credential Online
                    <Icon name="arrow-up-right" />
                  </a>
                ) : null}
                {certificate.documents?.map((doc) =>
                  doc.url ? (
                    <a
                      key={doc.label}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-secondary-link"
                    >
                      {doc.label}
                      <Icon name="arrow-up-right" />
                    </a>
                  ) : (
                    <span key={doc.label} className="cert-static-doc">
                      {doc.label} (Verified on file)
                    </span>
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
