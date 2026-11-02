import type { GitHubStats } from "@/lib/github";
import type { GitHubCalendarData } from "@/lib/github-calendar";

export const githubFallbackStats: GitHubStats = {
  publicRepos: 18,
  followers: 4,
  languages: [
    ["TypeScript", 9],
    ["Python", 4],
    ["JavaScript", 3],
    ["Go", 2],
    ["HTML", 1],
    ["C++", 1],
  ],
  recent: [
    {
      name: "RepoGrade",
      html_url: "https://github.com/meetkapadia1710-tech/RepoGrade",
      language: "TypeScript",
      updated_at: "2026-11-01T20:00:00Z",
      pushed_at: "2026-11-01T20:00:00Z",
    },
    {
      name: "Hindsight",
      html_url: "https://github.com/meetkapadia1710-tech/Hindsight",
      language: "Python",
      updated_at: "2026-07-28T18:00:00Z",
      pushed_at: "2026-07-28T18:00:00Z",
    },
    {
      name: "Attendance-Manager",
      html_url: "https://github.com/meetkapadia1710-tech/Attendance-Manager",
      language: "TypeScript",
      updated_at: "2026-08-15T12:00:00Z",
      pushed_at: "2026-08-15T12:00:00Z",
    },
    {
      name: "BD-Buildcon",
      html_url: "https://github.com/meetkapadia1710-tech/BD-Buildcon",
      language: "JavaScript",
      updated_at: "2026-07-20T10:00:00Z",
      pushed_at: "2026-07-20T10:00:00Z",
    },
    {
      name: "PickleRage-App",
      html_url: "https://github.com/meetkapadia1710-tech/PickleRage-App",
      language: "TypeScript",
      updated_at: "2026-06-10T14:00:00Z",
      pushed_at: "2026-06-10T14:00:00Z",
    },
  ],
  activity: [
    ["2025-12", 2],
    ["2026-01", 3],
    ["2026-02", 5],
    ["2026-03", 4],
    ["2026-04", 6],
    ["2026-05", 8],
    ["2026-06", 12],
    ["2026-07", 19],
    ["2026-08", 14],
    ["2026-09", 11],
    ["2026-10", 17],
    ["2026-11", 7],
  ],
};

// Generate realistic 53-week fallback calendar
function generateFallbackCalendar(): GitHubCalendarData {
  const weeks: GitHubCalendarData["weeks"] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  const startDate = new Date("2025-11-02T00:00:00Z");

  for (let w = 0; w < 53; w++) {
    const week: GitHubCalendarData["weeks"][0] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(startDate.getTime() + (w * 7 + d) * 86400000);
      const dateStr = cur.toISOString().slice(0, 10);
      const mIdx = cur.getUTCMonth();
      if (d === 0 && mIdx !== lastMonth) {
        monthLabels.push({ month: monthNames[mIdx], weekIndex: w });
        lastMonth = mIdx;
      }
      // Synthetic realistic activity
      const isWeekend = d === 0 || d === 6;
      const count = (w > 28 && w < 42) ? (isWeekend ? 3 : 6) : ((w + d) % 5 === 0 ? 2 : 0);
      const level = count === 0 ? 0 : count > 5 ? 4 : count > 3 ? 3 : count > 1 ? 2 : 1;

      week.push({
        id: `fb-day-${w}-${d}`,
        date: dateStr,
        level,
        count,
      });
    }
    weeks.push(week);
  }

  return {
    totalContributions: 683,
    currentStreak: 6,
    longestStreak: 10,
    maxDay: { date: "2026-06-10", count: 86 },
    weeks,
    monthLabels,
  };
}

export const githubFallbackCalendar: GitHubCalendarData = generateFallbackCalendar();
