import { renderOgImage } from "@/components/shell/og-image-template";
import { profile } from "@/content/profile";
import { getCodingStats } from "@/lib/coding-stats";

export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const codingStats = await getCodingStats();
  const statsHighlight = codingStats.leetcode
    ? `${codingStats.leetcode.totalDisplay} LeetCode · IIIT Vadodara`
    : "IIIT Vadodara · B.Tech CSE";

  return renderOgImage({
    title: profile.name,
    subtitle: profile.headline,
    eyebrow: "Software Engineering & Applied AI",
    badge: statsHighlight,
    stack: ["Next.js", "TypeScript", "Go", "PostgreSQL", "FastAPI", "Ollama"],
  });
}
