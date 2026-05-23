'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Car, MessageSquare, Tag, Menu, X } from 'lucide-react'
import { SignOutButton } from './SignOutButton'

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection?: string
  pendingReservations: number
  unresolvedContacts: number
}

export function AdminLayout({
  children,
  activeSection,
  pendingReservations,
  unresolvedContacts,
}: AdminLayoutProps) {
  const [open, setOpen] = useState(false)

  const nav = [
    {
      href: '/admin/dashboard',
      label: 'Rezervări',
      icon: <LayoutDashboard className="h-4 w-4" />,
      section: 'dashboard',
      badge: pendingReservations > 0 ? pendingReservations : null,
      badgeClass: 'bg-blue-500',
    },
    {
      href: '/admin/masini',
      label: 'Mașini',
      icon: <Car className="h-4 w-4" />,
      section: 'masini',
      badge: null,
      badgeClass: '',
    },
    {
      href: '/admin/contact',
      label: 'Formulare contact',
      icon: <MessageSquare className="h-4 w-4" />,
      section: 'contact',
      badge: unresolvedContacts > 0 ? unresolvedContacts : null,
      badgeClass: 'bg-amber-500',
    },
    {
      href: '/admin/preturi',
      label: 'Prețuri tractări',
      icon: <Tag className="h-4 w-4" />,
      section: 'preturi',
      badge: null,
      badgeClass: '',
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Toggle button – always visible on mobile */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-slate-900 text-white shadow-lg lg:hidden"
        aria-label={open ? 'Închide meniu' : 'Deschide meniu'}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-slate-900 text-white flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:shrink-0`}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="ml-10 lg:ml-0">
            <p className="font-bold text-sm">Expert Doi Trans</p>
            <p className="text-xs text-slate-500 mt-0.5">Panou Admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === item.section
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span
                  className={`${item.badgeClass} text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50 min-w-0">
        {/* Spacer so content doesn't hide under the fixed toggle button on mobile */}
        <div className="h-12 lg:hidden" />
        {children}
      </main>
    </div>
  )
}
