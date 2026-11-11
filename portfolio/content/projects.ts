// cspell:words Neev Mendpara Dishant Marchant asyncio HTTPX Uvicorn bursty Inngest playhub Pickleball learnflex BCNF wanderstay robustvision agrisetu Agrisetu nexshell gobooking pywin32 SheetJS
import type { Project } from "./types";

// null means unknown. An empty array would mean confirmed to have no entries.
const unknowns = { status: null, statusDetail: null, problem: null, role: null, stack: null, features: null, repoUrl: null, liveUrl: null, media: null, challenges: null, lessons: null, reviewNote: null } as const;
const provided = { ...unknowns, verification: "provided", visibility: "public" } as const;
const review = { ...unknowns, verification: "unverified", visibility: "review", status: "prototype", featured: false } as const;

export const meetOSProject = {
  ...provided, slug: "meetos", name: "MeetOS", category: "Interactive portfolio",
  tagline: "A macOS Sequoia-inspired portfolio that turns projects, skills, and experience into apps on an interactive web desktop.",
  status: "shipped", statusDetail: "Live on Vercel.",
  problem: "Explore a developer’s work through a desktop interface while keeping the same content easy to reach on a phone.",
  role: "Designed and built as a personal portfolio project.",
  stack: ["Next.js 14", "React 18", "TypeScript", "Tailwind CSS", "Zustand", "Framer Motion"],
  features: [
    "A desktop shell with a Dock, app launcher, and window switching",
    "Draggable, resizable windows and multiple Spaces that preserve open app state",
    "Portfolio apps for projects, skills, résumé, GitHub, and contact",
    "A browser terminal with a fixed command set and a read-only virtual filesystem",
    "A mobile app grid with a scrollable Dock",
  ],
  media: [
    { kind: "image", src: "/meetos-desktop.webp", alt: "MeetOS desktop with the About and Projects windows open above the Dock", width: 1360, height: 850 },
  ],
  challenges: "Switching Spaces had to preserve open windows and their state during animations. The workspace keeps app components mounted while the surrounding view transitions.",
  liveUrl: "https://meet-os-eight.vercel.app", featured: true, order: 21,
} satisfies Project;

