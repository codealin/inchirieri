'use client'

import { useState } from 'react'
import { Phone, MapPin, AlertCircle } from 'lucide-react'

const TARIFE = [
  { id: 'autoturism', label: 'Autoturism', base: 150, perKm: 4 },
  { id: 'avariat', label: 'Auto avariat', base: 200, perKm: 4 },
  { id: 'autoutilitara', label: 'Autoutilitară', base: 250, perKm: 5 },
] as const

type TarifId = (typeof TARIFE)[number]['id']

// Distanțe orientative de la Alba Iulia (one-way)
const DESTINATIONS = [
  { label: 'Local (Alba Iulia)', km: 0 },
  { label: 'Sebeș', km: 14 },
  { label: 'Teiuș', km: 17 },
  { label: 'Aiud', km: 30 },
  { label: 'Blaj', km: 38 },
  { label: 'Câmpeni', km: 65 },
  { label: 'Sibiu', km: 70 },
  { label: 'Brad', km: 75 },
  { label: 'Deva', km: 80 },
  { label: 'Hunedoara', km: 80 },
  { label: 'Mediaș', km: 85 },
  { label: 'Cluj-Napoca', km: 100 },
  { label: 'Târgu Mureș', km: 110 },
  { label: 'Petroșani', km: 120 },
] as const

const LONG_DISTANCE_THRESHOLD = 100 // km one-way

export function PriceSimulator() {
  const [type, setType] = useState<TarifId>('autoturism')
  const [km, setKm] = useState('')

  const tarif = TARIFE.find((t) => t.id === type)!
  const oneWay = Math.max(0, parseInt(km) || 0)
  const roundTrip = oneWay * 2
  const total = tarif.base + roundTrip * tarif.perKm
  const isLongDistance = oneWay > LONG_DISTANCE_THRESHOLD

  function selectDestination(destKm: number) {
    setKm(destKm > 0 ? String(destKm) : '')
  }

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

      {/* Destinație populară */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block" htmlFor="destination-select">
          <MapPin className="h-4 w-4 inline mr-1" style={{ color: '#16a34a' }} />
          Destinație populară (opțional)
        </label>
        <select
          id="destination-select"
          value={km}
          onChange={(e) => selectDestination(parseInt(e.target.value) || 0)}
          className="w-full border rounded-lg px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2"
          style={{ borderColor: '#cbd5e1' }}
        >
          <option value="">— Alege o destinație —</option>
          {DESTINATIONS.map((d) => (
            <option key={d.label} value={d.km}>
              {d.label} {d.km > 0 ? `(${d.km} km)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Distanta manuala */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block" htmlFor="km-input">
          Distanță one-way (km)
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
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            km
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Sau introdu manual distanța. 0 = tractare locală în Alba Iulia.
        </p>
      </div>

      {/* Rezultat */}
      <div
        className="rounded-xl p-5 mb-5"
        style={{ backgroundColor: '#f0fdf4' }}
      >
        {oneWay > 0 ? (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-slate-600">
              Dus-întors: <span className="font-semibold">2 × {oneWay} km = {roundTrip} km</span>
            </p>
            <p className="text-sm text-slate-600">
              Calcul: {tarif.base} RON + {roundTrip} km × {tarif.perKm} lei
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 mb-2">Tractare locală — tarif fix</p>
        )}

        <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-green-200">
          <span className="text-sm font-medium text-slate-700">Estimare:</span>
          <span className="text-3xl font-bold" style={{ color: '#16a34a' }}>
            ~{total} RON
          </span>
        </div>
      </div>

      {/* Avertisment distanta mare */}
      {isLongDistance && (
        <div
          className="rounded-xl p-4 mb-5 flex gap-3"
          style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <div className="text-sm">
            <p className="font-semibold mb-1" style={{ color: '#92400e' }}>
              Distanță mare ({oneWay} km)
            </p>
            <p style={{ color: '#92400e' }}>
              Pentru distanțe peste {LONG_DISTANCE_THRESHOLD} km prețul este orientativ și se{' '}
              <strong>negociază telefonic</strong>. Sună-ne pentru un tarif personalizat.
            </p>
          </div>
        </div>
      )}

      <a
        href="tel:+40732083657"
        style={{ backgroundColor: '#16a34a', color: '#fff' }}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
      >
        <Phone className="h-4 w-4" />
        {isLongDistance ? 'Sună pentru preț exact' : 'Confirmă prețul'} — +40 732 083 657
      </a>
    </div>
  )
}
