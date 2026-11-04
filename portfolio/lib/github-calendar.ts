export interface CalendarDay {
  id: string;
  date: string;
  level: number;
  count: number;
}

export interface GitHubCalendarData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  maxDay: { date: string; count: number };
  weeks: CalendarDay[][];
  monthLabels: { month: string; weekIndex: number }[];
}

const dayMs = 86_400_000;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getGitHubCalendar(username = "meetkapadia1710-tech", request: typeof fetch = fetch): Promise<GitHubCalendarData | null> {
  try {
    const res = await request(`https://github.com/users/${username}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const counts = new Map<string, number>();
    for (const [, id, label] of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)) {
      const text = label.trim();
      if (/^no contributions?\b/i.test(text)) counts.set(id, 0);
      else {
        const count = text.match(/^(\d{1,3}(?:,\d{3})+|\d+)\s+contributions?\b/i);
        if (count) counts.set(id, Number(count[1].replaceAll(",", "")));
      }
    }

    const days: CalendarDay[] = [];
    for (const [cell] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
      const date = cell.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const id = cell.match(/\sid="([^"]+)"/)?.[1];
      const level = cell.match(/\bdata-level="([0-4])"/)?.[1];
      const count = id ? counts.get(id) : undefined;
      if (!date || !id || level === undefined || count === undefined || !Number.isSafeInteger(count)) return null;
      if ((level === "0") !== (count === 0)) return null;
      days.push({ id, date, level: Number(level), count });
    }

    days.sort((a, b) => a.date.localeCompare(b.date));
    if (!days.length) return null;

    const weeks: CalendarDay[][] = [];
    const monthLabels: GitHubCalendarData["monthLabels"] = [];
    let lastMonth = -1;
    let previousDate: number | undefined;
    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let maxDay = { date: days[0].date, count: 0 };

    for (const day of days) {
      const date = new Date(day.date + "T00:00:00Z");
      const timestamp = date.getTime();
      if (!Number.isFinite(timestamp) || date.toISOString().slice(0, 10) !== day.date) return null;
      if (previousDate !== undefined && timestamp - previousDate !== dayMs) return null;
      previousDate = timestamp;

      if (!weeks.length || date.getUTCDay() === 0) {
        weeks.push([]);
        const month = date.getUTCMonth();
        if (month !== lastMonth) {
          monthLabels.push({ month: monthNames[month], weekIndex: weeks.length - 1 });
          lastMonth = month;
        }
      }
      weeks.at(-1)?.push(day);

      totalContributions += day.count;
      if (day.count > maxDay.count) maxDay = { date: day.date, count: day.count };
      if (day.count > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (day !== days.at(-1)) {
        // The latest day can still receive contributions.
        currentStreak = 0;
      }
    }

    if (!Number.isSafeInteger(totalContributions)) return null;
    return { totalContributions, currentStreak, longestStreak, maxDay, weeks, monthLabels };
  } catch {
    return null;
  }
}

