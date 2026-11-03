import { renderOgImage } from "@/components/shell/og-image-template";
import { profile } from "@/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: profile.name,
    subtitle: profile.headline,
    eyebrow: "Software Engineering & Applied AI",
    badge: "IIIT Vadodara · B.Tech CSE",
    stack: ["Next.js", "TypeScript", "Go", "PostgreSQL", "FastAPI", "Ollama"],
  });
}

