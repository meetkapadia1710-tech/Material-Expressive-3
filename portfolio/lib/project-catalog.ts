import type { Project, ProjectStatus } from "@/content/types";

export const ALL_PROJECTS = "__all__";
export const WITHOUT_VALUE = "__none__";
export const projectGroupOrder = ["featured", "more", "explorations"] as const;
export type ProjectGroup = (typeof projectGroupOrder)[number];
export interface ProjectFilters {
  query?: string;
  category: string;
  status: ProjectStatus | typeof ALL_PROJECTS | typeof WITHOUT_VALUE;
}

export function getProjectGroup(project: Project): ProjectGroup {
  if (project.status === "concept" || project.status === "prototype" || project.visibility === "review") return "explorations";
  return project.featured ? "featured" : "more";
}

export function filterProjects(entries: readonly Project[], filters: ProjectFilters): Project[] {
  return entries.filter((project) => {
    const categoryMatches = filters.category === ALL_PROJECTS || (filters.category === WITHOUT_VALUE ? project.category === null : project.category === filters.category);
    const statusMatches = filters.status === ALL_PROJECTS || (filters.status === WITHOUT_VALUE ? project.status === null : project.status === filters.status);
    const query = filters.query?.trim().toLocaleLowerCase() ?? "";
    const searchable = [project.name, project.tagline, project.category, ...(project.stack ?? [])].filter(Boolean).join(" ").toLocaleLowerCase();
    return categoryMatches && statusMatches && searchable.includes(query);
  }).toSorted((a, b) => a.order - b.order);
}

export function groupProjects(entries: readonly Project[]): Record<ProjectGroup, Project[]> {
  const groups: Record<ProjectGroup, Project[]> = { featured: [], more: [], explorations: [] };
  for (const project of entries.toSorted((a, b) => a.order - b.order)) groups[getProjectGroup(project)].push(project);
  return groups;
}

export function getProjectCategories(entries: readonly Project[]): string[] {
  return [...new Set(entries.flatMap(({ category }) => category === null ? [] : [category]))].toSorted((a, b) => a.localeCompare(b));
}
