# Claymorphism UI Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the AIGP Study App from a flat indigo/gray Tailwind design into a soft, rounded 3D "claymorphism" aesthetic using the claymorphism design skill as the authority.

**Architecture:** Foundation-first (tokens → components → pages). All styling changes are Tailwind class swaps + a small set of new CSS utilities. No component logic changes, no API changes, no test changes.

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS 3.4, Prisma, Vitest

---

## Design Tokens (from `.cursor/skills/claymorphism/SKILL.md`)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#3B82F6` | Buttons, active states, progress |
| `text` | `#1C398E` | Headings, primary text (navy) |
| `surface` | `#FFFFFF` | Card backgrounds |
| `success` | `#16A34A` | Completed, correct |
| `warning` | `#D97706` | In-progress, medium |
| `danger` | `#DC2626` | Errors, incorrect, critical |
| Body font | Montserrat | All body text |
| Display font | Poppins | Headings, nav title |
| Mono font | JetBrains Mono | Competency codes, IDs |

**Clay shadow recipe (the core visual):**
- Outer: soft ambient shadow + directional drop (gives the "floating" 3D feel)
- Inner: top-left white highlight (gives the "puffy" clay feel)
- Combined: `shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.08)]`

**Clay button press recipe:**
- Default: outer shadow + inner highlight
- Active (press): inverted — inner shadow only, no outer (looks "pushed in")

---

## Task 1: Foundation — Tailwind Config + Global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Step 1: Extend Tailwind config with clay tokens**

