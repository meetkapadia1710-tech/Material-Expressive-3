export const CODING_STATS_REVALIDATE_SECONDS = 3600;
export const CODING_STATS_PROVENANCE = "single-source:v1" as const;

export type CodingStatsSource = "live" | "cache" | "manual";

export interface ProvenanceStamped {
  readonly provenance: typeof CODING_STATS_PROVENANCE;
}

export function stampCodingStat<T extends object>(value: T): T & ProvenanceStamped {
  return {
    ...value,
    provenance: CODING_STATS_PROVENANCE,
  };
}

export function hasCodingStatProvenance(value: unknown): value is ProvenanceStamped {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { provenance?: unknown }).provenance === CODING_STATS_PROVENANCE
  );
}

const warnedComponents = new Set<string>();

/**
 * Development-only runtime guard that warns once per component if coding stats
 * do not carry the single-source provenance marker.
 */
export function assertDevCodingStatProvenance(value: unknown, componentName: string): void {
  if (value == null) return;
  if (process.env.NODE_ENV !== "development") return;
  if (hasCodingStatProvenance(value)) return;
  if (warnedComponents.has(componentName)) return;
  warnedComponents.add(componentName);
  console.warn(
    `[CodingStatsGuard] "${componentName}" received coding stats that did not originate from the single-source data modules (lib/leetcode, lib/geeksforgeeks, lib/codechef, lib/github, lib/coding-stats).`,
  );
}

export function resetDevProvenanceWarningsForTests(): void {
  warnedComponents.clear();
}

export function formatRelativeAge(isoDate: string | null | undefined, nowMs: number = Date.now()): string {
  if (!isoDate) return "";
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return "";
  const diffSec = Math.max(0, Math.floor((nowMs - parsed) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 1) return "Updated just now";
  if (diffMin === 1) return "Updated 1 min ago";
  if (diffMin < 60) return `Updated ${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "Updated 1 hr ago";
  if (diffHours < 24) return `Updated ${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Updated 1 day ago";
  return `Updated ${diffDays} days ago`;
}

export function formatAsOfDate(isoOrDate: string | null | undefined): string {
  if (!isoOrDate) return "";
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate);
  const parsed = isDateOnly ? Date.parse(`${isoOrDate}T00:00:00Z`) : Date.parse(isoOrDate);
  if (!Number.isFinite(parsed)) return isoOrDate;
  return new Date(parsed).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: isDateOnly ? "UTC" : "Asia/Kolkata",
  });
}

export function formatAsOfDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const parsed = Date.parse(isoDate);
  if (!Number.isFinite(parsed)) return isoDate;
  return (
    new Date(parsed).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }) + " IST"
  );
}

export interface CodingSearchEntry {
  id: string;
  label: string;
  detail: string;
  href: string;
  searchText: string;
}

export interface ResumeCodingStatsLike {
  leetcode?: {
    username: string;
    total: number;
    easy: { count: number };
    medium: { count: number };
    hard: { count: number };
  } | null;
  codechef?: {
    rating: number;
    handle: string;
    checkedAt: string;
  } | null;
  geeksforgeeks?: {
    username: string;
    problemsSolved: number;
    score: number;
  } | null;
}

export function buildResumeCodingLines(bundle: ResumeCodingStatsLike | null | undefined): {
  headerLine: string;
  sectionText: string;
} {
  const lc = bundle?.leetcode ?? null;
  const cc = bundle?.codechef ?? null;
  const gfg = bundle?.geeksforgeeks ?? null;

  const headerLine = lc
    ? `LeetCode: https://leetcode.com/u/${lc.username}/ (${lc.total} solved, ${lc.medium.count} Medium)`
    : "LeetCode: https://leetcode.com/u/Code-Hacker_17/";

  const sectionText = [
    lc
      ? `• LeetCode: ${lc.total} Solved (${lc.easy.count} Easy, ${lc.medium.count} Medium, ${lc.hard.count} Hard). Focused on Dynamic Programming, Sliding Window, Graphs, and Monotonic Stacks.`
      : "• LeetCode: Dynamic Programming, Sliding Window, Graphs, and Monotonic Stacks (Code-Hacker_17).",
    cc
      ? `• CodeChef: ${cc.rating} Rating (${cc.handle}, manual snapshot checked ${cc.checkedAt}).`
      : "• CodeChef: Competitive Programming (neat_otters_97).",
    gfg
      ? `• GeeksforGeeks: ${gfg.problemsSolved} Solved, ${gfg.score} Score (${gfg.username}).`
      : "• GeeksforGeeks: DSA Problem Solving (meetkapa9w1y).",
  ].join("\n");

  return { headerLine, sectionText };
}
