import type { Achievement, ContentLink, LinkId } from "@/content/types";
import { experience, hackathons, certifications, codingProfiles, problemSolvingTopics, type CodingProfile } from "@/content/achievements";
import { links } from "@/content/links";

export interface AchievementsData {
  experience: readonly Achievement[];
  hackathons: readonly Achievement[];
  certifications: readonly Achievement[];
  codingProfiles: readonly CodingProfile[];
  topics: readonly string[];
  links: Partial<Record<LinkId, ContentLink>>;
}

export const achievementsData: AchievementsData = { experience, hackathons, certifications, codingProfiles, topics: problemSolvingTopics, links };
const text = (value: string | null) => value?.trim() || null;

export function getVisibleAchievements(entries: readonly Achievement[]): Achievement[] {
  return entries.filter((entry) => entry.verification !== "unverified" && entry.visibility === "public" && entry.title.trim()).map((entry) => ({
    ...entry,
    title: entry.title.trim(),
    organization: text(entry.organization),
    description: text(entry.description),
    dateLabel: text(entry.dateLabel),
    url: text(entry.url),
    documents: entry.documents?.filter((document) => document.label.trim()).map((document) => ({ label: document.label.trim(), url: text(document.url) })) ?? null,
  }));
}

export function getAchievementsContent(data: AchievementsData = achievementsData) {
  const profiles = data.codingProfiles.flatMap((profile) => {
    const link = data.links[profile.linkId];
    if (profile.verification === "unverified" || profile.visibility !== "public" || !link || link.verification === "unverified" || !link.label.trim()) return [];
    return [{ ...profile, handle: profile.handle.trim(), updatedAt: text(profile.updatedAt), label: link.label.trim(), href: text(link.href) }];
  });
  return {
    experience: getVisibleAchievements(data.experience),
    hackathons: getVisibleAchievements(data.hackathons),
    certifications: getVisibleAchievements(data.certifications),
    profiles,
    topics: data.topics.map((topic) => topic.trim()).filter(Boolean),
  };
}
