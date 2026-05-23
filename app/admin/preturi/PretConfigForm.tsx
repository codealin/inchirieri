'use client'

import { useState, useTransition } from 'react'
import { updateTractariConfig, updateVehicleTypes } from '@/app/admin/actions'
import type { TractariConfig, VehicleType } from '@/lib/tractari-pricing'
import { calcBaseFee, calcTractariTotal } from '@/lib/tractari-pricing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  config: TractariConfig
  vehicleTypes: VehicleType[]
}

export function PretConfigForm({ config, vehicleTypes }: Props) {
  const [form, setForm] = useState(config)
  const [types, setTypes] = useState(
    [...vehicleTypes].sort((a, b) => a.position - b.position)
  )
  const [configSaved, setConfigSaved] = useState(false)
  const [typesSaved, setTypesSaved] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const [typesError, setTypesError] = useState<string | null>(null)
  const [isConfigPending, startConfigTransition] = useTransition()
  const [isTypesPending, startTypesTransition] = useTransition()

  function setField(field: keyof TractariConfig, value: string | number) {
    setConfigSaved(false)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function setTypeField(id: number, field: keyof VehicleType, value: string | number | boolean) {
    setTypesSaved(false)
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    )
  }

  function handleConfigSubmit(e: React.FormEvent) {
    e.preventDefault()
    setConfigError(null)
    setConfigSaved(false)
    startConfigTransition(async () => {
      const result = await updateTractariConfig({
        price_per_km: Number(form.price_per_km),
        local_fee: Number(form.local_fee),
        base_fee: Number(form.base_fee),
        base_fee_min_km: Number(form.base_fee_min_km),
        long_distance_km: Number(form.long_distance_km),
        schedule_label: String(form.schedule_label),
      })
      if (result?.error) setConfigError(result.error)
      else setConfigSaved(true)
    })
  }

  function handleTypesSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTypesError(null)
    setTypesSaved(false)
    startTypesTransition(async () => {
      const result = await updateVehicleTypes(
        types.map((t) => ({
          id: t.id,
          label: t.label,
          local_fee: Number(t.local_fee),
          per_km: Number(t.per_km),
          highlight: t.highlight,
        }))
      )
      if (result?.error) setTypesError(result.error)
      else setTypesSaved(true)
    })
  }

  return (
    <div className="space-y-10">
      {/* ── Tipuri vehicule ── */}
      <form onSubmit={handleTypesSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tipuri vehicule</h2>
            <p className="text-sm text-muted-foreground">Preț local și tarif/km pentru fiecare tip.</p>
          </div>
        </div>

        <div className="space-y-3">
          {types.map((t) => (
            <div key={t.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Input
                  value={t.label}
                  onChange={(e) => setTypeField(t.id, 'label', e.target.value)}
                  className="font-semibold max-w-[200px]"
                />
                <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.highlight}
                    onChange={(e) => setTypeField(t.id, 'highlight', e.target.checked)}
                    className="rounded"
                  />
                  Cel mai solicitat
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Preț local (RON)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={t.local_fee}
                      onChange={(e) => setTypeField(t.id, 'local_fee', e.target.value)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tarif extraurban (RON/km)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={t.per_km}
                      onChange={(e) => setTypeField(t.id, 'per_km', e.target.value)}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON/km</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {typesError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{typesError}</p>
        )}
        {typesSaved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            ✓ Tipurile de vehicule au fost salvate.
          </p>
        )}
        <Button type="submit" disabled={isTypesPending} variant="default">
          {isTypesPending ? 'Se salvează...' : 'Salvează tipuri vehicule'}
        </Button>
      </form>

      <hr />

      {/* ── Config globală (taxă pornire, program) ── */}
      <form onSubmit={handleConfigSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Configurare globală</h2>
          <p className="text-sm text-muted-foreground">Taxă de pornire și program afișat în simulator.</p>
        </div>

        {/* Taxă de pornire */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div>
            <h3 className="font-medium">Taxă de pornire</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Se adaugă la calculul per km, doar pentru distanțe medii.</p>
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
                  onChange={(e) => setField('base_fee', e.target.value)}
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
                  onChange={(e) => setField('base_fee_min_km', e.target.value)}
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
                  onChange={(e) => setField('long_distance_km', e.target.value)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
              </div>
              <p className="text-xs text-muted-foreground">Peste: negociere, fără taxă.</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm text-slate-600">
            <span className="font-medium">Regulă:</span>{' '}
            taxă de <strong>{form.base_fee} RON</strong> dacă distanța one-way este între{' '}
            <strong>{form.base_fee_min_km}–{form.long_distance_km} km</strong>{' '}
            (={Number(form.base_fee_min_km) * 2}–{Number(form.long_distance_km) * 2} km dus-întors)
          </div>
        </div>

        {/* Program + fallback per km */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-medium">Alte setări</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="schedule_label">Etichetă program (simulator)</Label>
              <Input
                id="schedule_label"
                value={form.schedule_label}
                onChange={(e) => setField('schedule_label', e.target.value)}
                placeholder="Luni–Sâmbătă, 08:00–20:00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local_fee">Tarif local fallback (RON)</Label>
              <div className="relative">
                <Input
                  id="local_fee"
                  type="number"
                  step="1"
                  min="0"
                  value={form.local_fee}
                  onChange={(e) => setField('local_fee', e.target.value)}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON</span>
              </div>
              <p className="text-xs text-muted-foreground">Folosit dacă tipurile vehicule nu sunt disponibile.</p>
            </div>
          </div>
        </div>

        {/* Preview live */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-medium text-blue-900 mb-3">Previzualizare (Aiud 30 km · Sibiu 70 km · Deva 80 km)</h3>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-left text-blue-700">
                  <th className="pb-2 pr-4 font-medium">Tip vehicul</th>
                  <th className="pb-2 pr-4 font-medium">Aiud (30 km)</th>
                  <th className="pb-2 pr-4 font-medium">Sibiu (70 km)</th>
                  <th className="pb-2 font-medium">Deva (80 km)</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-t border-blue-100">
                    <td className="py-2 pr-4 font-medium text-slate-700">{t.label}</td>
                    {[30, 70, 80].map((ow) => (
                      <td key={ow} className="py-2 pr-4 font-bold text-blue-700">
                        ~{calcTractariTotal(ow, form, { ...t, per_km: Number(t.per_km), local_fee: Number(t.local_fee) })} RON
                        {calcBaseFee(ow, form) > 0 && (
                          <span className="text-xs font-normal text-blue-500 block">incl. taxă {calcBaseFee(ow, form)} RON</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {configError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{configError}</p>
        )}
        {configSaved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            ✓ Configurația globală a fost salvată. Pagina /tractari a fost actualizată.
          </p>
        )}
        <Button type="submit" disabled={isConfigPending} variant="default">
          {isConfigPending ? 'Se salvează...' : 'Salvează configurația globală'}
        </Button>
      </form>
    </div>
  )
}
