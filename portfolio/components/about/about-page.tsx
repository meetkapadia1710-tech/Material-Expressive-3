import { aboutCopy, pageCopy, profile } from "@/content/profile";
import { experience } from "@/content/achievements";
import { skills } from "@/content/skills";
import { Icon } from "@/components/icon";

export function AboutPage({ className = "" }: { className?: string }) {
  const education = profile.education;
  const internships = experience.filter((item) => item.visibility === "public");
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
            <h4>Grounded in Reality</h4>
            <p>No synthetic AI fluff; software built on real codebases, verified data, and rigorous edge-case testing.</p>
          </div>
          <div className="about-principle-card tone-secondary">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="layers" /></div>
            <h4>Local-First & Privacy</h4>
            <p>Prioritizing on-device models (Ollama, Supermemory) and efficient SQLite/Postgres for private, zero-latency workflows.</p>
          </div>
          <div className="about-principle-card tone-tertiary">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="spark" /></div>
            <h4>M3 Expressive Aesthetics</h4>
            <p>Interfaces that respond with fluid physical springs, purposeful shape morphing, and accessible WCAG AA contrast.</p>
          </div>
          <div className="about-principle-card tone-accent">
            <div className="about-principle-icon" aria-hidden="true"><Icon name="monitor" /></div>
            <h4>Deep Fundamentals</h4>
            <p>Strong DSA base (650+ LeetCode) married to modern web frameworks, system design, and database engineering.</p>
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
            <span aria-hidden="true"><Icon name="layers" /></span>
            <h2 id="about-education-heading">{aboutCopy.educationTitle}</h2>
          </div>

          <div className="about-education-card">
            <p className="about-year-range">{education.startYear}–{education.endYear}</p>
            <h3>{education.institution}</h3>
            <p className="about-degree">{education.degree}<span aria-hidden="true"> · </span>{education.field}</p>
            {education.cgpa !== null ? (
              <dl className="about-cgpa">
                <dt>{aboutCopy.cgpaLabel}</dt>
                <dd>{education.cgpa}{education.cgpaScale !== null ? <span> / {education.cgpaScale}</span> : null}</dd>
              </dl>
            ) : null}
          </div>

          <div className="about-education-timeline">
            <div className="about-edu-node">
              <span className="about-edu-dot" aria-hidden="true" />
              <div className="about-edu-details">
                <h4>Cosmos Castle International School</h4>
                <p>Higher Secondary Certificate (HSC) · Class XII · 2024</p>
              </div>
            </div>
            <div className="about-edu-node">
              <span className="about-edu-dot" aria-hidden="true" />
              <div className="about-edu-details">
                <h4>Sanskar Vidhya Bhavan</h4>
                <p>Secondary School Certificate (SSC) · Class X · 2022</p>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Column: Expressive Multitonal M3 Timeline Arc */}
        {internships.length ? (
          <section className="about-experience" id="about-experience" aria-labelledby="about-experience-heading">
            <div className="about-section-heading">
              <span aria-hidden="true"><Icon name="code" /></span>
              <h2 id="about-experience-heading">{aboutCopy.experienceTitle}</h2>
              <span className="about-timeline-eyebrow" aria-hidden="true">2024 → Present</span>
            </div>

            <div className="about-timeline-stream">
              {/* Milestone 1: Corporate Internship (Primary Violet Theme) */}
              {internships.map((internship) => (
                <div key={internship.id} className="about-timeline-item tone-corporate">
                  <div className="about-timeline-node-col" aria-hidden="true">
                    <span className="about-timeline-dot" />
                    <span className="about-timeline-stem stem-1" />
                  </div>
                  <article className="about-timeline-card">
                    <div className="about-timeline-card-header">
                      <div className="about-timeline-pill-wrap">
                        <span className="about-timeline-badge-icon" aria-hidden="true">💼</span>
                        <span className="about-timeline-pill">Mid 2026 · Corporate Internship</span>
                      </div>
                      {internship.dateLabel ? <span className="about-timeline-date">{internship.dateLabel}</span> : null}
                    </div>
                    <div className="about-timeline-card-body">
                      <h3>{internship.title}</h3>
                      {internship.organization ? <p className="about-organization">{internship.organization}</p> : null}
                      {internship.description ? <p className="about-internship-description">{internship.description}</p> : null}
                      {internship.documents?.length ? (
                        <div className="about-documents">
                          <p>{aboutCopy.documentsLabel}</p>
                          <ul>
                            {internship.documents.map((document) => (
                              <li key={document.label}>
                                <span>
                                  <Icon name="file" />
                                  {document.label}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </div>
              ))}

              {/* Milestone 2: Supermemory Hackathon (Secondary Lime Theme) */}
              <div className="about-timeline-item tone-hackathon">
                <div className="about-timeline-node-col" aria-hidden="true">
                  <span className="about-timeline-dot" />
                  <span className="about-timeline-stem stem-2" />
                </div>
                <article className="about-timeline-card">
                  <div className="about-timeline-card-header">
                    <div className="about-timeline-pill-wrap">
                      <span className="about-timeline-badge-icon" aria-hidden="true">⚡</span>
                      <span className="about-timeline-pill">July 2026 · Supermemory Hackathon</span>
                    </div>
                    <span className="about-timeline-status">★ Finalist</span>
                  </div>
                  <div className="about-timeline-card-body">
                    <h3>Built Hindsight · 100% Local AI Memory</h3>
                    <p className="about-organization">Supermemory / Local Windows AI Track</p>
                    <p className="about-internship-description">
                      Architected 100% local Windows AI memory with Win32 screen capture, on-device OCR, and local vector embeddings. Zero cloud dependency.
                    </p>
                    <div className="about-timeline-tags">
                      <span>Local-First</span>
                      <span>Ollama</span>
                      <span>Win32</span>
                      <span>SQLite</span>
                    </div>
                  </div>
                </article>
              </div>

              {/* Milestone 3: Systems Architecture (Tertiary Terracotta Theme) */}
              <div className="about-timeline-item tone-systems">
                <div className="about-timeline-node-col" aria-hidden="true">
                  <span className="about-timeline-dot solid" />
                </div>
                <article className="about-timeline-card">
                  <div className="about-timeline-card-header">
                    <div className="about-timeline-pill-wrap">
                      <span className="about-timeline-badge-icon" aria-hidden="true">📐</span>
                      <span className="about-timeline-pill">Late 2026 · Systems Architecture</span>
                    </div>
                    <span className="about-timeline-status">● Active Focus</span>
                  </div>
                  <div className="about-timeline-card-body">
                    <h3>RepoGrade & M3 Expressive Architecture</h3>
                    <p className="about-organization">System Architecture & Open-Source Engineering</p>
                    <p className="about-internship-description">
                      Architectural deep-dive into AST code scoring engines, dynamic HCT palette algorithms, and fluid physics interactions with spring kinematics.
                    </p>
                    <div className="about-timeline-tags">
                      <span>AST Engines</span>
                      <span>M3 Color Science</span>
                      <span>Physics Springs</span>
                      <span>Turborepo</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* 3. Campus Community Bento Cards (3 Distinct Color Personalities) */}
      {profile.campus.length ? (
        <section className="about-campus" id="about-campus" aria-labelledby="about-campus-heading">
          <div className="about-section-heading">
            <span aria-hidden="true"><Icon name="spark" /></span>
            <h2 id="about-campus-heading">{aboutCopy.campusTitle}</h2>
          </div>
          <ul className="about-campus-grid">
            {profile.campus.map((community) => {
              const is9bit = community.includes("9bit");
              const isDot = community.includes("Dot");
              const toneClass = is9bit ? "tone-tech" : isDot ? "tone-design" : "tone-photo";
              const role = is9bit
                ? "Technical Community · Oct 2024 – Present"
                : isDot
                ? "Design Club · Aug 2025 – Present"
                : "Photography Club · Aug 2025 – Present";
              const desc = is9bit
                ? "Coding competitions, open-source workshops, peer learning, and hackathon teams."
                : isDot
                ? "UI/UX design sprints, design systems, Material Expressive aesthetics, and creative branding."
                : "Visual composition, framing, attention to detail, event coverage, and light/perspective study.";
              const iconName = is9bit ? "code" : isDot ? "palette" : "spark";

              return (
                <li key={community} className={`about-campus-card ${toneClass}`}>
                  <div className="about-campus-card-header">
                    <span className="about-campus-icon" aria-hidden="true"><Icon name={iconName} /></span>
                    <span className="about-campus-role">{role}</span>
                  </div>
                  <strong className="about-campus-name">{community}</strong>
                  <p className="about-campus-desc">{desc}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* 4. Learning & Next Explorations Grid (Rich Secondary Emerald & Warm Tertiary Terracotta) */}
      <div className="about-learning-grid">
        {learning?.items.length ? (
          <section className="about-learning" id="about-learning" aria-labelledby="about-learning-heading">
            <h2 id="about-learning-heading">{aboutCopy.learningTitle}</h2>
            <ul className="about-topic-list">
              {learning.items.map((topic, i) => (
                <li key={topic} className="about-topic-item">
                  <span className="about-topic-bullet" aria-hidden="true">
                    <Icon name={i % 2 === 0 ? "spark" : "code"} />
                  </span>
                  <span className="about-topic-name">{topic}</span>
                  <span className="about-topic-tag">{i === 0 ? "Core Focus" : "In Progress"}</span>
                </li>
              ))}
            </ul>
            {learning.note ? <p className="about-learning-note">{learning.note}</p> : null}
          </section>
        ) : null}

        {aboutCopy.exploreNext.length ? (
          <section className="about-next" id="about-next" aria-labelledby="about-next-heading">
            <h2 id="about-next-heading">{aboutCopy.nextTitle}</h2>
            <ul className="about-topic-list">
              {aboutCopy.exploreNext.map((topic, i) => (
                <li key={topic} className="about-topic-item">
                  <span className="about-topic-bullet" aria-hidden="true">
                    <Icon name={i % 2 === 0 ? "layers" : "spark"} />
                  </span>
                  <span className="about-topic-name">{topic}</span>
                  <span className="about-topic-tag">Exploration</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}
