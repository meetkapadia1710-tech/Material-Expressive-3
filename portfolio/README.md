# Meet Kapadia · Portfolio

A local Next.js App Router + TypeScript portfolio with an original Material 3 Expressive-inspired visual direction. Home, About, Skills, Achievements, the Projects catalog and public project details are implemented; Contact remains a placeholder for a subsequent phase.

## Run

Requires Node.js 20.9 or later (developed with Node.js 24) and npm.

```powershell
npm install
npm run dev
```

Open the printed localhost URL. Production checks and preview:

```powershell
npm test
npm run typecheck
npm run build
npm start
```

Fonts are installed as local packages and served by the application. There are no runtime font-CDN requests, database credentials, contact form services, or scraped profile data. The contact action opens the supplied email address.

## Structure

```text
app/                         App Router pages and shared root layout
  page.tsx                   Home entry point
  projects/[slug]/page.tsx    Statically generated public project details; unknown/review slugs return 404
  about/page.tsx             About page using supplied biography and existing facts
  skills/page.tsx            Data-driven skill categories and practice/study groups
  achievements/page.tsx      Configured achievements, coding profiles and problem-solving topics
  contact/                  Placeholder route
  globals.css                Shared design tokens, navigation, footer and placeholder styling
components/
  home/                      Home sections and reusable project cards
  site-navigation.tsx        Responsive navigation with current-route state
  site-footer.tsx             Shared footer
content/                     Typed, editable copy and supplied facts
styles/home.css              Styles scoped to Home-specific class names
tests/                       Content policy and Home rendering checks
```

## Where to edit content

| File | Edit here |
|---|---|
| `content/profile.ts` | Name, headline, description, location, education, CGPA, campus groups, hero labels, CTAs, navigation, footer, metadata, placeholder copy, Home section copy and `aboutCopy` |
| `content/links.ts` | Email/social/profile URLs and their verification flags; footer link selection |
| `content/projects.ts` | Project identity, ordering, featured selection, description, problem, role, known stacks/features, challenges, lessons, status, repo/live/media, review flags and catalog/detail UI copy |
| `content/skills.ts` | Canonical `skillCategories`, item practice classification, notes, one-line Home overviews and Skills page copy |
| `content/achievements.ts` | Internship dates/documents, hackathons, certifications, coding-profile counts/ratings and visibility/verification, problem-solving topics and Achievements UI copy |
| `content/types.ts` | Shared schemas; no content claims |

All user-facing copy is read from `/content`, including accessibility labels and empty/placeholder states. No biography, project descriptions, URLs or numeric achievements are hardcoded in the page components. `overview` in each skill group is an independently editable short summary; keep it aligned when changing `items`.

## Content policy

- Unknown values use `null`, including unknown arrays. Components omit optional null fields instead of printing fallback claims or empty links.
- A `provided` verification flag means supplied by Meet, not independently verified by this project.
- Only Hindsight has a supplied repository URL. Project live URLs and media remain null. No URL was guessed from a project name.
- RepoGrade is `in-progress`, with the supplied detail “Build complete; deploying.” Production corporate sites are `shipped`. Other regular projects have null status where release status was not supplied.
- Explorations are recorded as `concept`, never shipped. Earlier unverified work is `prototype` with `visibility: "review"`, excluded by public selectors and public detail routes.
- Adobe Round 2 remains review-only. GeeksforGeeks and the resume site retain `unverified` flags and are not included in the current footer.
- API Traffic Optimizer and the earlier academic AI Optimizer remain separate records. Their possible overlap is documented in review notes; no traffic-specific features have been inferred.
- CGPA 8.31, LeetCode 650+, and CodeChef 1462 are editable supplied values. CGPA scale, metric update dates, certificate URLs, phone and unknown ratings remain null. No coding-profile scraping occurs.
- The corporate-site pair is one project record, as supplied. It has no guessed individual URLs.

## Current routes and scope

- `/`: Hero with up to four labels and three CTAs; Explore My Work scrolls to `#selected-projects`. Five featured projects link to their detail routes. All skill groups have a brief overview and a `/skills` link. A closing CTA links to email and `/contact`.
- `/projects`: all 20 supplied records in Featured, More Projects, and Explorations & Ideas. Category and status filters combine; clear filters restores the full catalog. Unknown fields stay omitted from cards and can be selected through “Without a category/status” filter options. Review-only earlier work appears here as unverified prototypes, with no unavailable detail links. This catalog does not change Home's featured selection or the public-detail selector.
- `/about`: exact supplied bio, education, internship experience, campus communities, current learning and future exploration interests. `aboutCopy` in `content/profile.ts` owns the About-only copy; the existing Home bio is independent. Education/campus reuse `profile`, internships reuse `content/achievements.ts`, and current learning reuses the `learning` group in `content/skills.ts`. Future topics are only the interests stated in the supplied bio. Known certificate/recommendation labels render as text until document URLs are supplied. No personal anecdotes or new claims were added.
- `/skills`: all categories from `skillCategories`, each divided into Hands-on and Currently learning / study topics when applicable. Items are plain text lists, with no percentages, progress indicators or badges. Explicit ML study topics and academic CS fundamentals are classified as `study`; current learning items use `learning`.
- `/achievements`: Experience, Hackathons, Certifications, and Coding Profiles and Problem Solving. Unverified or review-only records are excluded. Coding profiles also require an associated link that is not flagged unverified. Counts and ratings are read directly from config; null fields are omitted, while an explicit zero is preserved. Missing sections are omitted; fully empty content shows a single neutral empty state. Known document names render as plain text until a URL is supplied.
- `/contact`: shared-layout placeholder.
- `/projects/[slug]`: all 15 public slugs are generated at build time. Overview (from `tagline`), problem, role, stack, key features, media, challenges/lessons, external links and status render only when their content is nonempty. The section index includes only rendered sections. Previous/next follows the public `order`, without wrapping or linking review-only records. Review-only and unknown slugs return 404; `dynamicParams = false` prevents on-demand generation of unknown paths.

