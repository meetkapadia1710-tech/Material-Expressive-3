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

export async function getGitHubCalendar(username = "meetkapadia1710-tech", request: typeof fetch = fetch): Promise<GitHubCalendarData | null> {
  try {
    const res = await request(`https://github.com/users/${username}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const html = await res.text();

    const totalMatch = html.match(/([\d,]+)\s+contributions\s+in\s+the\s+last\s+year/i);
    const totalContributions = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 683;

    const dayRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d+)"/g;
    const daysMap = new Map<string, CalendarDay>();
    let m: RegExpExecArray | null;
    while ((m = dayRegex.exec(html)) !== null) {
      daysMap.set(m[2], {
        id: m[2],
        date: m[1],
        level: parseInt(m[3], 10),
        count: 0,
      });
    }

    const tipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
    while ((m = tipRegex.exec(html)) !== null) {
      const day = daysMap.get(m[1]);
      if (day) {
        const text = m[2].trim();
        const countMatch = text.match(/^(\d+)\s+contribution/);
        day.count = countMatch ? parseInt(countMatch[1], 10) : 0;
      }
    }

    const days = [...daysMap.values()].sort((a, b) => a.date.localeCompare(b.date));
    if (days.length === 0) return null;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let maxDay = { date: "", count: 0 };

    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      if (d.count > maxDay.count) {
        maxDay = { date: d.date, count: d.count };
      }
      if (d.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) currentStreak++;
      else if (i === days.length - 1) continue;
      else break;
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Determine month labels across the 53 weeks
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeks.length; w++) {
      const firstDayOfWeek = weeks[w][0];
      if (firstDayOfWeek) {
        const mIdx = new Date(firstDayOfWeek.date + "T00:00:00Z").getUTCMonth();
        if (mIdx !== lastMonth) {
          monthLabels.push({ month: monthNames[mIdx], weekIndex: w });
          lastMonth = mIdx;
        }
      }
    }

    return {
      totalContributions,
      currentStreak,
      longestStreak,
      maxDay,
      weeks,
      monthLabels,
    };
  } catch {
    return null;
  }
}

