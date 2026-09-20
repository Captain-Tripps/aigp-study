# AIGP Study App

AI Governance Professional (AIGP) exam study companion. Built with Next.js 14, Prisma, SQLite, Tailwind CSS, and TipTap.

## Features

- **Dashboard** — Domain readiness cards (4 exam domains) and module progress rings (7 training modules)
- **Study View** — Browse the full AIGP curriculum: modules → competencies → performance indicators → content chunks
- **Domain View** — Exam-focused lens showing competency matrices weighted by BoK v2.1
- **Practice Questions** — Filterable quiz with answer reveal and session scoring
- **Flashcards** — SM-2 spaced repetition for active recall
- **Study Planner** — 10-week exam schedule generator with weekly calendar
- **Rich Editor** — TipTap-based content editor with YouTube embeds, links, highlights
- **Progress Tracking** — Mark PIs as done/in-progress with confidence ratings
- **Export/Import** — JSON data portability

## Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the database:
   ```bash
   npx prisma migrate dev
   ```
4. Seed exam domains and training modules:
   ```bash
   npx prisma db seed
   ```

### PDF Ingestion (optional)

To ingest the AIGP study supplement PDF:

1. Place the PDF at the path specified in `scripts/parse-pdf.ts` (or pass the path as an argument)
2. Run:
   ```bash
   npx tsx scripts/parse-pdf.ts [path/to/pdf]
   ```

This parses the PDF structure (domains, competencies, performance indicators) and stores content chunks in the database.

### Seed additional data

- Questions: `npx tsx prisma/questions-seed.ts`
- Flashcards: `npx tsx prisma/flashcards-seed.ts`

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Testing

```bash
npx vitest run
```

### Production Build

```bash
npm run build
npm run start
```

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS
- **Rich Text:** TipTap (ProseMirror-based)
- **Markdown:** react-markdown + remark-gfm
- **Testing:** Vitest + Testing Library

### Data Model

The Prisma schema defines 10 models:

| Model | Description |
|-------|-------------|
| ExamDomain | 4 AIGP exam domains (I-IV) with weight ranges |
| TrainingModule | 7 training modules mapped to exam domains |
| Competency | Learning competencies within modules |
| PerformanceIndicator | Specific PIs under each competency |
| ContentChunk | Markdown content (PDF, YouTube, article, manual) |
| UserProgress | Per-PI status (done/in-progress/not-started) + confidence |
| Question | Practice questions with options and difficulty |
| QuestionAttempt | Recorded quiz attempts |
| Flashcard | SM-2 spaced repetition cards |
| StudyPlan | Generated 10-week exam schedule |

### Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard with readiness metrics |
| `/study` | Module list with progress |
| `/study/modules/[number]` | Module detail: competency tree + content |
| `/study/domains/[roman]` | Domain view: competency matrix |
| `/practice` | Practice questions with filters |
| `/flashcards` | SM-2 flashcard review |
| `/planner` | Study plan generator + calendar |
| `/settings` | Exam config + data export/import |
| `/content/editor/[chunkId]` | TipTap rich editor |

### SRS Algorithm (SM-2)

Flashcards use the SM-2 spaced repetition algorithm:
- Quality ratings: 0-5 (Again=1, Hard=3, Good=4, Easy=5)
- Ease factor adjusts per rating
- Interval grows exponentially for correct answers, resets for incorrect
- Due date calculation drives the review queue

## License

MIT
