export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { ReservationList } from '@/components/admin/ReservationList'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { status } = await searchParams
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('reservations')
    .select('*, cars(name, price_per_day)')
    .order('created_at', { ascending: false })

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: reservations } = await query
  const safeReservations = reservations ?? []

  const [allCount, pendingCount] = await Promise.all([
    supabase.from('reservations').select('id', { count: 'exact', head: true }),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const tabs = [
    { label: 'Toate', value: '', count: allCount.count ?? 0 },
    { label: 'În așteptare', value: 'pending', count: pendingCount.count ?? 0 },
    { label: 'Aprobate', value: 'approved', count: null },
    { label: 'Respinse', value: 'rejected', count: null },
  ]

  return (
    <AdminShell activeSection="dashboard">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-5">Rezervări</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 border-b pb-0 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/dashboard?status=${tab.value}` : '/admin/dashboard'}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                (status ?? '') === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        <ReservationList reservations={safeReservations as Parameters<typeof ReservationList>[0]['reservations']} />
      </div>
    </AdminShell>
  )
}
