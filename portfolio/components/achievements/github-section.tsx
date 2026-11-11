import { getCachedGitHubStats, getGitHubStats, type GitHubStatsWithMeta } from "@/lib/github";
import { getCachedGitHubCalendar, getGitHubCalendar, type GitHubCalendarWithMeta } from "@/lib/github-calendar";
import type { CodingStatsBundle } from "@/lib/coding-stats";
import { formatAsOfDateTime } from "@/lib/coding-stats-core";
import { interfaceCopy } from "@/content/interface";
import { GitHubHeatmap } from "./github-heatmap";

const copy = interfaceCopy.github;

export function GitHubSkeleton() {
  return (
    <section className="github-section page-width" aria-busy="true" aria-label={copy.loading}>
      <div className="github-skeleton" />
      <div className="github-skeleton" />
    </section>
  );
}

export async function GitHubSection({ codingStats }: { codingStats?: CodingStatsBundle | null } = {}) {
  let stats: GitHubStatsWithMeta | Awaited<ReturnType<typeof getGitHubStats>> | null = null;
  let calendar: GitHubCalendarWithMeta | Awaited<ReturnType<typeof getGitHubCalendar>> | null = null;

  if (codingStats !== undefined) {
    stats = codingStats?.github.stats ?? null;
    calendar = codingStats?.github.calendar ?? null;
  } else if (process.env.NODE_TEST_CONTEXT) {
    [stats, calendar] = await Promise.all([getGitHubStats(), getGitHubCalendar()]);
  } else {
    [stats, calendar] = await Promise.all([getCachedGitHubStats(), getCachedGitHubCalendar()]);
  }

  const isCachedRepo = stats !== null && "source" in stats && stats.source === "cache";

  return (
    <section
      id="achievement-github"
      className="github-section page-width"
      aria-labelledby="github-heading"
      data-platform-scheme="github"
    >
      <div className="github-heading-row">
        <h2 id="github-heading">{copy.title}</h2>
        {!stats ? (
          <span className="github-cached-pill">
            <span className="cached-dot" /> Repository reference data
          </span>
        ) : isCachedRepo && "fetchedAt" in stats ? (
          <span className="github-cached-pill" title="Showing last cached GitHub snapshot">
            <span className="cached-dot" /> Cached · As of {formatAsOfDateTime(stats.fetchedAt)}
          </span>
        ) : (
          <span className="github-live-pill" title="Repository data is revalidated hourly">
            <span className="live-dot" /> Repository data from GitHub
          </span>
        )}
      </div>

      {/* Interactive 52-Week Contribution Heatmap & Streaks */}
      <GitHubHeatmap initialData={calendar} />

      {/* Languages & Recent Repositories (only shown when real live/cached GitHub data exists) */}
      {stats ? (
        <>
          <div className="github-secondary-grid">
            {stats.languages.length ? (
              <div className="github-languages-card">
                <h3>Top Languages</h3>
                <ul className="github-lang-list">
                  {stats.languages.map(([language, count]) => (
                    <li key={language} className="github-lang-item">
                      <span className="github-lang-name">{language}</span>
                      <span className="github-lang-count">
                        {count} {count === 1 ? "repo" : "repos"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {stats.recent.length ? (
              <div className="github-recent-card">
                <h3>Recently Pushed Repositories</h3>
                <ul className="github-recent-list">
                  {stats.recent.map((repo) => (
                    <li key={repo.html_url} className="github-recent-item">
                      <a
                        className="text-link github-repo-link"
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{repo.name}</span>
                        {repo.language ? <span className="github-repo-lang">{repo.language}</span> : null}
                      </a>
                      <time dateTime={repo.updated_at}>{repo.updated_at.slice(0, 10)}</time>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="sr-only">
            <table>
              <caption>{copy.activity}</caption>
              <thead>
                <tr>
                  <th scope="col">{copy.month}</th>
                  <th scope="col">{copy.count}</th>
                </tr>
              </thead>
              <tbody>
                {stats.activity.map(([month, count]) => (
                  <tr key={month}>
                    <th scope="row">{month}</th>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
