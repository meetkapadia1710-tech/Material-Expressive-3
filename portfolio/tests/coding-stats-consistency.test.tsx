import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AchievementsPage } from "../components/achievements/achievements-page";
import { LeetCodeWidget } from "../components/achievements/leetcode-widget";
import { PlatformProfileCard } from "../components/achievements/platform-profile-card";
import { GitHubSection } from "../components/achievements/github-section";
import { HomePage } from "../components/home/home-page";
import { AboutPage } from "../components/about/about-page";
import { achievementsData } from "../lib/achievements";
import { clearCodingStatsCacheForTests } from "../lib/coding-stats-cache";
import {
  assertDevCodingStatProvenance,
  CODING_STATS_REVALIDATE_SECONDS,
  resetDevProvenanceWarningsForTests,
} from "../lib/coding-stats-core";
import { buildLeetCodeStats, getCachedLeetCodeStats } from "../lib/leetcode";
import { getCachedGFGStats } from "../lib/geeksforgeeks";
import { getCachedGitHubStats } from "../lib/github";
import { getCachedGitHubCalendar } from "../lib/github-calendar";
import {
  buildAchievementsJsonLd,
  buildResumeCodingLines,
  extractCommandCodingItems,
  fetchCodingStatsUncached,
  stampCodingStatsBundle,
} from "../lib/coding-stats";
import { getSkillDetail } from "../lib/skill-projects";
import { achievementsPageCopy as copy, codingProfiles } from "../content/achievements";

function mockUpstreamFetch(options: {
  easy?: number;
  medium?: number;
  hard?: number;
  apiTotal?: number;
  gfgScore?: number;
  gfgProblems?: number;
  publicRepos?: number;
  failAll?: boolean;
}) {
  const easy = options.easy ?? 372;
  const medium = options.medium ?? 340;
  const hard = options.hard ?? 56;
  const apiTotal = options.apiTotal ?? easy + medium + hard;
  const gfgScore = options.gfgScore ?? 327;
  const gfgProblems = options.gfgProblems ?? 111;
  const publicRepos = options.publicRepos ?? 12;

  return (async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (options.failAll) {
      return new Response(null, { status: 503 });
    }
    if (url.includes("leetcode.com/graphql")) {
      return Response.json({
        data: {
          matchedUser: {
            submitStats: {
              acSubmissionNum: [
                { difficulty: "All", count: apiTotal },
                { difficulty: "Easy", count: easy },
                { difficulty: "Medium", count: medium },
                { difficulty: "Hard", count: hard },
              ],
            },
          },
          recentAcSubmissionList: [
            { title: "Minimum Cost to Acquire Required Items", titleSlug: "minimum-cost-to-acquire-required-items", timestamp: "1794390953" },
          ],
        },
      });
    }
    if (url.includes("geeksforgeeks.org/profile/")) {
      return new Response(
        `<script>{"score":${gfgScore},"total_problems_solved":${gfgProblems},"institute_rank":304}</script>`,
        { status: 200 },
      );
    }
    if (url.includes("api.github.com/users/") && url.includes("/repos?")) {
      return Response.json([
        {
          name: "Material-Expressive-3",
          html_url: "https://github.com/meetkapadia1710-tech/Material-Expressive-3",
          language: "TypeScript",
          updated_at: "2026-11-11T10:00:00Z",
          pushed_at: "2026-11-11T10:00:00Z",
        },
      ]);
    }
    if (url.includes("api.github.com/users/")) {
      return Response.json({ public_repos: publicRepos, followers: 4 });
    }
    if (url.includes("github.com/users/") && url.includes("/contributions")) {
      const html = `
        <table><tbody>
          <tr>
            <td id="day-1" data-date="2026-11-10" data-level="2"></td>
            <td id="day-2" data-date="2026-11-11" data-level="3"></td>
          </tr>
        </tbody></table>
        <tool-tip for="day-1">100 contributions on November 10.</tool-tip>
        <tool-tip for="day-2">609 contributions on November 11.</tool-tip>
      `;
      return new Response(html, { status: 200 });
    }
    return new Response(null, { status: 404 });
  }) as typeof fetch;
}

