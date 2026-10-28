import Link from "next/link";
import { links } from "@/content/links";
import { homeCopy, profile, siteCopy } from "@/content/profile";
import { getFeaturedProjects } from "@/content/projects";
import { skills } from "@/content/skills";
import { Icon } from "../icon";
import { ProjectCard } from "./project-card";

export function HomePage() {
  const featured = getFeaturedProjects();
  return <>
    <section className="hero page-width" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span>{homeCopy.eyebrow}<span className="location">{profile.location.label}</span></p>
        <p className="hero-name">{profile.displayName}<span aria-hidden="true">.</span></p>
        <h1 id="hero-heading">{profile.headline}</h1>
        {profile.description ? <p className="hero-description">{profile.description}</p> : null}
        {profile.heroLabels.length ? <ul className="hero-labels">{profile.heroLabels.slice(0, 4).map((label) => <li key={label}>{label}</li>)}</ul> : null}
        <div className="hero-actions">
          <a className="button button-primary" href={homeCopy.workCta.href}>{homeCopy.workCta.label}<Icon name="arrow-right" /></a>
          <Link className="button button-secondary" href={homeCopy.contactCta.href}>{homeCopy.contactCta.label}<Icon name="arrow-up-right" /></Link>
          {links.github.href ? <a className="github-link" href={links.github.href}><Icon name="github" />{homeCopy.githubCta.label}{links.github.verification === "unverified" ? <span className="verification-label">{siteCopy.unverified}</span> : null}</a> : null}
        </div>
      </div>
      <div className="hero-aside">
        <div className="hero-art" aria-hidden="true">
          <span className="art-caption top-caption"><span />{homeCopy.illustration.topLabel}</span>
          <div className="bloom"><span /><span /><span /><span /><span /><span /><span /><span /></div>
          <div className="art-message">{homeCopy.illustration.center}<br /><em>{homeCopy.illustration.emphasis}</em></div>
          <div className="small-star star-one">✦</div><div className="small-star star-two">✦</div>
          <span className="art-code"><Icon name="code" /></span>
          <span className="art-caption bottom-caption">{homeCopy.illustration.bottomLabel}<Icon name="arrow-up-right" /></span>
        </div>
        <p className="aside-note"><span aria-hidden="true">↳</span>{homeCopy.introduction}</p>
      </div>
    </section>

    {featured.length ? <section id="selected-projects" className="projects-section page-width section-space" aria-labelledby="projects-heading">
      <div className="section-header"><div><p className="eyebrow">{homeCopy.projects.eyebrow}</p><h2 id="projects-heading">{homeCopy.projects.title}</h2><p className="section-description">{homeCopy.projects.description}</p></div><Link className="text-link section-link" href="/projects">{homeCopy.projects.allLabel}<Icon name="arrow-up-right" /></Link></div>
      <div className="project-grid">{featured.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} lead={index === 0} />)}</div>
    </section> : null}

    {skills.length ? <section className="skills-section page-width section-space" aria-labelledby="skills-heading">
      <div className="skills-intro"><p className="eyebrow">{homeCopy.skills.eyebrow}</p><h2 id="skills-heading">{homeCopy.skills.title}</h2><p className="section-description">{homeCopy.skills.description}</p><Link className="button button-secondary" href="/skills">{homeCopy.skills.linkLabel}<Icon name="arrow-up-right" /></Link><span className="skills-flower" aria-hidden="true">✳</span></div>
      <dl className="skills-overview">{skills.map((group) => <div className="skill-row" key={group.id}><dt>{group.name}</dt><dd>{group.overview}</dd></div>)}</dl>
    </section> : null}

    <section className="contact-section page-width section-space" aria-labelledby="contact-heading"><div className="contact-panel"><span className="contact-flower" aria-hidden="true">✳</span><p className="eyebrow">{homeCopy.contact.eyebrow}</p><h2 id="contact-heading">{homeCopy.contact.title}</h2>{homeCopy.contact.description ? <p>{homeCopy.contact.description}</p> : null}<div className="contact-actions">{links.email.href ? <a className="button button-dark" href={links.email.href}>{homeCopy.contact.emailLabel}<Icon name="mail" /></a> : null}<Link className="text-link" href="/contact">{homeCopy.contact.pageLabel}<Icon name="arrow-up-right" /></Link></div></div></section>
  </>;
}
