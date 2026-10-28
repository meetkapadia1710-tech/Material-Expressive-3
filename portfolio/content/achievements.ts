import type { Achievement, LinkId, Verification, Visibility } from "./types";

const unknowns = { organization: null, description: null, startDate: null, endDate: null, dateLabel: null, url: null, reviewNote: null, documents: null } as const;
const provided = { ...unknowns, verification: "provided", visibility: "public" } as const;

export const experience: readonly Achievement[] = [{
  ...provided, id: "bhumi-internship", title: "Web Development Intern", organization: "Bhumi Developers / BD Buildcon LLP",
  description: "Built two production corporate sites in Bharuch.", startDate: "2026-05-19", endDate: "2026-07-25", dateLabel: "19 May – 25 July 2026",
  documents: [{ label: "Certificate of internship", url: null }, { label: "Letter of recommendation", url: null }],
}];

export const hackathons: readonly Achievement[] = [
  { ...provided, id: "supermemory", title: "Supermemory localhost:6767", description: "Built Hindsight as a solo hackathon project.", dateLabel: "July 2026" },
  { ...provided, id: "bharatiya-antariksh", title: "Bharatiya Antariksh Hackathon 2026", organization: "ISRO / Hack2skill", description: "Certificate of participation for idea submission.", dateLabel: "2026", documents: [{ label: "Certificate of participation", url: null }] },
  { ...provided, id: "adobe", title: "Adobe hackathon", description: "Round 2", verification: "unverified", visibility: "review", reviewNote: "Verify Round 2 before showing publicly." },
];

export const certifications: readonly Achievement[] = [
  { ...provided, id: "oracle-genai", title: "Oracle Cloud Infrastructure 2025 Generative AI Professional", organization: "Oracle" },
  { ...provided, id: "delta-mern", title: "Full Stack Web Development (Delta, MERN)", organization: "Apna College" },
  { ...provided, id: "iit-bombay-ai", title: "AI Workshop", organization: "IIT Bombay" },
];

export interface CodingProfile {
  id: string;
  linkId: LinkId;
  handle: string;
  problemsSolved: number | null;
  problemsQualifier: "+" | null;
  rating: number | null;
  updatedAt: string | null;
  verification: Verification;
  visibility: Visibility;
}

// Editable, user-supplied snapshots. No scraping or inferred timestamps.
export const codingProfiles: readonly CodingProfile[] = [
  { id: "leetcode", linkId: "leetcode", handle: "Code-Hacker_17", problemsSolved: 650, problemsQualifier: "+", rating: null, updatedAt: null, verification: "provided", visibility: "public" },
  { id: "codechef", linkId: "codechef", handle: "neat_otters_97", problemsSolved: null, problemsQualifier: null, rating: 1462, updatedAt: null, verification: "provided", visibility: "public" },
  { id: "codolio", linkId: "codolio", handle: "Lucifer_17", problemsSolved: null, problemsQualifier: null, rating: null, updatedAt: null, verification: "provided", visibility: "public" },
];

export const problemSolvingTopics: readonly string[] = [
  "Arrays and strings",
  "Sliding window",
  "Trees/BST/AVL/red-black",
  "Heaps",
  "BFS/DFS",
  "Topological sort",
  "DP",
  "Greedy",
  "Binary search",
  "String matching",
  "CPU scheduling",
  "Subnetting",
];

export const achievementsPageCopy = {
  eyebrow: "Along the way",
  title: "Achievements.",
  description: "Experience, learning, and problem solving.",
  experienceTitle: "Experience",
  hackathonsTitle: "Hackathons",
  certificationsTitle: "Certifications",
  codingTitle: "Coding Profiles and Problem Solving",
  topicsTitle: "DSA and systems topics",
  documentsLabel: "Documents",
  entryLinkLabel: "View details",
  problemsLabel: "Problems solved",
  ratingLabel: "Rating",
  updatedLabel: "Updated",
  empty: { title: "Nothing to share here yet.", description: "Updates will appear here as this collection grows." },
};
