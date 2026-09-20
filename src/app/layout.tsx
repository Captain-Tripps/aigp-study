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
