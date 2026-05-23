'use client'

import { useState, useTransition } from 'react'
import { updateTractariConfig, updateVehicleTypes } from '@/app/admin/actions'
import type { TractariConfig, VehicleType } from '@/lib/tractari-pricing'
import { calcBaseFee, calcTractariTotal } from '@/lib/tractari-pricing'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronRight, Star } from 'lucide-react'

interface Props {
  config: TractariConfig
  vehicleTypes: VehicleType[]
}

interface TypeEditForm {
  label: string
  local_fee: string
  per_km: string
  highlight: boolean
}

export function PretConfigForm({ config, vehicleTypes }: Props) {
  const [form, setForm] = useState(config)
  const [types, setTypes] = useState(
    [...vehicleTypes].sort((a, b) => a.position - b.position)
  )

  // Vehicle type modal state
  const [editingType, setEditingType] = useState<VehicleType | null>(null)
  const [typeForm, setTypeForm] = useState<TypeEditForm>({
    label: '',
    local_fee: '',
    per_km: '',
    highlight: false,
  })
  const [typeSaved, setTypeSaved] = useState(false)
  const [typeError, setTypeError] = useState<string | null>(null)
  const [isTypePending, startTypeTransition] = useTransition()

  // Global config state
  const [configSaved, setConfigSaved] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const [isConfigPending, startConfigTransition] = useTransition()

  function openTypeModal(t: VehicleType) {
    setEditingType(t)
    setTypeForm({
      label: t.label,
      local_fee: String(t.local_fee),
      per_km: String(t.per_km),
      highlight: t.highlight,
    })
    setTypeSaved(false)
    setTypeError(null)
  }

  function handleSaveType() {
    if (!editingType) return
    setTypeError(null)
    setTypeSaved(false)
    startTypeTransition(async () => {
      const result = await updateVehicleTypes([
        {
          id: editingType.id,
          label: typeForm.label,
          local_fee: Number(typeForm.local_fee),
          per_km: Number(typeForm.per_km),
          highlight: typeForm.highlight,
        },
      ])
      if (result?.error) {
        setTypeError(result.error)
      } else {
        setTypes((prev) =>
          prev.map((t) =>
            t.id === editingType.id
              ? {
                  ...t,
                  label: typeForm.label,
                  local_fee: Number(typeForm.local_fee),
                  per_km: Number(typeForm.per_km),
                  highlight: typeForm.highlight,
                }
              : t
          )
        )
        setTypeSaved(true)
      }
    })
  }

  function setField(field: keyof TractariConfig, value: string | number) {
    setConfigSaved(false)
    setForm((prev) => ({ ...prev, [field]: value }))
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

  return (
    <div className="space-y-10">

      {/* ── Tipuri vehicule – butoane cu modal ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tipuri vehicule</h2>
          <p className="text-sm text-muted-foreground">Apasă un tip pentru a edita prețurile.</p>
        </div>

        <div className="space-y-2">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => openTypeModal(t)}
              className="w-full text-left bg-white border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-slate-300 active:bg-slate-50 transition-colors shadow-sm"
            >
              {t.highlight && (
                <Star className="h-4 w-4 text-amber-400 shrink-0" fill="currentColor" />
              )}
              {!t.highlight && <div className="w-4 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Local: <span className="font-medium text-slate-700">{t.local_fee} RON</span>
                  {' · '}
                  Extraurban: <span className="font-medium text-slate-700">{t.per_km} RON/km</span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <hr />

      {/* ── Config globală ── */}
      <form onSubmit={handleConfigSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Configurare globală</h2>
          <p className="text-sm text-muted-foreground">Taxă de pornire și program afișat în simulator.</p>
        </div>

        {/* Taxă de pornire */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
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

        {/* Alte setări */}
        <div className="bg-white border rounded-xl p-5 space-y-4">
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

      {/* ── Modal editare tip vehicul ── */}
      <Dialog open={!!editingType} onOpenChange={(v) => { if (!v && !isTypePending) setEditingType(null) }}>
        <DialogContent className="max-w-sm w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Editează tip vehicul</DialogTitle>
          </DialogHeader>

          {editingType && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nume tip</Label>
                <Input
                  value={typeForm.label}
                  onChange={(e) => setTypeForm((p) => ({ ...p, label: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Preț local (RON)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    value={typeForm.local_fee}
                    onChange={(e) => setTypeForm((p) => ({ ...p, local_fee: e.target.value }))}
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
                    value={typeForm.per_km}
                    onChange={(e) => setTypeForm((p) => ({ ...p, per_km: e.target.value }))}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">RON/km</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={typeForm.highlight}
                  onChange={(e) => setTypeForm((p) => ({ ...p, highlight: e.target.checked }))}
                  className="rounded h-4 w-4"
                />
                <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
                Cel mai solicitat
              </label>

              {typeError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{typeError}</p>
              )}
              {typeSaved && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  ✓ Salvat cu succes.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingType(null)}
              disabled={isTypePending}
            >
              Anulează
            </Button>
            <Button onClick={handleSaveType} disabled={isTypePending}>
              {isTypePending ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
