"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { interfaceCopy as copy } from "@/content/interface";
import { projectCatalogCopy } from "@/content/projects";
import type { Project } from "@/content/types";
import { ALL_PROJECTS, WITHOUT_VALUE, filterProjects, getProjectCategories, groupProjects, projectGroupOrder, type ProjectFilters } from "@/lib/project-catalog";
import { Icon } from "@/components/icon";
import { CatalogCard } from "./catalog-card";
import { ExpandableProjectModal } from "@/components/ui/expandable-card";
import styles from "./project-catalog.module.css";

const initialFilters: ProjectFilters = { category: ALL_PROJECTS, status: ALL_PROJECTS };

export function ProjectCatalog({ entries, accentStyles = {} }: { entries: readonly Project[]; accentStyles?: Record<string, CSSProperties> }) {
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const restore = () => { const params = new URLSearchParams(location.search); const status = params.get("status"); setQuery(params.get("q") ?? ""); setFilters({ category: params.get("category") || ALL_PROJECTS, status: ["shipped", "in-progress", "prototype", "concept", WITHOUT_VALUE].includes(status ?? "") ? status as ProjectFilters["status"] : ALL_PROJECTS, query: params.get("q") ?? "" }); setReady(true); };
    restore(); window.addEventListener("popstate", restore); return () => window.removeEventListener("popstate", restore);
  }, []);
  useEffect(() => { if (!ready) return; const timer = setTimeout(() => setFilters((current) => ({ ...current, query })), 180); return () => clearTimeout(timer); }, [query, ready]);
  useEffect(() => { if (!ready) return; const url = new URL(location.href); for (const [key, value] of [["q", filters.query ?? ""], ["category", filters.category], ["status", filters.status]]) { if (!value || value === ALL_PROJECTS) url.searchParams.delete(key); else url.searchParams.set(key, value); } history.replaceState(history.state, "", url); }, [filters, ready]);
  const clearAll = () => { setQuery(""); setFilters(initialFilters); };
  const visible = filterProjects(entries, filters);
  const groups = groupProjects(visible);
  const categories = getProjectCategories(entries);
  const filtered = Boolean(query) || filters.category !== ALL_PROJECTS || filters.status !== ALL_PROJECTS;

  return <>
    <div className={styles.filterPanel} role="group" aria-label={projectCatalogCopy.filters.label}>
      <div className={styles.selectFields}><div className={styles.filterField}><label htmlFor="project-search">{copy.search}</label><input id="project-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} aria-controls="project-results" />{query ? <button type="button" className={styles.clearButton} onClick={() => { setQuery(""); setFilters((current) => ({...current, query: ""})); }}>{copy.clearSearch}</button> : null}</div>
        <div className={styles.filterField}><label htmlFor="project-category">{projectCatalogCopy.filters.category}</label>
          <select id="project-category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} aria-controls="project-results">
            <option value={ALL_PROJECTS}>{projectCatalogCopy.filters.allCategories}</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            {entries.some((project) => project.category === null) ? <option value={WITHOUT_VALUE}>{projectCatalogCopy.filters.noCategory}</option> : null}
          </select>
        </div>
        <div className={styles.filterField}><label htmlFor="project-status">{projectCatalogCopy.filters.status}</label>
          <select id="project-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as ProjectFilters["status"] })} aria-controls="project-results">
            <option value={ALL_PROJECTS}>{projectCatalogCopy.filters.allStatuses}</option>
            {Object.entries(projectCatalogCopy.statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
            {entries.some((project) => project.status === null) ? <option value={WITHOUT_VALUE}>{projectCatalogCopy.filters.noStatus}</option> : null}
          </select>
        </div>
      </div>
      <button className={styles.clearButton} type="button" disabled={!filtered} onClick={clearAll}>{projectCatalogCopy.filters.clear}</button>
    </div>

    <div className={styles.resultSummary}>
      <p role="status" aria-live="polite" aria-atomic="true">{projectCatalogCopy.resultsLabel(visible.length, entries.length)}</p>
      {visible.length ? <nav className={styles.groupNavigation} aria-label={projectCatalogCopy.groupNavigationLabel}>{projectGroupOrder.filter((group) => groups[group].length).map((group) => <a key={group} href={`#projects-${group}`}>{projectCatalogCopy.groups[group].title}<span aria-hidden="true">↘</span></a>)}</nav> : null}
    </div>

    <div id="project-results">
      {visible.length ? projectGroupOrder.map((group) => groups[group].length ? <section className={styles.projectGroup} key={group} id={`projects-${group}`} aria-labelledby={`projects-${group}-heading`}>
        <header className={styles.groupHeader}><div><h2 id={`projects-${group}-heading`}>{projectCatalogCopy.groups[group].title}</h2><p>{projectCatalogCopy.groups[group].description}</p></div><span className={styles.groupCount}>{projectCatalogCopy.groupCountLabel(groups[group].length)}</span></header>
        <div className={`${styles.grid}${group === "explorations" ? ` ${styles.ideaGrid}` : ""}`}>{groups[group].map((project) => <CatalogCard key={project.slug} project={project} accentStyle={accentStyles[project.slug]} onExpand={setActiveProject} />)}</div>
      </section> : null) : <div className={styles.empty}><Icon name="spark" /><h2>{copy.emptyTitle}</h2><p>{copy.emptyDescription}</p><button type="button" className="button button-primary" onClick={clearAll}>{copy.clearFilters}</button></div>}
    </div>
    <ExpandableProjectModal
      project={activeProject}
      onClose={() => setActiveProject(null)}
    />
  </>;
}
