import { links } from "@/content/links";
import { leetCodePatterns, type LeetCodePatternItem } from "@/content/achievements";
import {
  CODING_STATS_REVALIDATE_SECONDS,
  stampCodingStat,
  type CodingStatsSource,
  type ProvenanceStamped,
} from "./coding-stats-core";
import { getLastGoodCachedStat, setLastGoodCachedStat } from "./coding-stats-cache";

export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
}

export interface LeetCodeDifficultyStat {
  count: number;
  percentage: number;
}

export interface LeetCodeLiveStats extends ProvenanceStamped {
  platform: "leetcode";
  username: string;
  profileUrl: string;
  total: number;
  totalDisplay: string;
  easy: LeetCodeDifficultyStat;
  medium: LeetCodeDifficultyStat & { tagLabel: string; highlight?: string };
  hard: LeetCodeDifficultyStat;
  recent: LeetCodeSubmission[];
  patterns: readonly LeetCodePatternItem[];
  fetchedAt: string;
  source: Exclude<CodingStatsSource, "manual">;
  revalidateSeconds: typeof CODING_STATS_REVALIDATE_SECONDS;
}

export type LeetCodeStats = LeetCodeLiveStats;

function computePct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
}

export function buildLeetCodeStats(input: {
  username: string;
  easy: number;
  medium: number;
  hard: number;
  apiTotal?: number;
  recent: LeetCodeSubmission[];
  fetchedAt?: string;
  source?: Exclude<CodingStatsSource, "manual">;
}): LeetCodeStats {
  const bucketSum = input.easy + input.medium + input.hard;
  if (input.apiTotal !== undefined && input.apiTotal !== bucketSum) {
    console.warn(
      `[leetcode] Reported total (${input.apiTotal}) differed from Easy+Medium+Hard sum (${bucketSum}); normalizing total to ${bucketSum}.`,
    );
  }
  const total = bucketSum;

  return stampCodingStat({
    platform: "leetcode" as const,
    username: input.username,
    profileUrl: links.leetcode.href ?? `https://leetcode.com/u/${input.username}/`,
    total,
    totalDisplay: `${total}`,
    easy: {
      count: input.easy,
      percentage: computePct(input.easy, total),
    },
    medium: {
      count: input.medium,
      percentage: computePct(input.medium, total),
      tagLabel: "Interview Sweet Spot",
      highlight: "The sweet spot for technical interviews",
    },
    hard: {
      count: input.hard,
      percentage: computePct(input.hard, total),
    },
    recent: input.recent,
    patterns: leetCodePatterns,
    fetchedAt: input.fetchedAt ?? new Date().toISOString(),
    source: input.source ?? "live",
    revalidateSeconds: CODING_STATS_REVALIDATE_SECONDS,
  });
}

export async function getLeetCodeStats(
  username = "Code-Hacker_17",
  request: typeof fetch = fetch,
  options: { bypassCache?: boolean } = {},
): Promise<LeetCodeStats | null> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      recentAcSubmissionList(username: $username, limit: 10) {
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const fetchInit: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(8000),
      ...(options.bypassCache
        ? { cache: "no-store" as const }
        : { next: { revalidate: CODING_STATS_REVALIDATE_SECONDS, tags: ["coding-stats", "leetcode-stats"] } }),
    };

    const res = await request("https://leetcode.com/graphql", fetchInit);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.errors?.length) return null;
    const acNum = json?.data?.matchedUser?.submitStats?.acSubmissionNum;
    const submissions = json?.data?.recentAcSubmissionList;
    if (!Array.isArray(acNum) || !Array.isArray(submissions)) return null;

    const findCount = (difficulty: string): number | undefined => {
      const count = acNum.find(
        (item) => typeof item?.difficulty === "string" && item.difficulty.toLowerCase() === difficulty,
      )?.count;
      return Number.isSafeInteger(count) && count >= 0 ? count : undefined;
    };

    const apiTotal = findCount("all");
    const easy = findCount("easy");
    const medium = findCount("medium");
    const hard = findCount("hard");
    if (apiTotal === undefined || easy === undefined || medium === undefined || hard === undefined) return null;

    const recent: LeetCodeSubmission[] = [];
    for (const submission of submissions) {
      const titleSlug = submission?.titleSlug ?? submission?.slug;
      if (
        typeof submission?.title !== "string" ||
        !submission.title.trim() ||
        typeof titleSlug !== "string" ||
        !/^[a-z\d-]+$/.test(titleSlug) ||
        typeof submission.timestamp !== "string" ||
        !/^\d+$/.test(submission.timestamp)
      ) {
        return null;
      }
      recent.push({ title: submission.title, titleSlug, timestamp: submission.timestamp });
    }

    return buildLeetCodeStats({
      username,
      easy,
      medium,
      hard,
      apiTotal,
      recent,
      fetchedAt: new Date().toISOString(),
      source: "live",
    });
  } catch {
    return null;
  }
}

export async function getCachedLeetCodeStats(options: {
  username?: string;
  request?: typeof fetch;
  forceRefresh?: boolean;
} = {}): Promise<LeetCodeStats | null> {
  const username = options.username ?? "Code-Hacker_17";
  const cacheKey = `leetcode:${username}`;
  const live = await getLeetCodeStats(username, options.request ?? fetch, {
    bypassCache: options.forceRefresh,
  });

  if (live) {
    setLastGoodCachedStat(cacheKey, live);
    return live;
  }

  const cached = getLastGoodCachedStat<LeetCodeStats>(cacheKey);
  if (!cached) return null;

  return stampCodingStat({
    ...cached,
    source: "cache" as const,
  });
}
