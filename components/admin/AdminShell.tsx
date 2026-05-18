import Link from 'next/link'
import { LayoutDashboard, Car, MessageSquare } from 'lucide-react'
import { SignOutButton } from './SignOutButton'
import { createSupabaseAdminClient } from '@/lib/supabase'

interface AdminShellProps {
  children: React.ReactNode
  activeSection?: 'dashboard' | 'masini' | 'contact'
}

async function getCounts() {
  const supabase = createSupabaseAdminClient()
  const [pending, unresolved] = await Promise.all([
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('resolved', false),
  ])
  return {
    pendingReservations: pending.count ?? 0,
    unresolvedContacts: unresolved.count ?? 0,
  }
}

export async function AdminShell({ children, activeSection }: AdminShellProps) {
  const { pendingReservations, unresolvedContacts } = await getCounts()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <p className="font-bold text-sm">Expert Doi Trans</p>
          <p className="text-xs text-slate-500 mt-0.5">Panou Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === 'dashboard'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="flex-1">Rezervări</span>
            {pendingReservations > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {pendingReservations}
              </span>
            )}
          </Link>
          <Link
            href="/admin/masini"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === 'masini'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Car className="h-4 w-4" />
            Mașini
          </Link>
          <Link
            href="/admin/contact"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              activeSection === 'contact'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="flex-1">Formulare contact</span>
            {unresolvedContacts > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unresolvedContacts}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  )
}
