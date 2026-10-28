import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AchievementsPage } from "../components/achievements/achievements-page";
import { achievementsData, getAchievementsContent, type AchievementsData } from "../lib/achievements";
import { achievementsPageCopy as copy, codingProfiles, experience, hackathons, problemSolvingTopics } from "../content/achievements";
import { links } from "../content/links";

const empty: AchievementsData = { experience: [], hackathons: [], certifications: [], codingProfiles: [], topics: [], links: {} };
const render = (data: AchievementsData = achievementsData) => renderToStaticMarkup(<AchievementsPage data={data} />);

test("all requested achievement sections render from the supplied content", () => {
  const content = getAchievementsContent();
  assert.equal(content.experience.length, 1);
  assert.equal(content.hackathons.length, 2);
  assert.equal(content.certifications.length, 3);
  assert.equal(content.profiles.length, 3);
  const html = render();
  const sections = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, ["achievement-experience", "achievement-hackathons", "achievement-certifications", "achievement-coding"]);
  assert.ok(!html.includes("Adobe") && !html.includes("Round 2") && !html.includes("GeeksforGeeks"));
  assert.ok(!html.includes("null") && !html.includes("undefined"));
});

test("unverified or review-only achievements never render, including in otherwise empty sections", () => {
  const unverified = { ...hackathons[0], title: "Hidden unverified entry", verification: "unverified", visibility: "public" } as const;
  const reviewOnly = { ...hackathons[0], title: "Hidden review entry", verification: "provided", visibility: "review" } as const;
  const html = render({ ...empty, experience: [unverified], hackathons: [unverified, reviewOnly], certifications: [reviewOnly] });
  assert.ok(html.includes(copy.empty.title));
  assert.ok(!html.includes("Hidden unverified entry") && !html.includes("Hidden review entry"));
  assert.ok(!html.includes("<section"));
});

test("unverified profile records and profiles with unverified associated links are hidden", () => {
  const html = render({ ...empty, links, codingProfiles: [
    { ...codingProfiles[0], verification: "unverified" },
    { ...codingProfiles[1], visibility: "review" },
    { ...codingProfiles[2], linkId: "geeksforgeeks" },
  ] });
  assert.ok(html.includes(copy.empty.title));
  for (const label of ["LeetCode", "CodeChef", "GeeksforGeeks", "650", "1462"]) assert.ok(!html.includes(label));
});

test("coding links and statistics use config values with null metrics omitted", () => {
  const html = render();
  for (const id of ["leetcode", "codechef", "codolio"] as const) assert.ok(html.includes(`href="${links[id].href}"`));
  assert.ok(html.replace(/<!--.*?-->/g, "").includes("650+"));
  assert.ok(html.includes("1462"));
  const codolio = render({ ...empty, links, codingProfiles: [codingProfiles[2]] });
  assert.ok(codolio.includes("Lucifer_17") && !codolio.includes("<dl") && !codolio.includes(copy.updatedLabel));
  // Test-only edited counts demonstrate data-driven rendering; not portfolio claims.
  const edited = render({ ...empty, links, codingProfiles: [{ ...codingProfiles[0], problemsSolved: 123 }] });
  assert.ok(edited.replace(/<!--.*?-->/g, "").includes("123+"));
  assert.ok(!edited.includes("650"));
  const zeros = render({ ...empty, links, codingProfiles: [{ ...codingProfiles[0], problemsSolved: 0, problemsQualifier: null, rating: 0 }] });
  assert.equal((zeros.match(/<dd>0<\/dd>/g) ?? []).length, 2);
});

test("topics-only, profiles-only and fully empty content omit empty sections gracefully", () => {
  const topicsOnly = render({ ...empty, topics: ["CPU scheduling", "  "] });
  assert.ok(topicsOnly.includes(copy.codingTitle) && topicsOnly.includes("CPU scheduling"));
  assert.ok(!topicsOnly.includes('class="coding-profile"'));
  assert.equal((topicsOnly.match(/<section\b/g) ?? []).length, 1);
  const profilesOnly = render({ ...empty, links, codingProfiles: [codingProfiles[0]] });
  assert.ok(!profilesOnly.includes(copy.topicsTitle));
  const fullyEmpty = render(empty);
  assert.ok(fullyEmpty.includes(copy.empty.title) && !fullyEmpty.includes("<section"));
});

test("the requested topic list is preserved without adding claims of mastery", () => {
  assert.deepEqual(problemSolvingTopics, ["Arrays and strings", "Sliding window", "Trees/BST/AVL/red-black", "Heaps", "BFS/DFS", "Topological sort", "DP", "Greedy", "Binary search", "String matching", "CPU scheduling", "Subnetting"]);
  const html = render();
  for (const topic of problemSolvingTopics) assert.ok(html.includes(`<li>${topic}</li>`));
});

test("unknown document URLs render known document names without fabricated links", () => {
  const html = render({ ...empty, experience });
  assert.ok(html.includes("Certificate of internship") && html.includes("Letter of recommendation"));
  assert.ok(!html.includes("<a "));
  const fixture = { ...experience[0], documents: [{ label: "Test document", url: "https://example.test/document" }] };
  assert.ok(render({ ...empty, experience: [fixture] }).includes('href="https://example.test/document"'));
});
