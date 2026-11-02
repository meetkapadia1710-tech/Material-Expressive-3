import type { PageCopy } from "./types";

export const profile = {
  name: "Meet Kapadia",
  displayName: "Meet",
  initials: "MK",
  location: { region: "Gujarat", country: "India", label: "Ahmedabad, Gujarat, India" },
  headline: "Building thoughtful software, from interfaces to intelligent systems.",
  description: "I'm a Computer Science undergraduate at IIIT Vadodara interested in full-stack development, backend engineering, databases, and applied AI/ML. I enjoy turning ideas into functional products, exploring system design, and solving challenging programming problems.",
  education: {
    degree: "B.Tech",
    field: "Computer Science and Engineering",
    institution: "IIIT Vadodara",
    startYear: 2024,
    endYear: 2028,
    cgpa: 8.31 as number | null,
    cgpaScale: null as number | null,
  },
  heroLabels: ["Computer Science @ IIIT Vadodara", "Full-Stack Development", "Backend & Databases", "AI/ML Exploration"],
  internshipTarget: "Targeting SDE and full-stack engineering internships.",
  campus: ["9bit Technical Community", "Dot Design Club", "Obscura Photography Club"],
  portrait: null as { src: string; alt: string } | null,
  phone: null as string | null,
  personalWebsiteUrl: null as string | null,
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
] as const;

export const siteCopy = {
  metadata: { title: "Meet Kapadia — Portfolio", description: profile.headline },
  skipLink: "Skip to content",
  navigationLabel: "Main navigation",
  homeLinkLabel: "Meet Kapadia, home",
  footerLabel: "Find me elsewhere",
  footerNote: "Thoughtful software. Always learning.",
  unverified: "Unverified",
  backToProjects: "All projects",
  placeholder: { label: "A little more, soon.", description: "This page is taking shape. For now, explore the work on the home page.", linkLabel: "Back to home" },
  notFound: { eyebrow: "Page not found", title: "A small detour.", description: "That page isn't here. Let's get you back to the beginning.", linkLabel: "Back to home" },
  projectDetail: { eyebrow: "Project", placeholder: "The project story is taking shape. More details will be added here.", repoLabel: "View repository", liveLabel: "Visit website" },
};

export const homeCopy = {
  eyebrow: "Hello, I'm",
  introduction: "A curious mind. A builder at heart.",
  workCta: { label: "Explore My Work", href: "#selected-projects" },
  contactCta: { label: "Get in Touch", href: "/contact" },
  githubCta: { label: "View GitHub" },
  linkedinCta: { label: "LinkedIn" },
  resumeCta: { label: "View Resume", href: "https://miniresumemeet.vercel.app" },
  buildingStatus: { tag: "Currently building", project: "RepoGrade", href: "/projects/repograde", desc: "AST code scoring & ratings" },
  illustration: { center: "Make it", emphasis: "thoughtful.", caption: "Ideas → interfaces → systems", topLabel: "Curiosity, in progress", bottomLabel: "Learning by building" },
  projects: { eyebrow: "Ideas into things", title: "Selected projects.", description: "A few things I've been building across the web, backend systems, and applied AI.", allLabel: "All projects", featuredLabel: "Lead project", detailLabel: "Explore project", stackLabel: "Built with", statusLabels: { shipped: "Shipped", "in-progress": "In progress", prototype: "Prototype", concept: "Concept" } },
  skills: { eyebrow: "The toolkit", title: "Different tools. Same curiosity.", description: "The languages, systems, and ideas I work with — and the ones I'm exploring next.", linkLabel: "Explore my skills" },
  contact: { eyebrow: "Let's connect", title: "Something thoughtful starts with a conversation.", description: profile.internshipTarget, emailLabel: "Say hello", pageLabel: "Get in touch" },
};

export const pageCopy = {
  projects: { eyebrow: "The work", title: "Projects.", description: "Projects, experiments, and the thinking behind them." },
  about: { eyebrow: "A little context", title: "About Meet.", description: null },
  skills: { eyebrow: "The toolkit", title: "Skills.", description: null },
  achievements: { eyebrow: "Along the way", title: "Achievements.", description: null },
  contact: { eyebrow: "Let's connect", title: "Get in touch.", description: null },
} satisfies Record<string, PageCopy>;

export interface TimelineMilestone {
  id: string;
  category: string;
  dateLabel: string;
  title: string;
  organization: string;
  description: string;
  chips: readonly string[];
  status: string | null;
  current: boolean;
  shape: "roundedSquare" | "circle" | "scalloped" | "blob";
  viewShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  hoverShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  focusShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  pressShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  toneRole: "secondary" | "tertiary" | "primary";
  documents?: readonly { label: string; url: string | null }[];
}

