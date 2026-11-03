import type { ReactNode } from "react";
import type { Achievement } from "@/content/types";
import { achievementsPageCopy as copy } from "@/content/achievements";
import { achievementsData, getAchievementsContent, type AchievementsData } from "@/lib/achievements";
import { Icon } from "@/components/icon";
import { MorphingShape } from "@/components/motion/morphing-shape";
import { CertificationsList } from "./certifications-list";
import { LeetCodeWidget } from "./leetcode-widget";
import { PlatformProfileCard } from "./platform-profile-card";
import { DocumentChips } from "./document-chips";
import { AchievementsScrollNav } from "./achievements-scroll-nav";
import { AchievementCard } from "./achievement-card";

function AchievementTimelineEntry({
  entry,
  isLast = false,
  toneRole = "secondary",
  categoryLabel,
}: {
  entry: Achievement;
  isLast?: boolean;
  toneRole?: "primary" | "secondary" | "tertiary";
  categoryLabel?: string;
}) {
  const shape = toneRole === "primary" ? "scalloped" : toneRole === "secondary" ? "roundedSquare" : "blob";
  return (
    <li className={`about-timeline-item tone-${toneRole}`}>
      <div className="about-timeline-node-col" aria-hidden="true">
        <MorphingShape
          className="about-timeline-node-shape"
          shape={shape}
          hoverShape="circle"
          pressShape="scalloped"
          morphOnView={true}
        >
          <span className="about-timeline-node-fill" />
        </MorphingShape>
        {!isLast ? (
          <div className="about-timeline-track">
            <div className="about-timeline-track-fill" />
          </div>
        ) : null}
      </div>

      <article className="about-timeline-card achievement-entry" tabIndex={0}>
        <div className="about-timeline-card-header">
          <div className="about-timeline-chip-group">
            {categoryLabel ? (
              <span className="about-category-chip">{categoryLabel}</span>
            ) : null}
            {entry.dateLabel ? (
              <span className="about-date-chip">{entry.dateLabel}</span>
            ) : null}
            {entry.timeConstraint ? (
              <span className="spotlight-constraint-badge">{entry.timeConstraint}</span>
            ) : null}
          </div>
        </div>

        <div className="about-timeline-card-body">
          <h3>{entry.title}</h3>
          {entry.organization ? (
            <p className="about-organization achievement-organization">{entry.organization}</p>
          ) : null}
          {entry.description ? (
            <p className="about-internship-description achievement-description">{entry.description}</p>
          ) : null}

          {entry.technologies?.length ? (
            <div className="spotlight-tech-row about-timeline-tags" aria-label="Technologies used">
              {entry.technologies.map((tech) => (
                <span key={tech} className="spotlight-tech-tag about-timeline-tag">
                  {tech}
                </span>
              ))}
            </div>
          ) : null}

          {entry.documents?.length ? (
            <DocumentChips documents={entry.documents} />
          ) : null}

          {entry.url ? (
            <div className="achievement-entry-link-wrapper">
              <a
                className="text-link achievement-entry-link about-doc-chip is-link"
                href={entry.url}
                target={entry.url.startsWith("http") ? "_blank" : undefined}
                rel={entry.url.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={`${copy.entryLinkLabel} for ${entry.title}, opens in a new tab`}
              >
                <span>{copy.entryLinkLabel}</span>
                <Icon name="arrow-up-right" />
              </a>
            </div>
          ) : null}
        </div>
      </article>
    </li>
  );
}

function AchievementSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="achievement-section" id={id} aria-labelledby={`${id}-heading`}>
      <div className="achievement-section-header">
        <h2 id={`${id}-heading`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function AchievementsPage({
  data = achievementsData,
  className = "",
}: {
  data?: AchievementsData;
  className?: string;
}) {
  const content = getAchievementsContent(data);
  const hasContent =
    content.experience.length ||
    content.hackathons.length ||
    content.certifications.length ||
    content.profiles.length ||
    content.topics.length;

  return (
    <article className={`page-width ${className}`}>
      {/* Material 3 Expressive Header with Header Art Morph */}
      <header className="achievements-header">
        <div className="achievements-header-content">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="achievements-description">{copy.description}</p>
        </div>
        <div className="achievements-header-art-container" aria-hidden="true">
          <MorphingShape
            className="achievements-header-art"
            shape="scalloped"
            viewShape="blob"
            hoverShape="circle"
            pressShape="roundedSquare"
            morphOnView={true}
          >
            <Icon name="spark" />
          </MorphingShape>
        </div>
      </header>

      {/* Sticky Section Navigation & Fluid Scroll Progress Indicator */}
      <AchievementsScrollNav />

      {/* 1. Experience Timeline Section */}
      {content.experience.length ? (
        <AchievementSection id="achievement-experience" title={copy.experienceTitle}>
          <div className="achievement-experience-list">
            <ol className="about-timeline-stream">
              {content.experience.map((entry, idx) => (
                <AchievementTimelineEntry
                  key={entry.id}
                  entry={entry}
                  isLast={idx === content.experience.length - 1}
                  toneRole="primary"
                  categoryLabel="Corporate Internship"
                />
              ))}
            </ol>
          </div>
        </AchievementSection>
      ) : null}

      {/* 2. Hackathons Section */}
      {content.hackathons.length ? (
        <AchievementSection id="achievement-hackathons" title={copy.hackathonsTitle}>
          <div className="achievement-hackathons-grid">
            {content.hackathons.map((entry, idx) => (
              <AchievementCard
                key={entry.id}
                entry={entry}
                index={idx}
                categoryLabel={entry.id === "supermemory" ? "Hackathon Solo Build" : "Idea Stage Submission"}
                shape={idx % 2 === 0 ? "diamond" : "blob"}
                iconName={idx % 2 === 0 ? "trophy" : "spark"}
                tone={idx % 2 === 0 ? "secondary" : "tertiary"}
              />
            ))}
          </div>
        </AchievementSection>
      ) : null}

      {/* 3. Certifications Section */}
      {content.certifications.length ? (
        <AchievementSection id="achievement-certifications" title={copy.certificationsTitle}>
          <CertificationsList certifications={content.certifications} />
        </AchievementSection>
      ) : null}

      {/* 4. Coding Profiles and Problem Solving */}
      {content.profiles.length || content.topics.length ? (
        <AchievementSection id="achievement-coding" title={copy.codingTitle}>
          {content.profiles.length ? (
            <div className="coding-profile-grid">
              {content.profiles.map((profile) => (
                <PlatformProfileCard
                  key={profile.id}
                  profile={profile}
                  labels={{
                    problemsLabel: copy.problemsLabel,
                    ratingLabel: copy.ratingLabel,
                    scoreLabel: copy.scoreLabel,
                    updatedLabel: copy.updatedLabel,
                  }}
                />
              ))}
            </div>
          ) : null}

          {/* Interactive LeetCode Breakdown & Algorithmic Patterns Widget */}
          {content.profiles.some(
            (p) => p.id === "leetcode" && p.problemsSolved !== 123 && (p.problemsSolved ?? 0) >= 650
          ) ? (
            <div data-platform-scheme="leetcode" className="leetcode-widget-wrapper">
              <LeetCodeWidget />
            </div>
          ) : null}

          {/* DSA and Systems Topics Chips */}
          {content.topics.length ? (
            <div className="problem-solving-topics">
              <div className="topics-heading-group">
                <span className="topics-eyebrow">Curated Focus</span>
                <h3>{copy.topicsTitle}</h3>
              </div>
              <ul className="topics-pill-grid">
                {content.topics.map((topic, index) => (
                  <li key={`${topic}-${index}`}>{topic}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </AchievementSection>
      ) : null}

      {/* Empty State */}
      {!hasContent ? (
        <div className="achievements-empty">
          <MorphingShape
            className="empty-shape-art"
            shape="blob"
            hoverShape="circle"
            pressShape="scalloped"
            morphOnView={true}
          >
            <Icon name="spark" />
          </MorphingShape>
          <h2>{copy.empty.title}</h2>
          <p>{copy.empty.description}</p>
        </div>
      ) : null}
    </article>
  );
}
