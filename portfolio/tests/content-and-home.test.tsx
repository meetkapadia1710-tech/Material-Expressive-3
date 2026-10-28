import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage } from "../components/home/home-page";
import { ProjectCard } from "../components/home/project-card";
import { projects, getFeaturedProjects, getProjectBySlug, getPublicProjects } from "../content/projects";
import { homeCopy, profile } from "../content/profile";
import { links } from "../content/links";
import { skills } from "../content/skills";
import { hackathons, codingProfiles } from "../content/achievements";

test("featured order and links preserve the supplied selection", () => {
  assert.deepEqual(getFeaturedProjects().map((p) => p.slug), ["repograde", "hindsight", "playhub", "bd-buildcon-bhumi-developers", "api-traffic-optimizer"]);
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  for (const p of getFeaturedProjects()) assert.equal(getProjectBySlug(p.slug)?.name, p.name);
});

test("uncertain work and achievements cannot be surfaced as finished", () => {
  assert.equal(hackathons.find((a) => a.id === "adobe")?.visibility, "review");
  for (const p of projects.filter((p) => p.visibility === "review")) {
    assert.equal(p.status, "prototype");
    assert.equal(p.repoUrl, null);
    assert.equal(getProjectBySlug(p.slug), null);
  }
  for (const p of projects.filter((p) => p.order >= 9 && p.order <= 15)) assert.ok(p.status === "concept" || p.status === "prototype");
  assert.equal(getProjectBySlug("does-not-exist"), null);
  assert.equal(getPublicProjects().some((p) => p.visibility === "review"), false);
});

test("unknown and unverified fields remain explicit", () => {
  assert.equal(profile.phone, null);
  assert.equal(profile.education.cgpaScale, null);
  assert.equal(links.geeksforgeeks.verification, "unverified");
  assert.equal(links.resume.verification, "unverified");
  assert.equal(projects.filter((p) => p.repoUrl !== null).length, 1);
  assert.ok(projects.every((p) => p.liveUrl === null && p.media === null && p.challenges === null));
  assert.equal(getProjectBySlug("hindsight")?.status, null);
  assert.equal(codingProfiles.find((p) => p.id === "codolio")?.rating, null);
});

test("Home uses content, the project scroll target, all featured routes and skill categories", () => {
  const html = renderToStaticMarkup(<HomePage />);
  assert.ok(html.includes('href="#selected-projects"'));
  assert.ok(html.includes('id="selected-projects"'));
  assert.ok(html.includes(profile.headline));
  assert.ok(html.includes(homeCopy.workCta.label));
  assert.ok(html.includes(homeCopy.contactCta.label));
  assert.ok(html.includes(homeCopy.githubCta.label));
  assert.equal(profile.heroLabels.length, 4);
  for (const p of getFeaturedProjects()) assert.ok(html.includes(`href="/projects/${p.slug}"`));
  for (const group of skills) assert.ok(html.includes(group.name));
  assert.ok(html.includes('href="/skills"'));
  assert.ok(html.includes('href="mailto:meetkapadia1710@gmail.com"'));
  assert.ok(!html.includes("Agrisetu") && !html.includes("Adobe") && !html.includes("null"));
});

test("a card with unknown optional fields renders only its known identity and detail link", () => {
  const project = { ...projects[0], tagline: null, category: null, status: null, statusDetail: null, stack: null, features: null, repoUrl: null, liveUrl: null, media: null, challenges: null };
  const html = renderToStaticMarkup(<ProjectCard project={project} index={0} />);
  assert.ok(html.includes(project.name));
  assert.ok(html.includes(`href="/projects/${project.slug}"`));
  assert.ok(!html.includes("status-pill") && !html.includes("stack-list") && !html.includes("project-description"));
  assert.ok(!html.includes("null") && !html.includes("undefined"));
});
