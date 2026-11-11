import { interfaceCopy } from "@/content/interface";
import {
  CODING_STATS_REVALIDATE_SECONDS,
  stampCodingStat,
  type CodingStatsSource,
  type ProvenanceStamped,
} from "./coding-stats-core";
import { getLastGoodCachedStat, setLastGoodCachedStat } from "./coding-stats-cache";

export interface GitHubRepo {
  name: string;
  html_url: string;
  language: string | null;
  updated_at: string;
  pushed_at: string | null;
}

export interface GitHubStats {
  publicRepos: number;
  followers: number;
  languages: [string, number][];
  recent: GitHubRepo[];
  activity: [string, number][];
}

export interface GitHubStatsWithMeta extends GitHubStats, ProvenanceStamped {
  platform: "github";
  username: string;
  fetchedAt: string;
  source: Exclude<CodingStatsSource, "manual">;
  revalidateSeconds: typeof CODING_STATS_REVALIDATE_SECONDS;
}

export async function getGitHubStats(
  request: typeof fetch = fetch,
  options: { bypassCache?: boolean; username?: string } = {},
): Promise<GitHubStats | null> {
  const username = options.username ?? interfaceCopy.github.username;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    async function get(path: string) {
      const fetchInit: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
        headers,
        signal: AbortSignal.timeout(8000),
        ...(options.bypassCache
          ? { cache: "no-store" as const }
          : { next: { revalidate: CODING_STATS_REVALIDATE_SECONDS, tags: ["coding-stats", "github-stats"] } }),
      };
      const response = await request(`https://api.github.com/users/${username}${path}`, fetchInit);
      if (!response.ok) throw new Error("GitHub unavailable");
      return response.json();
    }

    const profile = await get("");
    if (!Number.isInteger(profile.public_repos) || !Number.isInteger(profile.followers)) return null;
    const repos: GitHubRepo[] = [];
    for (let page = 1; ; page++) {
      const batch = await get(`/repos?type=owner&sort=updated&per_page=100&page=${page}`);
      if (!Array.isArray(batch)) return null;
      for (const repo of batch) {
        if (
          typeof repo.name !== "string" ||
          typeof repo.html_url !== "string" ||
          !repo.html_url.startsWith("https://github.com/") ||
          !Number.isFinite(Date.parse(repo.updated_at))
        ) {
          return null;
        }
        repos.push(repo);
      }
      if (batch.length < 100) break;
      if (page >= 100) return null;
    }

    const languages = new Map<string, number>();
    const activity = new Map<string, number>();
    for (const repo of repos) {
      if (typeof repo.language === "string") languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
      if (repo.pushed_at && Number.isFinite(Date.parse(repo.pushed_at))) {
        const month = repo.pushed_at.slice(0, 7);
        activity.set(month, (activity.get(month) ?? 0) + 1);
      }
    }

    return {
      publicRepos: profile.public_repos,
      followers: profile.followers,
      languages: [...languages].sort((a, b) => b[1] - a[1]).slice(0, 6),
      recent: repos.slice(0, 5),
      activity: [...activity].sort(([a], [b]) => a.localeCompare(b)).slice(-12),
    };
  } catch {
    return null;
  }
}

export async function getCachedGitHubStats(options: {
  username?: string;
  request?: typeof fetch;
  forceRefresh?: boolean;
} = {}): Promise<GitHubStatsWithMeta | null> {
  const username = options.username ?? interfaceCopy.github.username;
  const cacheKey = `github-repos:${username}`;
  const raw = await getGitHubStats(options.request ?? fetch, {
    username,
    bypassCache: options.forceRefresh,
  });

  if (raw) {
    const live: GitHubStatsWithMeta = stampCodingStat({
      ...raw,
      platform: "github" as const,
      username,
      fetchedAt: new Date().toISOString(),
      source: "live" as const,
      revalidateSeconds: CODING_STATS_REVALIDATE_SECONDS,
    });
    setLastGoodCachedStat(cacheKey, live);
    return live;
  }

  const cached = getLastGoodCachedStat<GitHubStatsWithMeta>(cacheKey);
  if (!cached) return null;
  return stampCodingStat({
    ...cached,
    source: "cache" as const,
  });
}
