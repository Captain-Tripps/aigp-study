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
