import { notFound } from "next/navigation";
import { getProjectBySlug, getPublicProjects } from "@/content/projects";
import { getAdjacentProjects } from "@/lib/project-detail";
import { ProjectDetail } from "@/components/projects/project-detail";
import styles from "@/components/projects/project-detail.module.css";

// Generate only known public slugs; unknown and review-only slugs are 404s.
export const dynamicParams = false;

export function generateStaticParams() { return getPublicProjects().map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  return { title: project.name, ...(project.tagline?.trim() ? { description: project.tagline.trim() } : {}) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const { previous, next } = getAdjacentProjects(slug);
  return <ProjectDetail project={project} previous={previous} next={next} className={styles.page} />;
}