export const projects: readonly Project[] = [
  {
    ...provided, slug: "repograde", name: "RepoGrade", category: "Developer tooling",
    tagline: "Grades GitHub repository health and generates READMEs from the code it analyzes.",
    status: "shipped", statusDetail: "Live on Vercel.",
    stack: ["Next.js 15", "TypeScript", "Go", "PostgreSQL", "Drizzle", "Upstash Redis", "Auth.js", "Inngest", "Gemini API", "tree-sitter", "Turborepo", "Plasmo"],
    features: ["Letter grades across six repository health dimensions", "Documentation drift checks and code-grounded README generation", "Shareable report cards and embeddable badges", "GitHub Action for pull request scoring and a browser extension for inline grades"],
    liveUrl: "https://repo-grade-web.vercel.app", featured: true, currentlyBuilding: true, order: 1,
  },
  {
    ...provided, slug: "hindsight", name: "Hindsight", category: "Local AI",
    tagline: "An offline memory tool for Windows that answers questions about your past activity and shows the evidence behind each answer.",
    role: "Solo project for the Supermemory localhost:6767 hackathon in July 2026.",
    stack: ["Python", "FastAPI", "Uvicorn", "JavaScript", "Supermemory Local", "Ollama", "WSL2", "pywin32", "Pillow"],
    features: ["Local capture of window titles, clipboard text, Chromium history, and screenshot OCR", "Natural-language recall with a timestamped evidence timeline", "Time filters, a daily digest, and a Win+H search overlay", "Capture pause, source toggles, domain exclusions, and memory deletion"],
    repoUrl: "https://github.com/meetkapadia1710-tech/hindsight", featured: true, order: 2,
  },
  {
    ...provided, slug: "playhub", name: "PlayHub (PickleRage)", category: "Sports booking",
    tagline: "A mobile-first court booking app for pickleball and box cricket, built for Android and the web.",
    stack: ["React 19", "TypeScript", "Capacitor", "Tailwind CSS", "Leaflet", "Firebase", "Razorpay", "Framer Motion", "Vite", "Vitest"],
    features: ["Live court availability and reservations", "Google sign-in and Razorpay checkout", "Interactive venue map and Android push notifications", "Admin tools for managing venues, courts, bookings, and users"],
    media: [
      { kind: "image", src: "https://raw.githubusercontent.com/meetkapadia1710-tech/PickleRage_Booking/main/photos/court%201.jpeg", alt: "PickleRage venue court 1", width: 1280, height: 720 },
      { kind: "image", src: "https://raw.githubusercontent.com/meetkapadia1710-tech/PickleRage_Booking/main/photos/court%202.jpeg", alt: "PickleRage venue court 2", width: 1280, height: 720 },
    ],
    repoUrl: "https://github.com/meetkapadia1710-tech/PickleRage_Booking", featured: true, order: 3,
  },
  {
    ...provided, slug: "bd-buildcon-bhumi-developers", name: "BD Buildcon LLP & Bhumi Developers", category: "Corporate websites",
    tagline: "Two internship-built corporate sites showcasing BD Buildcon’s industrial contracting work and Bhumi Developers’ real estate projects.",
    status: "shipped", role: "Web Development Intern",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Lenis", "Lucide React"],
    features: ["Filterable industrial project gallery with individual case pages", "Plant and machinery gallery for BD Buildcon", "Real estate portfolio covering upcoming, ongoing, and completed developments", "Responsive layouts with optimized imagery and deferred video on mobile"],
    media: [
      { kind: "image", src: "https://raw.githubusercontent.com/meetkapadia1710-tech/BD_Buildcon/main/public/new-hero-image.webp", alt: "BD Buildcon hero preview showcasing industrial infrastructure", width: 1536, height: 1024 },
    ],
    repoUrl: "https://github.com/meetkapadia1710-tech/BD_Buildcon", liveUrl: "https://bd-buildcon.vercel.app", featured: true, order: 4,
  },
  {
    ...provided, slug: "api-traffic-optimizer", name: "API Traffic Optimizer", category: "Backend optimization",
    tagline: "An asynchronous FastAPI proxy that cuts duplicate upstream calls for public JSON GET requests.",
    status: "prototype", statusDetail: "Validated locally with a mock upstream API.",
    problem: "Repeated polling wastes upstream work. When a popular cache entry expires, simultaneous misses can also overwhelm the origin before the first response returns.",
    role: "Co-developed the prototype and co-authored the benchmark report with Neev Mendpara and Dishant Marchant.",
    stack: ["Python", "asyncio", "FastAPI", "Uvicorn", "HTTPX", "Redis", "React", "Vite"],
    features: [
      "SHA-256 cache keys normalize query parameter order while preserving repeated values and response variants.",
      "Matching requests share an asyncio future within one process. Expiring, token-checked Redis leases coordinate cache misses across instances.",
      "Authenticated and cookie-bearing requests bypass shared caching. Upstream error responses are never cached.",
      "A React dashboard tracks cache hits, upstream calls, and latency and lets developers simulate requests.",
    ],
    benchmark: {
      methodology: "The report compares direct access, in-memory caching, single-instance Redis, and Redis shared by two proxy instances across 72 cases and 1,608 HTTP requests. The benchmark ran on one workstation with a mock upstream and a fixed 50 ms response delay.",
      findings: [
        { workload: "Repeated queries", result: "The optimized modes made 1 upstream call instead of 30, a 96.67% reduction. In-memory caching lowered mean latency from 64.20 ms to 8.35 ms (86.99%)." },
        { workload: "Concurrent burst", result: "With 30 requests at concurrency 10, each optimized mode made 1 upstream call. Shared Redis across two instances lowered mean latency from 316.55 ms to 204.67 ms (35.34%)." },
        { workload: "Unique queries", result: "All 30 calls reached the origin. Mean latency rose 4.86% in memory mode and 30.15% with single-instance Redis." },
        { workload: "Simulated Redis outage", result: "Both Redis modes returned HTTP 503 without forwarding any fallback requests to the origin." },
      ],
      limitations: "The latency figures are specific to the local synthetic workload. Real network latency and different traffic patterns can change the trade-off. The prototype’s in-memory cache expires entries on access and has no size-based eviction.",
    },
    repoUrl: "https://github.com/DISHANT4714Y/API_TRAFFIC_OPTIMIZER", featured: true, order: 5,
  },
  {
    ...provided, slug: "learnflex", name: "LearnFlex", category: "DBMS project",
    tagline: "A team-built exam prep platform with topic practice, mock tests, daily challenges, and live quiz battles.",
    role: "Practice Mode on a five-person team.",
    stack: ["React 19", "Vite", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Neon", "Socket.IO"],
    features: ["Practice quizzes and scoring rules for JEE, NEET, and UPSC", "Daily challenges and scheduled mock tests", "Live one-on-one quiz battles with matchmaking", "Leaderboards and study activity heatmaps"],
    repoUrl: "https://github.com/DhirGoplani/Learn_Flex", liveUrl: "https://learn-flex-yw72.vercel.app/HomePage", featured: false, order: 6,
  },
  {
    ...provided, slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Progressive web app",
    tagline: "Two tools for Mann Beauty Studio, covering customer loyalty and daily staff attendance.",
    stack: ["React 19", "TypeScript", "Vite PWA", "Firebase", "Zustand", "Tailwind CSS", "Framer Motion", "SheetJS"],
    features: ["Visit tracking and redeemable rewards for customers", "Staff tools for managing loyalty offers and redeeming rewards", "Real-time attendance grid with monthly staff-hour summaries", "CSV attendance exports for payroll"],
    media: [
      { kind: "image", src: "https://raw.githubusercontent.com/meetkapadia1710-tech/Attendance-Manager/main/src/assets/hero.png", alt: "Mann Beauty Studio Attendance Manager hero banner", width: 343, height: 361 },
    ],
    repoUrl: "https://github.com/meetkapadia1710-tech/Attendance-Manager", liveUrl: "https://mann-beauty-parlour.vercel.app", featured: false, order: 7,
  },
  {
    ...provided, slug: "wanderstay", name: "WanderStay", category: "Learning project",
    tagline: "An Airbnb-inspired learning project for browsing, listing, reviewing, and booking stays.",
    stack: ["Node.js", "Express", "EJS", "MongoDB", "Mongoose", "Passport", "Socket.IO", "Stripe", "Cloudinary"],
    features: ["Property listings with photo uploads", "User accounts, ratings, and reviews", "Real-time messaging between users", "Booking flow with Stripe integration"],
    featured: false, order: 8,
  },
  { ...provided, slug: "coastal-blue-carbon", name: "Coastal Blue Carbon Early Warning Platform", tagline: null, category: null, status: "concept", featured: false, order: 9 },
  { ...provided, slug: "hydrogen-ecosystem-map", name: "Hydrogen Ecosystem Map", tagline: null, category: null, status: "concept", stack: ["Leaflet", "PostGIS"], featured: false, order: 10 },
  { ...provided, slug: "green-hydrogen-credits", name: "Blockchain-based Green Hydrogen Credits", tagline: null, category: null, status: "concept", featured: false, order: 11 },
  { ...provided, slug: "robustvision-privacy-lens", name: "RobustVision / Privacy Lens", tagline: "Privacy-preserving ML exploration.", category: null, status: "concept", featured: false, order: 12 },
  { ...provided, slug: "peer-skill-swap", name: "Peer Skill Swap", tagline: null, category: null, status: "concept", featured: false, order: 13 },
  { ...provided, slug: "pocket-noticeboard", name: "Pocket NoticeBoard", tagline: null, category: null, status: "concept", featured: false, order: 14 },
  { ...provided, slug: "receipt-scanner", name: "Receipt Scanner Android app", tagline: null, category: null, status: "concept", featured: false, order: 15 },
  { ...review, slug: "agrisetu", name: "Agrisetu", tagline: "Agriculture information portal.", category: null, reviewNote: "Earlier work; review before publishing.", order: 16 },
  {
    ...review, slug: "nexshell", name: "NexShell",
    tagline: "A team-built, PowerShell-inspired shell written in Go.",
    category: null, role: "Five-person team.", stack: ["Go"],
    features: ["Interactive command execution with pipelines and file redirection", "Built-in commands, aliases, and history", "Sequential tasks configured in YAML"],
    reviewNote: "Earlier work; review before publishing.", order: 17,
  },
  { ...review, slug: "academic-ai-optimizer", name: "AI Optimizer", tagline: "Academic design project.", category: null, reviewNote: "Earlier work; review before publishing. May overlap with API Traffic Optimizer; relationship unconfirmed.", order: 18 },
  { ...review, slug: "flight-booking-frontend", name: "Flight booking frontend", tagline: null, category: null, reviewNote: "Earlier work; review before publishing.", order: 19 },
  { ...review, slug: "gobooking", name: "GoBooking", tagline: "Booking-site frontend.", category: null, reviewNote: "Earlier work; review before publishing.", order: 20 },
  meetOSProject,
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

export function getCurrentlyBuildingProject(): Project | null {
  return getPublicProjects().find((project) => project.currentlyBuilding) ?? null;
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
  benchmark: "Benchmark results",
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
