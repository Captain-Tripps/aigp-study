# Open Items — AIGP Study App

Living tracker for all known open items. Items are grouped by category and ordered by recommended priority.

## Status Legend

- `[ ]` — Open
- `[~]` — In progress
- `[x]` — Done

---

## 1. v1 Review — Follow-up Tickets (Non-blocking)

These were identified in the initial whole-branch review of the AIGP Study App (v1, commit `29cf9ac`). They are non-blocking for v1 but should be addressed for v1.1 or v2.

### F-1: Editor enrichment

The TipTap editor is functional but thin. Enrich with:

- **Callouts** — blockquote-style callout blocks for key definitions
- **KaTeX** — math rendering for formulas in study material
- **PI cross-refs** — clickable links from content to specific Performance Indicators
- **Mermaid** — diagram support for process flows and architecture diagrams
- **Edit history / diff / revert** — track edits to study content chunks, show diffs, allow reverting to previous versions

### F-2: Export/import faithful round-trip

The current export/import flow does not preserve all fields faithfully. A round-trip (export → import) should produce an identical database state. Investigate which fields are lost and fix the serialization/deserialization.

### F-3: FK indexes + bounded queries

Database queries are missing foreign key indexes and some are unbounded. Add indexes on FK columns and add `LIMIT`/pagination to queries that can return large result sets.

### F-4: res.ok checks + flashcard quality range-check

- Add `res.ok` checks on remaining API fetches that are missing them (defensive error handling)
- Add range-check on flashcard quality values (valid range: 0, 3, 4, 5)

### F-5: Wire Add Resource button; idempotent seeds; planner dedupe

- The "Add Resource" button in the UI is not wired to any API endpoint
- Seed scripts should be idempotent (safe to run multiple times without duplicating data)
- Planner should deduplicate study sessions (avoid scheduling the same content twice)

### F-6: Portable integration tests

Current integration tests depend on local environment (SQLite file paths, etc.). Make them portable so they can run in CI without environment-specific setup.

---

## 2. v1 Review — Important Findings

### I-1: Editor is thin

See F-1 above. The editor needs enrichment to be useful for studying complex governance material.

### I-2: Export/import not faithful round-trip

See F-2 above.

---

## 3. Claymorphism Redesign — Deferred Minors

These were deferred during the claymorphism UI redesign (branch `feat/claymorphism-ui`). All are low-risk CSS polish.

### C-1: Deduplicate body font/bg — [x]

`globals.css` `@layer base` and `layout.tsx` both set body background, color, and font. **Fixed:** stripped body rule from `globals.css`, `layout.tsx` Tailwind classes are the single source of truth.

### C-2: Navbar shadows use raw rgba()

Navbar active-state shadow and nav boxShadow use raw `rgba()` values matching clay tokens. **Deferred by decision** (2026-07-20): values are correct and match tokens; token-derivation is a nice-to-have, not a blocker. Left as-is.

### C-3: CompetencyMatrix uses `rounded-clay bg-white` instead of `clay-card`

The `p-6` on `clay-card` would inset the scrollable table from container edges. **Fixed:** changed to `clay-card p-0` — gets the clay shadow, keeps table flush.

### C-4: CardFlip `!bg-clay-*` important overrides

Rating buttons used `!` important prefix to override `.clay-btn`'s baked-in `bg-clay-primary`. **Fixed:** created `.clay-btn-danger`, `.clay-btn-warning`, `.clay-btn-success`, `.clay-btn-easy` color variants in `globals.css`. Removed `!` prefixes from `CardFlip.tsx`.

### C-5: CardFlip colored buttons inherit blue-tinted shadow

A red "Again" button was casting a blue shadow (inherited from `.clay-btn`). **Fixed:** each color variant in C-4 now carries its own color-tinted box-shadow.

---

## 4. Known Limitations

### Visual QA not run automatically

The manual visual checklist from Task 11 (screenshots, WCAG contrast spot-check in browser, mobile nav) was not run automatically. Flagged for human verification:

- [ ] Dashboard: cards have puffy clay shadow, progress bars colored, badges are pills
- [ ] Navbar: sticky, glass effect, active link has soft blue highlight
- [ ] Study page: module cards are clay, progress bars visible
- [ ] Module detail: competency tree items are clay cards, selected PI has blue highlight
- [ ] Content panel: chunk cards are clay, edited badge is amber
- [ ] Practice: question card is clay, option buttons have soft backgrounds
- [ ] Flashcards: card is clay, rating buttons are colored clay (no blue shadow on red/amber/green)
- [ ] Planner: inputs are sunken clay, week cards are clay
- [ ] Settings: buttons are clay secondary, inputs are sunken
- [ ] Editor: rich text area has clay border/shadow, metadata inputs are sunken
- [ ] No contrast issues: all text readable on all backgrounds (WCAG AA)
- [ ] Mobile: nav collapses properly, cards stack

---

## 5. Content Generation Pipeline

The content generation pipeline (`scripts/generate-content.ts`, `lib/content-templates.ts`, `prisma/study-content-seed.ts`) was built but not yet run (GPUs were busy at the time).

- [ ] Run content generation for all modules
- [ ] Verify generated content quality
- [ ] Seed the database with generated content

---

## 6. Future Enhancements

Ideas noted during development, not yet scoped:

- Dark mode (claymorphism skill doesn't define a dark variant; requires separate design)
- Print styles (strip clay shadows in `@media print`)
- Reduced motion support (`@media (prefers-reduced-motion: no-preference)` for transitions)
- PWA / offline support for studying on the go
- Multi-user support (currently single-user, local SQLite)
