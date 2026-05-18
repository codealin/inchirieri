'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">Expert Doi Trans</span>
          </Link>
          <Link
            href="/tractari"
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tractări auto
          </Link>
        </div>

        <a
          href="tel:+40732083657"
          style={{ backgroundColor: '#2563eb', color: '#fff' }}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors hover:opacity-90"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">+40 732 083 657</span>
          <span className="sm:hidden">Sună</span>
        </a>
      </div>
    </header>
  )
}
