import { Icon } from "@/components/icon";
import { MorphingShape } from "@/components/motion/morphing-shape";
import { BlurText } from "@/components/ui/blur-text";
import { ProjectCatalog } from "@/components/projects/project-catalog";
import styles from "@/components/projects/project-catalog.module.css";
import { pageCopy } from "@/content/profile";
import { projects, projectCatalogCopy } from "@/content/projects";
import { projectAccentStyle } from "@/lib/project-accent";
export const metadata = { title: pageCopy.projects.title };
const accentStyles = Object.fromEntries(projects.flatMap((project) => {
  const style = projectAccentStyle(project.accentSeed);
  return style ? [[project.slug, style]] : [];
}));
export default function Page() {
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}><p className="eyebrow">{pageCopy.projects.eyebrow}</p><h1>{pageCopy.projects.title}</h1><p className={styles.collectionLabel}>{projectCatalogCopy.collectionLabel}</p>{pageCopy.projects.description ? <p className="section-description"><BlurText text={pageCopy.projects.description} delay={40} /></p> : null}<span className={styles.headerArt} aria-hidden="true"><MorphingShape className={styles.headerShape} shape="roundedSquare" viewShape="scalloped" hoverShape="blob" morphOnView><Icon name="spark" /></MorphingShape></span></header>
    <ProjectCatalog entries={projects} accentStyles={accentStyles} />
  </div>;
}
