import { NextResponse } from "next/server";
import { getLeetCodeStats } from "@/lib/leetcode";

export const revalidate = 3600;

export async function GET() {
  const stats = await getLeetCodeStats("Code-Hacker_17");
  if (!stats) {
    return NextResponse.json({ error: "Failed to fetch LeetCode statistics" }, { status: 502 });
  }
  return NextResponse.json(stats);
}

