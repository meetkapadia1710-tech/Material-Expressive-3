import { renderOgImage } from "@/components/shell/og-image-template";
import { getProjectBySlug, getPublicProjects } from "@/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPublicProjects().map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  return renderOgImage({
    title: project?.name ?? "Project Case Study",
    subtitle: project?.tagline ?? "Detailed engineering breakdown and system architecture.",
    eyebrow: project?.category ?? "Engineering Build",
    badge: project?.status ? `Status: ${project.status}` : "Meet Kapadia Portfolio",
    stack: project?.stack?.slice(0, 5) ?? ["TypeScript", "Full-Stack"],
  });
}

