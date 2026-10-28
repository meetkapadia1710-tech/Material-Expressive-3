import { interfaceCopy } from "@/content/interface";
export interface GitHubRepo { name: string; html_url: string; language: string | null; updated_at: string; pushed_at: string | null }
export interface GitHubStats { publicRepos: number; followers: number; languages: [string, number][]; recent: GitHubRepo[]; activity: [string, number][] }
export async function getGitHubStats(request: typeof fetch = fetch): Promise<GitHubStats | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    async function get(path: string) { const response = await request(`https://api.github.com/users/${interfaceCopy.github.username}${path}`, { headers, next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }); if (!response.ok) throw new Error("GitHub unavailable"); return response.json(); }
    const profile = await get("");
    if (!Number.isInteger(profile.public_repos) || !Number.isInteger(profile.followers)) return null;
    const repos: GitHubRepo[] = [];
    for (let page = 1; ; page++) {
      const batch = await get(`/repos?type=owner&sort=updated&per_page=100&page=${page}`);
      if (!Array.isArray(batch)) return null;
      for (const repo of batch) { if (typeof repo.name !== "string" || typeof repo.html_url !== "string" || !repo.html_url.startsWith("https://github.com/") || !Number.isFinite(Date.parse(repo.updated_at))) return null; repos.push(repo); }
      if (batch.length < 100) break;
      if (page >= 100) return null;
    }
    const languages = new Map<string, number>();
    const activity = new Map<string, number>();
    for (const repo of repos) { if (typeof repo.language === "string") languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1); if (repo.pushed_at && Number.isFinite(Date.parse(repo.pushed_at))) { const month = repo.pushed_at.slice(0, 7); activity.set(month, (activity.get(month) ?? 0) + 1); } }
    return { publicRepos: profile.public_repos, followers: profile.followers, languages: [...languages].sort((a,b) => b[1]-a[1]).slice(0, 6), recent: repos.slice(0, 5), activity: [...activity].sort(([a],[b]) => a.localeCompare(b)).slice(-12) };
  } catch { return null; }
}
