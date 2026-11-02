export interface SkillProjectLink {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  status: string;
  liveUrl: string | null;
  repoUrl: string | null;
}

export interface SkillDetail {
  name: string;
  role: string;
  description: string;
  projects: SkillProjectLink[];
  highlights?: string[];
}

/**
 * Maps skill names to projects and contextual architectural applications in Meet's portfolio.
 */
export const skillDetailsMap: Record<string, SkillDetail> = {
  // Languages
  "C": {
    name: "C",
    role: "Low-Level Systems & Memory Management",
    description: "Foundational systems programming with pointer arithmetic, manual memory allocation, POSIX system calls, and operating system kernels.",
    projects: [],
    highlights: ["POSIX system call dispatch", "Bitwise manipulation & memory structures", "Low-level OS process management"],
  },
  "C++": {
    name: "C++",
    role: "High-Performance Algorithms & Competitive Programming",
    description: "Primary language for algorithmic competitions and technical interviews. Standard Template Library (STL) mastery across 760+ solved challenges on LeetCode.",
    projects: [],
    highlights: ["762 LeetCode problems solved (371 Easy, 336 Medium, 55 Hard)", "Custom comparator heaps, segment trees, and disjoint-set unions", "Zero-overhead abstractions & template metaprogramming"],
  },
  "Java": {
    name: "Java",
    role: "Object-Oriented Enterprise Systems",
    description: "Enterprise backend development, design patterns, and multithreaded systems architecture built upon JVM runtimes.",
    projects: [],
    highlights: ["Object-oriented analysis and design (OOAD)", "Java Concurrency API & thread synchronization", "SOLID design patterns & interface-driven architecture"],
  },
  "Python": {
    name: "Python",
    role: "AI/ML Systems & Asynchronous Backends",
    description: "Used to develop asynchronous microservices, local LLM inference gateways, and computer vision / memory agents.",
    projects: [
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
    ],
    highlights: ["Asynchronous FastAPI & Uvicorn streaming", "Local Ollama deepseek-r1:8b orchestration", "PIL & PyWin32 desktop visual context capture"],
  },
  "JavaScript": {
    name: "JavaScript",
    role: "Dynamic Web Engineering & Event Loop Mastery",
    description: "Full-stack language used across SPAs, browser extensions, real-time WebSockets, and Node.js backend runtimes.",
    projects: [
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["Event loop mechanics & asynchronous microtasks", "DOM mutation optimization & fluid canvas animations", "PWA service worker caching & offline sync"],
  },
  "TypeScript": {
    name: "TypeScript",
    role: "Type-Safe Production Architecture",
    description: "Primary language for modern production engineering. Enforces compile-time guarantees, discriminated unions, and strict generic interfaces across web and mobile platforms.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "playhub", name: "PlayHub (PickleRage)", category: "Mobile app & community", tagline: "Cross-platform mobile court booking app with court locator and slot reservations.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/pickle-rage" },
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["Strict compiler configurations & zero 'any' policy", "Exhaustive pattern matching with discriminated unions", "Type-safe database schemas with Drizzle ORM"],
  },
  "Go": {
    name: "Go",
    role: "High-Throughput Systems & CLI Tooling",
    description: "Systems programming language used for CLI tools, AST code parsing, concurrent worker pools, and Unix shell implementations.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "nexshell", name: "NexShell", category: "CLI systems tooling", tagline: "Custom Unix shell in Go with command execution, pipelines, and signal dispatch.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/NexShell" },
    ],
    highlights: ["Custom Unix shell with I/O redirection & pipelines", "Tree-sitter AST parsing for multi-language code analysis", "Goroutine channel concurrency with context cancellation"],
  },

  // Frontend
  "React": {
    name: "React",
    role: "Component-Driven Declarative Interfaces",
    description: "Core frontend library for architecting reactive client applications, custom hooks, and mobile interfaces via Capacitor.",
    projects: [
      { slug: "playhub", name: "PlayHub (PickleRage)", category: "Mobile app & community", tagline: "Cross-platform mobile court booking app with court locator and slot reservations.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/pickle-rage" },
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["React 19 hooks & transition actions", "Custom fluid motion & spring physics listeners", "Cross-platform mobile architecture with Capacitor"],
  },
  "Next.js": {
    name: "Next.js",
    role: "Full-Stack React Framework & SSR / ISR",
    description: "Production framework powering scalable web platforms with Turbopack, App Router, Static Site Generation, and Edge Middleware.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
    ],
    highlights: ["App Router architecture with React Server Components", "Incremental Static Regeneration (ISR) with background caching", "Dynamic API route handlers with automated revalidation"],
  },
  "Tailwind CSS": {
    name: "Tailwind CSS",
    role: "Utility-First Responsive Styling",
    description: "Utility CSS framework providing design token consistency, mobile-first responsive layouts, and zero-runtime CSS footprint.",
    projects: [
      { slug: "playhub", name: "PlayHub (PickleRage)", category: "Mobile app & community", tagline: "Cross-platform mobile court booking app with court locator and slot reservations.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/pickle-rage" },
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["Design token binding with CSS custom properties", "Container queries & adaptive viewport layouts", "Purged production stylesheets under 15KB"],
  },
  "Framer Motion": {
    name: "Framer Motion",
    role: "Expressive Physics-Based Animation",
    description: "Declarative spring animation library powering gesture tracking, layout transitions, and fluid interactive feedback.",
    projects: [
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["Spring-damped physics with stiffness/damping tuning", "AnimatePresence layout morphing on filter updates", "Respects prefers-reduced-motion accessibility preferences"],
  },
  "React Three Fiber": {
    name: "React Three Fiber",
    role: "Declarative 3D WebGL Visualization",
    description: "Three.js React renderer powering interactive 3D viewports, spatial master plans, and dynamic color-responsive canvas effects.",
    projects: [
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
    ],
    highlights: ["Interactive 3D real estate master plan with camera orbits", "Shader-level performance optimization on mobile", "Powers the interactive 3D canvas on this portfolio"],
  },

  // Backend
  "Node.js": {
    name: "Node.js",
    role: "Asynchronous Server Runtimes",
    description: "Non-blocking I/O runtime powering full-stack web platforms, REST APIs, background job workers, and monorepo developer tooling.",
    projects: [
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
    ],
    highlights: ["Asynchronous event-driven architecture", "Turborepo monorepo orchestration", "Inngest durable background execution"],
  },
  "Express": {
    name: "Express",
    role: "RESTful HTTP Middleware Framework",
    description: "Lightweight web framework providing routing, session handling, authentication middleware, and REST API controllers.",
    projects: [
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
    ],
    highlights: ["Custom error-handling middleware chains", "Passport.js local & OAuth session strategies", "REST API resource controllers with Mongoose"],
  },
  "Django": {
    name: "Django",
    role: "Battery-Included Enterprise Web Framework",
    description: "Python web framework featuring ORM migrations, built-in administrative portals, and secure user management.",
    projects: [],
    highlights: ["Declarative model schema migrations", "Django REST Framework (DRF) serialization", "Built-in CSRF, XSS, and SQL injection defenses"],
  },
  "FastAPI": {
    name: "FastAPI",
    role: "High-Performance Asynchronous Python APIs",
    description: "Async Python web framework built on Starlette and Pydantic with automated OpenAPI docs and streaming support.",
    projects: [
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
    ],
    highlights: ["Server-Sent Events (SSE) token streaming from local LLMs", "Strict Pydantic request/response payload validation", "Zero-cloud local inference proxy architecture"],
  },
  "REST": {
    name: "REST",
    role: "Architectural API Pattern",
    description: "Stateless client-server architecture with semantic HTTP methods, JSON content negotiation, and idempotent endpoints.",
    projects: [
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
    ],
    highlights: ["Idempotent PUT/DELETE and query-filtered GET endpoints", "Consistent HTTP status code contracts (200, 201, 400, 401, 404, 500)", "Structured pagination, filtering, and error payloads"],
  },
  "JWT": {
    name: "JWT",
    role: "Stateless Cryptographic Authentication",
    description: "JSON Web Tokens with HMAC SHA-256 signing for stateless session management, role-based access control, and API authorization.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
    ],
    highlights: ["Short-lived access tokens with rotating refresh tokens", "Stateless authorization header verification", "Auth.js OAuth token integration"],
  },
  "Socket.IO": {
    name: "Socket.IO",
    role: "Real-Time Bi-Directional Event Streams",
    description: "Full-duplex WebSocket communication with automated fallback to HTTP long-polling for real-time messaging and notifications.",
    projects: [
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
    ],
    highlights: ["Sub-50ms room-based chat broadcasting", "Heartbeat monitoring with automatic reconnection", "Connection state recovery across network drops"],
  },

  // Databases
  "PostgreSQL": {
    name: "PostgreSQL",
    role: "Relational ACID Database Engine",
    description: "Advanced open-source relational database. Utilized for 3NF normalized schemas, JSONB columns, foreign key cascades, and composite indexing.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "learnflex", name: "LearnFlex", category: "EdTech web application", tagline: "Adaptive learning platform with modular course paths and student analytics.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/learnflex" },
    ],
    highlights: ["Normalized 3NF table design with composite unique indexes", "Serverless PostgreSQL pooling via Neon", "Declarative schema migrations via Drizzle ORM"],
  },
  "MySQL": {
    name: "MySQL",
    role: "Relational Database Management",
    description: "Relational database used for transactional schema design, query optimization, and relational DBMS coursework.",
    projects: [],
    highlights: ["B-Tree indexing strategies for primary/foreign keys", "ACID transaction isolation levels", "Complex SQL joins, group-by aggregations, and subqueries"],
  },
  "MongoDB": {
    name: "MongoDB",
    role: "Document-Oriented NoSQL Store",
    description: "Schema-flexible document database utilized for rapid prototyping, polymorphic data models, and nested listing records.",
    projects: [
      { slug: "wanderstay", name: "WanderStay", category: "Full-stack web application", tagline: "Vacation rental marketplace with listing discovery, reviews, and bookings.", status: "shipped", liveUrl: "https://wanderstay.onrender.com", repoUrl: "https://github.com/meetkapadia1710-tech/WanderStay" },
    ],
    highlights: ["Mongoose ODM schema validation and virtual properties", "Geospatial indexing for location-based listing queries", "Aggregation pipelines for analytical review calculations"],
  },
  "Firebase": {
    name: "Firebase",
    role: "Cloud BaaS & Real-Time Data Sync",
    description: "Google cloud infrastructure providing Firestore real-time synchronization, phone/email auth, and file storage for mobile apps.",
    projects: [
      { slug: "playhub", name: "PlayHub (PickleRage)", category: "Mobile app & community", tagline: "Cross-platform mobile court booking app with court locator and slot reservations.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/pickle-rage" },
      { slug: "mann-beauty-studio", name: "Mann Beauty Studio", category: "Client PWA & booking", tagline: "Salon booking PWA with offline catalog, appointment booking, and owner dashboard.", status: "shipped", liveUrl: "https://mannbeautystudio.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/mann-beauty-studio" },
    ],
    highlights: ["Firestore live listeners for real-time slot reservation sync", "Firebase Authentication rules & security enforcement", "Cloud Storage for mobile media uploads"],
  },
  "Prisma": {
    name: "Prisma",
    role: "Type-Safe Relational ORM",
    description: "Next-generation Node.js & TypeScript ORM with declarative schema modeling and auto-generated query clients.",
    projects: [],
    highlights: ["Declarative schema modeling with relation fields", "Auto-generated TypeScript types matching table schemas", "Atomic transactions with $transaction API"],
  },
  "Drizzle": {
    name: "Drizzle",
    role: "Zero-Overhead SQL TypeScript ORM",
    description: "Lightweight, type-safe SQL query builder and schema declaration framework matching relational PostgreSQL semantics.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
    ],
    highlights: ["Zero-runtime overhead with direct SQL translation", "Declarative migration generation with drizzle-kit", "Type-safe relational joins and audit cascade rules"],
  },

  // AI / ML
  "Gemini integration": {
    name: "Gemini integration",
    role: "Multimodal Foundation Model Orchestration",
    description: "Deep integration with Google Gemini 2.0 / 1.5 models for automated code summarization, README synthesis, and semantic analysis.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
    ],
    highlights: ["Structured JSON schema output enforcement", "Repository codebase summarization with AST context", "Few-shot prompt engineering for accurate grading"],
  },
  "Groq integration": {
    name: "Groq integration",
    role: "Ultra-Low-Latency LPU Inference",
    description: "High-speed token generation API integration leveraging Language Processing Units (LPUs) for sub-second interactive chat and agents.",
    projects: [],
    highlights: ["Sub-second token latency for conversational interfaces", "Llama-3 & Mixtral endpoint integration", "Streaming API consumption via asynchronous HTTP"],
  },
  "Ollama integration": {
    name: "Ollama integration",
    role: "Local Edge LLM Runtime",
    description: "Local model execution runtime ensuring 100% data privacy and offline capability with DeepSeek-R1 and Llama architectures.",
    projects: [
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
    ],
    highlights: ["Local inference with zero cloud data transmission", "DeepSeek-R1:8b distilled reasoning model orchestration", "NDJSON streaming response parser in Python"],
  },
  "RAG": {
    name: "RAG",
    role: "Retrieval-Augmented Generation Pipelines",
    description: "Grounds generative AI models in factual external data using vector similarity, chunking strategies, and semantic context injection.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
    ],
    highlights: ["Chunking & overlap strategies for source code and documents", "Context window budgeting to avoid hallucination", "Grounded README generation from real repository ASTs"],
  },

  // Academic AI / ML Foundations
  "Bayesian inference": {
    name: "Bayesian inference",
    role: "Probabilistic Modeling & Statistical Foundation",
    description: "Mathematical study of prior distributions, likelihood estimation, and posterior updates via Bayes' Theorem under uncertainty.",
    projects: [],
    highlights: ["Prior to posterior probability updating", "Maximum A Posteriori (MAP) vs Maximum Likelihood (MLE)", "Probabilistic graphical model foundations"],
  },
  "HMM": {
    name: "HMM",
    role: "Hidden Markov Models & Sequential State Inference",
    description: "Probabilistic graphical models representing systems that transition between unobserved latent states over discrete time steps.",
    projects: [],
    highlights: ["Forward-Backward algorithm for state likelihoods", "Viterbi algorithm for most probable sequence decoding", "Baum-Welch algorithm for parameter estimation"],
  },
  "EM": {
    name: "EM",
    role: "Expectation-Maximization Optimization",
    description: "Iterative mathematical optimization algorithm finding maximum likelihood estimates in statistical models with unobserved latent variables.",
    projects: [],
    highlights: ["E-step: calculating expected log-likelihood of latent states", "M-step: maximizing parameters with respect to expectations", "Convergence proofs and local maxima behavior"],
  },
  "K-means": {
    name: "K-means",
    role: "Unsupervised Centroid-Based Clustering",
    description: "Iterative vector quantization algorithm partitioning observations into k Voronoi cells minimizing within-cluster sum of squares.",
    projects: [],
    highlights: ["Voronoi cell geometric partitioning", "Elbow method & silhouette coefficient evaluation", "Initialization heuristics (K-means++)"],
  },
  "GMM": {
    name: "GMM",
    role: "Gaussian Mixture Models & Density Estimation",
    description: "Probabilistic model assuming data points are generated from a mixture of finite Gaussian distributions with unknown parameters.",
    projects: [],
    highlights: ["Soft clustering with posterior probability assignment", "Multivariate covariance matrix structures (full vs diagonal)", "Trained via Expectation-Maximization"],
  },

  // Tools
  "Git": {
    name: "Git",
    role: "Distributed Version Control System",
    description: "Core version control toolchain: branching strategies, interactive rebasing, merge conflict resolution, and commit hygiene.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "hindsight", name: "Hindsight", category: "AI memory agent", tagline: "Autonomous background agent converting desktop visual context into structured memory.", status: "prototype", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/hindsight" },
    ],
    highlights: ["Atomic commit discipline with descriptive semantics", "Trunk-based development & feature branch workflows", "Git plumbing inspection (blobs, trees, commit SHAs)"],
  },
  "GitHub Actions": {
    name: "GitHub Actions",
    role: "Continuous Integration & Deployment (CI/CD)",
    description: "Automated workflow pipelines executing linting, TypeScript verification, unit tests, and automated releases on pull requests.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
    ],
    highlights: ["Multi-step test execution matrices", "Automated npm release & Vercel deployment hooks", "Secret management & security auditing"],
  },
  "Vercel": {
    name: "Vercel",
    role: "Edge Hosting & Production Cloud Infrastructure",
    description: "Primary cloud deployment platform utilizing Edge Middleware, global CDN caching, and automated preview deployments.",
    projects: [
      { slug: "repograde", name: "RepoGrade", category: "Developer tooling", tagline: "Scores and rates GitHub repos and generates READMEs grounded in the actual code.", status: "shipped", liveUrl: "https://repo-grade-web.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/RepoGrade" },
      { slug: "bd-buildcon", name: "BD Buildcon LLP & Bhumi Developers", category: "Production web platform", tagline: "Commercial real estate site with 3D master plans, unit filters, and inquiry pipeline.", status: "shipped", liveUrl: "https://bhumidevelopers.vercel.app", repoUrl: "https://github.com/meetkapadia1710-tech/bd-buildcon" },
    ],
    highlights: ["Zero-configuration Next.js Turbopack build pipelines", "Global edge caching with sub-50ms TTFB", "Custom domain DNS routing & automated SSL"],
  },
  "Postman": {
    name: "Postman",
    role: "API Testing & Contract Validation",
    description: "Environment variable collections, automated assertions, and endpoint testing across REST and WebSocket services.",
    projects: [],
    highlights: ["Automated pre-request scripts & test assertions", "Environment variable scoping (Local, Staging, Prod)", "API mock servers & contract documentation"],
  },
  "Jupyter": {
    name: "Jupyter",
    role: "Interactive Notebooks & Data Exploration",
    description: "Interactive computing environment used for prototyping algorithms, charting statistical distributions, and validating models.",
    projects: [],
    highlights: ["Exploratory data analysis with NumPy & Pandas", "Loss curve & performance metric visualization", "Algorithmic proof-of-concept prototyping"],
  },
  "Claude Code": {
    name: "Claude Code",
    role: "Agentic Engineering & Terminal Toolchain",
    description: "CLI agentic workflow toolchain utilized for codebase exploration, refactoring verification, and automated scripting.",
    projects: [],
    highlights: ["Autonomous subagent orchestration", "Command-line development & test-driven refactoring", "AST-aware semantic codebase search"],
  },
  "Blender": {
    name: "Blender",
    role: "3D Asset Modeling & Spatial Design",
    description: "3D creation suite used for low-poly mesh modeling, material creation, and WebGL asset optimization for Three.js viewports.",
    projects: [],
    highlights: ["Low-poly architectural asset modeling", "PBR material creation & UV unwrapping", "glTF / GLB binary export optimized for web rendering"],
  },

  // CS Fundamentals
  "DSA": {
    name: "DSA",
    role: "Data Structures & Algorithms Mastery",
    description: "Rigorous algorithmic problem solving spanning trees, graphs, dynamic programming, heaps, and two-pointer techniques across 762 LeetCode problems.",
    projects: [],
    highlights: ["762 problems solved (371 Easy, 336 Medium, 55 Hard)", "Time & space complexity asymptotic analysis", "Sliding window, monotonic stack, and union-find patterns"],
  },
  "OOP": {
    name: "OOP",
    role: "Object-Oriented Programming Principles",
    description: "Encapsulation, inheritance, polymorphism, and abstraction applied to create maintainable, decoupled system architectures.",
    projects: [],
    highlights: ["SOLID design principles & dependency inversion", "Design patterns (Factory, Observer, Strategy, Singleton)", "Composition over inheritance architectures"],
  },
  "OS": {
    name: "OS",
    role: "Operating Systems Architecture",
    description: "Computer science degree foundation: process scheduling, threads, virtual memory paging, concurrency primitives, and file system layouts.",
    projects: [
      { slug: "nexshell", name: "NexShell", category: "CLI systems tooling", tagline: "Custom Unix shell in Go with command execution, pipelines, and signal dispatch.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/NexShell" },
    ],
    highlights: ["Process lifecycle, fork/exec, and signal handling", "Virtual memory translation & page replacement algorithms", "Deadlock conditions and mutual exclusion (mutexes, semaphores)"],
  },
  "Networks": {
    name: "Networks",
    role: "Computer Networking & Protocols",
    description: "OSI and TCP/IP stack layers, TCP flow control, UDP datagrams, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS resolution, and TLS handshakes.",
    projects: [],
    highlights: ["TCP three-way handshake & congestion control", "TLS 1.3 cryptographic key exchange", "DNS propagation & routing protocols"],
  },
  "DBMS": {
    name: "DBMS",
    role: "Database Management Systems Theory",
    description: "Database internals: relational algebra, B+ tree index structures, Write-Ahead Logging (WAL), transaction ACID guarantees, and normalization forms.",
    projects: [],
    highlights: ["Relational algebra & relational calculus", "1NF, 2NF, 3NF, and BCNF normalization", "Two-Phase Locking (2PL) and serializability"],
  },
  "Graphs": {
    name: "Graphs",
    role: "Graph Theory & Network Traversal",
    description: "Adjacency representation, BFS shortest paths, DFS topological sort, Dijkstra's algorithm, Bellman-Ford, and Minimum Spanning Trees (Kruskal/Prim).",
    projects: [],
    highlights: ["Topological sorting & cycle detection in DAGs", "Dijkstra's shortest path with min-heaps", "Bipartite graph matching and strongly connected components"],
  },
  "Trees": {
    name: "Trees",
    role: "Hierarchical Data Structures",
    description: "Binary search trees, self-balancing AVL/Red-Black trees, Trie prefix trees, and Segment Trees with lazy propagation.",
    projects: [],
    highlights: ["Trie prefix trees for auto-complete and dictionary lookup", "Segment Trees for range minimum/sum queries with O(log N) updates", "Lowest Common Ancestor (LCA) with binary lifting"],
  },
  "Dynamic programming": {
    name: "Dynamic programming",
    role: "Optimal Substructure & Memoization",
    description: "Breaking complex optimization problems into overlapping subproblems using top-down memoization and bottom-up tabulation.",
    projects: [],
    highlights: ["0/1 Knapsack & unbounded knapsack variants", "Longest Common Subsequence (LCS) & Edit Distance", "Bitmask dynamic programming for exponential state spaces"],
  },

  // Currently Learning
  "Machine Learning": {
    name: "Machine Learning",
    role: "Statistical Learning & Neural Networks",
    description: "Active coursework studying loss functions, gradient descent optimization, regularization (L1/L2), and neural network backpropagation.",
    projects: [],
    highlights: ["Stochastic Gradient Descent (SGD) with momentum", "Cross-entropy loss and regularization techniques", "Feedforward and convolutional network architectures"],
  },
  "Generative AI": {
    name: "Generative AI",
    role: "Transformer Architectures & LLM Systems",
    description: "Deep dive into multi-head self-attention mechanisms, positional encodings, instruction tuning, and agentic reasoning architectures.",
    projects: [],
    highlights: ["Transformer self-attention matrix mathematics", "Chain-of-thought and self-consistency prompting", "Quantization techniques (GGUF, AWQ, 4-bit) for edge inference"],
  },
  "LangGraph": {
    name: "LangGraph",
    role: "Cyclic Multi-Agent State Machine Design",
    description: "Framework for building stateful, multi-actor applications with LLMs by modeling workflows as cyclical computational graphs.",
    projects: [],
    highlights: ["State persistence and checkpointing across graph turns", "Conditional node routing with human-in-the-loop gates", "Multi-agent collaboration with specialized agent personas"],
  },
  "LangChain": {
    name: "LangChain",
    role: "LLM Component & Tool-Calling Toolchain",
    description: "Composable framework connecting language models to external data sources, document loaders, vector stores, and custom tools.",
    projects: [],
    highlights: ["Structured output parsers with Pydantic", "Document chunking and hybrid dense/sparse retrieval", "Tool calling definitions and execution sandboxes"],
  },
  "Concurrency / systems in Go": {
    name: "Concurrency / systems in Go",
    role: "High-Throughput Concurrent Systems Engineering",
    description: "Deep exploration of CSP (Communicating Sequential Processes) concurrency: buffered channels, select multiplexing, sync.Pool, and race conditions.",
    projects: [
      { slug: "nexshell", name: "NexShell", category: "CLI systems tooling", tagline: "Custom Unix shell in Go with command execution, pipelines, and signal dispatch.", status: "shipped", liveUrl: null, repoUrl: "https://github.com/meetkapadia1710-tech/NexShell" },
    ],
    highlights: ["Goroutine worker pool architecture with bounded queues", "Atomic memory operations & lock-free data structures", "Zero-allocation buffer pools with sync.Pool"],
  },
};

export function getSkillDetail(skillName: string): SkillDetail | null {
  return skillDetailsMap[skillName] ?? null;
}

export function getProjectsForSkill(skillName: string): SkillProjectLink[] {
  return skillDetailsMap[skillName]?.projects ?? [];
}