Replace the entire `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Claymorphism palette (from .cursor/skills/claymorphism/SKILL.md)
        clay: {
          primary: "#3B82F6",
          primaryLight: "#60A5FA",
          primaryDark: "#2563EB",
          surface: "#FFFFFF",
          text: "#1C398E",
          success: "#16A34A",
          successLight: "#DCFCE7",
          warning: "#D97706",
          warningLight: "#FEF3C7",
          danger: "#DC2626",
          dangerLight: "#FEE2E2",
          bg: "#F0F4FF",
        },
      },
      fontFamily: {
        // Loaded via next/font/google in layout.tsx
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        clay: "1.5rem",        // 24px — the signature clay radius
        "clay-sm": "1rem",     // 16px — smaller elements
        "clay-xs": "0.75rem",  // 12px — tiny elements (badges, buttons)
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 2: Rewrite `globals.css` with clay utilities**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background: #F0F4FF;
    color: #1C398E;
    font-family: var(--font-montserrat), system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* All headings use Poppins for the display face */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-poppins), system-ui, sans-serif;
  }
}

@layer components {
  /* ── Clay card: the workhorse surface ─────────────────────
     Outer: soft ambient + directional drop shadow
     Inner: top-left white highlight, bottom-right subtle dark */
  .clay-card {
    @apply rounded-clay bg-white p-6;
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.8),
      inset 0 -2px 4px rgba(0, 0, 0, 0.06),
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 1px 3px rgba(0, 0, 0, 0.04);
  }

  /* ── Clay card compact: for smaller cards (module list, etc.) */
  .clay-card-sm {
    @apply rounded-clay-sm bg-white p-4;
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.7),
      inset 0 -1px 3px rgba(0, 0, 0, 0.04),
      0 2px 8px rgba(0, 0, 0, 0.06),
      0 1px 2px rgba(0, 0, 0, 0.03);
  }

  /* ── Clay button: primary action ──────────────────────────
     Puffy blue button with inner highlight + outer drop.
     Active state inverts to "pressed in" */
  .clay-btn {
    @apply inline-flex items-center justify-center gap-2 rounded-clay-xs
           bg-clay-primary px-5 py-2.5 text-sm font-semibold text-white
           transition-all duration-150 cursor-pointer;
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.3),
      inset 0 -2px 3px rgba(0, 0, 0, 0.1),
      0 4px 8px rgba(59, 130, 246, 0.3);
  }
  .clay-btn:hover {
    @apply bg-clay-primaryDark;
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.25),
      inset 0 -2px 3px rgba(0, 0, 0, 0.12),
      0 3px 6px rgba(59, 130, 246, 0.35);
  }
  .clay-btn:active {
    @apply bg-clay-primaryDark translate-y-px;
    box-shadow:
      inset 0 2px 6px rgba(0, 0, 0, 0.2),
      inset 0 -1px 2px rgba(255, 255, 255, 0.1);
  }
  .clay-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
    box-shadow: none;
  }

  /* ── Clay button: secondary (white/ghost) ────────────────── */
  .clay-btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-clay-xs
           bg-white px-5 py-2.5 text-sm font-semibold text-clay-text
           transition-all duration-150 cursor-pointer;
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.9),
      inset 0 -2px 3px rgba(0, 0, 0, 0.04),
      0 3px 8px rgba(0, 0, 0, 0.08);
  }
  .clay-btn-secondary:hover {
    @apply bg-blue-50;
    box-shadow:
      inset 0 2px 3px rgba(255, 255, 255, 0.85),
      inset 0 -2px 3px rgba(0, 0, 0, 0.05),
      0 2px 6px rgba(0, 0, 0, 0.1);
  }
  .clay-btn-secondary:active {
    box-shadow:
      inset 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  /* ── Clay input: for selects, text inputs, number inputs ──
     Sunken look with inner shadow (the "pressed into clay" feel) */
  .clay-input {
    @apply rounded-clay-sm border-0 bg-white px-4 py-2 text-sm
           text-clay-text outline-none;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.08),
      inset 0 1px 2px rgba(0, 0, 0, 0.04),
      0 1px 2px rgba(255, 255, 255, 0.5);
  }
  .clay-input:focus {
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 0 0 3px rgba(59, 130, 246, 0.25);
  }

  /* ── Clay badge: small pill for labels, weights, statuses ── */
  .clay-badge {
    @apply inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.6),
      inset 0 -1px 2px rgba(0, 0, 0, 0.04),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }

  /* ── Clay progress bar track ─────────────────────────────── */
  .clay-progress-track {
    @apply h-3 w-full rounded-full bg-white;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 1px rgba(0, 0, 0, 0.05);
  }

  /* ── Clay progress bar fill ──────────────────────────────── */
  .clay-progress-fill {
    @apply h-3 rounded-full transition-all duration-300;
    box-shadow:
      inset 0 1px 2px rgba(255, 255, 255, 0.4),
      0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Step 3: Update `layout.tsx` with Google Fonts + clay background**

Replace the entire file with:

```tsx
import type { Metadata } from 'next'
import { Montserrat, Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

// Load fonts via next/font — zero layout shift, self-hosted
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AIGP Study',
  description: 'AI Governance Professional certification study app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-clay-bg font-sans text-clay-text">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. No TS errors. Fonts load without errors.

**Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/app/layout.tsx
git commit -m "feat(ui): add claymorphism design tokens, fonts, and base utilities

Foundation for the clay redesign:
- Tailwind config: clay color palette, clay border radii, font families
- globals.css: clay-card, clay-btn, clay-input, clay-badge, clay-progress utilities
- layout.tsx: Montserrat/Poppins/JetBrains Mono via next/font, clay background"
```

---

## Task 2: Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Step 1: Replace Navbar with clay styling**

Replace the entire file with:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/study', label: 'Study' },
  { href: '/practice', label: 'Practice' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/planner', label: 'Planner' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    return `rounded-clay-xs px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-clay-primary/10 text-clay-primary font-semibold shadow-[inset_0_1px_2px_rgba(59,130,246,0.1)]'
        : 'text-clay-text/70 hover:text-clay-text hover:bg-clay-primary/5'
    }`
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md"
         style={{ boxShadow: '0 2px 12px rgba(28,57,142,0.08)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/"
              className="font-display text-lg font-bold text-clay-primary"
              onClick={() => setOpen(false)}>
          AIGP Study
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-clay-xs p-2 text-clay-text/70 transition-colors hover:bg-clay-primary/10 hover:text-clay-text md:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-clay-primary/10 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                    onClick={() => setOpen(false)}
                    className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
```

**Step 2: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(ui): restyle Navbar with claymorphism

Sticky glass nav bar with clay pill links, active state with
soft primary highlight, clay mobile toggle button."
```

---

## Task 3: Dashboard Page + Components

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/dashboard/DomainReadinessCard.tsx`
- Modify: `src/components/dashboard/ModuleProgressRing.tsx`