The detail template is ready for fuller case studies as supplied content is added; it does not fabricate missing problems, media, reflections or outcomes. There are no skill ratings, certificate-image galleries or contact-form backends in this phase. Abstract CSS artwork is decorative, not a fabricated project screenshot or portrait.

The `/projects` UI copy is in `projectCatalogCopy` in `content/projects.ts`. Its client component and card are under `components/projects/`, with isolated CSS-module styling. Filtering and grouping live in `lib/project-catalog.ts`.

Detail UI copy is in `projectDetailCopy` in `content/projects.ts`. The detail renderer and scoped stylesheet are under `components/projects/`; content normalization and neighboring-project selection live in `lib/project-detail.ts`. `lessons` is a nullable field, independent of `challenges`. No lesson or challenge text has been inferred for existing projects.

For media, replace `media: null` with entries of `{ kind: "image" | "video", src: string, alt: string }`. Supply descriptive alternative text for images and a video label. Only entries with a nonblank `src` render. Images load lazily; videos expose controls and do not autoplay. No media or demo links are shown for current projects because those values remain null.

## Adding or classifying skills

Edit only `content/skills.ts`. Add an item to a category's `items` array:

```ts
{ name: "Your skill or topic", practice: "hands-on" }
```

`practice` accepts `"hands-on"`, `"learning"`, or `"study"`. The latter two appear together in the learning/study subgroup. This is a category of use or study, not a proficiency rating. To add a category, copy an existing object and supply a unique `id`, `name`, `items`, `note` (`null` when absent) and short `overview`. Both categories and items render automatically; empty categories/subgroups are omitted. Update the category's `overview` in the same file if its Home summary should change.

The exported `skills` string view is derived from `skillCategories` for Home and About compatibility; do not edit it separately. Those pages' existing rendered skill text was preserved during this migration. Skills page labels and introduction are in `skillsPageCopy` in the same file.

## Updating achievements and coding profiles

Edit `content/achievements.ts` for the records, `problemSolvingTopics`, and `achievementsPageCopy`. Set `verification: "unverified"` or `visibility: "review"` to hide a record from the Achievements page. `"provided"` denotes supplied content, not independent verification. Adobe remains excluded. Coding profiles additionally respect the verification flag on their linked entry in `content/links.ts`; no profile is scraped.

Set unknown counts, ratings, dates, and URLs to `null`. Profile handles and links are configured independently through `linkId`. Do not infer certification issue dates from years in certificate names. `lib/achievements.ts` filters and normalizes records; the renderer and scoped styles are under `components/achievements/`.

## Design and accessibility

Cream surfaces, plum typography, lavender containers and lime accents; variable Manrope and DM Sans; expressive but restrained shapes and hover motion. The layout uses semantic landmarks and headings, an accessible skip link, keyboard focus indicators, responsive navigation, a reduced-motion alternative and scroll anchoring. Font files are self-hosted through npm packages.

The existing `../knowledge-base/` documents the Material research that informs this implementation. This website is a custom interpretation; it does not claim official Material Web Expressive component support.

## Verification performed

- Production build and strict TypeScript check passed.
- Thirty-two automated tests passed for exact About copy, Home rendering, project grouping/filtering/details, data-driven skills, and achievement verification/visibility filters, configured metrics, nullable links and partial/fully empty content.
- HTTP checks passed for all planned routes and representative project pages; unknown and review-only project slugs returned 404.
- Browser inspection covered the desktop layout and 390px / 320px widths, with no horizontal overflow at the narrow sizes. The project scroll CTA and a project-detail link worked. No browser console warnings/errors were captured during these checks.
- Projects browser checks covered combined category/status selection, zero results, reset, concept/prototype labels and conditional external links. The supplied Hindsight repository is the sole repository link; no demo links appear because none were supplied. The project index retains all 20 records, while review-only records still have no public detail route.
- Detail verification confirmed 15 prerendered routes with `fallback: false`, HTTP 200 for all 15, and HTTP 404 for an unknown slug and all five review-only slugs. Browser checks covered both previous/next navigation and desktop/390px/320px layouts without overflow or console warnings. Media, problems and reflection text remain absent from current pages; their conditional branches are covered by isolated test fixtures rather than fabricated portfolio content.
- About verification checked all six sections, exact supplied bio, education/CGPA, internship dates and unlinked document labels, campus groups and content-derived learning/interests. Desktop/390px/320px browser checks found no horizontal overflow or console warnings. Hash comparisons confirmed that the 27 pre-existing files protecting other pages, shared components/styles and unrelated content were unchanged during the About implementation.
- Skills verification checked all eight categories and 53 supplied items, the AI/ML practical/study split, and the absence of percentages, progress widgets and item/label badge backgrounds. Desktop/390px/320px browser checks found no overflow or console warnings. A before/after comparison confirmed the derived string view used by Home and About is unchanged.
- Achievements verification checked the four sections, one internship, two visible hackathons, three certifications, three coding profiles and all twelve supplied topics. The production response excludes Adobe and unverified profile links. Browser checks confirmed the configured 650+ problem count, 1462 rating, null Codolio metrics, absent document links/update dates and responsive desktop/390px/320px layouts without overflow or console warnings. Tests cover omitted sections and a fully empty fallback.
- This is a local project; no production deployment or full assistive-technology audit was performed.
