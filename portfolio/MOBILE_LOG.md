# Phase 38 mobile layout audit

## Production baseline

Source revision `65b8b43`. Built with `npm run build`, then served with `npm run start -- --port 4380`. The build succeeded and emitted existing Open Graph renderer warnings about `z-index`. Chrome 156 ran through Playwright with device emulation. Geometry and screenshots used reduced motion to measure the settled layout. This baseline was recorded before editing the application.

The route matrix includes Home, Projects, RepoGrade, About, Skills, Achievements, Contact, Resume, and an unmatched URL returning HTTP 404. The build has no offline page or service worker. The geometry sweep uses 320, 360, 375, 390, 412, 430, 599, 600, 768 and 1024 CSS px, 844 × 390 landscape, and a 512 × 400 CSS viewport at 2× device scale as a reflow proxy for 200% zoom from 1024 × 800. A physical phone was unavailable.

Raw per-route measurements and original full-page PNGs at 360 and 390 px are in `artifacts/mobile/before/`. Each JSON entry includes the scrolling element's width, viewport meta, outlying boxes with selectors and clipping ancestors, intersecting control boxes, undersized controls, clipped leaf text, and fixed and sticky layers. The raw baseline includes hidden popover descendants because the initial geometry pass did not account for opacity and delayed mounting. Review the counts alongside the screenshots.

## Initial visual review and source evidence

| Route | Component | Width | Before |
| --- | --- | --- | --- |
| All | Header and bottom navigation | 320–599 | The header shows brand, seed/search, and theme in three tiers. The More item can cross the 320px right edge. The body and shell both reserve clearance, leaving extra space after the footer. |
| All | Viewport and floating UI | All | The default Next viewport includes device width and initial scale. It lacks `viewport-fit=cover`. Search and seed overlays use `100vw`. The loader and some overlays use `vh`. |
| Home | Hero and project actions | 320–430 | The hero fills most of the first viewport before the CTAs. Chips and project actions fall below 44px. Project metadata competes with link controls in a narrow row. |
| Projects | Catalog filters and cards | 320–430 | The filter panel stacks every field before the catalog. View switches and preview icons fall below 44px. Card decorations and the tight badge/action row leave little room for content. |
| RepoGrade | Section links | 320–430 | The jump links wrap into multiple rows. The detail content already uses one pane at phone widths. |
| About | Intro and timeline | 360–390 | The intro heading breaks awkwardly beside decorative art. The timeline and cards leave limited reading width after nested padding. |
| Skills | Sticky filters and type switch | 320–412 | The scrolling element expands to 436px at 320 and 360px. A flex row with intrinsic-width pills extends the controls pane. The small pill targets and sticky box consume space in both orientations. |
| Achievements | Entry and platform cards, LeetCode, heatmap | 320–768 | The scrolling element reaches 450px on the narrowest phones, 638px at 599 and 831px at 768. Intrinsic card/ring rows and the heatmap need separate sizing. The 320px sweep flags clipped card titles, descriptions and problem names. Platform actions, segments and credential copy controls fall below 44px. |
| Contact | Heading and form actions | 320–430 | The heading wraps into three tall lines. Resume and email fallback actions fall below 44px. |
| Resume | Toolbar and contact links | 320–430 | The toolbar stacks unevenly and inline contact links fall below 44px. |
| 404 | Header, body and footer | 320–430 | Header tiers push the short message down. The footer has excess clearance below it. |

## Geometry and fixes

Each width below covers the nine routes. The other seven routes had no page-level horizontal scrolling in the baseline. The column reports the document's scroll width in CSS pixels.

| Window | Skills before | Achievements before | After |
| --- | ---: | ---: | --- |
| 320 | 436 | 450 | No page scroll on any route |
| 360 | 436 | 450 | No page scroll on any route |
| 375 | 436 | 451 | No page scroll on any route |
| 390 | 436 | 450 | No page scroll on any route |
| 412 | 436 | 451 | No page scroll on any route |
| 430 | 436 | 469 | No page scroll on any route |
| 599 | 599 | 638 | No page scroll on any route |
| 600 | 600 | 640 | No page scroll on any route |
| 768 | 768 | 831 | No page scroll on any route |
| 1024 | 1024 | 1111 | No page scroll on any route |
| 844 × 390 landscape | 844 | 907 | No page scroll on any route |
| 200% reflow | 512 | 551 | No page scroll at actual 200% Chromium tab zoom |

