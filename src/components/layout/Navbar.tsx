'use client'

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
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          AIGP Study
        </Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
