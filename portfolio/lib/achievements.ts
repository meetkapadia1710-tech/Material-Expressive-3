import type { Achievement, ContentLink, LinkId } from "@/content/types";
import { experience, hackathons, certifications, codingProfiles, problemSolvingTopics, type CodingProfile } from "@/content/achievements";
import { links } from "@/content/links";
import type { CodingStatsBundle } from "@/lib/coding-stats";

export interface AchievementsData {
  experience: readonly Achievement[];
  hackathons: readonly Achievement[];
  certifications: readonly Achievement[];
  codingProfiles: readonly CodingProfile[];
  topics: readonly string[];
  links: Partial<Record<LinkId, ContentLink>>;
}

export interface MergedCodingProfile extends CodingProfile {
  label: string;
  href: string | null;
  provenance?: string;
}

export const achievementsData: AchievementsData = {
  experience,
  hackathons,
  certifications,
  codingProfiles,
  topics: problemSolvingTopics,
  links,
};

const text = (value: string | null | undefined) => value?.trim() || null;

export function getVisibleAchievements(entries: readonly Achievement[]): Achievement[] {
  return entries
    .filter((entry) => entry.verification !== "unverified" && entry.visibility === "public" && entry.title.trim())
    .map((entry) => ({
      ...entry,
      title: entry.title.trim(),
      organization: text(entry.organization),
      description: text(entry.description),
      dateLabel: text(entry.dateLabel),
      url: text(entry.url),
      documents:
        entry.documents
          ?.filter((document) => document.label.trim())
          .map((document) => ({ label: document.label.trim(), url: text(document.url) })) ?? null,
    }));
}

export function getAchievementsContent(
  data: AchievementsData = achievementsData,
  codingStats?: Pick<CodingStatsBundle, "leetcode" | "geeksforgeeks" | "codechef"> | null,
) {
  const profiles: MergedCodingProfile[] = data.codingProfiles.flatMap((profile): MergedCodingProfile[] => {
    const link = data.links[profile.linkId];
    if (
      profile.verification === "unverified" ||
      profile.visibility !== "public" ||
      !link ||
      link.verification === "unverified" ||
      !link.label.trim()
    ) {
      return [];
    }

    if (profile.id === "leetcode" && codingStats && "leetcode" in codingStats) {
      const lc = codingStats.leetcode;
      return [
        {
          ...profile,
          handle: (lc?.username ?? profile.handle).trim(),
          problemsSolved: lc ? lc.total : null,
          problemsQualifier: null,
          rating: null,
          updatedAt: lc ? lc.fetchedAt : null,
          fetchedAt: lc ? lc.fetchedAt : null,
          source: lc ? lc.source : undefined,
          provenance: lc?.provenance,
          label: link.label.trim(),
          href: text(link.href),
        },
      ];
    }

    if (profile.id === "geeksforgeeks" && codingStats && "geeksforgeeks" in codingStats) {
      const gfg = codingStats.geeksforgeeks;
      return [
        {
          ...profile,
          handle: (gfg?.username ?? profile.handle).trim(),
          problemsSolved: gfg ? gfg.problemsSolved : null,
          problemsQualifier: null,
          rating: gfg ? gfg.score : null,
          updatedAt: gfg ? gfg.fetchedAt : null,
          fetchedAt: gfg ? gfg.fetchedAt : null,
          source: gfg ? gfg.source : undefined,
          provenance: gfg?.provenance,
          label: link.label.trim(),
          href: text(link.href),
        },
      ];
    }

    if (profile.id === "codechef" && codingStats && "codechef" in codingStats) {
      const cc = codingStats.codechef;
      return [
        {
          ...profile,
          handle: (cc?.handle ?? profile.handle).trim(),
          problemsSolved: cc ? cc.problemsSolved : null,
          problemsQualifier: null,
          rating: cc ? cc.rating : null,
          updatedAt: cc ? cc.checkedAt : null,
          checkedAt: cc ? cc.checkedAt : null,
          fetchedAt: cc ? cc.fetchedAt : null,
          source: cc ? cc.source : undefined,
          provenance: cc?.provenance,
          label: link.label.trim(),
          href: text(link.href),
        },
      ];
    }

    return [
      {
        ...profile,
        handle: profile.handle.trim(),
        updatedAt: text(profile.updatedAt),
        checkedAt: text(profile.checkedAt),
        fetchedAt: text(profile.fetchedAt),
        label: link.label.trim(),
        href: text(link.href),
      },
    ];
  });

  return {
    experience: getVisibleAchievements(data.experience),
    hackathons: getVisibleAchievements(data.hackathons),
    certifications: getVisibleAchievements(data.certifications),
    profiles,
    topics: data.topics.map((topic) => topic.trim()).filter(Boolean),
  };
}
