// cspell:words Neev Mendpara Dishant Marchant asyncio HTTPX Uvicorn bursty Inngest playhub Pickleball learnflex BCNF wanderstay robustvision agrisetu Agrisetu nexshell gobooking
import type { Project } from "./types";

// null means unknown. An empty array would mean confirmed to have no entries.
const unknowns = { status: null, statusDetail: null, problem: null, role: null, stack: null, features: null, repoUrl: null, liveUrl: null, media: null, challenges: null, lessons: null, reviewNote: null } as const;
const provided = { ...unknowns, verification: "provided", visibility: "public" } as const;
const review = { ...unknowns, verification: "unverified", visibility: "review", status: "prototype", featured: false } as const;

export const projects: readonly Project[] = [
  {
    ...provided, slug: "repograde", name: "RepoGrade", category: "Developer tooling",
    tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.",
    status: "in-progress", statusDetail: "Build complete; deploying.",
    stack: ["Turborepo", "Next.js", "Plasmo", "GitHub Action", "Drizzle", "PostgreSQL", "Octokit GraphQL", "Inngest", "Upstash Redis", "Auth.js", "Gemini API"],
    features: ["GitHub repository scoring and ratings", "README generation grounded in the actual code", "Web app, browser extension, and GitHub Action in a Turborepo monorepo"],
    featured: true, order: 1,
  },
  {
    ...provided, slug: "hindsight", name: "Hindsight", category: "Local AI",
    tagline: "A 100% local photographic memory tool for Windows, built solo for the Supermemory localhost:6767 hackathon in July 2026.",
    role: "Solo hackathon project", stack: ["FastAPI", "Vanilla JavaScript SPA", "Supermemory Local", "Ollama"],
    features: ["Window title capture", "Clipboard capture", "Browser history capture", "On-device screenshot OCR"],
    repoUrl: "https://github.com/meetkapadia1710-tech/hindsight", featured: true, order: 2,
  },
  {
    ...provided, slug: "playhub", name: "PlayHub (PickleRage)", category: "Sports booking",
    tagline: "A court booking app for Cricket and Pickleball with customer, owner, and admin roles.",
    stack: ["React 19", "Capacitor Android", "Firebase Cloud Functions", "Razorpay", "Google Wallet JWT", "FCM", "Leaflet", "Vitest"],
    features: ["Cricket and Pickleball court booking", "Customer, owner, and admin roles"], featured: true, order: 3,
  },
  {
    ...provided, slug: "bd-buildcon-bhumi-developers", name: "BD Buildcon LLP & Bhumi Developers", category: "Corporate websites",
    tagline: "Two production corporate websites built during my internship.", status: "shipped", role: "Web Development Intern",
    stack: ["Next.js", "React", "Tailwind CSS", "Framer Motion", "React Three Fiber", "Lenis"], featured: true, order: 4,
  },
  {
    ...provided, slug: "api-traffic-optimizer", name: "API Traffic Optimizer", category: "AI / Optimization",
    tagline: "An asynchronous reverse-proxy middleware and research study mitigating cache stampedes and reducing upstream API traffic by 96.67% using deterministic SHA-256 normalization, in-flight request coalescing, and distributed Redis leases.",
    role: "Co-Author & System Architect; research collaboration with Neev Mendpara and Dishant Marchant at IIIT Vadodara.",
    problem: "Modern microservices frequently encounter duplicate upstream HTTP traffic from redundant client polling and concurrent cold-start cache misses. Standard HTTP caching proxies fail to coordinate concurrent requests, triggering thundering herds, CPU contention, and backend database saturation.",
    stack: ["FastAPI", "Python asyncio", "Redis 7", "Docker", "HTTPX", "Uvicorn", "React 18", "Vite", "SHA-256"],
    features: [
      "Deterministic SHA-256 request normalization with lexicographical query parameter sorting (O(k log k)) and Accept/Accept-Language representation negotiation",
      "In-flight request coalescing via non-blocking asyncio.Future and asyncio.shield() to collapse concurrent stampedes within the event loop",
      "Token-owned distributed Redis cache leases (SET NX PX 10000) with atomic Lua script evaluation to prevent stale leader overwrites",
      "96.67% upstream traffic reduction during repeated queries and high-concurrency bursts (collapsing 30 backend requests to 1 origin fetch)",
      "Client response latency reduction of up to 86.99% for repeated requests and 35.34% under concurrent burst loads",
      "Fail-closed outage protection: issues bounded HTTP 503 responses during Redis outages with zero fallback origin storms",
      "Dual pluggable storage backends: near-zero latency in-memory dictionary cache (~0.05 ms) and distributed multi-instance Redis tier",
      "Real-time developer telemetry and observability dashboard built with React 18 and Vite displaying live KPIs, hit ratios, and request waterfalls",
    ],
    lessons: "Benchmarking across a 72-case evaluation suite (1,608 HTTP transactions) revealed that request suppression delivers massive latency and throughput gains for repeated and bursty queries, but introduces a measurable pass-through overhead (+4.86% in memory, +30.15% in Redis) on unique non-cacheable traffic due to cryptographic hashing and serialization. Production middleware must evaluate workload concurrency thresholds to justify coordination overhead.",
    featured: true, order: 5,
  },
  {
    ...provided, slug: "learnflex", name: "LearnFlex", category: "DBMS project",
    tagline: "A team exam-prep quiz platform with an approximately 20-table PostgreSQL schema on Neon, using 3NF / BCNF.",
    role: "Practice Mode; team of 5", stack: ["PostgreSQL", "Neon"], features: ["Exam-prep quizzes", "Practice Mode"], featured: false, order: 6,
  },
  {
    ...provided, slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Progressive web app",
    tagline: "A loyalty PWA and staff attendance manager.", stack: ["React 19", "Firebase", "Zustand", "Vitest", "GitHub Actions CI/CD"],
    features: ["Loyalty PWA", "Staff attendance management"], featured: false, order: 7,
  },
  {
    ...provided, slug: "wanderstay", name: "WanderStay", category: "Learning project",
    tagline: "An Airbnb-clone learning project.", stack: ["EJS", "Express", "MongoDB", "Passport", "Socket.IO"], featured: false, order: 8,
  },
  { ...provided, slug: "coastal-blue-carbon", name: "Coastal Blue Carbon Early Warning Platform", tagline: null, category: null, status: "concept", featured: false, order: 9 },
  { ...provided, slug: "hydrogen-ecosystem-map", name: "Hydrogen Ecosystem Map", tagline: null, category: null, status: "concept", stack: ["Leaflet", "PostGIS"], featured: false, order: 10 },
  { ...provided, slug: "green-hydrogen-credits", name: "Blockchain-based Green Hydrogen Credits", tagline: null, category: null, status: "concept", featured: false, order: 11 },
  { ...provided, slug: "robustvision-privacy-lens", name: "RobustVision / Privacy Lens", tagline: "Privacy-preserving ML exploration.", category: null, status: "concept", featured: false, order: 12 },
  { ...provided, slug: "peer-skill-swap", name: "Peer Skill Swap", tagline: null, category: null, status: "concept", featured: false, order: 13 },
  { ...provided, slug: "pocket-noticeboard", name: "Pocket NoticeBoard", tagline: null, category: null, status: "concept", featured: false, order: 14 },
  { ...provided, slug: "receipt-scanner", name: "Receipt Scanner Android app", tagline: null, category: null, status: "concept", featured: false, order: 15 },
  { ...review, slug: "agrisetu", name: "Agrisetu", tagline: "Agriculture information portal.", category: null, reviewNote: "Earlier work; review before publishing.", order: 16 },
  { ...review, slug: "nexshell", name: "NexShell", tagline: "Custom shell in Go; team of 5.", category: null, stack: ["Go"], reviewNote: "Earlier work; review before publishing.", order: 17 },
  { ...review, slug: "academic-ai-optimizer", name: "AI Optimizer", tagline: "Academic design project.", category: null, reviewNote: "Earlier work; review before publishing. May overlap with API Traffic Optimizer; relationship unconfirmed.", order: 18 },
  { ...review, slug: "flight-booking-frontend", name: "Flight booking frontend", tagline: null, category: null, reviewNote: "Earlier work; review before publishing.", order: 19 },
  { ...review, slug: "gobooking", name: "GoBooking", tagline: "Booking-site frontend.", category: null, reviewNote: "Earlier work; review before publishing.", order: 20 },
];

