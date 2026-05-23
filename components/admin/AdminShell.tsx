import { createSupabaseAdminClient } from '@/lib/supabase'
import { AdminLayout } from './AdminLayout'

interface AdminShellProps {
  children: React.ReactNode
  activeSection?: 'dashboard' | 'masini' | 'contact' | 'preturi'
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
    <AdminLayout
      activeSection={activeSection}
      pendingReservations={pendingReservations}
      unresolvedContacts={unresolvedContacts}
    >
      {children}
    </AdminLayout>
  )
}
