'use client'

import { useState, useTransition } from 'react'
import { updateTractariConfig } from '@/app/admin/actions'
import type { TractariConfig } from '@/lib/tractari-pricing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { calcBaseFee, calcTractariTotal } from '@/lib/tractari-pricing'

interface Props {
  config: TractariConfig
}

export function PretConfigForm({ config }: Props) {
  const [form, setForm] = useState(config)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(field: keyof TractariConfig, value: string | number) {
    setSaved(false)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await updateTractariConfig({
        price_per_km: Number(form.price_per_km),
        local_fee: Number(form.local_fee),
        base_fee: Number(form.base_fee),
        base_fee_min_km: Number(form.base_fee_min_km),
        long_distance_km: Number(form.long_distance_km),
        schedule_label: String(form.schedule_label),
      })
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  // Live preview examples
  const ex25 = calcTractariTotal(25, form)
  const ex50 = calcTractariTotal(50, form)
  const ex80 = calcTractariTotal(80, form)
  const baseFee25 = calcBaseFee(25, form)
  const baseFee50 = calcBaseFee(50, form)
  const baseFee80 = calcBaseFee(80, form)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tarif per km */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base">Tarif per kilometru</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price_per_km">Preț per km (RON)</Label>
            <div className="relative">
              <Input
                id="price_per_km"
                type="number"
                step="0.1"
                min="0"
                value={form.price_per_km}
                onChange={(e) => set('price_per_km', e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON/km</span>
            </div>
            <p className="text-xs text-muted-foreground">Aplicat la distanța dus-întors.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="local_fee">Tarif local fix (RON)</Label>
            <div className="relative">
              <Input
                id="local_fee"
                type="number"
                step="1"
                min="0"
                value={form.local_fee}
                onChange={(e) => set('local_fee', e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON</span>
            </div>
            <p className="text-xs text-muted-foreground">Tractare locală în Alba Iulia (0 km).</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="schedule_label">Etichetă program (afișată în simulator)</Label>
          <Input
            id="schedule_label"
            type="text"
            value={form.schedule_label}
            onChange={(e) => set('schedule_label', e.target.value)}
            placeholder="ex: Luni–Sâmbătă, 08:00–20:00"
          />
        </div>
      </div>

      {/* Taxă de pornire */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-base">Taxă de pornire</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Se adaugă la calculul per km, doar pentru distanțe medii.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="base_fee">Taxă pornire (RON)</Label>
            <div className="relative">
              <Input
                id="base_fee"
                type="number"
                step="1"
                min="0"
                value={form.base_fee}
                onChange={(e) => set('base_fee', e.target.value)}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="base_fee_min_km">Aplică de la (km one-way)</Label>
            <div className="relative">
              <Input
                id="base_fee_min_km"
                type="number"
                step="1"
                min="0"
                value={form.base_fee_min_km}
                onChange={(e) => set('base_fee_min_km', e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
            </div>
            <p className="text-xs text-muted-foreground">= {Number(form.base_fee_min_km) * 2} km dus-întors</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="long_distance_km">Elimină de la (km one-way)</Label>
            <div className="relative">
              <Input
                id="long_distance_km"
                type="number"
                step="1"
                min="0"
                value={form.long_distance_km}
                onChange={(e) => set('long_distance_km', e.target.value)}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
            </div>
            <p className="text-xs text-muted-foreground">Peste această distanță: negociere, fără taxă.</p>
          </div>
        </div>

        {/* Regulă vizualizată */}
        <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600">
          <span className="font-medium">Regulă activă:</span>{' '}
          taxă de <strong>{form.base_fee} RON</strong> dacă distanța one-way este între{' '}
          <strong>{form.base_fee_min_km} km</strong> și <strong>{form.long_distance_km} km</strong>{' '}
          (={form.base_fee_min_km * 2}–{form.long_distance_km * 2} km dus-întors)
        </div>
      </div>

      {/* Preview live */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h2 className="font-semibold text-base mb-4 text-blue-900">Previzualizare prețuri (cu valorile curente)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Aiud (30 km)', ow: 25, total: ex25, fee: baseFee25 },
            { label: 'Câmpeni (65 km)', ow: 50, total: ex50, fee: baseFee50 },
            { label: 'Deva (80 km)', ow: 80, total: ex80, fee: baseFee80 },
          ].map((ex) => (
            <div key={ex.label} className="bg-white rounded-lg p-3 border">
              <p className="font-medium text-slate-700 mb-1">{ex.label}</p>
              <p className="text-xs text-slate-500">
                {ex.fee > 0 ? `${ex.fee} RON taxă + ` : ''}{ex.ow * 2} km × {form.price_per_km} RON
              </p>
              <p className="text-xl font-bold text-blue-700 mt-1">~{ex.total} RON</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          ✓ Configurația a fost salvată. Pagina /tractari a fost actualizată.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto px-8">
        {isPending ? 'Se salvează...' : 'Salvează configurația'}
      </Button>
    </form>
  )
}
