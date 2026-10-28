import test from "node:test";
import assert from "node:assert/strict";
import { getGitHubStats } from "../lib/github";
import { filterProjects, ALL_PROJECTS } from "../lib/project-catalog";
import { projects } from "../content/projects";
test("search is case insensitive and intersects category and status", () => {
  assert.ok(filterProjects(projects, { category: ALL_PROJECTS, status: ALL_PROJECTS, query: "oLLaMa" }).some(p => p.slug === "hindsight"));
  assert.equal(filterProjects(projects, { category: ALL_PROJECTS, status: "shipped", query: "oLLaMa" }).length, 0);
  assert.equal(filterProjects(projects, { category: ALL_PROJECTS, status: ALL_PROJECTS, query: "no-such-project-xyz" }).length, 0);
});
test("blocked and rate-limited GitHub fetches hide the section", async () => {
  assert.equal(await getGitHubStats(async () => { throw new Error("Blocked"); }), null);
  assert.equal(await getGitHubStats(async () => new Response("", {status:403})), null);
});
test("GitHub aggregates only actual API data and preserves explicit zero counts", async () => {
  const request: typeof fetch = async (url) => new Response(JSON.stringify(String(url).includes("/repos?") ? [{name:"fixture",html_url:"https://github.com/example/fixture",language:"TypeScript",updated_at:"2026-10-01T00:00:00Z",pushed_at:"2026-09-01T00:00:00Z"}] : {public_repos:1,followers:0}));
  const result = await getGitHubStats(request);
  assert.equal(result?.followers, 0);
  assert.deepEqual(result?.languages, [["TypeScript",1]]);
  assert.deepEqual(result?.activity, [["2026-09",1]]);
});
