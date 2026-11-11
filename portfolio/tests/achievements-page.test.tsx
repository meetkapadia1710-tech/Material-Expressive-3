import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AchievementsPage } from "../components/achievements/achievements-page";
import { achievementsData, getAchievementsContent, type AchievementsData } from "../lib/achievements";
import { buildGFGProfileStats } from "../lib/geeksforgeeks";
import { getCodeChefStats } from "../lib/codechef";
import { buildLeetCodeStats } from "../lib/leetcode";
import { stampCodingStatsBundle, type CodingStatsBundle } from "../lib/coding-stats";
import { achievementsPageCopy as copy, codingProfiles, experience, hackathons, problemSolvingTopics } from "../content/achievements";
import { links } from "../content/links";

const sampleCodingStats: CodingStatsBundle = stampCodingStatsBundle({
  leetcode: buildLeetCodeStats({
    username: "Code-Hacker_17",
    easy: 372,
    medium: 340,
    hard: 56,
    recent: [
      { title: "Minimum Cost to Acquire Required Items", titleSlug: "minimum-cost-to-acquire-required-items", timestamp: "1794390953" },
    ],
    fetchedAt: "2026-11-11T10:00:00.000Z",
    source: "live",
  }),
  geeksforgeeks: buildGFGProfileStats({
    username: "meetkapa9w1y",
    score: 327,
    problemsSolved: 111,
    instituteRank: 304,
    fetchedAt: "2026-11-11T10:00:00.000Z",
    source: "live",
  }),
  codechef: getCodeChefStats(),
  fetchedAt: "2026-11-11T10:00:00.000Z",
});

const empty: AchievementsData = { experience: [], hackathons: [], certifications: [], codingProfiles: [], topics: [], links: {} };
const render = (data: AchievementsData = achievementsData, codingStats?: CodingStatsBundle | null) =>
  renderToStaticMarkup(<AchievementsPage data={data} codingStats={codingStats} />);

test("all requested achievement sections render from the supplied content", () => {
  const content = getAchievementsContent(achievementsData, sampleCodingStats);
  assert.equal(content.experience.length, 1);
  assert.equal(content.hackathons.length, 2);
  assert.equal(content.certifications.length, 4);
  assert.equal(content.profiles.length, 3);
  const html = render(achievementsData, sampleCodingStats);
  const sections = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, ["achievement-experience", "achievement-hackathons", "achievement-certifications", "achievement-coding"]);
  assert.ok(!html.includes("Adobe") && !html.includes("Round 2") && !html.includes("Codolio"));
  assert.ok(html.includes("GeeksforGeeks"));
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
    { ...codingProfiles[2], linkId: "resume" },
  ] });
  assert.ok(html.includes(copy.empty.title));
  for (const label of ["LeetCode", "CodeChef", "GeeksforGeeks", "768", "1462"]) assert.ok(!html.includes(label));
});

