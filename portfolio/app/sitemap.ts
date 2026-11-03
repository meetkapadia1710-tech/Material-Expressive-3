import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://meetkapadia.dev";
  const routes = ["", "/projects", "/about", "/skills", "/achievements", "/contact", "/resume"];
  const projectRoutes = getPublicProjects().map((p) => `/projects/${p.slug}`);

  return [...routes, ...projectRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/projects/") ? "monthly" : "weekly",
    priority: route === "" ? 1.0 : route === "/resume" ? 0.9 : 0.8,
  }));
}

