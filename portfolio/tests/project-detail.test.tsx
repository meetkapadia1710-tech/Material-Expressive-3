import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectDetail } from "../components/projects/project-detail";
import { getProjectDetailContent, getAdjacentProjects } from "../lib/project-detail";
import { getProjectBySlug, getPublicProjects, projects, projectDetailCopy } from "../content/projects";
import type { Project } from "../content/types";

const render = (project: Project) => renderToStaticMarkup(<ProjectDetail project={project} previous={null} next={null} />);

test("null, blank strings, empty arrays and blank media do not create empty sections", () => {
  const project: Project = { ...projects[0], category: " ", tagline: "\n ", problem: null, role: " ", stack: ["", " "], features: [], media: [{ kind: "image", src: " ", alt: "" }], challenges: "\n", lessons: null, repoUrl: " ", liveUrl: null, status: null, statusDetail: " " };
  const content = getProjectDetailContent(project);
  assert.deepEqual(content.sections, []);
  const html = render(project);
  assert.ok(!html.includes("<section") && !html.includes("<aside") && !html.includes("<nav"));
  assert.ok(!html.includes("<img") && !html.includes("<video"));
  assert.ok(!html.includes("null") && !html.includes("undefined"));
  assert.ok(!html.includes('href=" "'));
});

test("Hindsight renders only its supplied detail sections and repository", () => {
  const project = getProjectBySlug("hindsight")!;
  assert.deepEqual(getProjectDetailContent(project).sections.map((s) => s.id), ["project-overview", "project-role", "project-stack", "project-features", "project-links"]);
  const html = render(project);
  assert.ok(html.includes('href="https://github.com/meetkapadia1710-tech/hindsight"'));
  assert.ok(!html.includes('id="project-problem"') && !html.includes('id="project-media"'));
  assert.ok(!html.includes('id="project-reflection"') && !html.includes('id="project-status"'));
  assert.ok(!html.includes(projectDetailCopy.demo));
});

test("optional problem, reflections, media and demo render when content is supplied", () => {
  // Reserved .test URLs are fixtures only, never added to portfolio content.
  const project: Project = { ...projects[0], problem: "A supplied problem statement.", role: "A supplied role.", challenges: "A supplied challenge.", lessons: "A supplied lesson.", repoUrl: "https://example.test/repository", liveUrl: "https://example.test/demo", media: [{ kind: "image", src: "/test-image.png", alt: "An illustrative test image" }, { kind: "video", src: "/test-video.mp4", alt: "An illustrative test video" }] };
  const html = render(project);
  for (const section of getProjectDetailContent(project).sections) {
    assert.ok(html.includes(`id="${section.id}"`));
    assert.ok(html.includes(`href="#${section.id}"`));
  }
  assert.ok(html.includes("A supplied challenge.") && html.includes("A supplied lesson."));
  assert.ok(html.includes('alt="An illustrative test image"'));
  assert.ok(html.includes("<video controls=") && !html.includes("autoPlay"));
  assert.ok(html.includes('href="https://example.test/repository"') && html.includes('href="https://example.test/demo"'));
});

test("either reflection field can render independently", () => {
  const lessonsOnly = render({ ...projects[0], challenges: null, lessons: "A supplied lesson." });
  assert.ok(lessonsOnly.includes('id="project-reflection"') && lessonsOnly.includes("A supplied lesson."));
  assert.ok(!lessonsOnly.includes(`<h3>${projectDetailCopy.challenges}</h3>`));
  const challengesOnly = render({ ...projects[0], challenges: "A supplied challenge.", lessons: null });
  assert.ok(challengesOnly.includes('id="project-reflection"') && !challengesOnly.includes(`<h3>${projectDetailCopy.lessons}</h3>`));
});

test("concepts and prototypes explicitly remain unfinished on detail pages", () => {
  const concept = render(getProjectBySlug("peer-skill-swap")!);
  assert.ok(concept.includes(projectDetailCopy.conceptNote) && concept.includes('id="project-status"'));
  assert.ok(!concept.includes('id="project-overview"'));
  const prototype = render({ ...projects[0], status: "prototype", statusDetail: null });
  assert.ok(prototype.includes(projectDetailCopy.prototypeNote));
});

test("previous and next follow public order, do not wrap, and exclude review-only projects", () => {
  assert.equal(getAdjacentProjects("repograde").previous, null);
  assert.equal(getAdjacentProjects("repograde").next?.slug, "hindsight");
  assert.equal(getAdjacentProjects("hindsight").previous?.slug, "repograde");
  assert.equal(getAdjacentProjects("hindsight").next?.slug, "playhub");
  assert.equal(getAdjacentProjects("receipt-scanner").next, null);
  assert.deepEqual(getAdjacentProjects("missing"), { previous: null, next: null });
  assert.deepEqual(getAdjacentProjects("agrisetu", projects), { previous: null, next: null });
  const publicSlugs = new Set(getPublicProjects().map((p) => p.slug));
  for (const project of getPublicProjects()) {
    const adjacent = getAdjacentProjects(project.slug, [...projects].reverse());
    for (const neighbor of [adjacent.previous, adjacent.next]) if (neighbor) assert.ok(publicSlugs.has(neighbor.slug));
  }
  const { previous, next } = getAdjacentProjects("hindsight");
  const html = renderToStaticMarkup(<ProjectDetail project={getProjectBySlug("hindsight")!} previous={previous} next={next} />);
  const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(anchors.some((tag) => tag.includes('href="/projects/repograde"') && tag.includes('rel="prev"')));
  assert.ok(anchors.some((tag) => tag.includes('href="/projects/playhub"') && tag.includes('rel="next"')));
});
