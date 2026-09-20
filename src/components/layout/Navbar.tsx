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

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(href + '/')
        ? 'text-indigo-600'
        : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600" onClick={() => setOpen(false)}>
          AIGP Study
        </Link>

        <div className="hidden gap-4 md:flex">
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
          className="rounded border p-1.5 text-gray-600 hover:bg-gray-50 md:hidden"
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
        <div className="border-t px-4 py-2 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
