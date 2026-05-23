'use client'

import { useState } from 'react'
import { Phone, MapPin, AlertCircle, Clock } from 'lucide-react'
import {
  type TractariConfig,
  DEFAULT_TRACTARI_CONFIG,
  calcBaseFee,
  calcTractariTotal,
  isLongDistance,
} from '@/lib/tractari-pricing'

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

interface PriceSimulatorProps {
  config?: TractariConfig
}

export function PriceSimulator({ config = DEFAULT_TRACTARI_CONFIG }: PriceSimulatorProps) {
  const [km, setKm] = useState('')

  const oneWay = Math.max(0, parseInt(km) || 0)
  const isLocal = oneWay === 0
  const longDist = isLongDistance(oneWay, config)
  const total = calcTractariTotal(oneWay, config)
  const baseFee = calcBaseFee(oneWay, config)
  const roundTrip = oneWay * 2

  return (
    <div className="bg-white border-2 rounded-2xl p-6 shadow-sm" style={{ borderColor: '#16a34a' }}>
      <h3 className="text-xl font-bold mb-1">Simulator preț</h3>
      <p className="text-sm text-muted-foreground mb-1">
        Estimare orientativă — tariful final se confirmă telefonic.
      </p>
      <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5 mb-6 w-fit">
        <Clock className="h-3.5 w-3.5" />
        {config.schedule_label}
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
          onChange={(e) => setKm(e.target.value === '0' ? '' : e.target.value)}
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

      {/* Distanță manuală */}
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
          0 = tractare locală în Alba Iulia
        </p>
      </div>

      {/* Rezultat */}
      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#f0fdf4' }}>
        {isLocal ? (
          <p className="text-sm text-slate-600 mb-3">Tractare locală — tarif fix</p>
        ) : longDist ? (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-slate-600">
              Dus-întors: <span className="font-semibold">2 × {oneWay} km = {roundTrip} km</span>
            </p>
            <p className="text-sm text-slate-600">
              {config.price_per_km} RON/km × {roundTrip} km
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-slate-600">
              Dus-întors: <span className="font-semibold">2 × {oneWay} km = {roundTrip} km</span>
            </p>
            <p className="text-sm text-slate-600">
              Calcul: {baseFee > 0 ? `${baseFee} RON taxă + ` : ''}{roundTrip} km × {config.price_per_km} RON
            </p>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-green-200">
          <span className="text-sm font-medium text-slate-700">
            {longDist ? 'Estimare minimă:' : 'Estimare:'}
          </span>
          <span className="text-3xl font-bold" style={{ color: '#16a34a' }}>
            ~{longDist ? Math.round(roundTrip * config.price_per_km) : total} RON
          </span>
        </div>
      </div>

      {/* Avertisment distanță mare */}
      {longDist && (
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
              Pentru distanțe peste {config.long_distance_km} km tariful se{' '}
              <strong>negociază telefonic</strong>. Taxa de pornire nu se aplică.
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
        {longDist ? 'Sună pentru preț exact' : 'Confirmă prețul'} — +40 732 083 657
      </a>
    </div>
  )
}
