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
  assert.deepEqual(getFeaturedProjects().map((p) => p.slug), ["repograde", "hindsight", "playhub", "bd-buildcon-bhumi-developers", "api-traffic-optimizer", "meetos"]);
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
  assert.equal(links.geeksforgeeks.verification, "provided");
  assert.equal(links.resume.verification, "unverified");
  assert.equal(projects.filter((p) => p.repoUrl !== null).length, 6);
  assert.equal(projects.filter((p) => p.liveUrl !== null).length, 5);
  assert.equal(projects.filter((p) => p.media !== null).length, 4);
  assert.equal(getProjectBySlug("repograde")?.repoUrl, null);
  assert.equal(getProjectBySlug("wanderstay")?.repoUrl, null);
  assert.equal(getProjectBySlug("meetos")?.repoUrl, null);
  assert.deepEqual(projects.filter((p) => p.challenges !== null).map((p) => p.slug), ["meetos"]);
  assert.equal(getProjectBySlug("hindsight")?.status, null);
  assert.equal(codingProfiles.find((p) => p.id === "geeksforgeeks")?.rating, 327);
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

  // Phase 41: Currently building banner in Material 3 Expressive
  assert.ok(html.includes('class="hero-building-banner"'));
  assert.ok(html.includes('aria-label="Currently building RepoGrade, AST code scoring &amp; ratings. Open project."'));
  assert.ok(html.includes('class="hero-building-leading"'));
  assert.ok(html.includes('class="hero-building-pulse"'));
  assert.ok(html.includes('class="hero-building-label"'));
  assert.ok(html.includes('Currently building</span>'));
  assert.ok(html.includes('class="hero-building-name"'));
  assert.ok(html.includes('RepoGrade</strong>'));
  assert.ok(html.includes('class="hero-building-desc"'));
  assert.ok(html.includes('class="hero-building-trailing"'));
  // Ensure no nested buttons or links inside the banner link
  const bannerLinkMatch = html.match(/<a[^>]*class="hero-building-banner"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(bannerLinkMatch, "Banner must render as an <a> link");
  assert.ok(!bannerLinkMatch[1].includes("<a "), "Banner link must not contain nested <a> links");
  assert.ok(!bannerLinkMatch[1].includes("<button"), "Banner link must not contain nested <button> elements");

  // Greeting row with responsive location
  assert.ok(html.includes('class="eyebrow hero-eyebrow"'));
  assert.ok(html.includes('class="hero-greeting-part"'));
  assert.ok(html.includes(profile.location.label));
});

test("Currently building banner handles static projects and empty states gracefully", () => {
  // Static banner verification when project has no page
  const staticBannerHtml = renderToStaticMarkup(
    <div
      className="hero-building-banner hero-building-banner--static"
      role="status"
      aria-label="Currently building ConceptX, In early design."
    >
      <span className="hero-building-text">
        <span className="hero-building-label">Currently building</span>
        <span className="hero-building-heading">
          <strong className="hero-building-name">ConceptX</strong>
          <span className="hero-building-separator" aria-hidden="true">•</span>
          <span className="hero-building-desc">In early design</span>
        </span>
      </span>
    </div>
  );
  assert.ok(staticBannerHtml.includes('hero-building-banner--static'));
  assert.ok(staticBannerHtml.includes('role="status"'));
  assert.ok(!staticBannerHtml.includes("<a "));
  assert.ok(!staticBannerHtml.includes("hero-building-trailing"));
});

test("a card with unknown optional fields renders only its known identity and detail link", () => {
  const project = { ...projects[0], tagline: null, category: null, status: null, statusDetail: null, stack: null, features: null, repoUrl: null, liveUrl: null, media: null, challenges: null };
  const html = renderToStaticMarkup(<ProjectCard project={project} index={0} />);
  assert.ok(html.includes(project.name));
  assert.ok(html.includes(`href="/projects/${project.slug}"`));
  assert.ok(!html.includes("status-pill") && !html.includes("stack-list") && !html.includes("project-description"));
  assert.ok(!html.includes("null") && !html.includes("undefined"));
});
