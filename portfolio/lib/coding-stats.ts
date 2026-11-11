import { cache } from "react";
import { interfaceCopy } from "@/content/interface";
import { links } from "@/content/links";
import { profile } from "@/content/profile";
import {
  CODING_STATS_REVALIDATE_SECONDS,
  buildResumeCodingLines,
  stampCodingStat,
  type CodingSearchEntry,
  type CodingStatsSource,
  type ProvenanceStamped,
} from "./coding-stats-core";
import { getCodeChefStats, type CodeChefProfileStats } from "./codechef";
import { getCachedGFGStats, type GFGProfileStats } from "./geeksforgeeks";
import { getCachedGitHubStats, type GitHubStatsWithMeta } from "./github";
import { getCachedGitHubCalendar, type GitHubCalendarWithMeta } from "./github-calendar";
import { getCachedLeetCodeStats, type LeetCodeStats } from "./leetcode";

export interface CodingStatsBundle extends ProvenanceStamped {
  leetcode: LeetCodeStats | null;
  geeksforgeeks: GFGProfileStats | null;
  codechef: CodeChefProfileStats | null;
  github: {
    stats: GitHubStatsWithMeta | null;
    calendar: GitHubCalendarWithMeta | null;
  };
  fetchedAt: string;
  revalidateSeconds: typeof CODING_STATS_REVALIDATE_SECONDS;
}

export type { CodingSearchEntry };

const dedupe = typeof cache === "function" ? cache : <T extends (...args: never[]) => unknown>(fn: T) => fn;

export async function fetchCodingStatsUncached(options: {
  forceRefresh?: boolean;
  request?: typeof fetch;
} = {}): Promise<CodingStatsBundle> {
  const [leetcode, geeksforgeeks, githubStats, githubCalendar] = await Promise.all([
    getCachedLeetCodeStats({
      username: links.leetcode.value ?? "Code-Hacker_17",
      request: options.request,
      forceRefresh: options.forceRefresh,
    }),
    getCachedGFGStats({
      username: links.geeksforgeeks.value ?? "meetkapa9w1y",
      request: options.request,
      forceRefresh: options.forceRefresh,
    }),
    getCachedGitHubStats({
      username: interfaceCopy.github.username,
      request: options.request,
      forceRefresh: options.forceRefresh,
    }),
    getCachedGitHubCalendar({
      username: interfaceCopy.github.username,
      request: options.request,
      forceRefresh: options.forceRefresh,
    }),
  ]);

  const codechef = getCodeChefStats();

  return stampCodingStat({
    leetcode,
    geeksforgeeks,
    codechef,
    github: {
      stats: githubStats,
      calendar: githubCalendar,
    },
    fetchedAt: new Date().toISOString(),
    revalidateSeconds: CODING_STATS_REVALIDATE_SECONDS,
  });
}

/**
 * Deduplicated per-request single entrypoint for all coding platform stats.
 */
export const getCodingStats = dedupe(async () => fetchCodingStatsUncached());

export function stampCodingStatsBundle(partial: {
  leetcode?: LeetCodeStats | null;
  geeksforgeeks?: GFGProfileStats | null;
  codechef?: CodeChefProfileStats | null;
  github?: {
    stats?: GitHubStatsWithMeta | null;
    calendar?: GitHubCalendarWithMeta | null;
  };
  fetchedAt?: string;
}): CodingStatsBundle {
  return stampCodingStat({
    leetcode: partial.leetcode ? stampCodingStat(partial.leetcode) : null,
    geeksforgeeks: partial.geeksforgeeks ? stampCodingStat(partial.geeksforgeeks) : null,
    codechef: partial.codechef ? stampCodingStat(partial.codechef) : null,
    github: {
      stats: partial.github?.stats ? stampCodingStat(partial.github.stats) : null,
      calendar: partial.github?.calendar ? stampCodingStat(partial.github.calendar) : null,
    },
    fetchedAt: partial.fetchedAt ?? new Date().toISOString(),
    revalidateSeconds: CODING_STATS_REVALIDATE_SECONDS,
  });
}

