# Open Items — AIGP Study App

Living tracker for all known open items. Items are grouped by category and ordered by recommended priority.

## Status Legend

- `[ ]` — Open
- `[~]` — In progress
- `[x]` — Done

---

## 1. v1 Review — Follow-up Tickets (Non-blocking)

These were identified in the initial whole-branch review of the AIGP Study App (v1, commit `29cf9ac`). They are non-blocking for v1 but should be addressed for v1.1 or v2.

### F-1: Editor enrichment — [x]

The TipTap editor is functional but thin. Enrich with:

- **Callouts** — blockquote-style callout blocks for key definitions ✅
- **KaTeX** — math rendering for formulas in study material ✅
- **PI cross-refs** — clickable links from content to specific Performance Indicators ✅
- **Mermaid** — diagram support for process flows and architecture diagrams ✅
- **Edit history / diff / revert** — track edits to study content chunks, show diffs, allow reverting to previous versions ✅

**Implementation (2026-09-20):** `@tiptap/extension-mathematics` + `katex` for math. Custom `CalloutBlock` (block node, 4 variants), `PIReference` (inline atom with `next/link` nav), `MermaidBlock` (block node with lazy-loaded mermaid rendering). `ContentChunkRevision` Prisma model + API routes for history/diff/revert. Toolbar in `RichEditor` for inserting all new types. Commits: `152878b`, `749ad9f`.

### F-2: Export/import faithful round-trip — [x]

The current export/import flow does not preserve all fields faithfully. A round-trip (export → import) should produce an identical database state. **Fixed (2026-09-20):** Import route rewritten to handle all 8 tables in dependency order with ID remapping (old→new maps for auto-incremented PKs). Upsert on natural keys for idempotency. Returns per-table counts. Commit: `24acb5c`.

### F-3: FK indexes + bounded queries — [x]

**Fixed (2026-09-20):** 10 `@@index` directives on FK columns + migration `add_fk_indexes`. Pagination (`page`/`pageSize`) added to questions, flashcards, and revisions routes. Commit: `6d20af3`.

### F-4: res.ok checks + flashcard quality range-check — [x]

**Fixed (2026-09-20):** `res.ok` checks added to practice, flashcards, planner, settings, and editor pages with error states + retry buttons. Flashcard quality validated as integer 0–5. Commit: `6d20af3`.

### F-5: Wire Add Resource button; idempotent seeds; planner dedupe — [x]

**Fixed (2026-09-20):** Seeds idempotent (skip existing records). Planner upserts single plan, fixed module distribution `[1,1,1,2,2,3,4,5,6,7]`. New `POST /api/content/add` endpoint + "Add Content" button on module detail page for empty PIs. Commit: `6d20af3`.

### F-6: Portable integration tests — [x]

**Fixed (2026-09-20):** `prisma.test.ts` now mock-based (no DB dependency). New `roundtrip.test.ts` tests export/import handlers with mocked Prisma. All 52 tests run in CI without a real database. Commit: `6ec869a`.

---

## 2. v1 Review — Important Findings

### I-1: Editor is thin — [x]

See F-1 above. Resolved with F-1 enrichment (commits `152878b`, `749ad9f`).

### I-2: Export/import not faithful round-trip — [x]

See F-2 above. Resolved with import route rewrite (commit `24acb5c`).

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

## 5. Content Generation Pipeline — [x]

Content generated on 2026-09-20 against `gpt-oss-120b` on the Zeus GPU server (`100.125.83.77:8080`).

- [x] BOK clean rebuild — 13 competencies, 58 PIs (verbatim BOK v2.1 wording), 58 content chunks generated
- [x] Playbook article scraping — 7 articles fetched from aigpplaybook.com, embedded in `scripts/playbook-content.ts`
- [x] PI-to-source mapping — all 58 PIs mapped to 1-2 source articles (min 5,562 chars, max 15,699 chars grounding per PI)
- [x] Source-grounded content generation — 58/58 PIs regenerated with actual Playbook article text injected into prompts
- [x] Deep-dive content structure — each chunk has 6 sections: Plain-Language Summary, Key Exam Concepts, Key Terms, Common Exam Misconceptions, Real-World Scenario, Practice Question
- [ ] Verify generated content quality — human review pending
- [x] Markdown formatting fixes — 842 fixes across 58 chunks (`scripts/fix-newlines.ts`)

**Structure:** 7 modules → 13 competencies → 58 PIs → 58 content chunks (~5,000-7,000 chars each, source-grounded).

**Scripts:** `bok-seed.ts` (BOK structure seed), `playbook-content.ts` (scraped articles + PI mapping), `generate-content-per-pi.ts` (source-grounded per-PI gen, supports `--only` and `--overwrite`), `fix-newlines.ts` (Markdown formatting).

---

## 6. Future Enhancements

Ideas noted during development, not yet scoped:

- Dark mode (claymorphism skill doesn't define a dark variant; requires separate design)
- Print styles (strip clay shadows in `@media print`)
- Reduced motion support (`@media (prefers-reduced-motion: no-preference)` for transitions)
- PWA / offline support for studying on the go
- Multi-user support (currently single-user, local SQLite)