test("coding links and single-source statistics keep cards and widgets in sync with null metrics omitted", () => {
  const html = render(achievementsData, sampleCodingStats);
  const cleanHtml = html.replace(/<!--.*?-->/g, "");
  for (const id of ["leetcode", "codechef", "geeksforgeeks"] as const) assert.ok(html.includes(`href="${links[id].href}"`));
  assert.ok(cleanHtml.includes("768"));
  assert.ok(cleanHtml.includes("All (768)"));
  assert.ok(cleanHtml.includes("Easy (372)"));
  assert.ok(cleanHtml.includes("Med (340)"));
  assert.ok(cleanHtml.includes("Hard (56)"));
  assert.ok(cleanHtml.includes("1462") && cleanHtml.includes("Manual"));
  assert.ok(cleanHtml.includes("111") && cleanHtml.includes("327") && !cleanHtml.includes("111+"));

  // Platform cards use a single link wrapper with zero nested interactive anchors or buttons
  const profileCards = [...cleanHtml.matchAll(/<a[^>]*class="coding-profile[^"]*"[^>]*>[\s\S]*?<\/a>/g)];
  assert.equal(profileCards.length, 3);
  for (const [cardHtml] of profileCards) {
    assert.equal((cardHtml.match(/<a\b/g) ?? []).length, 1);
    assert.equal((cardHtml.match(/<button\b/g) ?? []).length, 0);
    const headerArrows = cardHtml.match(/platform-action-button/g) ?? [];
    assert.equal(headerArrows.length, 1);
  }

  // Empty stats bundle hides dynamic metrics and widget cleanly
  const emptyStats = stampCodingStatsBundle({ leetcode: null, geeksforgeeks: null, codechef: null, fetchedAt: "2026-11-11T10:00:00.000Z" });
  const emptyHtml = render(achievementsData, emptyStats).replace(/<!--.*?-->/g, "");
  assert.ok(!emptyHtml.includes("coding-metrics"));
  assert.ok(!emptyHtml.includes("leetcode-widget"));
  assert.ok(!emptyHtml.includes("768"));

  // Test-only edited synthetic counts demonstrate data-driven rendering when codingStats is omitted
  const edited = render({ ...empty, links, codingProfiles: [{ ...codingProfiles[0], problemsSolved: 123, problemsQualifier: "+" }] });
  assert.ok(edited.replace(/<!--.*?-->/g, "").includes("123+"));
  assert.ok(!edited.includes("768"));
  const zeros = render({ ...empty, links, codingProfiles: [{ ...codingProfiles[0], problemsSolved: 0, problemsQualifier: null, rating: 0 }] });
  assert.equal((zeros.match(/<dd[^>]*>0<\/dd>/g) ?? []).length, 2);
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
  const html = render(achievementsData, sampleCodingStats);
  for (const topic of problemSolvingTopics) assert.ok(html.includes(`<li>${topic}</li>`));
});

test("unknown document URLs render known document names without fabricated links", () => {
  const html = render({ ...empty, experience });
  assert.ok(html.includes("Certificate of internship") && html.includes("Letter of recommendation"));
  assert.ok(!html.includes("<a "));
  const fixture = { ...experience[0], documents: [{ label: "Test document", url: "https://example.test/document" }] };
  assert.ok(render({ ...empty, experience: [fixture] }).includes('href="https://example.test/document"'));
});

test("documents lists render with M3 assist chip classes, no bullet lists, and proper accessibility", () => {
  const html = render(achievementsData, sampleCodingStats);
  assert.ok(html.includes('class="achievement-doc-chips"'));
  assert.ok(html.includes('class="achievement-doc-chip'));
  assert.ok(!html.includes('achievement-documents"><ul>'));
  assert.ok(!html.includes('achievement-documents"><p>Documents</p><ul>'));
  assert.ok(html.includes("opens in a new tab"));
  assert.ok(html.includes("GitHub submission"));
  assert.ok(html.includes("Certificate of Competency (PDF)"));
  assert.ok(html.includes("achievements-nav-sticky"));
  assert.ok(html.includes("achievements-nav-pill"));
  assert.ok(html.includes('role="radiogroup"'));
  assert.ok(html.includes("nav-sliding-indicator"));
  assert.ok(html.includes("nav-segment-button"));
  assert.ok(html.includes("pill-scroll-track"));
  assert.ok(html.includes("Hackathons") && html.includes("Certifications") && html.includes("Coding Profiles"));
});

test("achievement cards render shared 6-slot subgrid structure with credential ID truncation and M3 difficulty segment control", () => {
  const html = render(achievementsData, sampleCodingStats);

  assert.ok(html.includes("achievement-card"));
  assert.ok(html.includes("achievement-card-header"));
  assert.ok(html.includes("achievement-card-shape-slot"));
  assert.ok(html.includes("achievement-card-title-slot"));
  assert.ok(html.includes("achievement-card-org-slot"));
  assert.ok(html.includes("achievement-card-desc-slot"));
  assert.ok(html.includes("achievement-card-tech-slot"));
  assert.ok(html.includes("achievement-card-footer"));

  assert.ok(html.includes("achievement-id-chip"));
  assert.ok(html.includes("achievement-id-copy-btn"));
  assert.ok(html.includes("iCYD7o...pwJA"));

  assert.ok(html.includes("leetcode-segmented-group"));
  assert.ok(html.includes("leetcode-segmented-indicator"));
  assert.ok(html.includes("segmented-button"));
  assert.ok(html.includes("segment-all"));
  assert.ok(html.includes("segment-easy"));
  assert.ok(html.includes("segment-medium"));
  assert.ok(html.includes("segment-hard"));
  assert.ok(html.includes("segmented-dot dot-easy"));
  assert.ok(html.includes("segmented-dot dot-medium"));
  assert.ok(html.includes("segmented-dot dot-hard"));
});
