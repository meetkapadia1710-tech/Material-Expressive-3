import { NextResponse } from "next/server";
import { getGFGStats } from "@/lib/geeksforgeeks";

export const revalidate = 3600;

export async function GET() {
  const stats = await getGFGStats("meetkapa9w1y");
  if (!stats) {
    return NextResponse.json({ error: "Failed to fetch GeeksforGeeks statistics" }, { status: 502 });
  }
  return NextResponse.json(stats);
}

