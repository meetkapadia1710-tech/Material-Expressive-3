import { NextResponse } from "next/server";
import { getGitHubCalendar } from "@/lib/github-calendar";

export const revalidate = 3600;

export async function GET() {
  const data = await getGitHubCalendar("meetkapadia1710-tech");
  if (!data) {
    return NextResponse.json({ error: "Failed to fetch GitHub calendar" }, { status: 502 });
  }
  return NextResponse.json(data);
}

