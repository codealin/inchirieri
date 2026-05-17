export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { AdminShell } from '@/components/admin/AdminShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { formatCurrency } from '@/lib/pricing'
import {
  approveReservation,
  rejectReservation,
  deleteReservation,
} from '@/app/admin/actions'
import type { Reservation } from '@/types/database'

const STATUS_LABEL: Record<string, string> = {
  pending: 'În așteptare',
  approved: 'Aprobată',
  rejected: 'Respinsă',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
}

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

  const allCount = await supabase.from('reservations').select('id', { count: 'exact', head: true })
  const pendingCount = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  const tabs = [
    { label: 'Toate', value: '', count: allCount.count ?? 0 },
    { label: 'În așteptare', value: 'pending', count: pendingCount.count ?? 0 },
    { label: 'Aprobate', value: 'approved' },
    { label: 'Respinse', value: 'rejected' },
  ]

  return (
    <AdminShell activeSection="dashboard">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rezervări</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b pb-0">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/dashboard?status=${tab.value}` : '/admin/dashboard'}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                (status ?? '') === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {'count' in tab && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Table */}
        {safeReservations.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nu există rezervări{status ? ` cu status "${STATUS_LABEL[status]}"` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mașină</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefon</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Perioada</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Zile</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {(safeReservations as (Reservation & { cars: { name: string } | null })[]).map(
                  (r) => {
                    const start = new Date(r.start_date)
                    const end = new Date(r.end_date)
                    const days = Math.max(
                      1,
                      Math.round((end.getTime() - start.getTime()) / 86400000)
                    )

                    const approve = approveReservation.bind(null, r.id)
                    const reject = rejectReservation.bind(null, r.id)
                    const remove = deleteReservation.bind(null, r.id)

                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{r.cars?.name ?? '—'}</td>
                        <td className="px-4 py-3">{r.customer_name}</td>
                        <td className="px-4 py-3">
                          <a
                            href={`tel:${r.customer_phone}`}
                            className="text-primary hover:underline"
                          >
                            {r.customer_phone}
                          </a>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {format(start, 'd MMM', { locale: ro })} →{' '}
                          {format(end, 'd MMM yyyy', { locale: ro })}
                        </td>
                        <td className="px-4 py-3">{days}</td>
                        <td className="px-4 py-3 font-medium">
                          {r.total_price ? formatCurrency(r.total_price) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[r.status]}>
                            {STATUS_LABEL[r.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {r.status === 'pending' && (
                              <>
                                <form action={approve}>
                                  <Button type="submit" size="sm" variant="default">
                                    Aprobă
                                  </Button>
                                </form>
                                <form action={reject}>
                                  <Button type="submit" size="sm" variant="outline">
                                    Respinge
                                  </Button>
                                </form>
                              </>
                            )}
                            {r.status === 'approved' && (
                              <form action={reject}>
                                <Button type="submit" size="sm" variant="outline">
                                  Respinge
                                </Button>
                              </form>
                            )}
                            {r.status === 'rejected' && (
                              <form action={approve}>
                                <Button type="submit" size="sm" variant="outline">
                                  Aprobă
                                </Button>
                              </form>
                            )}
                            <form action={remove}>
                              <Button type="submit" size="sm" variant="destructive">
                                Șterge
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
