import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Project } from "@/content/types";
import { projectDetailCopy } from "@/content/projects";
import { siteCopy } from "@/content/profile";
import { getProjectDetailContent } from "@/lib/project-detail";
import { Icon } from "@/components/icon";

function DetailSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section className="detail-section" id={id} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>{title}</h2>{children}</section>;
}

export function ProjectDetail({ project, previous, next, className = "" }: { project: Project; previous: Project | null; next: Project | null; className?: string }) {
  const content = getProjectDetailContent(project);
  const ideaNote = content.status === "concept" ? projectDetailCopy.conceptNote : content.status === "prototype" ? projectDetailCopy.prototypeNote : null;

  return <article className={`page-width ${className}`}>
    <Link className="text-link detail-back" href="/projects"><Icon name="arrow-right" />{siteCopy.backToProjects}</Link>
    <header className="detail-header">
      <p className="eyebrow">{projectDetailCopy.eyebrow}{project.category?.trim() ? <><span aria-hidden="true">/</span>{project.category}</> : null}</p>
      <h1>{project.name}</h1>
      {content.status ? <span className={`detail-status-pill${ideaNote ? " detail-idea-status" : ""}`}><span aria-hidden="true" />{projectDetailCopy.statusLabels[content.status]}</span> : null}
      {ideaNote ? <p className="detail-idea-note">{ideaNote}</p> : null}
      {project.verification === "unverified" ? <p className="detail-review">{projectDetailCopy.unverified}</p> : null}
      <span className="detail-header-art" aria-hidden="true"><Icon name="spark" /></span>
    </header>

    {content.sections.length ? <div className="detail-layout">
      <div className="detail-content">
        {content.overview ? <DetailSection id="project-overview" title={projectDetailCopy.overview}><p className="detail-overview">{content.overview}</p></DetailSection> : null}
        {content.problem ? <DetailSection id="project-problem" title={projectDetailCopy.problem}><p>{content.problem}</p></DetailSection> : null}
        {content.role ? <DetailSection id="project-role" title={projectDetailCopy.role}><p>{content.role}</p></DetailSection> : null}
        {content.stack.length ? <DetailSection id="project-stack" title={projectDetailCopy.stack}><ul className="detail-stack">{content.stack.map((tool, index) => <li key={`${tool}-${index}`}>{tool}</li>)}</ul></DetailSection> : null}
        {content.features.length ? <DetailSection id="project-features" title={projectDetailCopy.features}><ul className="detail-features">{content.features.map((feature, index) => <li key={index}><span aria-hidden="true"><Icon name="arrow-up-right" /></span><p>{feature}</p></li>)}</ul></DetailSection> : null}
        {content.media.length ? <DetailSection id="project-media" title={projectDetailCopy.media}><div className="detail-media">{content.media.map((item, index) => <figure key={`${item.src}-${index}`}>
          {item.kind === "image" ? item.width && item.height ? <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 720px) 100vw, 800px" unoptimized loading="lazy" /> : <img src={item.src} alt={item.alt} loading="lazy" decoding="async" /> : <><video controls preload="metadata" aria-label={item.alt || undefined}><source src={item.src} /><a href={item.src}>{projectDetailCopy.videoFallback}</a></video>{item.alt ? <figcaption>{item.alt}</figcaption> : null}</>}
        </figure>)}</div></DetailSection> : null}
        {content.challenges || content.lessons ? <DetailSection id="project-reflection" title={projectDetailCopy.reflection}>
          {content.challenges ? <div className="detail-reflection"><h3>{projectDetailCopy.challenges}</h3><p>{content.challenges}</p></div> : null}
          {content.lessons ? <div className="detail-reflection"><h3>{projectDetailCopy.lessons}</h3><p>{content.lessons}</p></div> : null}
        </DetailSection> : null}
        {content.repoUrl || content.liveUrl ? <DetailSection id="project-links" title={projectDetailCopy.links}><div className="detail-external-links">
          {content.repoUrl ? <a className="button button-primary" href={content.repoUrl}><Icon name="github" />{projectDetailCopy.repo}<Icon name="arrow-up-right" /></a> : null}
          {content.liveUrl ? <a className="button button-secondary" href={content.liveUrl}>{projectDetailCopy.demo}<Icon name="arrow-up-right" /></a> : null}
        </div></DetailSection> : null}
        {content.status || content.statusDetail ? <DetailSection id="project-status" title={projectDetailCopy.status}><div className="detail-status-panel">
          {content.status ? <p className="detail-status-value">{projectDetailCopy.statusLabels[content.status]}</p> : null}
          {content.statusDetail ? <p>{content.statusDetail}</p> : null}
          {ideaNote ? <p>{ideaNote}</p> : null}
        </div></DetailSection> : null}
      </div>
      <aside className="detail-aside"><nav aria-label={projectDetailCopy.sectionNavigation}><p>{projectDetailCopy.onThisPage}</p><ul>{content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}<span aria-hidden="true">↗</span></a></li>)}</ul></nav></aside>
    </div> : null}

    {previous || next ? <nav className="detail-pagination" aria-label={projectDetailCopy.projectNavigation}>
      {previous ? <Link className="detail-previous" href={`/projects/${previous.slug}`} rel="prev"><span className="detail-direction"><Icon name="arrow-right" />{projectDetailCopy.previous}</span><span className="detail-neighbor-name">{previous.name}</span></Link> : null}
      {next ? <Link className="detail-next" href={`/projects/${next.slug}`} rel="next"><span className="detail-direction">{projectDetailCopy.next}<Icon name="arrow-right" /></span><span className="detail-neighbor-name">{next.name}</span></Link> : null}
    </nav> : null}
  </article>;
}
