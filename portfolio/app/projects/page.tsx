import { Icon } from "@/components/icon";
import { ProjectCatalog } from "@/components/projects/project-catalog";
import styles from "@/components/projects/project-catalog.module.css";
import { pageCopy } from "@/content/profile";
import { projects, projectCatalogCopy } from "@/content/projects";
export const metadata = { title: pageCopy.projects.title };
export default function Page() {
  return <div className={`page-width ${styles.page}`}>
    <header className={styles.header}><p className="eyebrow">{pageCopy.projects.eyebrow}</p><h1>{pageCopy.projects.title}</h1><p className={styles.collectionLabel}>{projectCatalogCopy.collectionLabel}</p>{pageCopy.projects.description ? <p className="section-description">{pageCopy.projects.description}</p> : null}<span className={styles.headerArt} aria-hidden="true"><Icon name="spark" /></span></header>
    <ProjectCatalog entries={projects} />
  </div>;
}
