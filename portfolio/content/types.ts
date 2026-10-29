export type Verification = "provided" | "unverified";
export type Visibility = "public" | "review";
export type ProjectStatus = "shipped" | "in-progress" | "prototype" | "concept";
export type LinkId = "email" | "github" | "linkedin" | "leetcode" | "codechef" | "codolio" | "geeksforgeeks" | "resume";

export interface ContentLink {
  id: LinkId;
  label: string;
  value: string | null;
  href: string | null;
  verification: Verification;
}

export interface ProjectMedia {
  src: string;
  alt: string;
  kind: "image" | "video";
  width?: number | null;
  height?: number | null;
}

export interface Project {
  slug: string;
  accentSeed?: string | null;
  name: string;
  tagline: string | null;
  category: string | null;
  status: ProjectStatus | null;
  statusDetail: string | null;
  problem: string | null;
  role: string | null;
  stack: readonly string[] | null;
  features: readonly string[] | null;
  repoUrl: string | null;
  liveUrl: string | null;
  media: readonly ProjectMedia[] | null;
  challenges: string | null;
  lessons: string | null;
  featured: boolean;
  order: number;
  verification: Verification;
  visibility: Visibility;
  reviewNote: string | null;
}

export interface SkillGroup {
  id: string;
  name: string;
  items: readonly string[];
  note: string | null;
  overview: string;
}

export type SkillPractice = "hands-on" | "learning" | "study";

export interface SkillItem {
  name: string;
  practice: SkillPractice;
}

export interface SkillCategory extends Omit<SkillGroup, "items"> {
  items: readonly SkillItem[];
}

export interface Achievement {
  id: string;
  title: string;
  organization: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  dateLabel: string | null;
  url: string | null;
  verification: Verification;
  visibility: Visibility;
  reviewNote: string | null;
  documents: readonly { label: string; url: string | null }[] | null;
}

export interface PageCopy {
  eyebrow: string;
  title: string;
  description: string | null;
}
