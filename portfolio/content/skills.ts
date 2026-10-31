import type { SkillCategory, SkillGroup } from "./types";

// Edit this array to add categories or items. No component edits are needed.
// "hands-on" is a supplied skill, not a proficiency rating or independent verification.
// Keep explicitly studied algorithms and academic fundamentals under "study".
export const skillCategories: readonly SkillCategory[] = [
  {
    id: "languages", name: "Languages",
    items: [
      { name: "C", practice: "hands-on" },
      { name: "C++", practice: "hands-on" },
      { name: "Java", practice: "hands-on" },
      { name: "Python", practice: "hands-on" },
      { name: "JavaScript", practice: "hands-on" },
      { name: "TypeScript", practice: "hands-on" },
      { name: "Go", practice: "hands-on" },
    ],
    note: null, overview: "C, C++, Java, Python, JavaScript, TypeScript, Go",
  },
  {
    id: "frontend", name: "Frontend",
    items: [
      { name: "React", practice: "hands-on" },
      { name: "Next.js", practice: "hands-on" },
      { name: "Tailwind CSS", practice: "hands-on" },
      { name: "Framer Motion", practice: "hands-on" },
      { name: "React Three Fiber", practice: "hands-on" },
    ],
    note: null, overview: "React, Next.js, Tailwind CSS, Framer Motion, React Three Fiber",
  },
  {
    id: "backend", name: "Backend",
    items: [
      { name: "Node.js", practice: "hands-on" },
      { name: "Express", practice: "hands-on" },
      { name: "Django", practice: "hands-on" },
      { name: "FastAPI", practice: "hands-on" },
      { name: "REST", practice: "hands-on" },
      { name: "JWT", practice: "hands-on" },
      { name: "Socket.IO", practice: "hands-on" },
    ],
    note: null, overview: "Node.js, Express, Django, FastAPI, REST, JWT, Socket.IO",
  },
  {
    id: "databases", name: "Databases",
    items: [
      { name: "PostgreSQL", practice: "hands-on" },
      { name: "MySQL", practice: "hands-on" },
      { name: "MongoDB", practice: "hands-on" },
      { name: "Firebase", practice: "hands-on" },
      { name: "Prisma", practice: "hands-on" },
      { name: "Drizzle", practice: "hands-on" },
    ],
    note: null, overview: "PostgreSQL, MySQL, MongoDB, Firebase, Prisma, Drizzle",
  },
  {
    id: "ai-ml", name: "AI / ML",
    items: [
      { name: "Gemini integration", practice: "hands-on" },
      { name: "Groq integration", practice: "hands-on" },
      { name: "Ollama integration", practice: "hands-on" },
      { name: "RAG", practice: "hands-on" },
      { name: "Bayesian inference", practice: "study" },
      { name: "HMM", practice: "study" },
      { name: "EM", practice: "study" },
      { name: "K-means", practice: "study" },
      { name: "GMM", practice: "study" },
    ],
    note: "Bayesian inference, HMM, EM, K-means, and GMM are study topics.",
    overview: "Gemini / Groq / Ollama, RAG; Bayesian inference, HMM, EM, K-means, GMM (study topics)",
  },
  {
    id: "tools", name: "Tools",
    items: [
      { name: "Git", practice: "hands-on" },
      { name: "GitHub Actions", practice: "hands-on" },
      { name: "Vercel", practice: "hands-on" },
      { name: "Postman", practice: "hands-on" },
      { name: "Jupyter", practice: "hands-on" },
      { name: "Claude Code", practice: "hands-on" },
      { name: "Blender", practice: "hands-on" },
    ],
    note: null, overview: "Git, GitHub Actions, Vercel, Postman, Jupyter, Claude Code, Blender",
  },
  {
    id: "fundamentals", name: "CS fundamentals",
    items: [
      { name: "DSA", practice: "study" },
      { name: "OOP", practice: "study" },
      { name: "OS", practice: "study" },
      { name: "Networks", practice: "study" },
      { name: "DBMS", practice: "study" },
      { name: "Graphs", practice: "study" },
      { name: "Trees", practice: "study" },
      { name: "Dynamic programming", practice: "study" },
    ],
    note: null, overview: "DSA, OOP, OS, networks, DBMS, graphs, trees, dynamic programming",
  },
  {
    id: "learning", name: "Currently learning",
    items: [
      { name: "Machine Learning", practice: "learning" },
      { name: "Generative AI", practice: "learning" },
      { name: "LangGraph", practice: "learning" },
      { name: "LangChain", practice: "learning" },
      { name: "Concurrency / systems in Go", practice: "learning" },
    ],
    note: null, overview: "Machine Learning, Generative AI (LangGraph + LangChain), concurrency / systems in Go",
  },
];

// Backward-compatible string view for Home and About. Edit skillCategories only.
export const skills: readonly SkillGroup[] = skillCategories.map((category) => ({
  ...category, items: category.items.map((item) => item.name),
}));

export const skillsPageCopy = {
  eyebrow: "The toolkit",
  title: "Skills.",
  description: "Tools, languages, and foundations — with hands-on work separated from current learning and study topics.",
  groupLabels: { handsOn: "Hands-on", learningStudy: "Currently learning / study topics" },
};