export const aboutMilestones: readonly TimelineMilestone[] = [
  {
    id: "bhumi-internship",
    category: "Corporate Internship",
    dateLabel: "19 May – 25 July 2026",
    title: "Web Development Intern",
    organization: "Bhumi Developers / BD Buildcon LLP",
    description: "Built two production corporate sites in Bharuch.",
    chips: ["Full-Stack", "Web Development", "Production Deployment"],
    status: null,
    current: false,
    shape: "roundedSquare",
    viewShape: "circle",
    hoverShape: "scalloped",
    focusShape: "blob",
    pressShape: "circle",
    toneRole: "secondary",
    documents: [
      { label: "Certificate of internship", url: null },
      { label: "Letter of recommendation", url: null },
    ],
  },
  {
    id: "supermemory-hackathon",
    category: "Supermemory Hackathon",
    dateLabel: "July 2026",
    title: "Built Hindsight · 100% Local AI Memory",
    organization: "Supermemory / Local Windows AI Track",
    description: "Architected 100% local Windows AI memory with Win32 screen capture, on-device OCR, and local vector embeddings. Zero cloud dependency.",
    chips: ["Local-First", "Ollama", "Win32", "SQLite"],
    status: null,
    current: false,
    shape: "scalloped",
    viewShape: "blob",
    hoverShape: "circle",
    focusShape: "roundedSquare",
    pressShape: "blob",
    toneRole: "tertiary",
    documents: [],
  },
  {
    id: "systems-architecture",
    category: "Systems Architecture",
    dateLabel: "Late 2026",
    title: "RepoGrade & M3 Expressive Architecture",
    organization: "System Architecture & Open-Source Engineering",
    description: "Architectural deep-dive into AST code scoring engines, dynamic HCT palette algorithms, and fluid physics interactions with spring kinematics.",
    chips: ["AST Engines", "M3 Color Science", "Physics Springs", "Turborepo"],
    status: null,
    current: true,
    shape: "blob",
    viewShape: "roundedSquare",
    hoverShape: "scalloped",
    focusShape: "circle",
    pressShape: "roundedSquare",
    toneRole: "primary",
    documents: [],
  },
];

export interface CampusCommunity {
  id: string;
  name: string;
  category: string;
  period: string;
  description: string;
  icon: "code" | "palette" | "camera";
  shape: "roundedSquare" | "circle" | "scalloped" | "blob";
  hoverShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  focusShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  pressShape: "roundedSquare" | "circle" | "scalloped" | "blob";
}

export const aboutCampusCommunities: readonly CampusCommunity[] = [
  {
    id: "9bit",
    name: "9bit Technical Community",
    category: "Technical",
    period: "Oct 2024 – Present",
    description: "Coding competitions, open-source workshops, peer learning, and hackathon teams.",
    icon: "code",
    shape: "roundedSquare",
    hoverShape: "circle",
    focusShape: "blob",
    pressShape: "circle",
  },
  {
    id: "dot",
    name: "Dot Design Club",
    category: "Design",
    period: "Aug 2025 – Present",
    description: "UI/UX design sprints, design systems, Material Expressive aesthetics, and creative branding.",
    icon: "palette",
    shape: "scalloped",
    hoverShape: "blob",
    focusShape: "roundedSquare",
    pressShape: "blob",
  },
  {
    id: "obscura",
    name: "Obscura Photography Club",
    category: "Photography",
    period: "Aug 2025 – Present",
    description: "Visual composition, framing, attention to detail, event coverage, and light/perspective study.",
    icon: "camera",
    shape: "blob",
    hoverShape: "roundedSquare",
    focusShape: "circle",
    pressShape: "roundedSquare",
  },
];

export interface AboutLearningItem {
  id: string;
  name: string;
  status: "Core Focus" | null;
  supportingText: string;
  icon: "brain" | "spark" | "graph" | "link" | "terminal";
  shape: "roundedSquare" | "circle" | "scalloped" | "blob";
  hoverShape: "roundedSquare" | "circle" | "scalloped" | "blob";
}

