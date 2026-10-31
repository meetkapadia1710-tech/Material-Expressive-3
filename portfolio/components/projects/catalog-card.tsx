"use client";

import Link from "next/link";
import { memo, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { readMotionBezier, readMotionMilliseconds } from "@/components/motion/motion-tokens";
import { MorphingShape } from "@/components/motion/morphing-shape";
import { SharedProjectElement, sharedProjectLayoutId, useSharedProjectTransitionEnabled } from "@/components/motion/shared-project-element";
import { projectCatalogCopy } from "@/content/projects";
import type { Project } from "@/content/types";
import { Icon } from "@/components/icon";
import { EncryptedText } from "@/components/ui/encrypted-text";
import styles from "./project-catalog.module.css";

export const CatalogCard = memo(function CatalogCard({ project, accentStyle, onExpand }: { project: Project; accentStyle?: CSSProperties; onExpand?: (project: Project) => void }) {
  const reduced = useReducedMotion();
  const shared = useSharedProjectTransitionEnabled();
  const isExploration = project.status === "concept" || project.status === "prototype";
  const isReview = project.visibility === "review" || project.verification === "unverified";
  const layoutDuration = readMotionMilliseconds(shared ? "--motion-duration-card" : "--motion-duration-layout", shared ? 400 : 280) / 1000;
  const layoutEasing = shared ? readMotionBezier("--motion-project-spatial-easing", [0.38, 1.21, 0.22, 1]) : readMotionBezier("--motion-project-layout-easing", [0.2, 0.75, 0.2, 1]);
  return <motion.article layout={reduced ? false : "position"} layoutId={sharedProjectLayoutId("catalog", project.slug, "container", shared)} transition={{ layout: { duration: layoutDuration, ease: layoutEasing } }} className={`${styles.card}${isExploration ? ` ${styles.ideaCard}` : ""}`} style={accentStyle} data-project-accent={accentStyle ? "true" : undefined} data-project-slug={project.slug}>
    <div className={styles.cardMeta}>
      <SharedProjectElement slug={project.slug} scope="catalog" element="shape" className={styles.cardShape} ariaHidden>
        <MorphingShape className={styles.cardShapeInner} shape="roundedSquare" viewShape="scalloped" hoverShape="circle" focusShape="blob" morphOnView>
          <Icon name="spark" />
        </MorphingShape>
      </SharedProjectElement>
      {project.category ? <span className={styles.category}>{project.category}</span> : null}
      {project.status ? <span className={`${styles.status} ${isExploration ? styles.explorationStatus : ""}`}><span aria-hidden="true" />{projectCatalogCopy.statusLabels[project.status]}</span> : null}
    </div>
    <h3 className={styles.cardTitle}>{project.visibility === "public" ? <Link href={`/projects/${project.slug}`} data-project-transition scroll={false}><SharedProjectElement as="span" slug={project.slug} scope="catalog" element="title">{project.name}</SharedProjectElement><Icon name="arrow-up-right" /></Link> : project.name}</h3>
    {isReview ? <p className={styles.review}>{projectCatalogCopy.reviewLabel}</p> : null}
    {project.tagline ? <p className={styles.tagline}>{project.tagline}</p> : null}
    {project.statusDetail ? <p className={styles.statusDetail}>{project.statusDetail}</p> : null}
    {isExploration ? <p className={styles.ideaNote}>{project.status === "concept" ? projectCatalogCopy.conceptNote : projectCatalogCopy.prototypeNote}</p> : null}
    {project.stack?.length ? <ul className={styles.stack} aria-label={projectCatalogCopy.stackLabel}>{project.stack.map((item) => <li key={item}><EncryptedText text={item} revealDelayMs={24} replayOnHover /></li>)}</ul> : null}
    {project.repoUrl || project.liveUrl || onExpand ? <div className={styles.cardLinks}>
      {onExpand ? <button type="button" onClick={() => onExpand(project)} className={styles.cardExpandButton} aria-label={`Preview ${project.name}`}><Icon name="spark" /><span>Quick preview</span></button> : null}
      {project.repoUrl ? <a href={project.repoUrl}><Icon name="github" />{projectCatalogCopy.repoLabel}<Icon name="arrow-up-right" /></a> : null}
      {project.liveUrl ? <a href={project.liveUrl}>{projectCatalogCopy.liveLabel}<Icon name="arrow-up-right" /></a> : null}
    </div> : null}
  </motion.article>;
});
