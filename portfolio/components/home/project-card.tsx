import Link from "next/link";
import { homeCopy } from "@/content/profile";
import type { Project } from "@/content/types";
import { Icon } from "../icon";
import { MorphingShape, type ShapeName } from "../motion/morphing-shape";
import { SharedProjectElement } from "../motion/shared-project-element";
import { projectAccentStyle } from "@/lib/project-accent";

const projectShapes: ShapeName[] = ["roundedSquare", "circle", "blob", "scalloped", "roundedSquare"];

export function ProjectCard({ project, lead = false, index }: { project: Project; lead?: boolean; index: number }) {
  return <SharedProjectElement as="article" slug={project.slug} scope="home" element="container" className={`project-card project-tone-${index % 5}${lead ? " project-lead" : ""}`} style={projectAccentStyle(project.accentSeed)} data-project-accent={project.accentSeed ? "true" : undefined}>
    <div className="project-art" aria-hidden="true">
      <span className="project-number">{String(project.order).padStart(2, "0")}</span>
      <SharedProjectElement slug={project.slug} scope="home" element="shape" className="project-symbol" ariaHidden>
        <MorphingShape className={`project-symbol-shape symbol-${index % 5}`} shape={projectShapes[index % projectShapes.length]} viewShape="scalloped" hoverShape="blob" focusShape="circle" pressShape="scalloped" morphOnView>
          <Icon name={index === 0 ? "code" : index === 1 ? "spark" : "layers"} />
        </MorphingShape>
      </SharedProjectElement>
      <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
      {lead ? <span className="art-tag">{homeCopy.projects.featuredLabel}<Icon name="spark" /></span> : null}
    </div>
    <div className="project-information">
      <div className="project-meta">{project.category ? <span>{project.category}</span> : null}{project.status ? <span className="status-pill"><span aria-hidden="true" />{homeCopy.projects.statusLabels[project.status]}</span> : null}</div>
      <h3><Link className="project-title-link" href={`/projects/${project.slug}`} data-project-transition scroll={false}><SharedProjectElement as="span" slug={project.slug} scope="home" element="title">{project.name}</SharedProjectElement><Icon name="arrow-up-right" /></Link></h3>
      {project.tagline ? <p className="project-description">{project.tagline}</p> : null}
      {project.statusDetail ? <p className="project-status-detail">{project.statusDetail}</p> : null}
      {project.stack?.length ? <ul className="stack-list" aria-label={homeCopy.projects.stackLabel}>{project.stack.slice(0, lead ? 6 : 4).map((tool) => <li key={tool}>{tool}</li>)}</ul> : null}
      {project.repoUrl || project.liveUrl ? (
        <div className="project-card-actions">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-action-link"
              aria-label={`Source code for ${project.name} on GitHub (opens in new tab)`}
            >
              <Icon name="github" />
              <span>Source</span>
            </a>
          ) : null}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-action-link project-action-live"
              aria-label={`Live demo for ${project.name} (opens in new tab)`}
            >
              <Icon name="arrow-up-right" />
              <span>Live Demo</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  </SharedProjectElement>;
}
