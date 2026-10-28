import Link from "next/link";
import { homeCopy } from "@/content/profile";
import type { Project } from "@/content/types";
import { Icon } from "../icon";

export function ProjectCard({ project, lead = false, index }: { project: Project; lead?: boolean; index: number }) {
  return <article className={`project-card project-tone-${index % 5}${lead ? " project-lead" : ""}`}>
    <div className="project-art" aria-hidden="true">
      <span className="project-number">{String(project.order).padStart(2, "0")}</span>
      <div className={`project-symbol symbol-${index % 5}`}><Icon name={index === 0 ? "code" : index === 1 ? "spark" : "layers"} /></div>
      <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
      {lead ? <span className="art-tag">{homeCopy.projects.featuredLabel}<Icon name="spark" /></span> : null}
    </div>
    <div className="project-information">
      <div className="project-meta">{project.category ? <span>{project.category}</span> : null}{project.status ? <span className="status-pill"><span aria-hidden="true" />{homeCopy.projects.statusLabels[project.status]}</span> : null}</div>
      <h3><Link className="project-title-link" href={`/projects/${project.slug}`}>{project.name}<Icon name="arrow-up-right" /></Link></h3>
      {project.tagline ? <p className="project-description">{project.tagline}</p> : null}
      {project.statusDetail ? <p className="project-status-detail">{project.statusDetail}</p> : null}
      {project.stack?.length ? <ul className="stack-list" aria-label={homeCopy.projects.stackLabel}>{project.stack.slice(0, lead ? 6 : 4).map((tool) => <li key={tool}>{tool}</li>)}</ul> : null}
    </div>
  </article>;
}
