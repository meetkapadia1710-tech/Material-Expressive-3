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
    if (json?.errors?.length) return null;
    const acNum = json?.data?.matchedUser?.submitStats?.acSubmissionNum;
    const submissions = json?.data?.recentAcSubmissionList;
    if (!Array.isArray(acNum) || !Array.isArray(submissions)) return null;

    const findCount = (difficulty: string): number | undefined => {
      const count = acNum.find((item) => typeof item?.difficulty === "string" &&
        item.difficulty.toLowerCase() === difficulty)?.count;
      return Number.isSafeInteger(count) && count >= 0 ? count : undefined;
    };

    const total = findCount("all");
    const easy = findCount("easy");
    const medium = findCount("medium");
    const hard = findCount("hard");
    if (total === undefined || easy === undefined || medium === undefined || hard === undefined || easy + medium + hard > total) return null;

    const recent: LeetCodeSubmission[] = [];
    for (const submission of submissions) {
      const titleSlug = submission?.titleSlug ?? submission?.slug;
      if (typeof submission?.title !== "string" || !submission.title.trim() ||
          typeof titleSlug !== "string" || !/^[a-z\d-]+$/.test(titleSlug) ||
          typeof submission.timestamp !== "string" || !/^\d+$/.test(submission.timestamp)) return null;
      recent.push({ title: submission.title, titleSlug, timestamp: submission.timestamp });
    }

    return {
      total,
      totalDisplay: `${total}`,
      easy: { count: easy, percentage: total > 0 ? Math.round((easy / total) * 1000) / 10 : 0 },
      medium: { count: medium, percentage: total > 0 ? Math.round((medium / total) * 1000) / 10 : 0, highlight: "The sweet spot for technical interviews" },
      hard: { count: hard, percentage: total > 0 ? Math.round((hard / total) * 1000) / 10 : 0 },
      recent,
    };
  } catch {
    return null;
  }
}

