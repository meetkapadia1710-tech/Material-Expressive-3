import type { ReactNode } from "react";
import type { Achievement } from "@/content/types";
import { achievementsPageCopy as copy, academicHonorsAndLeadership } from "@/content/achievements";
import { achievementsData, getAchievementsContent, type AchievementsData } from "@/lib/achievements";
import { Icon } from "@/components/icon";
import { CertificationsList } from "./certifications-list";
import { LeetCodeWidget } from "./leetcode-widget";

function AchievementEntry({ entry }: { entry: Achievement }) {
  return (
    <article className="achievement-entry" tabIndex={0}>
      <div className="achievement-entry-top">
        {entry.dateLabel ? <p className="achievement-date">{entry.dateLabel}</p> : null}
        {entry.timeConstraint ? <span className="spotlight-constraint-badge">{entry.timeConstraint}</span> : null}
      </div>
      <h3>{entry.title}</h3>
      {entry.organization ? <p className="achievement-organization">{entry.organization}</p> : null}
      {entry.description ? <p className="achievement-description">{entry.description}</p> : null}

      {entry.technologies?.length ? (
        <div className="spotlight-tech-row" aria-label="Technologies used">
          {entry.technologies.map((tech) => (
            <span key={tech} className="spotlight-tech-tag">{tech}</span>
          ))}
        </div>
      ) : null}

      {entry.documents?.length ? (
        <div className="achievement-documents">
          <p>{copy.documentsLabel}</p>
          <ul>
            {entry.documents.map((document) => (
              <li key={document.label}>
                {document.url ? (
                  <a href={document.url} target={document.url.startsWith("http") ? "_blank" : undefined} rel={document.url.startsWith("http") ? "noopener noreferrer" : undefined}>
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

      {entry.url ? (
        <a className="text-link achievement-entry-link" href={entry.url} target={entry.url.startsWith("http") ? "_blank" : undefined} rel={entry.url.startsWith("http") ? "noopener noreferrer" : undefined}>
          {copy.entryLinkLabel}
          <Icon name="arrow-up-right" />
        </a>
      ) : null}
    </article>
  );
}

function AchievementSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="achievement-section" id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  );
}

export function AchievementsPage({ data = achievementsData, className = "" }: { data?: AchievementsData; className?: string }) {
  const content = getAchievementsContent(data);
  const hasContent = content.experience.length || content.hackathons.length || content.certifications.length || content.profiles.length || content.topics.length;

  return (
    <article className={`page-width ${className}`}>
      <header className="achievements-header">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <span className="achievements-header-art" aria-hidden="true">
          <Icon name="layers" />
        </span>
      </header>

      {content.experience.length ? (
        <AchievementSection id="achievement-experience" title={copy.experienceTitle}>
          <div className="achievement-experience-list">
            {content.experience.map((entry) => (
              <AchievementEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </AchievementSection>
      ) : null}

      {content.hackathons.length ? (
        <AchievementSection id="achievement-hackathons" title={copy.hackathonsTitle}>
          <div className="achievement-grid">
            {content.hackathons.map((entry) => (
              <AchievementEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </AchievementSection>
      ) : null}

      {/* Academic Honors & Leadership Callout Banner */}
      {hasContent ? (
        <aside className="academic-honors-callout" aria-label="Academic Honors and Community Leadership">
          <div className="honors-header">
            <div>
              <span className="honors-eyebrow">{copy.honorsEyebrow}</span>
              <h2>{copy.honorsTitle}</h2>
            </div>
          </div>
          <div className="honors-grid">
            {academicHonorsAndLeadership.map((item) => (
              <div key={item.id} className="honor-card">
                <div className="honor-card-top">
                  <span className="honor-category">{item.category}</span>
                  {item.badge ? <span className="honor-badge">{item.badge}</span> : null}
                </div>
                <h3>{item.title}</h3>
                <p className="honor-org">{item.organization}</p>
                <p className="honor-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </aside>
      ) : null}

      {content.certifications.length ? (
        <AchievementSection id="achievement-certifications" title={copy.certificationsTitle}>
          <CertificationsList certifications={content.certifications} />
        </AchievementSection>
      ) : null}

      {content.profiles.length || content.topics.length ? (
        <AchievementSection id="achievement-coding" title={copy.codingTitle}>
          {content.profiles.length ? (
            <div className="coding-profile-grid">
              {content.profiles.map((profile) => (
                <article className="coding-profile" key={profile.id}>
                  <h3>
                    {profile.href ? (
                      <a href={profile.href} target="_blank" rel="noopener noreferrer">
                        {profile.label}
                        <Icon name="arrow-up-right" />
                      </a>
                    ) : (
                      profile.label
                    )}
                  </h3>
                  {profile.handle ? <p className="coding-handle">{profile.handle}</p> : null}
                  {profile.problemsSolved !== null || profile.rating !== null ? (
                    <dl className="coding-metrics">
                      {profile.problemsSolved !== null ? (
                        <div>
                          <dt>{copy.problemsLabel}</dt>
                          <dd>
                            {profile.problemsSolved}
                            {profile.problemsQualifier}
                          </dd>
                        </div>
                      ) : null}
                      {profile.rating !== null ? (
                        <div>
                          <dt>{profile.linkId === "geeksforgeeks" ? copy.scoreLabel : copy.ratingLabel}</dt>
                          <dd>{profile.rating}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                  {profile.updatedAt ? (
                    <p className="coding-updated">
                      {copy.updatedLabel}
                      <time dateTime={profile.updatedAt}>{profile.updatedAt}</time>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}

          {/* Interactive LeetCode Breakdown & Algorithmic Patterns Widget */}
          {content.profiles.some((p) => p.id === "leetcode" && p.problemsSolved !== 123 && (p.problemsSolved ?? 0) >= 650) ? (
            <LeetCodeWidget />
          ) : null}

          {content.topics.length ? (
            <div className="problem-solving-topics">
              <h3>{copy.topicsTitle}</h3>
              <ul>
                {content.topics.map((topic, index) => (
                  <li key={`${topic}-${index}`}>{topic}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </AchievementSection>
      ) : null}

      {!hasContent ? (
        <div className="achievements-empty">
          <Icon name="spark" />
          <h2>{copy.empty.title}</h2>
          <p>{copy.empty.description}</p>
        </div>
      ) : null}
    </article>
  );
}
