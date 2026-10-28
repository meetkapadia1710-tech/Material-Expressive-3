import { getGitHubStats } from "@/lib/github";
import { interfaceCopy } from "@/content/interface";
const copy = interfaceCopy.github;
export function GitHubSkeleton() { return <section className="github-section page-width" aria-busy="true" aria-label={copy.loading}><div className="github-skeleton" /><div className="github-skeleton" /></section>; }
export async function GitHubSection() {
  const stats = await getGitHubStats();
  if (!stats) return null;
  const max = Math.max(1, ...stats.activity.map(([, count]) => count));
  return <section className="github-section page-width" aria-labelledby="github-heading"><h2 id="github-heading">{copy.title}</h2><dl className="github-metrics"><div><dt>{copy.repos}</dt><dd>{stats.publicRepos}</dd></div><div><dt>{copy.followers}</dt><dd>{stats.followers}</dd></div></dl>
    {stats.languages.length ? <><h3>{copy.languages}</h3><ul>{stats.languages.map(([language,count]) => <li key={language}>{language}: {count}</li>)}</ul></> : null}
    {stats.recent.length ? <><h3>{copy.recent}</h3><ul>{stats.recent.map(repo => <li key={repo.html_url}><a className="text-link" href={repo.html_url}>{repo.name}</a> <time dateTime={repo.updated_at}>{repo.updated_at.slice(0,10)}</time></li>)}</ul></> : null}
    {stats.activity.length ? <><h3>{copy.activity}</h3><p>{copy.summary}</p><div className="activity-chart" aria-hidden="true">{stats.activity.map(([month,count]) => <div key={month}><span style={{height: `${Math.max(4, count / max * 100)}%`}} /><small>{month.slice(2)}</small></div>)}</div><table><caption>{copy.activity}</caption><thead><tr><th scope="col">{copy.month}</th><th scope="col">{copy.count}</th></tr></thead><tbody>{stats.activity.map(([month,count]) => <tr key={month}><th scope="row">{month}</th><td>{count}</td></tr>)}</tbody></table></> : null}
  </section>;
}
