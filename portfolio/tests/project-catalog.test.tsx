import assert from "node:assert/strict";
import test from "node:test";
import { projects } from "../content/projects";
import { ALL_PROJECTS, WITHOUT_VALUE, filterProjects, getProjectCategories, getProjectGroup, groupProjects } from "../lib/project-catalog";

test("every supplied project appears exactly once in the three groups", () => {
  const groups = groupProjects(projects);
  assert.equal(groups.featured.length, 5);
  assert.equal(groups.more.length, 3);
  assert.equal(groups.explorations.length, 12);
  const grouped = Object.values(groups).flat();
  assert.equal(grouped.length, projects.length);
  assert.equal(new Set(grouped.map((p) => p.slug)).size, projects.length);
  assert.equal(groups.featured[0].slug, "repograde");
  assert.ok(groups.explorations.every((p) => p.status === "concept" || p.status === "prototype"));
  assert.equal(groups.explorations.filter((p) => p.visibility === "review").length, 5);
});

test("category and status filters intersect rather than overwrite each other", () => {
  assert.deepEqual(filterProjects(projects, { category: "Corporate websites", status: "shipped" }).map((p) => p.slug), ["bd-buildcon-bhumi-developers"]);
  assert.deepEqual(filterProjects(projects, { category: "Local AI", status: "shipped" }), []);
  assert.deepEqual(filterProjects(projects, { category: "Local AI", status: ALL_PROJECTS }).map((p) => p.slug), ["hindsight"]);
});

test("missing values are filterable without inventing a category or status", () => {
  assert.equal(filterProjects(projects, { category: WITHOUT_VALUE, status: "concept" }).length, 7);
  assert.equal(filterProjects(projects, { category: ALL_PROJECTS, status: WITHOUT_VALUE }).length, 6);
  assert.ok(filterProjects(projects, { category: ALL_PROJECTS, status: WITHOUT_VALUE }).every((p) => p.status === null));
  assert.ok(!getProjectCategories(projects).includes("null"));
  assert.equal(getProjectCategories(projects).length, 8);
});

test("prototype/concept classification takes priority over a future featured flag", () => {
  assert.equal(getProjectGroup({ ...projects[0], status: "concept", featured: true }), "explorations");
  assert.equal(getProjectGroup({ ...projects[0], status: "prototype", featured: true }), "explorations");
  assert.equal(getProjectGroup({ ...projects[0], visibility: "review", featured: true }), "explorations");
});

test("filters and grouping preserve content order without mutating the input", () => {
  const reversed = [...projects].reverse();
  const before = reversed.map((p) => p.slug);
  const result = filterProjects(reversed, { category: ALL_PROJECTS, status: ALL_PROJECTS });
  assert.deepEqual(result.map((p) => p.slug), projects.map((p) => p.slug));
  assert.deepEqual(groupProjects(reversed).more.map((p) => p.slug), ["learnflex", "mann-beauty-studio", "wanderstay"]);
  assert.deepEqual(reversed.map((p) => p.slug), before);
});
