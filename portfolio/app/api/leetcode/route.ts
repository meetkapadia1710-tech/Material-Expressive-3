import { NextResponse } from "next/server";
import { links } from "@/content/links";
import { getCachedLeetCodeStats } from "@/lib/leetcode";

export const revalidate = 3600;

export async function GET(request?: Request) {
  const refresh = request ? new URL(request.url).searchParams.get("refresh") === "1" : false;
  const stats = await getCachedLeetCodeStats({
    username: links.leetcode.value ?? "Code-Hacker_17",
    forceRefresh: refresh,
  });
  if (!stats) {
    return NextResponse.json({ error: "Failed to fetch LeetCode statistics" }, { status: 502 });
  }
  return NextResponse.json(stats);
}

