# Portfolio additions

Appearance offers Light, Dark and System through sun, moon and monitor icons in a native radio group. Arrow keys change the choice, and each icon has an accessible name and visible focus ring. A small head script resolves the saved choice before paint; storage failures fall back to the OS preference. The dark palette uses layered charcoal surfaces with violet, lime, green, blue and warm accents. Original font families and layout remain in place. See `verification/theme-review/README.md` for the page audit.

Project search matches name, tagline, category and stack. Typing is reflected immediately and results debounce by 180 ms. `q`, `category` and `status` query parameters preserve selections on refresh; clearing filters removes them. No navigation or browser API call to GitHub is required.

Copy email uses the Clipboard API. If permission is denied or the API is unavailable, a selected read-only input provides a manual-copy fallback. Toasts use a persistent polite live region, a dismiss button, Escape, and a seven-second timeout. Contact uses the editable copy in `content/contact.ts` and social links in `content/links.ts`. Its validated form opens a prefilled `mailto:` URL in the visitor's email app; it does not send messages from the site.

GitHub uses server fetches and daily ISR. Set an optional `GITHUB_TOKEN` in `.env.local`; never expose it through a public environment variable. All public repository pages are fetched. Languages count each repository's primary language, including forks. The activity chart groups repositories by their latest push month, not contributions. Its complete visible table provides an accessible equivalent. Any failed, blocked or rate-limited fetch hides the whole section. Suspense supplies a section-only static skeleton while fetching.

Validation: production build and TypeScript passed; 35 tests passed, including blocked/rate-limited GitHub requests and intersecting search filters. ESLint has zero errors and one pre-existing warning for dimensionless legacy media's `<img>` fallback. Browser checks verified keyboard theme selection/search, persistence on refresh, copy success and Escape dismissal, and real server-rendered GitHub data. Full assistive-technology and every theme/state contrast combination were not audited.

## Files changed in this feature pass

- `app/layout.tsx`
- `app/globals.css`
- `app/achievements/page.tsx`
- `app/contact/page.tsx`
- `components/interface-controls.tsx`
- `components/site-navigation.tsx`
- `components/site-footer.tsx`
- `components/projects/project-catalog.tsx`
- `components/projects/project-catalog.module.css`
- `components/projects/project-detail.module.css`
- `components/about/about-page.module.css`
- `components/skills/skills-page.module.css`
- `components/achievements/achievements-page.module.css`
- `components/achievements/github-section.tsx`
- `content/interface.ts`
- `lib/project-catalog.ts`
- `lib/github.ts`
- `styles/home.css`
- `styles/themes.css`
- `tests/interface.test.tsx`
- `eslint.config.mjs`
- `package.json`
- `package-lock.json`
- `.env.example`
- `FEATURES.md`
