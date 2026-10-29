import Link from "next/link";
import { homeCopy } from "@/content/profile";
import type { Project } from "@/content/types";
import { Icon } from "../icon";
import { MorphingShape, type ShapeName } from "../motion/morphing-shape";
import { SharedProjectElement } from "../motion/shared-project-element";

const projectShapes: ShapeName[] = ["roundedSquare", "circle", "blob", "scalloped", "roundedSquare"];

export function ProjectCard({ project, lead = false, index }: { project: Project; lead?: boolean; index: number }) {
  return <SharedProjectElement as="article" slug={project.slug} element="container" className={`project-card project-tone-${index % 5}${lead ? " project-lead" : ""}`}>
    <div className="project-art" aria-hidden="true">
      <span className="project-number">{String(project.order).padStart(2, "0")}</span>
      <SharedProjectElement slug={project.slug} element="shape" className="project-symbol" ariaHidden>
        <MorphingShape className={`project-symbol-shape symbol-${index % 5}`} shape={projectShapes[index % projectShapes.length]} viewShape="scalloped" hoverShape="blob" focusShape="circle" pressShape="scalloped" morphOnView>
          <Icon name={index === 0 ? "code" : index === 1 ? "spark" : "layers"} />
        </MorphingShape>
      </SharedProjectElement>
      <span className="art-orbit orbit-one" /><span className="art-orbit orbit-two" />
      {lead ? <span className="art-tag">{homeCopy.projects.featuredLabel}<Icon name="spark" /></span> : null}
    </div>
    <div className="project-information">
      <div className="project-meta">{project.category ? <span>{project.category}</span> : null}{project.status ? <span className="status-pill"><span aria-hidden="true" />{homeCopy.projects.statusLabels[project.status]}</span> : null}</div>
      <h3><Link className="project-title-link" href={`/projects/${project.slug}`} data-project-transition><SharedProjectElement as="span" slug={project.slug} element="title">{project.name}</SharedProjectElement><Icon name="arrow-up-right" /></Link></h3>
      {project.tagline ? <p className="project-description">{project.tagline}</p> : null}
      {project.statusDetail ? <p className="project-status-detail">{project.statusDetail}</p> : null}
      {project.stack?.length ? <ul className="stack-list" aria-label={homeCopy.projects.stackLabel}>{project.stack.slice(0, lead ? 6 : 4).map((tool) => <li key={tool}>{tool}</li>)}</ul> : null}
    </div>
  </SharedProjectElement>;
}