| Route | Component | Width | Before | After |
| --- | --- | --- | --- | --- |
| All | Shell and footer | 320–599 | Three header rows, fixed 64px nav pills, duplicate bottom clearance | Brand and icon search in one row. Five flexible destinations reserve bottom clearance once. The More sheet contains the secondary actions. |
| All | Search, dialogs, loader and toasts | 320–599 and short windows | Mixed fixed or viewport-relative dimensions, desktop overlays, and hidden 3D work on initial load | Search uses the visual viewport. Compact sheets use dynamic height and safe areas. Toasts clear the nav. Touch visits skip the intro's automatic 3D mount and retain the explicit badge viewer. |
| Home | Hero, CTAs and feature cards | 320–599 | Oversized brand name, narrow chip labels, small project actions, and fixed-size art | Fluid display roles, a full-width primary CTA, wrapping actions and labels, single-column cards and clipped decorative wrappers. |
| Projects | Filters, jump links and catalog | 320–599 | Full filter form pushes results down, wrapping jump links, small preview controls | Full-width search, a Filters sheet with an active count, contained chip rows and stacked cards. |
| Projects | Off-screen groups | 320–1024 | Fixed intrinsic height under-reserved groups and put the last preview controls over the footer during layout measurement | Catalog groups reserve their actual layout height. |
| Project detail | Section links, media and pagination | 320–599 | Jump links wrap, external media lacks reserved dimensions, and hydration replaces the media element | Contained chip strip, single-column content and stacked pagination. Measured raster dimensions enable responsive Next Image candidates. The live SVG badge has intrinsic dimensions, and the route wrapper keeps the same DOM during hydration. |
| About | Intro, timeline, education and footer | 320–599 | Header decoration competes with the title, nested timeline spacing narrows cards, and compact off-screen estimates move the footer during a jump to the end | Compact headline, left-side timeline nodes, more reading width, stacked cards and score chips. Compact About panels reserve their actual height. |
| Skills | Search, filters, code and skill actions | 320–430 | Intrinsic-width type switch expands the document to 436px. Code relies on nested clipping. Skill links use delegated mouse clicks. | Independent scrollports for filters and code, full-width search, native buttons for linked skills and a keyboard-accessible sheet. |
| Achievements | Section nav and card content | 320–768 | Shrinking buttons let labels spill into adjacent segments. Cards and problem names use line clamps or ellipses. | Non-shrinking scrollable chips, wrapped titles and descriptions, stacked entry and platform cards, and preserved credential copy. |
| Achievements | LeetCode and GitHub | 320–1024 | Wide difficulty group, small profile actions and heatmap targets, visually hidden table expanding the document | Responsive ring, contained filter strip, larger targets, two-column compact metrics, a separately clipped screen-reader table and a scrollable calendar that starts at the newest weeks. A date lookup exposes individual contribution counts. |
| Contact | Form and sidebar | 320–599 | Sidebar precedes the form, small email and fallback actions | Form first, full-width actions, existing field types and autocomplete preserved, and the bottom bar clears focused fields. |
| Resume | Contact links | 320–599 | Compact links fall below 44px | 48px targets and wrapped addresses. |
| 404 | Shell and footer | 320–599 | Header tiers and duplicate bottom clearance | Single-row header and one safe-area reservation. |

## Reproduction and artifacts

Run from `portfolio` after `npm ci` and `npx playwright install chromium`.

```text
npm run build
npm run typecheck
npm run lint
npm test
npm run test:responsive
npm run test:responsive -- --audit
```

The responsive check starts `next start` automatically. Set `MOBILE_URL` to reuse a running production server and `MOBILE_OUTPUT` to change the artifact directory. `CHROME_PATH` selects installed Chrome for the main matrix. The 200% audit uses Playwright's full Chromium with a local extension that calls `chrome.tabs.setZoom` and confirms a 512px CSS viewport from a 1024px window. The CI workflow runs the production matrix in light and dark using Default, Violet and Lagoon and uploads the measurements and axe results. The interactive checks exercise the More palette, shortcuts, compact search, Projects filters and preview, Contact and the achievement and skill sheets. Chrome viewport resizing simulates the reduced height of a keyboard. Native phone keyboards and safe-area behavior on physical devices remain unverified.

For the throttled benchmark, start production on port 4382 in one terminal and run `node tests/mobile-performance.mjs` in another. The harness uses 4× CPU throttling with a 150 ms RTT, 1.6 Mbit/s down and 750 kbit/s up in Chrome. It captures long tasks, long animation frames, layout shifts and heading commit times. It measures the routes directly and exercises a sequence of client navigations. The sequence and combined throttle differ from the separate profiles and 42 directional pairs in the repository's `PERF_LOG.md`.