export function extractCommandCodingItems(bundle: CodingStatsBundle | null | undefined): CodingSearchEntry[] {
  if (!bundle) return [];
  const entries: CodingSearchEntry[] = [];

  if (bundle.leetcode) {
    entries.push({
      id: "stat:leetcode",
      label: `LeetCode · ${bundle.leetcode.totalDisplay} solved`,
      detail: `${bundle.leetcode.easy.count} Easy · ${bundle.leetcode.medium.count} Med · ${bundle.leetcode.hard.count} Hard`,
      href: "/achievements#achievement-coding",
      searchText: `leetcode coding problems solved ${bundle.leetcode.totalDisplay} ${bundle.leetcode.username}`,
    });
  }

  if (bundle.codechef) {
    entries.push({
      id: "stat:codechef",
      label: `CodeChef · ${bundle.codechef.rating} rating`,
      detail: `Manual snapshot · Checked ${bundle.codechef.checkedAt}`,
      href: "/achievements#achievement-coding",
      searchText: `codechef rating ${bundle.codechef.rating} ${bundle.codechef.username}`,
    });
  }

  if (bundle.geeksforgeeks) {
    entries.push({
      id: "stat:geeksforgeeks",
      label: `GeeksforGeeks · ${bundle.geeksforgeeks.problemsSolved} solved`,
      detail: `Score ${bundle.geeksforgeeks.score}`,
      href: "/achievements#achievement-coding",
      searchText: `geeksforgeeks gfg coding score ${bundle.geeksforgeeks.problemsSolved} ${bundle.geeksforgeeks.score}`,
    });
  }

  if (bundle.github.stats || bundle.github.calendar) {
    const parts: string[] = [];
    if (bundle.github.stats) parts.push(`${bundle.github.stats.publicRepos} public repos`);
    if (bundle.github.calendar) parts.push(`${bundle.github.calendar.totalContributions} contributions`);
    entries.push({
      id: "stat:github",
      label: `GitHub Activity · ${parts[0] ?? "Activity"}`,
      detail: parts.slice(1).join(" · ") || `@${interfaceCopy.github.username}`,
      href: "/achievements#achievement-github",
      searchText: `github activity repos contributions streak ${parts.join(" ")}`,
    });
  }

  return entries;
}

export function buildAchievementsJsonLd(bundle: CodingStatsBundle | null | undefined): Record<string, unknown> {
  const sameAs = [links.github.href, links.linkedin.href, links.leetcode.href, links.codechef.href, links.geeksforgeeks.href]
    .filter((href): href is string => Boolean(href));

  const descriptions: string[] = [];
  if (bundle?.leetcode) {
    descriptions.push(
      `LeetCode: ${bundle.leetcode.total} solved (${bundle.leetcode.easy.count} Easy, ${bundle.leetcode.medium.count} Medium, ${bundle.leetcode.hard.count} Hard)`,
    );
  }
  if (bundle?.codechef) {
    descriptions.push(`CodeChef: ${bundle.codechef.rating} rating (checked ${bundle.codechef.checkedAt})`);
  }
  if (bundle?.geeksforgeeks) {
    descriptions.push(
      `GeeksforGeeks: ${bundle.geeksforgeeks.problemsSolved} solved, ${bundle.geeksforgeeks.score} coding score`,
    );
  }
  if (bundle?.github.calendar) {
    descriptions.push(`GitHub: ${bundle.github.calendar.totalContributions} contributions in the last year`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: bundle?.fetchedAt ?? undefined,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      url: "https://meetkapadia.dev",
      sameAs,
      affiliation: {
        "@type": "CollegeOrUniversity",
        name: profile.education.institution,
      },
      description: descriptions.length ? descriptions.join("; ") : profile.headline,
    },
  };
}

export { buildResumeCodingLines };
export type { CodingStatsSource };
