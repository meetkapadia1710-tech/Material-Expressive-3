import type { LeetCodeStats } from "@/lib/leetcode";
import { aboutCopy, pageCopy, profile } from "@/content/profile";
import { skills } from "@/content/skills";
import { Icon } from "@/components/icon";
import { MorphingShape } from "@/components/motion/morphing-shape";

export function AboutPage({
  className = "",
  leetCodeStats = null,
}: {
  className?: string;
  leetCodeStats?: LeetCodeStats | null;
}) {
  const education = profile.education;
  const learning = skills.find((group) => group.id === "learning");

  return (
    <article className={`page-width ${className}`}>
      {/* Page Header */}
      <header className="about-header">
        <p className="eyebrow">{pageCopy.about.eyebrow}</p>
        <h1>{pageCopy.about.title}</h1>
        <span className="about-header-art" aria-hidden="true"><Icon name="spark" /></span>
      </header>

      {/* 1. Bio & Engineering Principles Bento */}
      <section className="about-bio" id="about-bio" aria-labelledby="about-bio-heading">
        <h2 id="about-bio-heading">{aboutCopy.bioTitle}</h2>
        <p>{aboutCopy.bio}</p>

        {/* 4-Tile "How I Build" Bento with Dynamic M3 Expressive Colors */}
        <div className="about-principles-grid">
          <div className="about-principle-card tone-primary">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="code" /></div>
            <h3>Grounded in Reality</h3>
            <p>No synthetic AI fluff; software built on real codebases, verified data, and rigorous edge-case testing.</p>
          </div>
          <div className="about-principle-card tone-secondary">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="layers" /></div>
            <h3>Local-First & Privacy</h3>
            <p>Prioritizing on-device models (Ollama, Supermemory) and efficient SQLite/Postgres for private, zero-latency workflows.</p>
          </div>
          <div className="about-principle-card tone-tertiary">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="spark" /></div>
            <h3>M3 Expressive Aesthetics</h3>
            <p>Interfaces that respond with fluid physical springs, purposeful shape morphing, and accessible WCAG AA contrast.</p>
          </div>
          <div className="about-principle-card tone-accent">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="monitor" /></div>
            <h3>Deep Fundamentals</h3>
            <p>
              {leetCodeStats
                ? `Strong DSA base (${leetCodeStats.totalDisplay} LeetCode solved: ${leetCodeStats.easy.count} Easy, ${leetCodeStats.medium.count} Medium, ${leetCodeStats.hard.count} Hard) married to modern web frameworks, system design, and database engineering.`
                : "Strong DSA and algorithmic fundamentals married to modern web frameworks, system design, and database engineering."}
            </p>
          </div>
        </div>

        {/* Minimalist Tooling Strip */}
        <div className="about-tooling-strip">
          <span className="about-tooling-label">Daily environment:</span>
          <ul className="about-tooling-pills">
            <li>Neovim / VS Code</li>
            <li>Windows Terminal</li>
            <li>Arch / WSL</li>
            <li>TypeScript</li>
            <li>Go</li>
            <li>Python</li>
            <li>Next.js</li>
            <li>Turborepo</li>
            <li>PostgreSQL</li>
            <li>Blender</li>
          </ul>
        </div>
      </section>

      {/* 2. Education & Experience Grid */}
      <div className="about-background-grid">
        {/* Education Column */}
        <section className="about-education" id="about-education" aria-labelledby="about-education-heading">
          <div className="about-section-heading">
            <span aria-hidden="true"><Icon name="school" /></span>
            <h2 id="about-education-heading">{aboutCopy.educationTitle}</h2>
          </div>

          <ol className="about-education-list">
            {/* 1. IIIT Vadodara (Most Recent Higher Education) */}
            <li className="about-education-card is-current">
              <div className="about-edu-header">
                <MorphingShape
                  className="about-edu-shape"
                  shape="roundedSquare"
                  hoverShape="circle"
                  morphOnView={true}
                >
                  <Icon name="school" />
                </MorphingShape>
                <span className="about-year-range">{education.startYear}–{education.endYear}</span>
              </div>

              <div className="about-edu-main">
                <h3>{education.institution}</h3>
                <p className="about-degree">{education.degree}<span aria-hidden="true"> · </span>{education.field}</p>
              </div>

              {education.cgpa !== null ? (
                <dl className="about-edu-score">
                  <dt className="about-score-label">{aboutCopy.cgpaLabel}</dt>
                  <dd>{education.cgpa}{education.cgpaScale !== null ? <span> / {education.cgpaScale}</span> : null}</dd>
                </dl>
              ) : null}
            </li>

            {/* 2 & 3. Secondary & Higher Secondary Schools */}
            {aboutCopy.schools.map((school) => (
              <li key={school.id} className="about-education-card">
                <div className="about-edu-header">
                  <MorphingShape
                    className="about-edu-shape"
                    shape={school.shape}
                    hoverShape={school.hoverShape}
                    morphOnView={true}
                  >
                    <Icon name={school.icon} />
                  </MorphingShape>
                  <span className="about-year-range">{school.yearLabel}</span>
                </div>

                <div className="about-edu-main">
                  <h3>{school.institution}</h3>
                  <p className="about-degree">
                    {school.qualification}<span aria-hidden="true"> · </span>{school.classLevel}
                  </p>
                </div>

                <div className="about-edu-score">
                  <span className="sr-only">{school.screenReaderText}</span>
                  <span className="about-score-label" aria-hidden="true">Score</span>
                  <span className="about-score-value" aria-hidden="true">{school.score}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Experience Column: Expressive Multitonal M3 Timeline Arc */}
        {aboutCopy.milestones.length ? (
          <section className="about-experience" id="about-experience" aria-labelledby="about-experience-heading">
            <div className="about-section-heading">
              <span aria-hidden="true"><Icon name="code" /></span>
              <h2 id="about-experience-heading">{aboutCopy.experienceTitle}</h2>
            </div>

            <ol className="about-timeline-stream">
              {aboutCopy.milestones.map((entry, index) => {
                const isCurrent = entry.current;
                const toneClass = `tone-${entry.toneRole}`;
                const isLast = index === aboutCopy.milestones.length - 1;

                return (
                  <li
                    key={entry.id}
                    className={`about-timeline-item ${toneClass} ${isCurrent ? "is-current" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <div className="about-timeline-node-col" aria-hidden="true">
                      <MorphingShape
                        className={`about-timeline-node-shape ${isCurrent ? "is-current-node" : ""}`}
                        shape={entry.shape}
                        viewShape={entry.viewShape}
                        hoverShape={entry.hoverShape}
                        focusShape={entry.focusShape}
                        pressShape={entry.pressShape}
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

                    <article className="about-timeline-card">
                      <div className="about-timeline-card-header">
                        <div className="about-timeline-chip-group">
                          <span className="about-category-chip">{entry.category}</span>
                          <span className="about-date-chip">{entry.dateLabel}</span>
                        </div>
                      </div>

                      <div className="about-timeline-card-body">
                        <h3>{entry.title}</h3>
                        {entry.organization ? <p className="about-organization">{entry.organization}</p> : null}
                        {entry.description ? <p className="about-internship-description">{entry.description}</p> : null}

                        {entry.chips?.length ? (
                          <div className="about-timeline-tags">
                            {entry.chips.map((chip) => (
                              <span key={chip} className="about-timeline-tag">{chip}</span>
                            ))}
                          </div>
                        ) : null}

                        {entry.documents?.length ? (
                          <div className="about-documents">
                            <p>{aboutCopy.documentsLabel}</p>
                            <div className="about-document-chips" role="list">
                              {entry.documents.map((doc) =>
                                doc.url ? (
                                  <a
                                    key={doc.label}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="about-doc-chip is-link"
                                    role="listitem"
                                  >
                                    <Icon name="file" />
                                    <span>{doc.label}</span>
                                    <Icon name="arrow-up-right" className="about-doc-external" />
                                  </a>
                                ) : (
                                  <span
                                    key={doc.label}
                                    className="about-doc-chip is-static"
                                    role="listitem"
                                    title="Verification document available upon request"
                                  >
                                    <Icon name="file" />
                                    <span>{doc.label}</span>
                                    <span className="about-doc-tag">Available on request</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}
      </div>

      {/* 3. Campus Community Bento Cards (Material 3 Expressive Unified Architecture) */}
      {aboutCopy.campusCommunities?.length ? (
        <section className="about-campus" id="about-campus" aria-labelledby="about-campus-heading">
          <div className="about-section-heading">
            <span aria-hidden="true"><Icon name="spark" /></span>
            <h2 id="about-campus-heading">{aboutCopy.campusTitle}</h2>
          </div>
          <ul className="about-campus-grid">
            {aboutCopy.campusCommunities.map((community) => (
              <li key={community.id} className="about-campus-card">
                <div className="about-campus-card-header">
                  <MorphingShape
                    className="about-campus-shape"
                    shape={community.shape}
                    hoverShape={community.hoverShape}
                    focusShape={community.focusShape}
                    pressShape={community.pressShape}
                    morphOnView={true}
                  >
                    <Icon name={community.icon} />
                  </MorphingShape>
                  <div className="about-campus-chips">
                    <span className="about-campus-category-chip">{community.category}</span>
                    <span className="about-campus-period-chip">{community.period}</span>
                  </div>
                </div>
                <h3 className="about-campus-name">{community.name}</h3>
                <p className="about-campus-desc">{community.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 4. Learning & Next Explorations Grid (M3 Expressive Aligned Lists) */}
      <div className="about-learning-grid">
        {aboutCopy.learningItems?.length ? (
          <section className="about-learning tone-secondary" id="about-learning" aria-labelledby="about-learning-heading">
            <div className="about-panel-header">
              <div className="about-section-heading">
                <span aria-hidden="true"><Icon name="brain" /></span>
                <h2 id="about-learning-heading">{aboutCopy.learningTitle}</h2>
              </div>
              <span className="about-panel-caption">Active track · In progress</span>
            </div>
            <ul className="about-topic-list">
              {aboutCopy.learningItems.map((item) => (
                <li key={item.id} className="about-topic-item">
                  <div className="about-topic-leading">
                    <MorphingShape
                      className="about-topic-shape tone-secondary"
                      shape={item.shape}
                      hoverShape={item.hoverShape}
                      morphOnView={true}
                    >
                      <Icon name={item.icon} />
                    </MorphingShape>
                    <div className="about-topic-text">
                      <span className="about-topic-name">{item.name}</span>
                      <span className="about-topic-support">{item.supportingText}</span>
                    </div>
                  </div>
                  {item.status ? (
                    <span className="about-topic-chip status-focus">{item.status}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            {learning?.note ? <p className="about-learning-note">{learning.note}</p> : null}
          </section>
        ) : null}

        {aboutCopy.exploreItems?.length ? (
          <section className="about-next tone-tertiary" id="about-next" aria-labelledby="about-next-heading">
            <div className="about-panel-header">
              <div className="about-section-heading">
                <span aria-hidden="true"><Icon name="layers" /></span>
                <h2 id="about-next-heading">{aboutCopy.learntTitle}</h2>
              </div>
              <span className="about-panel-caption">{aboutCopy.learntCaption}</span>
            </div>
            <ul className="about-topic-list">
              {aboutCopy.exploreItems.map((item) => (
                <li key={item.id} className="about-topic-item">
                  <div className="about-topic-leading">
                    <MorphingShape
                      className="about-topic-shape tone-tertiary"
                      shape={item.shape}
                      hoverShape={item.hoverShape}
                      morphOnView={true}
                    >
                      <Icon name={item.icon} />
                    </MorphingShape>
                    <div className="about-topic-text">
                      <span className="about-topic-name">{item.name}</span>
                      <span className="about-topic-support">{item.supportingText}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
