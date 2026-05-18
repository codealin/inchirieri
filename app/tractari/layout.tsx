import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    default: 'Tractări Auto Alba Iulia | Expert Doi Trans',
    template: '%s | Expert Doi Trans Tractări',
  },
  description: 'Servicii tractări auto în Alba Iulia și împrejurimi. Autoturisme, mașini avariate, autoutilitare. Disponibili rapid, prețuri transparente.',
}

export default function TractariLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-green-800" style={{ backgroundColor: '#14532d' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back link — always visible */}
            <Link
              href="/"
              className="flex items-center gap-1 text-green-400 hover:text-green-200 transition-colors shrink-0"
              title="Închirieri auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Închirieri</span>
            </Link>
            <span className="text-green-700 text-sm">|</span>
            <Link href="/tractari" className="flex items-center gap-2 min-w-0">
              <span className="font-bold tracking-tight text-white truncate">Expert Doi Trans</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: '#16a34a', color: '#fff' }}
              >
                Tractări
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-4 shrink-0">
            <nav className="hidden md:flex items-center gap-4 text-sm text-green-200">
              <Link href="/tractari/despre" className="hover:text-white transition-colors">Despre</Link>
              <Link href="/tractari/contact" className="hover:text-white transition-colors">Contact</Link>
            </nav>
            <a
              href="tel:+40732083657"
              style={{ backgroundColor: '#ffffff', color: '#14532d' }}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-90 shrink-0"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">+40 732 083 657</span>
              <span className="sm:hidden">Sună</span>
            </a>
          </div>
        </div>
        {/* Mobile nav strip — vizibil doar pe mobil */}
        <nav
          className="md:hidden flex items-center justify-center gap-6 py-2 border-t border-green-800 text-sm text-green-200"
          style={{ backgroundColor: '#0f3d22' }}
        >
          <Link href="/tractari" className="hover:text-white transition-colors">Tarife</Link>
          <Link href="/tractari/despre" className="hover:text-white transition-colors">Despre</Link>
          <Link href="/tractari/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
      </header>

      {children}

      <footer style={{ backgroundColor: '#14532d' }} className="text-green-300 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-white font-semibold text-lg mb-1">Expert Doi Trans — Tractări</p>
            <p>Alba Iulia și împrejurimi</p>
            <a href="tel:+40732083657" className="text-green-400 hover:text-green-200 transition-colors">
              +40 732 083 657
            </a>
          </div>
          <div className="text-sm">
            <p>© {new Date().getFullYear()} Expert Doi Trans. Toate drepturile rezervate.</p>
            <Link href="/" className="text-green-600 hover:text-green-400 text-xs mt-1 block">
              Mergi la Închirieri Auto →
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
