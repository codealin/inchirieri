'use client'

import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/inchirieri" className="flex items-center gap-2 min-w-0 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-inchirieri.png"
              alt="Expert Doi Trans"
              className="h-10 w-auto"
            />
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: '#2563eb', color: '#fff' }}
            >
              Închirieri
            </span>
          </Link>
          <span className="text-slate-300 text-sm hidden sm:inline">|</span>
          <Link
            href="/tractari"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-green-700 transition-colors shrink-0 group"
          >
            Tractări auto
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <a
          href="tel:+40721999922"
          style={{ backgroundColor: '#2563eb', color: '#fff' }}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90 shrink-0"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">+40 721 999 922</span>
          <span className="sm:hidden">Sună</span>
        </a>
      </div>
      {/* Mobile strip cu link Tractări */}
      <Link
        href="/tractari"
        className="sm:hidden flex items-center justify-center gap-1.5 py-2 border-t bg-slate-50 text-sm font-semibold text-slate-700 hover:text-green-700 hover:bg-slate-100 transition-colors"
      >
        Tractări auto
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </header>
  )
}
