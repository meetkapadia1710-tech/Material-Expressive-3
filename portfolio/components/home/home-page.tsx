"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { links } from "@/content/links";
import { homeCopy, profile, siteCopy } from "@/content/profile";
import { getFeaturedProjects } from "@/content/projects";
import { skills } from "@/content/skills";
import { Icon } from "../icon";
import { MorphingShape } from "../motion/morphing-shape";
import Lanyard from "../motion/Lanyard";
import { useLanyardTheme } from "../motion/lanyard-theme";
import { HighlightText } from "@/components/ui/highlight-text";
import { BlurText } from "@/components/ui/blur-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SVGMaskEffectDemo } from "@/components/ui/svg-mask-effect";
import { ProjectCard } from "./project-card";

export function HomePage() {
  const featured = getFeaturedProjects();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [inspectBadge, setInspectBadge] = useState<boolean>(false);
  const lanyardTheme = useLanyardTheme();

  useEffect(() => {
    if (!inspectBadge) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInspectBadge(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectBadge]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const p of featured) {
      if (p.category) cats.add(p.category);
    }
    return ["all", ...Array.from(cats)];
  }, [featured]);

  const visibleProjects = useMemo(() => {
    if (activeCategory === "all") return featured;
    return featured.filter((p) => p.category === activeCategory);
  }, [featured, activeCategory]);

  return (
    <>
      <section className="hero page-width" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <Link href={homeCopy.buildingStatus.href} className="hero-status-pill">
            <span className="hero-status-dot" aria-hidden="true" />
            <span className="hero-status-tag">{homeCopy.buildingStatus.tag}</span>
            <span className="hero-status-sep" aria-hidden="true">·</span>
            <span className="hero-status-text">
              <strong>{homeCopy.buildingStatus.project}</strong> ({homeCopy.buildingStatus.desc})
            </span>
            <Icon name="arrow-up-right" />
          </Link>

          <p className="eyebrow">
            <span className="tiny-spark" aria-hidden="true">✳</span>
            {homeCopy.eyebrow}
            <span className="location">{profile.location.label}</span>
          </p>
          <p className="hero-name">{profile.displayName}<span aria-hidden="true">.</span></p>
          <h1 id="hero-heading">{profile.headline}</h1>
          {profile.description ? (
            <p className="hero-description">
              <TextGenerateEffect text={profile.description} delay={0.025} />
            </p>
          ) : null}
          {profile.heroLabels.length ? (
            <ul className="hero-labels">
              {profile.heroLabels.slice(0, 4).map((label) => <li key={label}>{label}</li>)}
            </ul>
          ) : null}
          <div className="hero-actions">
            <a className="button button-primary" href={homeCopy.workCta.href}>
              {homeCopy.workCta.label}
              <Icon name="arrow-right" />
            </a>
            <a
              className="button button-secondary hero-resume-btn"
              href={links.resume.href ?? "https://miniresumemeet.vercel.app"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Meet Kapadia's Resume (opens in new tab)"
            >
              <Icon name="file" />
              <span>{homeCopy.resumeCta.label}</span>
              <Icon name="arrow-up-right" />
            </a>
            <Link className="button button-secondary" href={homeCopy.contactCta.href}>
              {homeCopy.contactCta.label}
              <Icon name="arrow-up-right" />
            </Link>
            {links.github.href ? (
              <a
                className="github-link"
                href={links.github.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="github" />
                {homeCopy.githubCta.label}
                {links.github.verification === "unverified" ? (
                  <span className="verification-label">{siteCopy.unverified}</span>
                ) : null}
              </a>
            ) : null}
            {links.linkedin.href ? (
              <a
                className="github-link linkedin-link"
                href={links.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Meet Kapadia on LinkedIn (opens in new tab)"
              >
                <Icon name="linkedin" />
                <span>{homeCopy.linkedinCta?.label ?? "LinkedIn"}</span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="hero-aside">
          <div className="hero-art-frame">
            <div className="hero-art" aria-hidden="true">
              <span className="art-caption top-caption"><span />{homeCopy.illustration.topLabel}</span>
              <div className="bloom"><span /><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="art-message">
                {homeCopy.illustration.center}<br />
                <em>
                  <HighlightText
                    text={homeCopy.illustration.emphasis}
                    delay={300}
                    highlightColor="linear-gradient(120deg, color-mix(in srgb, var(--color-secondary) 45%, transparent) 0%, color-mix(in srgb, var(--color-inverse-primary) 38%, transparent) 100%)"
                  />
                </em>
              </div>
              <div className="small-star star-one">✦</div><div className="small-star star-two">✦</div>
              <span className="art-caption bottom-caption">
                {homeCopy.illustration.bottomLabel}
                <Icon name="arrow-up-right" />
              </span>
            </div>
            <MorphingShape
              className="art-code hero-badge"
              interactive
              label="Change decorative badge shape"
              shape="roundedSquare"
              hoverShape="scalloped"
              focusShape="circle"
              pressShape="blob"
              selectedShape="blob"
            >
              <Icon name="code" />
            </MorphingShape>
          </div>
          <div className="hero-inspect-action">
            <button
              type="button"
              className="hero-badge-trigger"
              onClick={() => setInspectBadge(true)}
              aria-haspopup="dialog"
            >
              <span className="hero-badge-trigger-dot" aria-hidden="true" />
              <span>Inspect 3D Pass</span>
              <Icon name="spark" />
            </button>
          </div>
          <p className="aside-note"><span aria-hidden="true">↳</span><BlurText text={homeCopy.introduction} delay={50} /></p>
        </div>
      </section>

      {/* Impact & Velocity Metrics Ribbon */}
      <section className="impact-strip page-width" aria-label="Key engineering highlights and velocity">
        <div className="impact-grid">
          <div className="impact-card">
            <span className="impact-icon" aria-hidden="true"><Icon name="code" /></span>
            <div className="impact-data">
              <span className="impact-value">650<span className="impact-plus">+</span></span>
              <span className="impact-label">LeetCode Problems</span>
            </div>
            <span className="impact-tag">DSA & System Design Mastery</span>
          </div>
          <div className="impact-card">
            <span className="impact-icon" aria-hidden="true"><Icon name="layers" /></span>
            <div className="impact-data">
              <span className="impact-value">8<span className="impact-plus">+</span></span>
              <span className="impact-label">Full-Stack Builds</span>
            </div>
            <span className="impact-tag">Next.js · FastAPI · Postgres</span>
          </div>
          <div className="impact-card">
            <span className="impact-icon" aria-hidden="true"><Icon name="spark" /></span>
            <div className="impact-data">
              <span className="impact-value">8.31</span>
              <span className="impact-label">CGPA · B.Tech CSE</span>
            </div>
            <span className="impact-tag">IIIT Vadodara (2024–2028)</span>
          </div>
          <div className="impact-card">
            <span className="impact-icon" aria-hidden="true"><Icon name="spark" /></span>
            <div className="impact-data">
              <span className="impact-value">100<span className="impact-percent">%</span></span>
              <span className="impact-label">Local-First AI Focus</span>
            </div>
            <span className="impact-tag">Ollama · Supermemory Hackathon</span>
          </div>
        </div>
      </section>

      {/* Selected Projects with Interactive Filter Bar */}
      {featured.length ? (
        <section id="selected-projects" className="projects-section page-width section-space" aria-labelledby="projects-heading">
          <div className="section-header">
            <div>
              <p className="eyebrow">{homeCopy.projects.eyebrow}</p>
              <h2 id="projects-heading">{homeCopy.projects.title}</h2>
              <p className="section-description"><BlurText text={homeCopy.projects.description} delay={35} /></p>
            </div>
            <Link className="text-link section-link" href="/projects">
              {homeCopy.projects.allLabel}
              <Icon name="arrow-up-right" />
            </Link>
          </div>

          <div className="home-project-filters" role="group" aria-label="Filter selected projects by category">
            {categories.map((cat) => {
              const count = cat === "all" ? featured.length : featured.filter((p) => p.category === cat).length;
              const label = cat === "all" ? "All Featured" : cat;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className="home-filter-chip"
                  data-active={isActive}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{label}</span>
                  <span className="home-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} lead={index === 0 && activeCategory === "all"} />
            ))}
          </div>
        </section>
      ) : null}

      {skills.length ? (
        <section className="skills-section page-width section-space" aria-labelledby="skills-heading">
          <div className="skills-intro">
            <p className="eyebrow">{homeCopy.skills.eyebrow}</p>
            <h2 id="skills-heading">{homeCopy.skills.title}</h2>
            <p className="section-description">{homeCopy.skills.description}</p>
            <Link className="button button-secondary" href="/skills">
              {homeCopy.skills.linkLabel}
              <Icon name="arrow-up-right" />
            </Link>
            <span className="skills-flower" aria-hidden="true">✳</span>
          </div>
          <dl className="skills-overview">
            {skills.map((group) => (
              <div className="skill-row" key={group.id}>
                <dt>{group.name}</dt>
                <dd>{group.overview}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="page-width section-space" aria-label="Interactive design philosophy">
        <SVGMaskEffectDemo />
      </section>

      <section className="contact-section page-width section-space" aria-labelledby="contact-heading">
        <div className="contact-panel">
          <span className="contact-flower" aria-hidden="true">✳</span>
          <p className="eyebrow">{homeCopy.contact.eyebrow}</p>
          <h2 id="contact-heading">
            Something <HighlightText text="thoughtful" highlightColor="linear-gradient(120deg, color-mix(in srgb, var(--color-primary-container) 95%, transparent) 0%, color-mix(in srgb, var(--color-primary) 18%, transparent) 100%)" /> starts with a conversation.
          </h2>
          {homeCopy.contact.description ? <p>{homeCopy.contact.description}</p> : null}
          <div className="contact-actions">
            {links.email.href ? (
              <a className="button button-dark" href={links.email.href}>
                {homeCopy.contact.emailLabel}
                <Icon name="mail" />
              </a>
            ) : null}
            {links.linkedin.href ? (
              <a
                className="button button-secondary"
                href={links.linkedin.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Meet Kapadia on LinkedIn (opens in new tab)"
              >
                <Icon name="linkedin" />
                <span>LinkedIn</span>
                <Icon name="arrow-up-right" />
              </a>
            ) : null}
            <Link className="text-link" href="/contact">
              {homeCopy.contact.pageLabel}
              <Icon name="arrow-up-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3D Lanyard Pass Interactive Modal */}
      {inspectBadge ? (
        <div
          className="lanyard-inspect-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lanyard-modal-title"
          onClick={() => setInspectBadge(false)}
        >
          <div
            className="lanyard-inspect-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="lanyard-inspect-header">
              <div>
                <h2 id="lanyard-modal-title">Meet Kapadia · M3 Interactive Pass</h2>
                <p>Physics-simulated 3D badge · Drag to swing or grab edge to flip</p>
              </div>
              <button
                type="button"
                className="lanyard-inspect-close"
                onClick={() => setInspectBadge(false)}
                aria-label="Close 3D badge viewer"
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="lanyard-inspect-canvas-wrapper" style={{ width: "100%", height: "480px" }}>
              <Lanyard
                frontImage={lanyardTheme.frontImage}
                backImage={lanyardTheme.backImage}
                strapImage={lanyardTheme.strapImage}
                imageFit="cover"
                cardColor={lanyardTheme.cardColor}
                orientation="portrait"
                finish="glossy"
                cornerRadius={0.3}
                size={0.65}
                anchor="center"
                strapLength={0.5}
                strapColor={lanyardTheme.strapColor}
                strapWidth={0.65}
                metal="silver"
                gravity={1}
                damping={0.5}
                elasticity={0.5}
                breeze={0.5}
                interactive
                intro
              />
            </div>
            <footer className="lanyard-inspect-footer">
              <span><Icon name="spark" /> Material 3 Expressive Physical Motion</span>
              <button type="button" className="button button-secondary" onClick={() => setInspectBadge(false)}>
                Close Viewer
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