Before screenshots and detailed bounding boxes live in `artifacts/mobile/before`. The final audit screenshots and measurements live in `artifacts/mobile/after-final`. The PNGs retain the full page and the `review-360.jpg` and `review-390.jpg` contact sheets show the first viewport beside a full-page overview. The fixed navigation appears at its viewport position in each full-page image. Use the footer clearance measurement to verify the final actions at the bottom of a real scroll.

## Verification outcome

- The production build, lint, typecheck and all 51 unit tests passed. The build still prints the existing Open Graph renderer `z-index` warnings.
- The 108-visit geometry audit passed, including landscape, actual 200% zoom and footer clearance at 360 and 390px. The 36 before and after full-page screenshots were reviewed at those widths.
- The Playwright suite passed 378 route, width, theme and palette combinations, nine interactive states, and expanded desktop navigation with normal motion. The 18 axe checks reported zero violations. The suite is configured in GitHub Actions and was run locally against `next start`.
- The copy-email toast on a 320 × 640 touch viewport stayed within the viewport and ended 7px above the bottom bar's border.

The 100 ms CPU target and the original 42-pair navigation comparison remain open. The physical-device keyboard and notch checks require a real phone. No presentation decisions are pending.

## Throttled performance

Lighthouse 13 mobile scores on production, using the same Chrome flags before and after. The final Lighthouse CLS was 0 on each route.

| Route | Performance before → after | Accessibility before → after |
| --- | ---: | ---: |
| Home | 62 → 100 | 96 → 100 |
| Projects | 66 → 100 | 100 → 100 |
| Achievements | 60 → 100 | 88 → 100 |

The combined 4× CPU and Fast 3G run completed nine direct visits and eight client navigations. The largest CLS was 0.00033 on the 404. All other samples reported 0. The 100 ms task budget remains unmet. The worst direct-load task was 564 ms on Achievements. The worst navigation task was 810 ms from About to Achievements. Chrome associated the latter with the React client runtime chunk. The longest initial rendering frames on Projects, Skills and Contact included at most 5 ms of attributed JavaScript in the Long Animation Frames report. See `artifacts/mobile/after-final/performance.json` for timing and source attribution.

| Route | Longest load task | Route change | Heading commit | Longest navigation task |
| --- | ---: | --- | ---: | ---: |
| Home | 249 ms | Home → Projects | 1019 ms | 304 ms |
| Projects | 557 ms | Projects → RepoGrade | 493 ms | 183 ms |
| RepoGrade | 179 ms | RepoGrade → About | 506 ms | 280 ms |
| About | 181 ms | About → Achievements | 1217 ms | 810 ms |
| Skills | 545 ms | Achievements → Skills | 1443 ms | 544 ms |
| Achievements | 564 ms | Skills → Contact | 879 ms | 209 ms |
| Contact | 393 ms | Contact → Resume | 544 ms | 298 ms |
| Resume | 176 ms | Resume → Home | 569 ms | 174 ms |
| 404 | 221 ms | — | — | — |

Phase 38 reduces startup work on touch by skipping the automatic 3D intro, disabling large view snapshots on navigation, eliminating repeated polygon strings and using five SVG paths for the contribution chart. The desktop motion eligibility remains tied to a fine pointer and reduced-motion preference. The earlier full cold and warm navigation matrix was not repeated under its original test conditions, so this run cannot establish parity with those timings.

## Files changed

- Shared foundation in `app/layout.tsx`, `app/globals.css`, `styles/breakpoints.css`, `styles/shapes.css`, `styles/typography.css` and `postcss.config.mjs`.
- Navigation and overlays in `components/site-navigation.tsx`, `components/shell`, `components/command-palette*`, `components/color-seed-picker*` and the shared project and select components.
- Page layouts in `styles/home.css` and `components/home`, `components/projects`, `components/about`, `components/skills`, `components/achievements`, `components/contact` and `components/resume`.
- Runtime changes in `components/motion/intro-loader.tsx`, `components/motion/morphing-shape.tsx`, `components/motion/motion-runtime.tsx`, `components/motion/route-transition-content.tsx` and `components/motion/shared-project-element.tsx`. Project image sizing uses `content/projects.ts` and `next.config.ts`.
- Verification in `tests/responsive.mjs`, `tests/mobile-performance.mjs`, `tests/skills-page.test.tsx`, `package.json`, `package-lock.json` and `.github/workflows/responsive.yml`.
