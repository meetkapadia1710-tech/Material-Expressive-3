# About Page Timeline: Material 3 Expressive Rebuild Log

## 1. Section Heading Decision
- **Choice**: Updated section heading from `"Internship experience"` to `"Experience and milestones"` in `aboutCopy.experienceTitle`.
- **Rationale**: The section contains not only a corporate internship (Bhumi Internship), but also a hackathon achievement (Supermemory Hackathon) and an open-source systems architecture milestone. `"Experience and milestones"` accurately reflects all three entries without misleading the visitor.

## 2. Removed Unbacked Claims
The following claims were removed because they had no verifiable source in the content layer:
- **"FINALIST" badge**: Removed from the Supermemory Hackathon entry (no certificate or external verification in content layer).
- **"ACTIVE FOCUS" badge**: Removed from the Systems Architecture entry (unbacked status label).
- **"2024 → PRESENT" chip**: Removed from the timeline header (unbacked span).

## 3. Flagged Descriptive Lines (Preserved Verbatim)
The following technical descriptions are preserved verbatim from the content layer, but are flagged here as self-reported engineering notes:
- **Hindsight Entry**: *"Native Win32 accessibility hooks, dual-layer OCR indexing, and sub-10ms sqlite-vec vector lookups for offline desktop telemetry."*
- **RepoGrade Entry**: *"Full AST parsing, static analysis metrics, and Material 3 Expressive review generation."*

## 4. Material 3 Expressive Color Roles
Zero hardcoded hex values were used. All colors adapt dynamically to the visitor's chosen seed color, light/dark mode, and the Default palette:
- **Current Milestone (Systems Architecture)**: `primary-container` surface, `on-primary-container` text, `primary` accent border and glow.
- **Corporate Internship (Bhumi)**: `secondary-container` surface, `on-secondary-container` text, `secondary` accent border.
- **Hackathon Milestone (Supermemory)**: `tertiary-container` surface, `on-tertiary-container` text, `tertiary` accent border.
- All text pairs satisfy WCAG AA contrast (minimum 4.5:1 for normal text, 3:1 for large text and graphics) across both light and dark modes.

## 5. Timeline Nodes & Connecting Rail
- **Morphing Nodes**: Replaced thin 2px line and small static dots with `MorphingShape` nodes:
  - Entry 1 (Bhumi): `roundedSquare` base morphing to `circle` on view/hover.
  - Entry 2 (Supermemory): `scalloped` base morphing to `blob` on view/hover.
  - Entry 3 (Systems Architecture): `blob` base morphing to `roundedSquare` on view/hover.
- **Active Node**: Highlighted with a larger (34px) filled node and glow matching `primary-container`.
- **Connecting Track**: Replaced with a 5px rounded track with gradient progress fill (`--color-surface-container-highest` track with `--color-primary` progress fill).

## 6. Card Shapes & Interactions
- Standardized to M3 Expressive card corner radius scale:
  - Base: `border-radius: 28px`
  - Hover Morph: `border-radius: 36px 18px 36px 18px`
  - Press Morph: `border-radius: 20px 32px 20px 32px`
- Assist/Suggestion Chips: Uniform sizing and padding for category tags, dates, and technology chips.
- Document Links: "Certificate of internship" and "Letter of recommendation" render as non-link chips (`<span class="about-doc-chip is-static">`) when `url === null`, strictly fulfilling test requirements (`!html.includes("<a ")`).
- Accessible semantics: Semantic `<ol>` list structure with `aria-current="step"` on the active milestone and decorative shapes marked `aria-hidden="true"`.

---

## 7. Campus Communities Bento Rebuild
- **Unified Architecture**: Removed top-edge colored accents and per-card custom lime, purple, and brown fills. Every card now uses M3 role tokens (`surface-container-low` base, `surface-container` on hover, `primary-container` for the icon shape, `outline-variant` borders).
- **Leading Morphing Shapes**:
  - **9bit Technical Community**: `roundedSquare` base holding `<Icon name="code" />`, morphing to `circle` on hover/view.
  - **Dot Design Club**: `scalloped` base holding `<Icon name="palette" />`, morphing to `blob` on hover/view.
  - **Obscura Photography Club**: `blob` base holding `<Icon name="camera" />`, morphing to `roundedSquare` on hover/view.
