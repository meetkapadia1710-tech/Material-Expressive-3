"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentLink, LinkId } from "@/content/types";
import type { CodingProfile } from "@/content/achievements";
import { getAchievementsContent, type AchievementsData } from "@/lib/achievements";
import type { CodingStatsBundle } from "@/lib/coding-stats";
import {
  assertDevCodingStatProvenance,
  formatAsOfDateTime,
  stampCodingStat,
} from "@/lib/coding-stats-core";
import { PlatformProfileCard } from "./platform-profile-card";
import { LeetCodeWidget } from "./leetcode-widget";

const STORAGE_KEY = "meet-portfolio:coding-stats:v1";

interface CodingProfilesSectionProps {
  codingProfiles: readonly CodingProfile[];
  links: Partial<Record<LinkId, ContentLink>>;
  initialCodingStats?: CodingStatsBundle | null;
  labels: {
    problemsLabel: string;
    ratingLabel: string;
    scoreLabel: string;
    updatedLabel: string;
  };
  enableClientSync?: boolean;
}

function normalizeClientLeetCode(raw: NonNullable<CodingStatsBundle["leetcode"]>) {
  const easy = Math.max(0, Number(raw.easy?.count) || 0);
  const medium = Math.max(0, Number(raw.medium?.count) || 0);
  const hard = Math.max(0, Number(raw.hard?.count) || 0);
  const sum = easy + medium + hard;
  const pct = (count: number) => (sum > 0 ? Math.round((count / sum) * 1000) / 10 : 0);

  return stampCodingStat({
    ...raw,
    total: sum,
    totalDisplay: `${sum}`,
    easy: { count: easy, percentage: pct(easy) },
    medium: {
      count: medium,
      percentage: pct(medium),
      tagLabel: raw.medium?.tagLabel || "Interview Sweet Spot",
      highlight: raw.medium?.highlight,
    },
    hard: { count: hard, percentage: pct(hard) },
  });
}

function readStoredBundle(): CodingStatsBundle | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CodingStatsBundle;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredBundle(bundle: CodingStatsBundle): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
  } catch {
    // Ignore storage quota or private-mode restrictions.
  }
}

function mergeWithStoredFallback(
  incoming: CodingStatsBundle | null,
  stored: CodingStatsBundle | null,
): CodingStatsBundle | null {
  if (!incoming && !stored) return null;
  if (!incoming) {
    if (!stored) return null;
    return stampCodingStat({
      ...stored,
      leetcode: stored.leetcode ? stampCodingStat({ ...stored.leetcode, source: "cache" as const }) : null,
      geeksforgeeks: stored.geeksforgeeks
        ? stampCodingStat({ ...stored.geeksforgeeks, source: "cache" as const })
        : null,
      codechef: stored.codechef ? stampCodingStat(stored.codechef) : null,
    });
  }

  return stampCodingStat({
    ...incoming,
    leetcode:
      incoming.leetcode ??
      (stored?.leetcode ? stampCodingStat({ ...stored.leetcode, source: "cache" as const }) : null),
    geeksforgeeks:
      incoming.geeksforgeeks ??
      (stored?.geeksforgeeks ? stampCodingStat({ ...stored.geeksforgeeks, source: "cache" as const }) : null),
    codechef: incoming.codechef ?? stored?.codechef ?? null,
  });
}