test("all coding stats consumers display identical single-source values without hardcoded overrides", async () => {
  clearCodingStatsCacheForTests(true);
  const bundle = await fetchCodingStatsUncached({
    request: mockUpstreamFetch({ easy: 372, medium: 340, hard: 56, gfgScore: 327, gfgProblems: 111, publicRepos: 12 }),
  });

  assert.equal(bundle.revalidateSeconds, CODING_STATS_REVALIDATE_SECONDS);
  assert.equal(bundle.leetcode?.total, 768);
  assert.equal(bundle.geeksforgeeks?.problemsSolved, 111);
  assert.equal(bundle.geeksforgeeks?.score, 327);
  assert.equal(bundle.codechef?.rating, 1462);
  assert.equal(bundle.codechef?.source, "manual");
  assert.equal(bundle.github.stats?.publicRepos, 12);
  assert.equal(bundle.github.calendar?.totalContributions, 709);

  const githubEl = await GitHubSection({ codingStats: bundle });
  const achievementsHtml = renderToStaticMarkup(
    <AchievementsPage data={achievementsData} codingStats={bundle}>
      {githubEl}
    </AchievementsPage>,
  ).replace(/<!--.*?-->/g, "");

  // Card, donut ring, filter chips, progress bars, SR table all agree on 768 = 372 + 340 + 56
  assert.ok(achievementsHtml.includes(">768</dd>"));
  assert.ok(achievementsHtml.includes('All (768)'));
  assert.ok(achievementsHtml.includes('Easy (372)'));
  assert.ok(achievementsHtml.includes('Med (340)'));
  assert.ok(achievementsHtml.includes('Hard (56)'));
  assert.ok(achievementsHtml.includes('709'));
  assert.ok(!/\b763\b/.test(achievementsHtml) && !/\b767\b/.test(achievementsHtml) && !achievementsHtml.includes("111+"));

  // Cross-page consumers
  const homeHtml = renderToStaticMarkup(<HomePage leetCodeStats={bundle.leetcode} />).replace(/<!--.*?-->/g, "");
  assert.ok(homeHtml.includes(">768<") && !homeHtml.includes("650+"));

  const aboutHtml = renderToStaticMarkup(<AboutPage leetCodeStats={bundle.leetcode} />).replace(/<!--.*?-->/g, "");
  assert.ok(aboutHtml.includes("768 LeetCode solved") && !aboutHtml.includes("650+"));

  const resumeCopy = buildResumeCodingLines(bundle);
  assert.ok(resumeCopy.headerLine.includes("768 solved, 340 Medium"));
  assert.ok(resumeCopy.sectionText.includes("LeetCode: 768 Solved (372 Easy, 340 Medium, 56 Hard)"));
  assert.ok(resumeCopy.sectionText.includes("GeeksforGeeks: 111 Solved, 327 Score"));
  assert.ok(resumeCopy.sectionText.includes("CodeChef: 1462 Rating"));
  assert.ok(!resumeCopy.sectionText.includes("763+") && !resumeCopy.sectionText.includes("111+"));

  // Skills drawer helpers
  const cppDetail = getSkillDetail("C++", bundle.leetcode);
  const dsaDetail = getSkillDetail("DSA", bundle.leetcode);
  assert.ok(cppDetail?.description.includes("768") && cppDetail.highlights?.[0].includes("372 Easy, 340 Medium, 56 Hard"));
  assert.ok(dsaDetail?.description.includes("768") && dsaDetail.highlights?.[0].includes("768"));

  // Command palette & JSON-LD
  const cmdItems = extractCommandCodingItems(bundle);
  assert.ok(cmdItems.some((entry) => entry.label.includes("768")));
  assert.ok(cmdItems.some((entry) => entry.label.includes("111 solved")));
  assert.ok(cmdItems.some((entry) => entry.label.includes("12 public repos")));

  const jsonLd = buildAchievementsJsonLd(bundle);
  const desc = (jsonLd.mainEntity as { description: string }).description;
  assert.ok(desc.includes("LeetCode: 768 solved") && desc.includes("CodeChef: 1462") && desc.includes("GitHub: 709"));
});

test("buildLeetCodeStats logs a single warning and derives total from difficulty buckets on API mismatch", (t) => {
  const warnings: string[] = [];
  t.mock.method(console, "warn", (msg: unknown) => {
    warnings.push(String(msg));
  });

  const stats = buildLeetCodeStats({
    username: "Code-Hacker_17",
    easy: 372,
    medium: 340,
    hard: 56,
    apiTotal: 767,
    recent: [],
    fetchedAt: "2026-11-11T10:00:00.000Z",
    source: "live",
  });

  assert.equal(stats.total, 768);
  assert.equal(stats.totalDisplay, "768");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /767.*768/);
});