- **Card Motion & Corner Radius Scale**:
  - Base: `border-radius: 28px`
  - Hover: `border-radius: 36px 18px 36px 18px`, `translateY(-3px)`, primary glow `box-shadow: 0 12px 28px -6px color-mix(in srgb, var(--color-primary) 14%, transparent)`
  - Active: `border-radius: 20px 32px 20px 32px`, `scale(0.98)`
- **Category & Period Chips**:
  - Category labels ("Technical", "Design", "Photography") styled as M3 suggestion chips, rendered separately from the date.
  - Period chips ("Oct 2024 – Present", "Aug 2025 – Present") standardized as M3 assist chips with uniform size, shape, and weight across all three clubs.

---

## 8. Learning & Exploring Lists Rebuild
- **Equal-Height Layout**: `.about-learning-grid` aligns both `.about-learning` and `.about-next` panels to equal height using `align-items: stretch` and flex columns.
- **Distinct M3 Container Roles**:
  - **What I'm learning**: Wrapped in `tone-secondary` (`border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, var(--color-outline-variant))`).
  - **What I want to explore next**: Wrapped in `tone-tertiary` (`border: 1px solid color-mix(in srgb, var(--color-tertiary) 30%, var(--color-outline-variant))`).
- **Status Chips & Single Group Captions**:
  - "In progress" is now rendered once as a group caption (`Active track · In progress`) in the header, rather than repeated on every single row.
  - "Core Focus" chip is retained exclusively on the "Machine Learning" item.
  - Removed repeated "Exploration" chips from every row in the explore panel.
- **Semantic M3 List Items**:
  - Each list item features an icon-tailored morphing shape:
    - *Machine Learning*: `brain` icon with `roundedSquare` morphing to `circle`.
    - *Generative AI*: `spark` icon with `scalloped` morphing to `blob`.
    - *LangGraph*: `graph` icon with `blob` morphing to `roundedSquare`.
    - *LangChain*: `link` icon with `roundedSquare` morphing to `scalloped`.
    - *Concurrency / systems in Go*: `terminal` icon with `circle` morphing to `blob`.
    - *Full-stack development*: `layers` icon with `roundedSquare` morphing to `circle`.
    - *Backend systems*: `terminal` icon with `circle` morphing to `blob`.
    - *Database engineering*: `database` icon with `scalloped` morphing to `roundedSquare`.
    - *Data structures and algorithms*: `code` icon with `blob` morphing to `circle`.
    - *Applied artificial intelligence*: `cpu` icon with `roundedSquare` morphing to `scalloped`.
  - Item interactions: Hover and `:focus-visible` apply `transform: translateX(4px)` with spring transition, elevated surface, and visible focus rings.

---

## 9. Flagged Unverified Sentences (Preserved Verbatim)
The following club descriptions are preserved in the content layer, but are flagged here for your confirmation:
- **9bit Technical Community**: *"Coding competitions, open-source workshops, peer learning, and hackathon teams."* (Specific claims flagged: *"open-source workshops"*, *"hackathon teams"*).
- **Dot Design Club**: *"UI/UX design sprints, design systems, Material Expressive aesthetics, and creative branding."* (Specific claims flagged: *"UI/UX design sprints"*, *"Material Expressive aesthetics"*, *"creative branding"*).
- **Obscura Photography Club**: *"Visual composition, framing, attention to detail, event coverage, and light/perspective study."* (Specific claims flagged: *"event coverage"*, *"light/perspective study"*).

---

## 10. Questions for User Confirmation
- **"What I want to explore next" vs Existing Competencies**:
  - Several items under *explore next* (*"Full-stack development"*, *"Backend systems"*, *"Database engineering"*) are technologies/disciplines you already actively build and ship in your portfolio (e.g. RepoGrade, PlayHub, Bhumi internship).
  - *Question*: In a future content iteration, would you prefer to keep these as broad general interest areas (as they match the text of your bio), or refine them to specific emerging/advanced engineering frontiers (for example: *"Distributed Systems & Raft Consensus"*, *"Database Internals & Storage Engines"*, *"Compiler Design & Static AST Analysis"*)?