export function CodingProfilesSection({
  codingProfiles,
  links,
  initialCodingStats,
  labels,
  enableClientSync = true,
}: CodingProfilesSectionProps) {
  const [bundle, setBundle] = useState<CodingStatsBundle | null>(initialCodingStats ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialCodingStats) {
      assertDevCodingStatProvenance(initialCodingStats, "CodingProfilesSection");
    }
  }, [initialCodingStats]);

  // Restore cached fallback cleanly after hydration if SSR lacked dynamic platform data,
  // or persist SSR live/cached bundle for offline reloads.
  useEffect(() => {
    if (initialCodingStats === undefined) return;
    const stored = readStoredBundle();
    if (initialCodingStats && (initialCodingStats.leetcode || initialCodingStats.geeksforgeeks)) {
      writeStoredBundle(initialCodingStats);
      setBundle(initialCodingStats);
    } else {
      const recovered = mergeWithStoredFallback(initialCodingStats, stored);
      if (recovered) {
        setBundle(recovered);
      }
    }
  }, [initialCodingStats]);

  const performSync = useCallback(async (forceRefresh: boolean, signal?: AbortSignal) => {
    if (forceRefresh) setIsRefreshing(true);
    try {
      const url = forceRefresh ? "/api/coding-stats?refresh=1" : "/api/coding-stats";
      const res = await fetch(url, { signal, cache: forceRefresh ? "no-store" : "default" });
      if (!res.ok) {
        if (!mountedRef.current || signal?.aborted) return;
        const stored = readStoredBundle();
        setBundle((prev) => {
          const fallback = mergeWithStoredFallback(null, prev ?? stored);
          const asOf = fallback?.leetcode?.fetchedAt ?? fallback?.fetchedAt;
          if (asOf) setSyncNote(`Cached · As of ${formatAsOfDateTime(asOf)}`);
          return fallback ?? prev;
        });
        return;
      }

      const incoming = (await res.json()) as CodingStatsBundle;
      if (!mountedRef.current || signal?.aborted || !incoming) return;

      const normalizedIncoming = stampCodingStat({
        ...incoming,
        leetcode: incoming.leetcode ? normalizeClientLeetCode(incoming.leetcode) : null,
        geeksforgeeks: incoming.geeksforgeeks ? stampCodingStat(incoming.geeksforgeeks) : null,
        codechef: incoming.codechef ? stampCodingStat(incoming.codechef) : null,
      });

      setSyncNote(null);
      setBundle((prev) => {
        const merged = mergeWithStoredFallback(normalizedIncoming, prev ?? readStoredBundle());
        if (merged) writeStoredBundle(merged);
        return merged;
      });
    } catch {
      if (!mountedRef.current || signal?.aborted) return;
      setBundle((prev) => {
        const fallback = mergeWithStoredFallback(null, prev ?? readStoredBundle());
        const asOf = fallback?.leetcode?.fetchedAt ?? fallback?.fetchedAt;
        if (asOf) setSyncNote(`Cached · As of ${formatAsOfDateTime(asOf)}`);
        return fallback ?? prev;
      });
    } finally {
      if (mountedRef.current && forceRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enableClientSync || initialCodingStats === undefined) return;
    const controller = new AbortController();

    const markOfflineCached = () => {
      setBundle((prev) => {
        const cached = mergeWithStoredFallback(null, prev ?? readStoredBundle());
        const asOf = cached?.leetcode?.fetchedAt ?? cached?.fetchedAt;
        if (asOf) setSyncNote(`Cached · As of ${formatAsOfDateTime(asOf)}`);
        return cached ?? prev;
      });
    };

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      markOfflineCached();
    }

    // Even when navigator.onLine is false, fetch("/api/coding-stats") allows an active
    // Service Worker to reply from caches cleanly with cached timestamps.
    void performSync(false, controller.signal);

    const onOffline = () => markOfflineCached();
    const onOnline = () => void performSync(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      controller.abort();
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [enableClientSync, initialCodingStats, performSync]);

  const dataSlice: AchievementsData = useMemo(
    () => ({
      experience: [],
      hackathons: [],
      certifications: [],
      codingProfiles,
      topics: [],
      links,
    }),
    [codingProfiles, links],
  );

  const profiles = useMemo(() => {
    if (initialCodingStats === undefined && !bundle) {
      return getAchievementsContent(dataSlice).profiles;
    }
    return getAchievementsContent(dataSlice, bundle).profiles;
  }, [bundle, dataSlice, initialCodingStats]);

  const leetCodeProfile = bundle?.leetcode ?? null;

  return (
    <>
      {profiles.length ? (
        <div className="coding-profile-grid">
          {profiles.map((profile) => (
            <PlatformProfileCard key={profile.id} profile={profile} labels={labels} />
          ))}
        </div>
      ) : null}

      {leetCodeProfile ? (
        <div data-platform-scheme="leetcode" className="leetcode-widget-wrapper">
          <LeetCodeWidget
            stats={leetCodeProfile}
            onRefresh={initialCodingStats !== undefined ? () => void performSync(true) : undefined}
            isRefreshing={isRefreshing}
            syncNote={syncNote}
          />
        </div>
      ) : null}
    </>
  );
}
