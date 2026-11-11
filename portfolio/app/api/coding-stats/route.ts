import { NextResponse } from "next/server";
import { CODING_STATS_REVALIDATE_SECONDS } from "@/lib/coding-stats-core";
import { fetchCodingStatsUncached, getCodingStats } from "@/lib/coding-stats";

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const refresh = url.searchParams.get("refresh") === "1" || url.searchParams.get("refresh") === "true";

  const bundle = refresh
    ? await fetchCodingStatsUncached({ forceRefresh: true })
    : await getCodingStats();

  return NextResponse.json(bundle, {
    headers: refresh
      ? { "Cache-Control": "no-store" }
      : { "Cache-Control": `public, s-maxage=${CODING_STATS_REVALIDATE_SECONDS}, stale-while-revalidate=86400` },
  });
}

