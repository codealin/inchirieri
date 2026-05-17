'use client'

import { useState, useTransition } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { CalendarDays, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { calculateTotalDays, calculateTotalPrice, formatCurrency } from '@/lib/pricing'
import { submitReservation } from '@/app/masini/[id]/actions'
import type { Car } from '@/types/database'

interface BookingFormProps {
  car: Car
  bookedRanges: { start_date: string; end_date: string }[]
}

export function BookingForm({ car, bookedRanges }: BookingFormProps) {
  const [range, setRange] = useState<DateRange | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Parse date string as local time (not UTC) to avoid timezone shift
  function localDate(str: string): Date {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const disabledDays = [
    { before: today },
    ...bookedRanges.map((r) => ({
      from: localDate(r.start_date),
      to: localDate(r.end_date),
    })),
  ]

  const totalDays =
    range?.from && range?.to ? calculateTotalDays(range.from, range.to) : 0
  const totalPrice =
    range?.from && range?.to
      ? calculateTotalPrice(range.from, range.to, car.price_per_day)
      : 0

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!range?.from || !range?.to) {
      setError('Selectează perioada de închiriere.')
      return
    }

    const form = e.currentTarget
    const data = {
      carId: car.id,
      startDate: format(range.from, 'yyyy-MM-dd'),
      endDate: format(range.to, 'yyyy-MM-dd'),
      pricePerDay: car.price_per_day,
      customerName: (form.elements.namedItem('customerName') as HTMLInputElement).value,
      customerPhone: (form.elements.namedItem('customerPhone') as HTMLInputElement).value,
      customerEmail: (form.elements.namedItem('customerEmail') as HTMLInputElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
    }

    startTransition(async () => {
      const result = await submitReservation(data)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Alege perioada
        </h3>
        <div className="border rounded-lg overflow-auto">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={disabledDays}
            numberOfMonths={1}
            locale={ro}
            className="p-3"
          />
        </div>
        {range?.from && range?.to && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
            <div className="flex justify-between text-blue-900">
              <span>
                {format(range.from, 'd MMM yyyy', { locale: ro })} →{' '}
                {format(range.to, 'd MMM yyyy', { locale: ro })}
              </span>
              <span className="font-medium">{totalDays} {totalDays === 1 ? 'zi' : 'zile'}</span>
            </div>
            <div className="flex justify-between font-bold text-blue-900 mt-1 text-base">
              <span>Total estimat</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <p className="text-blue-700 text-xs mt-1">
              Prețul final se confirmă la ridicarea mașinii.
            </p>
          </div>
        )}
      </div>

      {/* Customer form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nume complet *</Label>
            <Input
              id="customerName"
              name="customerName"
              placeholder="Ion Popescu"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerPhone">Telefon *</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              placeholder="+40 7XX XXX XXX"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerEmail">Email (opțional)</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              placeholder="ion@exemplu.ro"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Mențiuni (opțional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Orice informații utile..."
              rows={2}
              disabled={isPending}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isPending || !range?.from || !range?.to}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Se trimite...
            </>
          ) : (
            'Trimite cererea de rezervare'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Rezervarea va fi confirmată telefonic. Nu se percepe avans la trimiterea cererii.
        </p>
      </form>
    </div>
  )
}
