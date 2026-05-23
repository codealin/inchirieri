'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  approveReservation,
  rejectReservation,
  deleteReservation,
} from '@/app/admin/actions'
import { formatCurrency } from '@/lib/pricing'
import type { Reservation } from '@/types/database'

type ReservationWithCar = Reservation & {
  cars: { name: string; price_per_day: number } | null
}

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

interface Props {
  reservations: ReservationWithCar[]
}

function calcDays(r: ReservationWithCar) {
  const start = new Date(r.start_date)
  const end = new Date(r.end_date)
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
}

export function ReservationList({ reservations }: Props) {
  const [selected, setSelected] = useState<ReservationWithCar | null>(null)
  const [isPending, startTransition] = useTransition()

  function runAction(fn: (id: string) => Promise<void>) {
    if (!selected) return
    const id = selected.id
    startTransition(async () => {
      await fn(id)
      setSelected(null)
    })
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Nu există rezervări.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reservations.map((r) => {
          const days = calcDays(r)
          const start = new Date(r.start_date)
          const end = new Date(r.end_date)
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className="w-full text-left bg-white border rounded-xl p-4 shadow-sm hover:border-slate-300 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{r.cars?.name ?? '—'}</span>
                    <Badge variant={STATUS_VARIANT[r.status]} className="text-xs">
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700">{r.customer_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(start, 'd MMM', { locale: ro })} →{' '}
                    {format(end, 'd MMM yyyy', { locale: ro })} ·{' '}
                    {days} {days === 1 ? 'zi' : 'zile'}
                    {r.total_price ? ` · ${formatCurrency(r.total_price)}` : ''}
                  </p>
                  {r.notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1.5 truncate max-w-full">
                      ✎ {r.notes}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v && !isPending) setSelected(null) }}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Detalii rezervare</DialogTitle>
          </DialogHeader>

          {selected && (() => {
            const days = calcDays(selected)
            const start = new Date(selected.start_date)
            const end = new Date(selected.end_date)
            return (
              <div className="space-y-4">
                <div className="space-y-2.5 text-sm">
                  <Row label="Mașină" value={selected.cars?.name ?? '—'} />
                  <Row label="Client" value={selected.customer_name} />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Telefon</span>
                    <a
                      href={`tel:${selected.customer_phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {selected.customer_phone}
                    </a>
                  </div>
                  {selected.customer_email && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Email</span>
                      <a
                        href={`mailto:${selected.customer_email}`}
                        className="text-primary text-xs hover:underline truncate max-w-[180px]"
                      >
                        {selected.customer_email}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Perioadă</span>
                    <span className="font-medium text-right">
                      {format(start, 'd MMM', { locale: ro })} →{' '}
                      {format(end, 'd MMM yyyy', { locale: ro })}
                    </span>
                  </div>
                  <Row label="Zile" value={String(days)} />
                  {selected.total_price && (
                    <Row label="Total" value={formatCurrency(selected.total_price)} />
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={STATUS_VARIANT[selected.status]}>
                      {STATUS_LABEL[selected.status]}
                    </Badge>
                  </div>
                  {selected.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground text-xs mb-1">Note</p>
                      <p className="text-sm bg-amber-50 text-amber-800 rounded px-2 py-1.5">
                        {selected.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t">
                  {selected.status === 'pending' && (
                    <Button
                      onClick={() => runAction(approveReservation)}
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? 'Se procesează...' : 'Aprobă'}
                    </Button>
                  )}
                  {selected.status === 'rejected' && (
                    <Button
                      variant="outline"
                      onClick={() => runAction(approveReservation)}
                      disabled={isPending}
                      className="w-full"
                    >
                      Aprobă
                    </Button>
                  )}
                  {selected.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      onClick={() => runAction(rejectReservation)}
                      disabled={isPending}
                      className="w-full"
                    >
                      Respinge
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm(`Ștergi rezervarea pentru ${selected.customer_name}? Acțiune ireversibilă.`)) {
                        runAction(deleteReservation)
                      }
                    }}
                    className="w-full"
                  >
                    Șterge rezervarea
                  </Button>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
