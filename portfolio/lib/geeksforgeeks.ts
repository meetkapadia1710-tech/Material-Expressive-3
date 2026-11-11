import { links } from "@/content/links";
import {
  CODING_STATS_REVALIDATE_SECONDS,
  stampCodingStat,
  type CodingStatsSource,
  type ProvenanceStamped,
} from "./coding-stats-core";
import { getLastGoodCachedStat, setLastGoodCachedStat } from "./coding-stats-cache";

export interface GFGStats {
  username: string;
  score: number;
  problemsSolved: number;
  instituteRank: number;
}

export interface GFGProfileStats extends GFGStats, ProvenanceStamped {
  platform: "geeksforgeeks";
  profileUrl: string;
  fetchedAt: string;
  source: Exclude<CodingStatsSource, "manual">;
  revalidateSeconds: typeof CODING_STATS_REVALIDATE_SECONDS;
}

export async function getGFGStats(
  username = "meetkapa9w1y",
  request: typeof fetch = fetch,
  options: { bypassCache?: boolean } = {},
): Promise<GFGStats | null> {
  try {
    const fetchInit: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
      ...(options.bypassCache
        ? { cache: "no-store" as const }
        : { next: { revalidate: CODING_STATS_REVALIDATE_SECONDS, tags: ["coding-stats", "gfg-stats"] } }),
    };

    const res = await request(`https://www.geeksforgeeks.org/profile/${username}`, fetchInit);
    if (!res.ok) return null;
    const text = await res.text();

    const scoreMatch = text.match(/"score\\?":\s*(\d+)(?=\s*[,}])/i);
    const problemsMatch = text.match(/"total_problems_solved\\?":\s*(\d+)(?=\s*[,}])/i);
    const rankMatch = text.match(/"institute_rank\\?":\s*(\d+)(?=\s*[,}])/i);

    if (!scoreMatch || !problemsMatch || !rankMatch) return null;
    const score = Number(scoreMatch[1]);
    const problemsSolved = Number(problemsMatch[1]);
    const instituteRank = Number(rankMatch[1]);
    if (![score, problemsSolved, instituteRank].every(Number.isSafeInteger)) return null;
    return { username, score, problemsSolved, instituteRank };
  } catch {
    return null;
  }
}

export function buildGFGProfileStats(input: GFGStats & {
  fetchedAt?: string;
  source?: Exclude<CodingStatsSource, "manual">;
}): GFGProfileStats {
  return stampCodingStat({
    platform: "geeksforgeeks" as const,
    username: input.username,
    profileUrl: links.geeksforgeeks.href ?? `https://www.geeksforgeeks.org/profile/${input.username}`,
    score: input.score,
    problemsSolved: input.problemsSolved,
    instituteRank: input.instituteRank,
    fetchedAt: input.fetchedAt ?? new Date().toISOString(),
    source: input.source ?? "live",
    revalidateSeconds: CODING_STATS_REVALIDATE_SECONDS,
  });
}

export async function getCachedGFGStats(options: {
  username?: string;
  request?: typeof fetch;
  forceRefresh?: boolean;
} = {}): Promise<GFGProfileStats | null> {
  const username = options.username ?? "meetkapa9w1y";
  const cacheKey = `geeksforgeeks:${username}`;
  const raw = await getGFGStats(username, options.request ?? fetch, {
    bypassCache: options.forceRefresh,
  });

  if (raw) {
    const live = buildGFGProfileStats({ ...raw, fetchedAt: new Date().toISOString(), source: "live" });
    setLastGoodCachedStat(cacheKey, live);
    return live;
  }

  const cached = getLastGoodCachedStat<GFGProfileStats>(cacheKey);
  if (!cached) return null;

  return stampCodingStat({
    ...cached,
    source: "cache" as const,
  });
}
