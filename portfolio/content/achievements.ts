import type { Achievement, LinkId, Verification, Visibility } from "./types";

const unknowns = { organization: null, description: null, startDate: null, endDate: null, dateLabel: null, url: null, reviewNote: null, documents: null, timeConstraint: null, technologies: null, credentialId: null, skills: null } as const;
const provided = { ...unknowns, verification: "provided", visibility: "public" } as const;

export const experience: readonly Achievement[] = [{
  ...provided, id: "bhumi-internship", title: "Web Development Intern", organization: "Bhumi Developers / BD Buildcon LLP",
  description: "Built two production corporate sites in Bharuch.", startDate: "2026-05-19", endDate: "2026-07-25", dateLabel: "19 May – 25 July 2026",
  documents: [{ label: "Certificate of internship", url: null }, { label: "Letter of recommendation", url: null }],
}];

export const hackathons: readonly Achievement[] = [
  {
    ...provided,
    id: "supermemory",
    title: "Supermemory localhost:6767",
    organization: "Supermemory",
    description: "Built Hindsight as a solo hackathon project. A 100% local, privacy-first photographic memory tool for Windows with offline semantic search.",
    dateLabel: "Jul 2026",
    timeConstraint: "48-hour build",
    technologies: ["FastAPI", "Supermemory Local", "Ollama", "Vanilla JS", "pywin32", "Pillow"],
    documents: [
      { label: "GitHub submission", url: "https://github.com/meetkapadia1710-tech/Hindsight" },
      { label: "Project case study", url: "/projects/hindsight" },
    ],
    url: "https://github.com/meetkapadia1710-tech/Hindsight",
  },
  {
    ...provided,
    id: "bharatiya-antariksh",
    title: "Bharatiya Antariksh Hackathon 2026",
    organization: "ISRO / Hack2skill",
    description: "Certificate of participation for space science data processing and geospatial analysis idea submission.",
    dateLabel: "2026",
    timeConstraint: "National idea stage",
    technologies: ["Python", "Geospatial Analytics", "Satellite Telemetry"],
    documents: [{ label: "Certificate of participation", url: null }],
  },
  { ...provided, id: "adobe", title: "Adobe hackathon", description: "Round 2", verification: "unverified", visibility: "review", reviewNote: "Verify Round 2 before showing publicly." },
];

