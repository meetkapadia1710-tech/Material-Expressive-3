import { getPublicProjects, projectDetailCopy } from "@/content/projects";
import type { Project } from "@/content/types";

export function nonEmptyText(value: string | null): string | null {
  return value?.trim() || null;
}

export function getProjectDetailContent(project: Project) {
  const content = {
    overview: nonEmptyText(project.tagline),
    problem: nonEmptyText(project.problem),
    role: nonEmptyText(project.role),
    stack: (project.stack ?? []).map((item) => item.trim()).filter(Boolean),
    features: (project.features ?? []).map((item) => item.trim()).filter(Boolean),
    media: (project.media ?? []).filter((item) => item.src.trim()).map((item) => ({ ...item, src: item.src.trim(), alt: item.alt.trim() })),
    challenges: nonEmptyText(project.challenges),
    lessons: nonEmptyText(project.lessons),
    repoUrl: nonEmptyText(project.repoUrl),
    liveUrl: nonEmptyText(project.liveUrl),
    status: project.status,
    statusDetail: nonEmptyText(project.statusDetail),
  };
  const sections: { id: string; title: string }[] = [];
  if (content.overview) sections.push({ id: "project-overview", title: projectDetailCopy.overview });
  if (content.problem) sections.push({ id: "project-problem", title: projectDetailCopy.problem });
  if (content.role) sections.push({ id: "project-role", title: projectDetailCopy.role });
  if (content.stack.length) sections.push({ id: "project-stack", title: projectDetailCopy.stack });
  if (content.features.length) sections.push({ id: "project-features", title: projectDetailCopy.features });
  if (content.media.length) sections.push({ id: "project-media", title: projectDetailCopy.media });
  if (content.challenges || content.lessons) sections.push({ id: "project-reflection", title: projectDetailCopy.reflection });
  if (content.repoUrl || content.liveUrl) sections.push({ id: "project-links", title: projectDetailCopy.links });
  if (content.status || content.statusDetail) sections.push({ id: "project-status", title: projectDetailCopy.status });
  return { ...content, sections };
}

export function getAdjacentProjects(slug: string, entries: readonly Project[] = getPublicProjects()) {
  const ordered = entries.filter((project) => project.visibility === "public").toSorted((a, b) => a.order - b.order);
  const index = ordered.findIndex((project) => project.slug === slug);
  if (index < 0) return { previous: null, next: null };
  return { previous: ordered[index - 1] ?? null, next: ordered[index + 1] ?? null };
}
