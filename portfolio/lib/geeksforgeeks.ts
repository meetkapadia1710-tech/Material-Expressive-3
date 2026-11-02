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

    const scoreMatch = text.match(/score\\":(\d+)/i) || text.match(/"score":(\d+)/i);
    const problemsMatch = text.match(/total_problems_solved\\":(\d+)/i) || text.match(/"total_problems_solved":(\d+)/i);
    const rankMatch = text.match(/institute_rank\\":(\d+)/i) || text.match(/"institute_rank":(\d+)/i);

    return {
      username,
      score: scoreMatch ? parseInt(scoreMatch[1], 10) : 327,
      problemsSolved: problemsMatch ? parseInt(problemsMatch[1], 10) : 111,
      instituteRank: rankMatch ? parseInt(rankMatch[1], 10) : 304,
    };
  } catch {
    return null;
  }
}

