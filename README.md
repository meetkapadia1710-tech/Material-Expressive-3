
# Meet Kapadia — Material 3 Expressive Portfolio

[![Live Production](https://img.shields.io/badge/Live%20Demo-meet--material--portfolio.vercel.app-6750A4?style=for-the-badge&logo=vercel&logoColor=white)](https://meet-material-portfolio.vercel.app/)
[![Next.js](<https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-black?style=for-the-badge&logo=next.js>)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-51%2F51%20Passing-22c55e?style=for-the-badge)](https://meet-material-portfolio.vercel.app/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-blueviolet?style=for-the-badge)](https://meet-material-portfolio.vercel.app/)

> **Live Deployment:** [https://meet-material-portfolio.vercel.app/](https://meet-material-portfolio.vercel.app/)

A production-grade, editorial developer portfolio and design engineering system built for **Meet Kapadia** (Computer Science undergraduate at IIIT Vadodara). Designed around Google’s **Material 3 Expressive** design philosophy, the site combines mathematical color science (HCT tonal palettes), spring-physics interaction design, tactile sound synthesis, and an accessibility-first architecture.

---

## 🌟 What This Repository Is

This repository contains the complete full-stack codebase for Meet Kapadia's personal website and engineering portfolio, alongside an offline research knowledge base documenting the implementation of Material 3 Expressive on the web.

The project goes beyond typical static portfolios by treating the developer portfolio as a high-fidelity digital product with:
* **Zero CSS framework bloat**: 100% vanilla CSS Modules coupled with semantic Material 3 custom properties and design tokens.
* **HCT Algorithmic Theming**: Real-time color generation using `@material/material-color-utilities` ensuring perceptually uniform contrast in both Light and Dark modes.
* **Strict Ethical Content Layer**: A single source of truth (`portfolio/content/`) with verification flags (`provided` vs `unverified`), ensuring no exaggerated metrics or fabricated achievements.
* **Production Reliability**: 51 automated unit/integration tests running via the native Node.js test runner covering theme contrast, route integrity, and catalog filtering.

---

## 🚀 Key Features & Route Architecture

### 1. Home (`/`)
* **Editorial Hero & Typography**: Bold display hierarchy featuring high-contrast text treatments and dynamic status badges (`Currently building: RepoGrade`).
* **Featured Showcase**: Deep-dive cards into lead projects with stack badges, status chips, and direct links to full case studies.
* **Curated Toolkits**: Instant preview of core programming languages, database architectures, and systems fundamentals.

### 2. Projects Catalog & Case Studies (`/projects` & `/projects/[slug]`)
* **Catalog Exploration**: Complete directory of 21 engineering projects grouped into *Featured*, *More Projects*, and *Explorations & Ideas*.
* **Custom M3 Select Controls**: Custom floating surface dropdowns with 20px corner radii, spring-rotating chevrons, and full WAI-ARIA 1.2 listbox keyboard accessibility.
* **Multi-Filter Intersection**: Simultaneous filtering across technical categories and development statuses (*Shipped*, *In Progress*, *Concept*, *Prototype*).
* **Static Case Studies (SSG)**: 16 statically generated detail routes (`/projects/[slug]`) featuring problem statements, technical architecture, challenges, and lessons learned.
* **Dynamic OpenGraph Cards**: Automated social sharing image generation via `@vercel/og` Edge runtime for every project slug.

### 3. Digital Resume (`/resume`)
* **Dual Format Presentation**: Human-readable interactive digital resume paired with an instant **"Copy ATS Plaintext"** fast-path (<1ms execution) and print stylesheet.
* **Tactile Audio Feedback**: Subtle auditory click confirmations using the Web Audio API with an omnipresent mute control.

### 4. Interactive Contact Experience (`/contact`)
* **🟢 Real-Time IST Availability Badge**:
  * Live ticking Indian Standard Time clock (`Asia/Kolkata` • UTC+5:30) with tabular numerals to eliminate layout shift.
  * Context-aware daytime/nighttime availability indicator (*Active hours* vs *Resting hours*).
  * Prominent availability signal: `Open to SDE & Full-Stack Internships (2026–2027)`.
* **💼 Material 3 Expressive Inquiry Topic Cards**:
  * Topic cards for internships, collaboration, tech chats, and feedback on RepoGrade and MeetOS.
  * One-tap auto-fill: sets the subject line and tailors the message placeholder guide.
  * URL query parameter pre-fill support (`/contact?topic=internship` or `/contact?project=repograde`).
* **✉️ Direct Web Form Delivery**:
  * Seamless browser form submission powered by **Web3Forms** with invisible bot suppression honeypot (`botcheck`).
  * Inline loading spinner and Material 3 confirmation state.
  * Built-in graceful fallback to local desktop email clients (`mailto:`) if connectivity fails.
* **Harmonious Baseline Geometry**: Symmetrically balanced grid alignment ensuring both the contact aside and form cards terminate on the exact same horizontal baseline (`0px delta`).

### 5. About & Background (`/about`)
* Authentic chronological timeline covering engineering coursework at IIIT Vadodara (CGPA 8.31), corporate web development internship experience, and active campus leadership in 9bit Technical Community and Dot Design Club.

### 6. Skills Matrix (`/skills`)
* Data-driven skills breakdown separating verified production experience (*Hands-on*) from continuous learning topics and academic computer science fundamentals.

### 7. Achievements & Competitive Programming (`/achievements`)
* Verified competitive programming metrics (LeetCode 650+ solved, CodeChef 1462 rating, GeeksforGeeks), hackathon podium placements, and technical certifications.

### 8. Global Command Palette (`⌘K` / `Ctrl+K`)
* Keyboard-driven command center supporting fuzzy search across all pages, project case studies, external social profiles, and instant theme toggling.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16.4.3](https://nextjs.org/) (Turbopack) | App Router, SSG static pre-rendering, Server Functions & Edge API routes |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict end-to-end type safety |
| **Design System** | Google Material 3 Expressive | Custom design tokens, spring timing functions, and asymmetric containers |
| **Color Engine** | `@material/material-color-utilities` | Perceptually uniform HCT (Hue-Chroma-Tone) tonal palettes |
| **Typography** | Fontsource Manrope & DM Sans | Self-hosted variable typography (zero external CDN network requests) |
| **Forms & Email** | [Web3Forms](https://web3forms.com/) | Direct browser web forms with server-side proxy fallback |
| **Audio** | HTML5 Web Audio API | Synthesized tactile micro-interaction sounds (no heavy audio assets) |
| **Testing** | Node.js Test Runner + `tsx` | 51 automated unit, integration, and contrast verification test suites |
| **Deployment** | [Vercel](https://vercel.com/) | Edge network hosting, continuous integration, and global CDN caching |

---

## 📂 Repository Directory Layout

```text
├── portfolio/                       # Next.js App Router application
│   ├── app/                         # Pages, layouts, metadata & API endpoints
│   │   ├── api/contact/             # Contact proxy & Web3Forms configuration route
│   │   ├── projects/[slug]/         # Static project case studies & OG image generators
│   │   ├── resume/                  # ATS-friendly digital resume
│   │   ├── globals.css              # M3 Expressive design tokens, colors & typography
│   │   └── layout.tsx               # Root layout with skip-links, navbar & footer
│   ├── components/                  # Reusable UI component library
│   │   ├── contact/                 # Contact page, LiveStatusCard, and M3 Topic Cards
│   │   ├── ui/                      # MaterialSelect, HighlightText, CommandPalette
│   │   └── shell/                   # Navigation, Footer, ThemeSelector, AudioControls
│   ├── content/                     # Single source of truth typed content layer
│   │   ├── profile.ts               # Bio, education, contact info & timeline milestones
│   │   ├── projects.ts              # 20 detailed project schemas and case studies
│   │   ├── skills.ts                # Structured skill categories and study groups
│   │   ├── achievements.ts          # Competitive metrics, hackathons, and certifications
│   │   └── links.ts                 # External profiles with verification flags
│   ├── lib/                         # Pure helper utilities
│   │   ├── clipboard.ts             # Synchronous fast-path clipboard copy
│   │   ├── audio.ts                 # Web Audio API sound synthesis
│   │   ├── project-catalog.ts       # Multi-criteria project filtering logic
│   │   └── theme-tokens.ts          # HCT color palette mathematics
│   └── tests/                       # 51 automated test suites
├── knowledge-base/                  # Material 3 Expressive research documentation
└── README.md                        # Root repository guide
````


---


## 💻 Local Development Setup

### Prerequisites

- **Node.js**: `v20.9.0` or higher (tested on Node.js `v24.22.1`)
- **npm**: `v10.0.0` or higher

### Installation & Run

1. **Clone the repository:**

   ```bash
   git clone https://github.com/meetkapadia1710-tech/Material-Expressive.git
   cd Material-Expressive/portfolio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Web Forms):**
   Create a `.env.local` file inside the `portfolio/` directory:

   ```env
   # Server-only Web3Forms access key
   WEB3FORMS_ACCESS_KEY=your_access_key_here
   ```

   Web3Forms requires a paid plan and an allowlisted server IP for server-side delivery. Without working delivery configuration, the form keeps the draft and offers an explicit email app action.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

The codebase includes an extensive automated test harness to ensure strict adherence to accessibility, token contrast ratios, and content accuracy.

```bash
# Run all 51 automated tests
npm test --prefix portfolio

# Run TypeScript strict typecheck
npm run typecheck --prefix portfolio

# Verify production build and SSG page generation
npm run build --prefix portfolio
```

---

## 🔒 Security & Privacy

- **Strict Git Exclusions**: All local environment files (`.env*`) are explicitly ignored in `.gitignore` to prevent credential exposure.
- **Client-Safe Form Keys**: Web3Forms access keys are safe for public web forms; no secret backend credentials or private tokens are packaged into client bundles.
- **Spam Protection**: The contact form implements zero-JS honeypot trapping to silently drop automated bots.

---

## 📄 License & Contact

Developed by **Meet Kapadia**

- **Portfolio**: [https://meet-material-portfolio.vercel.app/](https://meet-material-portfolio.vercel.app/)
- **Email**: [meetkapadia1710@gmail.com](mailto:meetkapadia1710@gmail.com)
- **GitHub**: [@meetkapadia1710-tech](https://github.com/meetkapadia1710-tech)
- **LinkedIn**: [Meet Kapadia](https://www.linkedin.com/in/meet-kapadia17)

This project is open-source under the [MIT License](LICENSE).
