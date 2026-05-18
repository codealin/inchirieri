'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'

const TARIFE = [
  { id: 'autoturism', label: 'Autoturism', base: 150, perKm: 4 },
  { id: 'avariat', label: 'Auto avariat', base: 200, perKm: 4 },
  { id: 'autoutilitara', label: 'Autoutilitară', base: 250, perKm: 5 },
] as const

type TarifId = (typeof TARIFE)[number]['id']

export function PriceSimulator() {
  const [type, setType] = useState<TarifId>('autoturism')
  const [km, setKm] = useState('')

  const tarif = TARIFE.find((t) => t.id === type)!
  const distance = Math.max(0, parseInt(km) || 0)
  const total = tarif.base + distance * tarif.perKm

  return (
    <div className="bg-white border-2 rounded-2xl p-6 shadow-sm" style={{ borderColor: '#16a34a' }}>
      <h3 className="text-xl font-bold mb-1">Simulator preț</h3>
      <p className="text-sm text-muted-foreground mb-6">Estimare orientativă — tariful final se confirmă telefonic.</p>

      {/* Tip vehicul */}
      <div className="mb-5">
        <p className="text-sm font-medium mb-2">Tip vehicul</p>
        <div className="grid grid-cols-3 gap-2">
          {TARIFE.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setType(t.id)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all"
              style={
                type === t.id
                  ? { backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff' }
                  : { borderColor: '#e2e8f0', color: '#374151', backgroundColor: '#f8fafc' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distanta */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block" htmlFor="km-input">
          Distanță estimată (km)
        </label>
        <div className="relative">
          <input
            id="km-input"
            type="number"
            min="0"
            max="500"
            placeholder="ex: 25"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="w-full border rounded-lg px-4 py-2.5 text-base focus:outline-none focus:ring-2 pr-14"
            style={{ focusRingColor: '#16a34a' } as React.CSSProperties}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            km
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Lasă 0 pentru tractare locală (în Alba Iulia)
        </p>
      </div>

      {/* Rezultat */}
      <div
        className="rounded-xl p-5 mb-5 flex items-center justify-between gap-4"
        style={{ backgroundColor: '#f0fdf4' }}
      >
        <div>
          <p className="text-sm text-slate-600 mb-0.5">
            {distance === 0 ? 'Tractare locală' : `${tarif.base} RON + ${distance} km × ${tarif.perKm} lei`}
          </p>
          <p className="text-3xl font-bold" style={{ color: '#16a34a' }}>
            ~{total} RON
          </p>
        </div>
        <div className="text-right text-xs text-slate-500 leading-relaxed">
          <p>Tarif minim: {tarif.base} RON</p>
          <p>Extraurban: {tarif.perKm} lei/km</p>
        </div>
      </div>

      <a
        href="tel:+40732083657"
        style={{ backgroundColor: '#16a34a', color: '#fff' }}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
      >
        <Phone className="h-4 w-4" />
        Confirmă prețul — +40 732 083 657
      </a>
    </div>
  )
}