export const aboutLearningItems: readonly AboutLearningItem[] = [
  {
    id: "machine-learning",
    name: "Machine Learning",
    status: "Core Focus",
    supportingText: "Foundational theory & statistical models",
    icon: "brain",
    shape: "roundedSquare",
    hoverShape: "circle",
  },
  {
    id: "generative-ai",
    name: "Generative AI",
    status: null,
    supportingText: "LLM integration, prompting & embeddings",
    icon: "spark",
    shape: "scalloped",
    hoverShape: "blob",
  },
  {
    id: "langgraph",
    name: "LangGraph",
    status: null,
    supportingText: "Cyclic stateful agentic graph workflows",
    icon: "graph",
    shape: "blob",
    hoverShape: "roundedSquare",
  },
  {
    id: "langchain",
    name: "LangChain",
    status: null,
    supportingText: "Tool composition & document retrieval",
    icon: "link",
    shape: "roundedSquare",
    hoverShape: "scalloped",
  },
  {
    id: "concurrency-go",
    name: "Concurrency / systems in Go",
    status: null,
    supportingText: "Goroutines, channels & low-latency execution",
    icon: "terminal",
    shape: "circle",
    hoverShape: "blob",
  },
];

export interface AboutExploreItem {
  id: string;
  name: string;
  supportingText: string;
  icon: "layers" | "terminal" | "database" | "code" | "cpu";
  shape: "roundedSquare" | "circle" | "scalloped" | "blob";
  hoverShape: "roundedSquare" | "circle" | "scalloped" | "blob";
}

export const aboutExploreItems: readonly AboutExploreItem[] = [
  {
    id: "full-stack",
    name: "Full-stack development",
    supportingText: "End-to-end type-safe product architecture",
    icon: "layers",
    shape: "roundedSquare",
    hoverShape: "circle",
  },
  {
    id: "backend-systems",
    name: "Backend systems",
    supportingText: "Distributed APIs & resilient services",
    icon: "terminal",
    shape: "circle",
    hoverShape: "blob",
  },
  {
    id: "database-engineering",
    name: "Database engineering",
    supportingText: "Relational indexing, 3NF schema design & migrations",
    icon: "database",
    shape: "scalloped",
    hoverShape: "roundedSquare",
  },
  {
    id: "dsa",
    name: "Data structures and algorithms",
    supportingText: "Optimal complexity & asymptotic problem solving",
    icon: "code",
    shape: "blob",
    hoverShape: "circle",
  },
  {
    id: "applied-ai",
    name: "Applied artificial intelligence",
    supportingText: "On-device intelligence & real-world utility",
    icon: "cpu",
    shape: "roundedSquare",
    hoverShape: "scalloped",
  },
];

export interface SchoolEducation {
  id: string;
  institution: string;
  qualification: string;
  classLevel: string;
  year: number;
  yearLabel: string;
  score: string;
  screenReaderText: string;
  shape: "roundedSquare" | "circle" | "scalloped" | "blob";
  hoverShape: "roundedSquare" | "circle" | "scalloped" | "blob";
  icon: "school" | "book" | "layers" | "spark";
}

export const aboutSchoolEducation: readonly SchoolEducation[] = [
  {
    id: "cosmos-castle",
    institution: "Cosmos Castle International School",
    qualification: "Higher Secondary Certificate (HSC)",
    classLevel: "Class XII",
    year: 2024,
    yearLabel: "2024",
    score: "89.8%",
    screenReaderText: "Class XII, 2024, 89.8 percent",
    shape: "scalloped",
    hoverShape: "blob",
    icon: "book",
  },
  {
    id: "sanskar-vidhya-bhavan",
    institution: "Sanskar Vidhya Bhavan",
    qualification: "Secondary School Certificate (SSC)",
    classLevel: "Class X",
    year: 2022,
    yearLabel: "2022",
    score: "92.33%",
    screenReaderText: "Class X, 2022, 92.33 percent",
    shape: "circle",
    hoverShape: "roundedSquare",
    icon: "book",
  },
];

// About-only copy. Keep the Home description above independent of this bio.
export const aboutCopy = {
  bioTitle: "Bio",
  bio: "I'm a Computer Science undergraduate at IIIT Vadodara with a strong interest in building practical software products. I enjoy working across the software development process, from creating responsive interfaces to implementing backend logic, designing data flows, and integrating external services. My interests include full-stack development, backend systems, database engineering, data structures and algorithms, and applied artificial intelligence. I believe the best way to learn software engineering is to build, test, debug, and continuously improve real projects.",
  educationTitle: "Education",
  cgpaLabel: "CGPA",
  experienceTitle: "Experience and milestones",
  documentsLabel: "Documents",
  campusTitle: "Campus communities",
  learningTitle: "What I'm learning",
  nextTitle: "What I want to explore next",
  // Supplied interests only; this is not a list of claimed experience or accomplishments.
  exploreNext: ["Full-stack development", "Backend systems", "Database engineering", "Data structures and algorithms", "Applied artificial intelligence"],
  milestones: aboutMilestones,
  campusCommunities: aboutCampusCommunities,
  learningItems: aboutLearningItems,
  exploreItems: aboutExploreItems,
  schools: aboutSchoolEducation,
};
