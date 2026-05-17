'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Expert Doi Trans</span>
        </Link>

        <a href="tel:+40732083657">
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">+40 732 083 657</span>
            <span className="sm:hidden">Sună</span>
          </Button>
        </a>
      </div>
    </header>
  )
}
