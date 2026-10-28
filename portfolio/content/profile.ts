import type { PageCopy } from "./types";

export const profile = {
  name: "Meet Kapadia",
  displayName: "Meet",
  initials: "MK",
  location: { region: "Gujarat", country: "India", label: "Gujarat, India" },
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

// About-only copy. Keep the Home description above independent of this bio.
export const aboutCopy = {
  bioTitle: "Bio",
  bio: "I'm a Computer Science undergraduate at IIIT Vadodara with a strong interest in building practical software products. I enjoy working across the software development process, from creating responsive interfaces to implementing backend logic, designing data flows, and integrating external services. My interests include full-stack development, backend systems, database engineering, data structures and algorithms, and applied artificial intelligence. I believe the best way to learn software engineering is to build, test, debug, and continuously improve real projects.",
  educationTitle: "Education",
  cgpaLabel: "CGPA",
  experienceTitle: "Internship experience",
  documentsLabel: "Documents",
  campusTitle: "Campus communities",
  learningTitle: "What I'm learning",
  nextTitle: "What I want to explore next",
  // Supplied interests only; this is not a list of claimed experience or accomplishments.
  exploreNext: ["Full-stack development", "Backend systems", "Database engineering", "Data structures and algorithms", "Applied artificial intelligence"],
};
