export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
}

export interface LeetCodeLiveStats {
  total: number;
  totalDisplay: string;
  easy: { count: number; percentage: number };
  medium: { count: number; percentage: number; highlight?: string };
  hard: { count: number; percentage: number };
  recent: LeetCodeSubmission[];
}

export async function getLeetCodeStats(username = "Code-Hacker_17", request: typeof fetch = fetch): Promise<LeetCodeLiveStats | null> {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      recentAcSubmissionList(username: $username, limit: 10) {
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const res = await request("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const acNum = json?.data?.matchedUser?.submitStats?.acSubmissionNum;
    if (!Array.isArray(acNum)) return null;

    const findCount = (diff: string) =>
      acNum.find((item: { difficulty: string; count: number }) => item.difficulty.toLowerCase() === diff.toLowerCase())?.count ?? 0;

    const total = findCount("all");
    const easy = findCount("easy");
    const medium = findCount("medium");
    const hard = findCount("hard");

    const recent: LeetCodeSubmission[] = (json?.data?.recentAcSubmissionList || []).map((sub: { title: string; titleSlug?: string; slug?: string; timestamp: string }) => ({
      title: sub.title,
      titleSlug: sub.titleSlug || sub.slug || "",
      timestamp: sub.timestamp,
    }));

    return {
      total,
      totalDisplay: `${total}+`,
      easy: { count: easy, percentage: total > 0 ? Math.round((easy / total) * 1000) / 10 : 0 },
      medium: { count: medium, percentage: total > 0 ? Math.round((medium / total) * 1000) / 10 : 0, highlight: "The sweet spot for technical interviews" },
      hard: { count: hard, percentage: total > 0 ? Math.round((hard / total) * 1000) / 10 : 0 },
      recent,
    };
  } catch {
    return null;
  }
}

