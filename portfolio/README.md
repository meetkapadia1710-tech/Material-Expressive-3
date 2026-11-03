
# Meet Kapadia · Material 3 Expressive Portfolio

[![Live Production](https://img.shields.io/badge/Live%20Demo-meet--material--portfolio.vercel.app-6750A4?style=for-the-badge&logo=vercel&logoColor=white)](https://meet-material-portfolio.vercel.app/)
[![Next.js](<https://img.shields.io/badge/Next.js-16.4%20(Turbopack)-black?style=for-the-badge&logo=next.js>)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests Passing](https://img.shields.io/badge/Tests-51%2F51%20Passing-22c55e?style=for-the-badge)](https://meet-material-portfolio.vercel.app/)


> **Live Deployment:** [https://meet-material-portfolio.vercel.app/](https://meet-material-portfolio.vercel.app/)

A production Next.js App Router + TypeScript developer portfolio designed around Google’s **Material 3 Expressive** visual design language, HCT (Hue-Chroma-Tone) tonal palette science, tactile sound engineering, and strict data accuracy.

---

## 🚀 Quickstart

Requires Node.js 20.9 or later (developed with Node.js 24) and npm.

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Verification & Build:

```powershell
npm test             # Run 51 automated unit, integration, and contrast tests
npm run typecheck    # Strict TypeScript validation
npm run build        # Compile Next.js production build and SSG static pages
npm start            # Preview production build locally
```



## 📦 What This Application Includes

- **Home (`/`)**: High-contrast editorial hero typography, lead projects showcase, curated skills overview, and building status chips.
- **Projects Catalog (`/projects`)**: Complete catalog of 20 engineering projects with multi-criteria category and status filter intersection, powered by custom Material 3 floating dropdown surfaces (`MaterialSelect`).
- **Static Case Studies (`/projects/[slug]`)**: 15 pre-rendered SSG project pages with problem statements, architectural role breakdown, technical challenges, and dynamic OpenGraph image cards.
- **About (`/about`)**: Verified chronological education at IIIT Vadodara (CGPA 8.31), corporate web development internship, and technical campus leadership.
- **Skills Matrix (`/skills`)**: Data-driven skills categorization cleanly differentiating production hands-on work from continuous learning and CS theory.
- **Achievements (`/achievements`)**: Real-time verified metrics across competitive programming (LeetCode 650+, CodeChef 1462, GeeksforGeeks), hackathons, and certifications.
- **Digital Resume (`/resume`)**: ATS-compliant digital resume view with instant plain-text clipboard copy (<1ms) and print layout.
- **Contact (`/contact`)**:
  - 🟢 **Live Local Clock & Availability**: Real-time Indian Standard Time clock (`Asia/Kolkata` • UTC+5:30) with active daytime/nighttime indicators and internship availability beacon.
  - 💼 **M3 Expressive Topic Cards**: Balanced 2×2 suggestion card grid (`SDE / Internship`, `Project Collaboration`, `Tech Chat`, `Feedback on RepoGrade`) with custom SVG icons and URL pre-filling (`/contact?topic=internship`).
  - ✉️ **Web Forms Delivery**: Client-side form submission to **Web3Forms** with honeypot bot suppression, inline loading state, and graceful email fallback.
  - **0px Baseline Alignment**: Equal-height flexbox column architecture ensuring both columns terminate cleanly on the exact same baseline.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Global spotlight modal for fast fuzzy navigation across all pages and actions.
- **HCT Color Engine & Themes**: Perceptually uniform contrast palettes supporting Default, Light, Dark, and dynamic seed colors with checked WCAG AA contrast.
- **Tactile Audio**: Synthesized Web Audio API interaction sounds with global mute control.

---

## 🗂️ Project Structure

```text
app/                         Next.js App Router pages, layouts, and API routes
  page.tsx                   Home entry point
  projects/page.tsx          Projects catalog with custom M3 filter dropdowns
  projects/[slug]/page.tsx   Statically generated SSG project case study
  about/page.tsx             About page using verified biography and facts
  skills/page.tsx            Data-driven skill categories and study groups
  achievements/page.tsx      Achievements, coding profiles and certifications
  resume/page.tsx            ATS-friendly digital resume viewer
  contact/page.tsx           Contact route with live IST clock & Web3Forms
  api/contact/route.ts       Server-side proxy and key configuration route
  globals.css                Shared Material 3 tokens, colors & typography
components/                  Reusable UI components
  contact/                   Contact page, LiveStatusCard, and M3 Topic Cards
  ui/                        MaterialSelect, HighlightText, CommandPalette
  shell/                     Navigation, Footer, ThemeSelector, AudioControls
content/                     Single source of truth typed content layer
lib/                         Pure utilities (audio, clipboard, project filtering, HCT tokens)
tests/                       51 automated test suites (contrast, routing, and filters)
```


---

## 📝 Content Architecture & Policies

All content is managed through typed TypeScript modules in `content/`:

| File                      | Manages                                                                               |
| :------------------------ | :------------------------------------------------------------------------------------ |
| `content/profile.ts`      | Identity, bio, education, location, campus groups, CTAs, navigation, metadata         |
| `content/links.ts`        | Verified social URLs, email, and verification flags                                   |
| `content/projects.ts`     | 20 project definitions, technical stacks, challenges, lessons, and case study copy    |
| `content/skills.ts`       | Canonical skills divided by practice classification (_hands-on_, _learning_, _study_) |
| `content/achievements.ts` | Internship experience, hackathon results, coding metrics, and certifications          |

### Ethical Content Policies:

- Unknown values explicitly use `null` and are gracefully omitted from UI cards rather than displaying fabricated claims or dead links.
- A `provided` verification flag denotes facts verified by Meet; unverified items are kept out of production listings.
- No scraping of live profile pages occurs at runtime; all metrics are verified in the typed data layer.

---

## 🔑 Environment Variables

For web form submissions on `/contact`, create `.env.local`:

```env
# Web3Forms Access Key (free from https://web3forms.com)
NEXT_PUBLIC_WEB3FORMS_KEY=your_key_here
WEB3FORMS_ACCESS_KEY=your_key_here
````

All `.env*` files are strictly excluded in `.gitignore` to prevent secret leaks.


## 📄 License

  MIT © [Meet Kapadia](https://meet-material-portfolio.vercel.app/)
