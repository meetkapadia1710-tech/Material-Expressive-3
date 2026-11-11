import { NextResponse } from "next/server";
import { interfaceCopy } from "@/content/interface";
import { getCachedGitHubCalendar } from "@/lib/github-calendar";

export const revalidate = 3600;

export async function GET(request?: Request) {
  const refresh = request ? new URL(request.url).searchParams.get("refresh") === "1" : false;
  const data = await getCachedGitHubCalendar({
    username: interfaceCopy.github.username,
    forceRefresh: refresh,
  });
  if (!data) {
    return NextResponse.json({ error: "Failed to fetch GitHub calendar" }, { status: 502 });
  }
  return NextResponse.json(data);
}