export function getPublicProjects(): Project[] {
  return projects.filter((project) => project.visibility === "public").toSorted((a, b) => a.order - b.order);
}

export function getFeaturedProjects(): Project[] {
  return getPublicProjects().filter((project) => project.featured);
}

export function getProjectBySlug(slug: string): Project | null {
  return getPublicProjects().find((project) => project.slug === slug) ?? null;
}

// Copy for /projects only. Project facts above remain the source of truth.
export const projectCatalogCopy = {
  collectionLabel: "Built, building, and imagining.",
  filters: {
    label: "Filter projects",
    category: "Category",
    status: "Status",
    allCategories: "All categories",
    allStatuses: "All statuses",
    noCategory: "Without a category",
    noStatus: "Without a status",
    clear: "Clear filters",
  },
  statusLabels: { shipped: "Shipped", "in-progress": "In progress", prototype: "Prototype", concept: "Concept" },
  groups: {
    featured: { title: "Featured", description: "Selected builds across interfaces, systems, and applied AI." },
    more: { title: "More Projects", description: "More of the work, from team projects to learning by building." },
    explorations: { title: "Explorations & Ideas", description: "Concepts and prototypes — not finished products. Earlier work awaiting review is marked explicitly." },
  },
  groupNavigationLabel: "Project groups",
  stackLabel: "Technology stack",
  repoLabel: "Repository",
  liveLabel: "Live demo",
  detailLabel: "Project details",
  reviewLabel: "Unverified · Needs review",
  conceptNote: "An idea to explore; not a finished product.",
  prototypeNote: "Prototype; not a finished product.",
  empty: { title: "No projects in this combination.", description: "Try another category or status, or clear the filters to see the full collection." },
  resultsLabel: (visible: number, total: number) => `Showing ${visible} of ${total} ${total === 1 ? "project" : "projects"}`,
  groupCountLabel: (count: number) => `${count} ${count === 1 ? "project" : "projects"}`,
};

// Copy for project detail pages; unknown project facts above stay null.
export const projectDetailCopy = {
  eyebrow: "Project",
  overview: "Overview",
  problem: "The problem",
  role: "My role",
  stack: "Stack",
  features: "Key features",
  media: "Media",
  reflection: "Challenges & lessons",
  challenges: "Challenges",
  lessons: "Lessons learned",
  links: "Explore the project",
  repo: "Repository",
  demo: "Live demo",
  status: "Status",
  onThisPage: "On this page",
  sectionNavigation: "Project sections",
  projectNavigation: "Previous and next projects",
  previous: "Previous project",
  next: "Next project",
  conceptNote: "This is a concept, not a finished product.",
  prototypeNote: "This is a prototype, not a finished product.",
  unverified: "Unverified · Needs review",
  videoFallback: "Open video",
  statusLabels: projectCatalogCopy.statusLabels,
};