**Step 1: Restyle dashboard page**

Replace `src/app/page.tsx` with:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { DomainReadinessCard } from '@/components/dashboard/DomainReadinessCard'
import { ModuleProgressRing } from '@/components/dashboard/ModuleProgressRing'
import type { DomainReadiness, ModuleProgress } from '@/types/dashboard'

interface DashboardData {
  domains: DomainReadiness[]
  modules: ModuleProgress[]
  nextActions: string[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    fetch('/api/dashboard')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          setError(err?.error || `Failed to load (HTTP ${res.status})`)
          return
        }
        setData(await res.json())
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => { load() }, [])

  if (error) {
    return (
      <div className="clay-card mx-auto max-w-md text-center">
        <p className="text-clay-danger font-medium">{error}</p>
        <button onClick={load} className="clay-btn mt-4">
          Retry
        </button>
      </div>
    )
  }
  if (!data) return <p className="text-clay-text/50">Loading...</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-clay-text">Dashboard</h1>
        <p className="mt-1 text-clay-text/60">Your AIGP exam readiness at a glance</p>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-clay-text">Exam Domain Readiness</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.domains.map((d) => (
            <DomainReadinessCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-clay-text">Module Progress</h2>
        <div className="flex flex-wrap gap-6">
          {data.modules.map((m) => (
            <ModuleProgressRing key={m.id} module={m} />
          ))}
        </div>
      </section>

      {data.nextActions.length > 0 && (
        <section className="clay-card">
          <h2 className="mb-3 font-display text-lg font-semibold text-clay-text">Next Actions</h2>
          <ul className="list-inside list-disc text-sm text-clay-text/80 space-y-1">
            {data.nextActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
```

**Step 2: Restyle DomainReadinessCard**

Replace `src/components/dashboard/DomainReadinessCard.tsx` with:

```tsx
import type { DomainReadiness } from '@/types/dashboard'

export function DomainReadinessCard({ domain }: { domain: DomainReadiness }) {
  // Clay progress color: use the clay palette tokens
  const fillColor =
    domain.readiness >= 80 ? 'bg-clay-success' :
    domain.readiness >= 50 ? 'bg-clay-warning' :
    'bg-clay-danger'

  return (
    <div className="clay-card-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-clay-text/50">
            Domain {domain.romanNumeral}
          </p>
          <h3 className="font-display text-base font-semibold text-clay-text">{domain.title}</h3>
        </div>
        <span className="clay-badge bg-clay-primary/10 text-clay-primary">
          {domain.weightMin}-{domain.weightMax}%
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-clay-text">{domain.readiness}% ready</span>
          <span className="text-clay-text/50">
            {domain.completedPis}/{domain.totalPis} PIs
          </span>
        </div>
        <div className="clay-progress-track mt-2">
          <div
            className={`clay-progress-fill ${fillColor}`}
            style={{ width: `${domain.readiness}%` }}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-clay-text/40">
        Avg confidence: {domain.avgConfidence}/5
      </p>
    </div>
  )
}
```

**Step 3: Restyle ModuleProgressRing**

Replace `src/components/dashboard/ModuleProgressRing.tsx` with:

```tsx
import type { ModuleProgress } from '@/types/dashboard'

export function ModuleProgressRing({ module }: { module: ModuleProgress }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (module.completion / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        {/* Track: subtle sunken ring */}
        <circle cx="45" cy="45" r={radius} fill="none"
                stroke="#E0E7FF" strokeWidth="8" />
        {/* Progress: clay primary */}
        <circle
          cx="45" cy="45" r={radius} fill="none"
          stroke="#3B82F6" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
              className="fill-clay-text text-sm font-bold">
          {module.completion}%
        </text>
      </svg>
      <p className="mt-2 text-center text-xs font-semibold text-clay-text/80">
        M{module.number}
      </p>
      <p className="text-center text-xs text-clay-text/50 line-clamp-2 max-w-[100px]">
        {module.title}
      </p>
    </div>
  )
}
```

**Step 4: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/dashboard/DomainReadinessCard.tsx src/components/dashboard/ModuleProgressRing.tsx
git commit -m "feat(ui): restyle dashboard with claymorphism

Dashboard page, DomainReadinessCard, and ModuleProgressRing
now use clay cards, clay badges, clay progress bars, and
clay color tokens."
```

---

## Task 4: Study Pages + Components

**Files:**
- Modify: `src/app/study/page.tsx`
- Modify: `src/app/study/modules/[number]/page.tsx`
- Modify: `src/components/study/CompetencyTree.tsx`
- Modify: `src/components/study/ContentPanel.tsx`
- Modify: `src/components/study/ProgressActions.tsx`

**Step 1: Restyle study page (module list)**

Read the current file first, then replace all `rounded-lg border bg-white p-4 shadow-sm` with `clay-card-sm`, `text-gray-*` with `text-clay-text/*`, `bg-indigo-600` with `bg-clay-primary`, `bg-indigo-500` with `bg-clay-primary`, `bg-gray-200` (progress track) with `clay-progress-track` class, and `bg-indigo-500` (progress fill) with `clay-progress-fill bg-clay-primary`.

Key patterns to replace:
- `rounded-lg border bg-white p-4 shadow-sm` → `clay-card-sm`
- `text-indigo-600` → `text-clay-primary`
- `text-gray-500` → `text-clay-text/50`
- `text-gray-700` → `text-clay-text/80`
- `text-gray-900` → `text-clay-text`
- `bg-gray-200` (progress track) → remove, use `clay-progress-track` on parent
- `h-1.5 rounded-full bg-indigo-500` → `clay-progress-fill bg-clay-primary`
- `h-1.5 rounded-full bg-gray-200` → `clay-progress-track`
- `rounded border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`

**Step 2: Restyle module detail page**

Read the current file, then apply the same pattern replacements as Step 1. Specifically:
- Error card: `rounded-lg border bg-white p-8` → `clay-card`, `text-red-600` → `text-clay-danger`, `bg-indigo-600` → `clay-btn`
- Module header: `text-indigo-600` → `text-clay-primary`, `text-gray-900` → `text-clay-text`
- Empty states: `rounded-lg border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`

**Step 3: Restyle CompetencyTree**

Read the current file, then:
- Each competency item: `rounded-lg border bg-white` → `clay-card-sm`
- Selected PI: `bg-indigo-100 text-indigo-700` → `bg-clay-primary/10 text-clay-primary`
- Done checkmark: `text-green-600` → `text-clay-success`
- Code: `text-indigo-600 font-mono` → `text-clay-primary font-mono font-medium`
- Title: `text-gray-900` → `text-clay-text`

**Step 4: Restyle ContentPanel**

Read the current file, then:
- Chunk cards: `rounded-lg border bg-white p-4 shadow-sm` → `clay-card-sm`
- Source link: `text-indigo-600` → `text-clay-primary`
- Edited badge: `bg-yellow-100 text-yellow-700` → `clay-badge bg-clay-warning/10 text-clay-warning`
- Edit button: `rounded border px-2 py-0.5 text-gray-600` → `clay-btn-secondary rounded-clay-xs px-3 py-1 text-xs`

**Step 5: Restyle ProgressActions**

Read the current file, then:
- Status select: `rounded border px-2 py-1` → `clay-input`
- Range input: keep as-is (native range, no clay styling needed)
- Save button: `rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Error: `text-red-600` → `text-clay-danger`

**Step 6: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 7: Commit**

```bash
git add src/app/study/page.tsx src/app/study/modules/\[number\]/page.tsx src/components/study/CompetencyTree.tsx src/components/study/ContentPanel.tsx src/components/study/ProgressActions.tsx
git commit -m "feat(ui): restyle study pages with claymorphism

Study list, module detail, competency tree, content panel,
and progress actions now use clay cards, clay inputs,
clay badges, and clay buttons."
```

---

## Task 5: Domain Pages + Components

**Files:**
- Modify: `src/app/study/domains/[roman]/page.tsx`
- Modify: `src/components/domain/CompetencyMatrix.tsx`

**Step 1: Restyle domain detail page**

Read the current file, then:
- Header card: `rounded-lg border bg-white p-4 shadow-sm` → `clay-card`
- Weight badge: `rounded-full bg-indigo-100 px-3 py-1 text-indigo-700` → `clay-badge bg-clay-primary/10 text-clay-primary`
- Readiness text: `text-gray-900` → `text-clay-text`, `text-gray-500` → `text-clay-text/50`
- Module list items: apply same patterns as study page (clay-card-sm)
- Empty state: `rounded-lg border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`

**Step 2: Restyle CompetencyMatrix**

Read the current file, then:
- Table container: `rounded-lg border bg-white` → `clay-card`
- Header row: `bg-gray-50` → `bg-clay-primary/5`
- Code cells: `text-indigo-600 font-mono` → `text-clay-primary font-mono font-medium`
- Status colors: `text-green-600` → `text-clay-success`, `text-yellow-600` → `text-clay-warning`, `text-gray-400` → `text-clay-text/30`
- Cell text: `text-gray-900` → `text-clay-text`, `text-gray-500` → `text-clay-text/50`

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/study/domains/\[roman\]/page.tsx src/components/domain/CompetencyMatrix.tsx
git commit -m "feat(ui): restyle domain pages with claymorphism

Domain detail page and competency matrix now use clay cards,
clay badges, and clay color tokens."
```

---

## Task 6: Practice Pages + Components

**Files:**
- Modify: `src/app/practice/page.tsx`
- Modify: `src/components/practice/QuestionCard.tsx`

**Step 1: Restyle practice page**

Read the current file, then:
- Filter selects: `rounded border px-2 py-1 text-sm` → `clay-input`
- Search button: `rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Session complete card: `rounded-lg border bg-white p-4` → `clay-card`
- Empty state: `rounded-lg border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`
- Question counter: `text-gray-500` → `text-clay-text/50`
- Heading: `text-gray-900` → `text-clay-text`

**Step 2: Restyle QuestionCard**

Read the current file, then:
- Card: `rounded-lg border bg-white p-4 shadow-sm` → `clay-card`
- Difficulty badges:
  - Easy: `bg-green-100 text-green-700` → `clay-badge bg-clay-success/10 text-clay-success`
  - Medium: `bg-yellow-100 text-yellow-700` → `clay-badge bg-clay-warning/10 text-clay-warning`
  - Hard: `bg-red-100 text-red-700` → `clay-badge bg-clay-danger/10 text-clay-danger`
- Option buttons (unselected): `border border-gray-300 bg-white hover:bg-gray-50` → `rounded-clay-sm border-0 bg-white hover:bg-clay-primary/5` + inner shadow
- Option button (selected, before submit): `border-indigo-500 bg-indigo-50` → `bg-clay-primary/10 text-clay-primary` + `shadow-[inset_0_2px_4px_rgba(59,130,246,0.15)]`
- Option button (correct): `border-green-500 bg-green-50` → `bg-clay-success/10 text-clay-success`
- Option button (incorrect): `border-red-500 bg-red-50` → `bg-clay-danger/10 text-clay-danger`
- Explanation box: `bg-gray-50 rounded p-3` → `rounded-clay-sm bg-clay-primary/5 p-4`
- Text: `text-gray-900` → `text-clay-text`, `text-gray-600` → `text-clay-text/70`

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/practice/page.tsx src/components/practice/QuestionCard.tsx
git commit -m "feat(ui): restyle practice pages with claymorphism

Practice page filters, question card, difficulty badges,
option buttons, and explanation box now use clay styling."
```

---

## Task 7: Flashcards Pages + Components

**Files:**
- Modify: `src/app/flashcards/page.tsx`
- Modify: `src/components/flashcards/CardFlip.tsx`

**Step 1: Restyle flashcards page**

Read the current file, then:
- Empty state: `rounded-lg border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`
- Card queue heading: `text-gray-900` → `text-clay-text`
- Any buttons: apply `clay-btn` or `clay-btn-secondary`

**Step 2: Restyle CardFlip**

Read the current file, then:
- Card: `rounded-lg border bg-white p-6 shadow-sm` → `clay-card`
- Flip button: `rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Rating buttons:
  - Again (red): `bg-red-500` → `bg-clay-danger` + clay shadow
  - Hard (yellow): `bg-yellow-500` → `bg-clay-warning` + clay shadow
  - Good (green): `bg-green-500` → `bg-clay-success` + clay shadow
  - Easy (blue): `bg-blue-500` → `bg-clay-primary` + clay shadow
  - All: `rounded-lg text-white font-semibold` → `rounded-clay-xs text-white font-semibold` + clay button shadow (reuse the `.clay-btn` shadow pattern but with the specific color)
- Card text: `text-gray-900` → `text-clay-text`, `text-gray-500` → `text-clay-text/50`

For the rating buttons, since they each have different colors, use inline style for the shadow color or add a CSS utility. The simplest approach: use the `.clay-btn` class but override the background color with an inline style or Tailwind class:

```tsx
<button className="clay-btn !bg-clay-danger">Again</button>
<button className="clay-btn !bg-clay-warning">Hard</button>
<button className="clay-btn !bg-clay-success">Good</button>
<button className="clay-btn !bg-clay-primary">Easy</button>
```

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/flashcards/page.tsx src/components/flashcards/CardFlip.tsx
git commit -m "feat(ui): restyle flashcards with claymorphism

Flashcard page and CardFlip component now use clay cards,
clay flip button, and clay-colored rating buttons."
```

---

## Task 8: Planner Pages + Components

**Files:**
- Modify: `src/app/planner/page.tsx`
- Modify: `src/components/planner/CalendarView.tsx`

**Step 1: Restyle planner page**

Read the current file, then:
- Exam date input: `rounded border px-3 py-2` → `clay-input`
- Hours input: `rounded border px-3 py-2` → `clay-input`
- Generate button: `rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Empty state: `rounded-lg border bg-white p-8 text-center text-gray-500` → `clay-card text-clay-text/50`
- Labels: `text-gray-700` → `text-clay-text/80`
- Heading: `text-gray-900` → `text-clay-text`

**Step 2: Restyle CalendarView**

Read the current file, then:
- Week cards: `rounded-lg border bg-white p-4` → `clay-card-sm`
- Module badges: `rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700` → `clay-badge bg-clay-primary/10 text-clay-primary`
- Domain badges: `rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600` → `clay-badge bg-clay-text/5 text-clay-text/70`
- Week header: `text-gray-900 font-semibold` → `text-clay-text font-semibold`
- Day text: `text-gray-500` → `text-clay-text/50`

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/planner/page.tsx src/components/planner/CalendarView.tsx
git commit -m "feat(ui): restyle planner with claymorphism

Planner page inputs, generate button, and calendar week
cards now use clay inputs, clay buttons, and clay badges."
```

---

## Task 9: Settings Pages + Components

**Files:**
- Modify: `src/app/settings/page.tsx`
- Modify: `src/components/settings/ExamSettings.tsx`

**Step 1: Restyle settings page**

Read the current file, then:
- Export button: `rounded border px-4 py-2 text-gray-700 hover:bg-gray-50` → `clay-btn-secondary`
- Import button: `rounded border px-4 py-2 text-gray-700 hover:bg-gray-50` → `clay-btn-secondary`
- Section headings: `text-gray-900` → `text-clay-text`
- Labels: `text-gray-600` → `text-clay-text/70`
- Any cards: `rounded-lg border bg-white` → `clay-card`

**Step 2: Restyle ExamSettings**

Read the current file, then:
- Date input: `rounded border px-3 py-2` → `clay-input`
- Number input: `rounded border px-3 py-2` → `clay-input`
- Save button: `rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Labels: `text-gray-700` → `text-clay-text/80`
- Error text: `text-red-600` → `text-clay-danger`
- Success text: `text-green-600` → `text-clay-success`

**Step 3: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/app/settings/page.tsx src/components/settings/ExamSettings.tsx
git commit -m "feat(ui): restyle settings with claymorphism

Settings page and exam settings form now use clay buttons,
clay inputs, and clay color tokens."
```

---

## Task 10: Editor Pages + Components

**Files:**
- Modify: `src/app/content/editor/[chunkId]/page.tsx`
- Modify: `src/components/editor/RichEditor.tsx`
- Modify: `src/components/editor/MetadataPanel.tsx`

**Step 1: Restyle editor page**

Read the current file, then:
- Error card: `rounded-lg border bg-white p-8` → `clay-card`, `text-red-600` → `text-clay-danger`, retry button → `clay-btn`
- Save button: `rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700` → `clay-btn`
- Grid headings: `text-gray-900` → `text-clay-text`
- Empty/loading states: apply clay patterns

**Step 2: Restyle RichEditor**

Read the current file, then:
- Editor wrapper: `rounded-lg border bg-white` → `rounded-clay bg-white` + clay card shadow (use `clay-card` or inline shadow)
- TipTap content: keep `prose-sm` but ensure text color is `text-clay-text`
- Min height: keep `min-h-[200px]`

**Step 3: Restyle MetadataPanel**

Read the current file, then:
- All inputs (video ID, start/end, tags): `rounded border px-2 py-1 text-sm` → `clay-input`
- Labels: `text-gray-700 text-sm` → `text-clay-text/80 text-sm font-medium`
- Panel container: if it has a card wrapper, apply `clay-card-sm`

**Step 4: Verify**

Run: `npm run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/app/content/editor/\[chunkId\]/page.tsx src/components/editor/RichEditor.tsx src/components/editor/MetadataPanel.tsx
git commit -m "feat(ui): restyle editor with claymorphism

Editor page, RichEditor wrapper, and metadata panel now
use clay cards, clay inputs, and clay buttons."
```

---

## Task 11: Visual QA Pass

**Files:** None (verification only)

**Step 1: Run all tests**

Run: `npm test -- --run`
Expected: All 46 tests pass. No regressions.

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 3: Visual spot-check (manual or screenshot)**

Start dev server: `npm run dev` (port 3100)

Checklist:
- [ ] Dashboard: cards have puffy clay shadow, progress bars are colored, badges are pills
- [ ] Navbar: sticky, glass effect, active link has soft blue highlight
- [ ] Study page: module cards are clay, progress bars visible
- [ ] Module detail: competency tree items are clay cards, selected PI has blue highlight
- [ ] Content panel: chunk cards are clay, edited badge is amber
- [ ] Practice: question card is clay, option buttons have soft backgrounds
- [ ] Flashcards: card is clay, rating buttons are colored clay
- [ ] Planner: inputs are sunken clay, week cards are clay
- [ ] Settings: buttons are clay secondary, inputs are sunken
- [ ] Editor: rich text area has clay border/shadow, metadata inputs are sunken
- [ ] No contrast issues: all text is readable on all backgrounds (WCAG AA)
- [ ] Mobile: nav collapses properly, cards stack

**Step 4: Fix any issues found**

If any visual issues are found, fix them and re-run the build.

**Step 5: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "fix(ui): visual QA fixes for claymorphism"
```

---

## Task 12: Final Build + Summary

**Files:** None (verification only)

**Step 1: Full test suite**

Run: `npm test -- --run`
Expected: All 46 tests pass.

**Step 2: Production build**

Run: `npm run build`
Expected: Build succeeds. No errors, no warnings.

**Step 3: Lint**

Run: `npm run lint`
Expected: No errors.

**Step 4: Summarize**

Report:
- Total files changed
- Test results
- Build status
- Any known limitations or follow-up items

---

## Anti-Patterns to Avoid

1. **Don't use `!important` (the `!` prefix) unless necessary** — prefer modifying the CSS utility classes in `globals.css` instead.
2. **Don't mix flat and clay styles** — every card, button, input, and badge must use a clay variant. No `border border-gray-200` flat cards remain.
3. **Don't use raw hex colors in components** — always use the `clay-*` Tailwind tokens (`text-clay-primary`, `bg-clay-danger`, etc.).
4. **Don't change component logic** — this is a styling-only task. No changes to data flow, API calls, or state management.
5. **Don't break accessibility** — all interactive elements must have visible focus states. The `.clay-input:focus` rule handles this for inputs. Buttons use `:focus-visible` via Tailwind's default.
6. **Don't forget the `font-display` class on headings** — Poppins is the display font, applied via `font-display` utility or the base `h1-h6` rule in `globals.css`.

## Follow-Up Items (Post-Redesign)

- **Dark mode:** The claymorphism skill doesn't define a dark variant. The current dark mode CSS variables in `globals.css` are removed. If dark mode is needed later, it requires a separate clay dark palette design.
- **Print styles:** Not addressed. If the app needs print support, clay shadows should be stripped in `@media print`.
- **Reduced motion:** The `transition-all duration-150` on buttons could be wrapped in `@media (prefers-reduced-motion: no-preference)` if accessibility requirements expand.
