"use client";

import React, { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Icon } from "@/components/icon";
import { MorphingShape } from "@/components/motion/morphing-shape";
import { projectAccentStyle } from "@/lib/project-accent";
import { projectCatalogCopy } from "@/content/projects";
import type { Project } from "@/content/types";

export interface ExpandableProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ExpandableProjectModal({
  project,
  onClose,
}: ExpandableProjectModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (project) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [project, onClose]);

  useOutsideClick(ref, () => {
    if (project) onClose();
  });

  const accentStyle = project ? projectAccentStyle(project.accentSeed) : undefined;
  const isExploration =
    project?.status === "concept" || project?.status === "prototype";

  return (
    <AnimatePresence>
      {project ? (
        <>
          <motion.div
            key="expandable-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25 }}
            className="expandable-backdrop"
            aria-hidden="true"
          />

          <div
            className="expandable-dialog-wrapper"
            role="presentation"
          >
            <motion.div
              key={`expandable-dialog-${project.slug}`}
              layoutId={
                shouldReduceMotion ? undefined : `project-card-${project.slug}`
              }
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`expandable-title-${project.slug}`}
              className="expandable-dialog"
              style={accentStyle as CSSProperties}
              data-project-accent={accentStyle ? "true" : undefined}
              initial={
                shouldReduceMotion
                  ? { opacity: 0, scale: 0.98 }
                  : { opacity: 0, scale: 0.94, y: 18 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0, scale: 0.98 }
                  : { opacity: 0, scale: 0.94, y: 14 }
              }
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.38,
                ease: [0.38, 1.21, 0.22, 1], // Material 3 Expressive spatial spring
              }}
            >
              <div className="expandable-dialog-art">
                <div className="expandable-art-badge">
                  <span className="expandable-order">
                    {String(project.order).padStart(2, "0")}
                  </span>
                  <div className="expandable-shape-frame">
                    <MorphingShape
                      className="expandable-symbol-shape"
                      shape="roundedSquare"
                      viewShape="scalloped"
                      hoverShape="blob"
                      focusShape="circle"
                      pressShape="blob"
                      morphOnView
                    >
                      <Icon name="spark" />
                    </MorphingShape>
                  </div>
                </div>

                <div className="expandable-art-meta">
                  {project.category ? (
                    <span className="expandable-category-pill">
                      {project.category}
                    </span>
                  ) : null}
                  {project.status ? (
                    <span
                      className={`expandable-status-pill ${
                        isExploration ? "expandable-exploration-status" : ""
                      }`}
                    >
                      <span aria-hidden="true" />
                      {projectCatalogCopy.statusLabels[project.status]}
                    </span>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="expandable-dialog-close"
                  onClick={onClose}
                  aria-label="Close project preview"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="expandable-dialog-body">
                <div>
                  <h2
                    id={`expandable-title-${project.slug}`}
                    className="expandable-title"
                  >
                    {project.name}
                  </h2>
                  {project.tagline ? (
                    <p className="expandable-tagline">{project.tagline}</p>
                  ) : null}
                </div>

                {project.problem ? (
                  <div className="expandable-section">
                    <h3>Problem & Vision</h3>
                    <p>{project.problem}</p>
                  </div>
                ) : null}

                {project.statusDetail ? (
                  <div className="expandable-section">
                    <h3>Current Status</h3>
                    <p>{project.statusDetail}</p>
                  </div>
                ) : isExploration ? (
                  <div className="expandable-section">
                    <h3>Exploration Note</h3>
                    <p>
                      {project.status === "concept"
                        ? projectCatalogCopy.conceptNote
                        : projectCatalogCopy.prototypeNote}
                    </p>
                  </div>
                ) : null}

                {project.stack?.length ? (
                  <div className="expandable-section">
                    <h3>Technologies & Tools</h3>
                    <ul
                      className="expandable-stack"
                      aria-label={projectCatalogCopy.stackLabel}
                    >
                      {project.stack.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {project.features?.length ? (
                  <div className="expandable-section">
                    <h3>Key Highlights</h3>
                    <ul className="expandable-features">
                      {project.features.map((feat, idx) => (
                        <li key={idx}>
                          <Icon name="arrow-up-right" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="expandable-actions">
                  {project.visibility === "public" ? (
                    <Link
                      href={`/projects/${project.slug}`}
                      className="button button-primary"
                      onClick={onClose}
                    >
                      <span>Explore Full Project</span>
                      <Icon name="arrow-right" />
                    </Link>
                  ) : null}

                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary"
                    >
                      <Icon name="github" />
                      <span>{projectCatalogCopy.repoLabel}</span>
                      <Icon name="arrow-up-right" />
                    </a>
                  ) : null}

                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-secondary"
                    >
                      <span>{projectCatalogCopy.liveLabel}</span>
                      <Icon name="arrow-up-right" />
                    </a>
                  ) : null}

                  <button
                    type="button"
                    className="button button-secondary expandable-dismiss"
                    onClick={onClose}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

