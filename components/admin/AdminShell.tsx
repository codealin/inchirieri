import Link from 'next/link'
import { LayoutDashboard, Car, MessageSquare } from 'lucide-react'
import { SignOutButton } from './SignOutButton'

interface AdminShellProps {
  children: React.ReactNode
  activeSection?: 'dashboard' | 'masini' | 'contact'
}

export function AdminShell({ children, activeSection }: AdminShellProps) {
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
            Rezervări
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
            Formulare contact
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
