"use client";

import Link from "next/link";
import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projectCatalogCopy } from "@/content/projects";
import type { Project } from "@/content/types";
import { Icon } from "@/components/icon";
import styles from "./project-catalog.module.css";

export const CatalogCard = memo(function CatalogCard({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  const isExploration = project.status === "concept" || project.status === "prototype";
  const isReview = project.visibility === "review" || project.verification === "unverified";
  return <motion.article layout={reduced ? false : "position"} transition={{ layout: { duration: 0.28, ease: [0.2, 0.75, 0.2, 1] } }} className={`${styles.card}${isExploration ? ` ${styles.ideaCard}` : ""}`} data-project-slug={project.slug}>
    <div className={styles.cardMeta}>
      {project.category ? <span className={styles.category}>{project.category}</span> : null}
      {project.status ? <span className={`${styles.status} ${isExploration ? styles.explorationStatus : ""}`}><span aria-hidden="true" />{projectCatalogCopy.statusLabels[project.status]}</span> : null}
    </div>
    <h3 className={styles.cardTitle}>{project.visibility === "public" ? <Link href={`/projects/${project.slug}`}>{project.name}<Icon name="arrow-up-right" /></Link> : project.name}</h3>
    {isReview ? <p className={styles.review}>{projectCatalogCopy.reviewLabel}</p> : null}
    {project.tagline ? <p className={styles.tagline}>{project.tagline}</p> : null}
    {project.statusDetail ? <p className={styles.statusDetail}>{project.statusDetail}</p> : null}
    {isExploration ? <p className={styles.ideaNote}>{project.status === "concept" ? projectCatalogCopy.conceptNote : projectCatalogCopy.prototypeNote}</p> : null}
    {project.stack?.length ? <ul className={styles.stack} aria-label={projectCatalogCopy.stackLabel}>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul> : null}
    {project.repoUrl || project.liveUrl ? <div className={styles.cardLinks}>
      {project.repoUrl ? <a href={project.repoUrl}><Icon name="github" />{projectCatalogCopy.repoLabel}<Icon name="arrow-up-right" /></a> : null}
      {project.liveUrl ? <a href={project.liveUrl}>{projectCatalogCopy.liveLabel}<Icon name="arrow-up-right" /></a> : null}
    </div> : null}
  </motion.article>;
});
