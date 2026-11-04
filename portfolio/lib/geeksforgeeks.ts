export interface GFGStats {
  username: string;
  score: number;
  problemsSolved: number;
  instituteRank: number;
}

export async function getGFGStats(username = "meetkapa9w1y", request: typeof fetch = fetch): Promise<GFGStats | null> {
  try {
    const res = await request(`https://www.geeksforgeeks.org/profile/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

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

