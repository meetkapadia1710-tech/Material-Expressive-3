import { getGitHubStats } from "@/lib/github";
import { getGitHubCalendar } from "@/lib/github-calendar";
import { interfaceCopy } from "@/content/interface";
import { githubFallbackStats, githubFallbackCalendar } from "@/content/github-fallback";
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

export async function GitHubSection() {
  const [liveStats, liveCalendar] = await Promise.all([
    getGitHubStats(),
    getGitHubCalendar(),
  ]);

  const stats = liveStats ?? githubFallbackStats;
  const calendarData = liveCalendar ?? githubFallbackCalendar;
  const isCached = !liveStats && !liveCalendar;

  return (
    <section className="github-section page-width" aria-labelledby="github-heading">
      <div className="github-heading-row">
        <h2 id="github-heading">{copy.title}</h2>
        {isCached ? (
          <span className="github-cached-pill">
            <span className="cached-dot" /> Cached snapshot
          </span>
        ) : (
          <span className="github-live-pill">
            <span className="live-dot" /> Live GitHub Sync
          </span>
        )}
      </div>

      {/* Interactive 52-Week Contribution Heatmap & Streaks */}
      <GitHubHeatmap initialData={calendarData} />

      {/* Languages & Recent Repositories */}
      <div className="github-secondary-grid">
        {stats.languages.length ? (
          <div className="github-languages-card">
            <h3>Top Languages</h3>
            <ul className="github-lang-list">
              {stats.languages.map(([language, count]) => (
                <li key={language} className="github-lang-item">
                  <span className="github-lang-name">{language}</span>
                  <span className="github-lang-count">{count} {count === 1 ? "repo" : "repos"}</span>
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
                  <a className="text-link github-repo-link" href={repo.html_url} target="_blank" rel="noopener noreferrer">
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

      {/* Accessible data table for screen readers and search crawlers */}
      <table className="sr-only">
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
    </section>
  );
}