test("failed upstream fetch serves last good cached value with As of date, and empty outage hides stats cleanly", async () => {
  clearCodingStatsCacheForTests(true);

  // 1. Seed good live cache
  const seeded = await fetchCodingStatsUncached({
    request: mockUpstreamFetch({ easy: 372, medium: 340, hard: 56, gfgProblems: 111, gfgScore: 327 }),
  });
  assert.equal(seeded.leetcode?.source, "live");

  // 2. Subsequent upstream failure falls back to cache with source === "cache"
  const [lcCached, gfgCached, ghStatsCached, ghCalCached] = await Promise.all([
    getCachedLeetCodeStats({ request: mockUpstreamFetch({ failAll: true }) }),
    getCachedGFGStats({ request: mockUpstreamFetch({ failAll: true }) }),
    getCachedGitHubStats({ request: mockUpstreamFetch({ failAll: true }) }),
    getCachedGitHubCalendar({ request: mockUpstreamFetch({ failAll: true }) }),
  ]);

  assert.equal(lcCached?.source, "cache");
  assert.equal(lcCached?.total, 768);
  assert.equal(gfgCached?.source, "cache");
  assert.equal(gfgCached?.problemsSolved, 111);
  assert.equal(ghStatsCached?.source, "cache");
  assert.equal(ghStatsCached?.publicRepos, 12);
  assert.equal(ghCalCached?.source, "cache");
  assert.equal(ghCalCached?.totalContributions, 709);

  const cachedBundle = stampCodingStatsBundle({
    leetcode: lcCached,
    geeksforgeeks: gfgCached,
    codechef: seeded.codechef,
    github: { stats: ghStatsCached, calendar: ghCalCached },
  });

  const cachedGithubEl = await GitHubSection({ codingStats: cachedBundle });
  const cachedHtml = renderToStaticMarkup(
    <AchievementsPage data={achievementsData} codingStats={cachedBundle}>
      {cachedGithubEl}
    </AchievementsPage>,
  );
  assert.ok(cachedHtml.includes("Cached"));
  assert.ok(cachedHtml.includes("As of"));
  assert.ok(!cachedHtml.includes("Repository data from GitHub"));

  // 3. Complete cold outage with empty cache hides dynamic stats cleanly (no hardcoded fallback numbers)
  clearCodingStatsCacheForTests(true);
  const emptyOutageBundle = await fetchCodingStatsUncached({
    request: mockUpstreamFetch({ failAll: true }),
  });
  assert.equal(emptyOutageBundle.leetcode, null);
  assert.equal(emptyOutageBundle.geeksforgeeks, null);
  assert.equal(emptyOutageBundle.github.stats, null);
  assert.equal(emptyOutageBundle.github.calendar, null);

  const outageGithubEl = await GitHubSection({ codingStats: emptyOutageBundle });
  const outageHtml = renderToStaticMarkup(
    <AchievementsPage data={achievementsData} codingStats={emptyOutageBundle}>
      {outageGithubEl}
    </AchievementsPage>,
  );
  assert.ok(!outageHtml.includes("leetcode-widget"));
  assert.ok(outageHtml.includes("Stats temporarily unavailable"));
  assert.ok(outageHtml.includes("GitHub contribution data is currently unavailable."));
  assert.ok(!outageHtml.includes("763") && !outageHtml.includes("650+") && !outageHtml.includes("Material-Expressive-3"));
});

test("PlatformProfileCard renders a single top-level link and a single trailing arrow icon", () => {
  const html = renderToStaticMarkup(
    <PlatformProfileCard
      profile={{
        ...codingProfiles[0],
        label: "LeetCode",
        href: "https://leetcode.com/u/Code-Hacker_17/",
        problemsSolved: 768,
        fetchedAt: "2026-11-11T10:00:00.000Z",
        source: "live",
      }}
      labels={{
        problemsLabel: copy.problemsLabel,
        ratingLabel: copy.ratingLabel,
        scoreLabel: copy.scoreLabel,
        updatedLabel: copy.updatedLabel,
      }}
    />,
  );

  assert.equal((html.match(/<a\b/g) ?? []).length, 1);
  assert.equal((html.match(/<svg\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<h3[^>]*>[\s\S]*?<a\b/);
  assert.equal((html.match(/platform-action-button/g) ?? []).length, 1);
});

test("development runtime guard warns when a UI component receives unbranded hardcoded coding stats", (t) => {
  const prevEnv = process.env.NODE_ENV;
  const warnings: string[] = [];
  t.mock.method(console, "warn", (msg: unknown) => {
    warnings.push(String(msg));
  });
  resetDevProvenanceWarningsForTests();
  (process.env as Record<string, string | undefined>).NODE_ENV = "development";

  try {
    renderToStaticMarkup(
      <LeetCodeWidget
        stats={{
          total: 999,
          totalDisplay: "999",
          easy: { count: 100, percentage: 10 },
          medium: { count: 800, percentage: 80, tagLabel: "Core" },
          hard: { count: 99, percentage: 10 },
          patterns: [],
        }}
      />,
    );
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /CodingStatsGuard.*LeetCodeWidget/);

    resetDevProvenanceWarningsForTests();
    const valid = buildLeetCodeStats({
      username: "Code-Hacker_17",
      easy: 372,
      medium: 340,
      hard: 56,
      recent: [],
    });
    assertDevCodingStatProvenance(valid, "LeetCodeWidget");
    assert.equal(warnings.length, 1);
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
    resetDevProvenanceWarningsForTests();
  }
});
