import { codeChefManualSnapshot, type CodeChefManualSnapshot } from "@/content/achievements";
import { links } from "@/content/links";
import { stampCodingStat, type ProvenanceStamped } from "./coding-stats-core";

export interface CodeChefProfileStats extends CodeChefManualSnapshot, ProvenanceStamped {
  platform: "codechef";
  username: string;
  profileUrl: string;
  problemsSolved: null;
  fetchedAt: string;
  source: "manual";
}

export function getCodeChefStats(
  snapshot: CodeChefManualSnapshot = codeChefManualSnapshot,
): CodeChefProfileStats | null {
  if (!Number.isSafeInteger(snapshot.rating) || snapshot.rating < 0 || !snapshot.checkedAt.trim()) {
    return null;
  }

  return stampCodingStat({
    platform: "codechef" as const,
    username: snapshot.handle,
    handle: snapshot.handle,
    profileUrl: links.codechef.href ?? `https://www.codechef.com/users/${snapshot.handle}`,
    rating: snapshot.rating,
    highestRating: snapshot.highestRating,
    stars: snapshot.stars,
    division: snapshot.division,
    problemsSolved: null,
    checkedAt: snapshot.checkedAt,
    fetchedAt: `${snapshot.checkedAt}T00:00:00Z`,
    source: "manual" as const,
  });
}