export const certifications: readonly Achievement[] = [
  {
    ...provided,
    id: "nvidia-deep-learning",
    title: "Fundamentals of Deep Learning",
    organization: "NVIDIA",
    dateLabel: "Sep 2026",
    startDate: "2026-09-05",
    credentialId: "iCYD7o4TQD2sk23TRgpwJA",
    skills: ["Deep Neural Networks", "Computer Vision", "CUDA", "PyTorch"],
    description: "Comprehensive training by NVIDIA Deep Learning Institute covering end-to-end computer vision pipelines, multi-class classification, convolutional networks, and transfer learning.",
    url: "https://learn.nvidia.com/certificates?id=iCYD7o4TQD2sk23TRgpwJA",
    documents: [
      { label: "Certificate of Competency (PDF)", url: "/certificates/nvidia-deep-learning.pdf" },
      { label: "Verify Credential", url: "https://learn.nvidia.com/certificates?id=iCYD7o4TQD2sk23TRgpwJA" },
    ],
  },
  {
    ...provided,
    id: "oracle-genai",
    title: "Oracle Cloud Infrastructure 2025 Generative AI Professional",
    organization: "Oracle",
    dateLabel: "2025",
    credentialId: "Oracle Certified Professional",
    skills: ["Large Language Models", "Retrieval-Augmented Generation (RAG)", "OCI Generative AI", "Vector Databases", "Prompt Engineering"],
    description: "Demonstrated proficiency in architecting and deploying LLMs, fine-tuning foundation models, integrating embeddings with vector stores, and developing RAG applications on Oracle Cloud Infrastructure.",
    documents: [{ label: "Verify on Oracle University", url: "https://catalog-education.oracle.com" }],
    url: "https://catalog-education.oracle.com",
  },
  {
    ...provided,
    id: "delta-mern",
    title: "Full Stack Web Development (Delta, MERN)",
    organization: "Apna College",
    dateLabel: "2024",
    credentialId: "Delta Full Stack Certificate",
    skills: ["React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "JWT Authentication"],
    description: "Intensive 400+ hours full-stack development curriculum with hands-on capstone projects covering frontend state management, RESTful backend design, schema modeling, and production deployment.",
    documents: [{ label: "Curriculum & Certificate", url: null }],
  },
  {
    ...provided,
    id: "iit-bombay-ai",
    title: "AI Workshop",
    organization: "IIT Bombay",
    dateLabel: "2024",
    credentialId: "IIT Bombay Workshop Certificate",
    skills: ["Machine Learning", "Neural Networks", "Data Processing", "Applied AI"],
    description: "Hands-on intensive workshop exploring modern artificial intelligence architectures, machine learning model evaluation, and deployment practices.",
    documents: [{ label: "Workshop Certificate", url: null }],
  },
];

export interface CodingProfile {
  id: string;
  linkId: LinkId;
  handle: string;
  problemsSolved: number | null;
  problemsQualifier: "+" | null;
  rating: number | null;
  updatedAt: string | null;
  checkedAt?: string | null;
  fetchedAt?: string | null;
  source?: "live" | "cache" | "manual";
  verification: Verification;
  visibility: Visibility;
}

export interface CodeChefManualSnapshot {
  handle: string;
  rating: number;
  highestRating: number;
  stars: number;
  division: string;
  checkedAt: string;
}

/**
 * Manual platform entry (CodeChef provides no unauthenticated public API).
 * Live-API platforms (LeetCode, GeeksforGeeks, GitHub) leave numeric stats null here
 * so every UI surface reads exclusively from the single-source data modules.
 */
export const codeChefManualSnapshot: CodeChefManualSnapshot = {
  handle: "neat_otters_97",
  rating: 1462,
  highestRating: 1475,
  stars: 2,
  division: "Div 3",
  checkedAt: "2026-11-11",
};

export const codingProfiles: readonly CodingProfile[] = [
  { id: "leetcode", linkId: "leetcode", handle: "Code-Hacker_17", problemsSolved: null, problemsQualifier: null, rating: null, updatedAt: null, source: "live", verification: "provided", visibility: "public" },
  { id: "codechef", linkId: "codechef", handle: codeChefManualSnapshot.handle, problemsSolved: null, problemsQualifier: null, rating: codeChefManualSnapshot.rating, updatedAt: codeChefManualSnapshot.checkedAt, checkedAt: codeChefManualSnapshot.checkedAt, source: "manual", verification: "provided", visibility: "public" },
  { id: "geeksforgeeks", linkId: "geeksforgeeks", handle: "meetkapa9w1y", problemsSolved: null, problemsQualifier: null, rating: null, updatedAt: null, source: "live", verification: "provided", visibility: "public" },
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

export interface LeetCodeSubmissionItem {
  title: string;
  titleSlug: string;
  timestamp: string;
}

export interface LeetCodePatternItem {
  title: string;
  subtitle: string;
  tag: string;
}

export interface LeetCodeBreakdown {
  total: number;
  totalDisplay: string;
  easy: { count: number; percentage: number };
  medium: { count: number; percentage: number; tagLabel: string; highlight?: string };
  hard: { count: number; percentage: number };
  patterns: readonly LeetCodePatternItem[];
  recentSubmissions?: readonly LeetCodeSubmissionItem[];
  fetchedAt?: string;
  source?: "live" | "cache";
  provenance?: string;
}

export const leetCodePatterns: readonly LeetCodePatternItem[] = [
  { title: "Sliding Window", subtitle: "Dynamic arrays, two pointers & sub-array optimizations", tag: "Array / Two Pointers" },
  { title: "Dynamic Programming", subtitle: "Memoization, bottom-up tabulations & state transitions", tag: "Optimal Substructure" },
  { title: "Monotonic Stacks", subtitle: "Next greater element, histogram areas & O(n) bounds", tag: "O(n) Range Queries" },
  { title: "Graph DFS/BFS", subtitle: "Connected components, shortest paths & topological orders", tag: "Traversal & Cycles" },
];

export interface HonorItem {
  id: string;
  title: string;
  category: string;
  organization: string;
  description: string;
  badge?: string;
}

export const academicHonorsAndLeadership: readonly HonorItem[] = [
  {
    id: "academic-distinction",
    title: "Academic Distinction in CSE",
    category: "Academics",
    organization: "IIIT Vadodara",
    description: "B.Tech Computer Science and Engineering (CGPA: 8.31). Consistent distinction across foundational systems and algorithms coursework.",
    badge: "8.31 CGPA",
  },
  {
    id: "hackathon-spotlights",
    title: "National & Global Hackathons",
    category: "Competitions",
    organization: "Supermemory & ISRO Hack2skill",
    description: "Solo project finalist in Supermemory localhost:6767 building Hindsight. National-level space science analytics proposal in ISRO Bharatiya Antariksh Hackathon.",
    badge: "Finalist / Participant",
  },
  {
    id: "community-leadership",
    title: "Technical Community Leadership",
    category: "Leadership",
    organization: "9bit, Dot & Obscura Clubs",
    description: "Active technical contributor and coordinator in 9bit Technical Community, alongside creative contributions to Dot Design Club and Obscura Photography Club.",
    badge: "Community Lead",
  },
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
  scoreLabel: "Coding score",
  updatedLabel: "Updated",
  honorsTitle: "Academic Honors & Leadership",
  honorsEyebrow: "Campus & Community",
  leetcodeBreakdownTitle: "LeetCode Breakdown & Algorithmic Patterns",
  empty: { title: "Nothing to share here yet.", description: "Updates will appear here as this collection grows." },
};
