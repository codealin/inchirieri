'use client'

import { useState, useMemo } from 'react'
import { CarCard } from '@/components/CarCard'
import type { Car } from '@/types/database'

type TransmissionFilter = 'all' | 'manuala' | 'automata'
type FuelFilter = 'all' | 'diesel' | 'electric' | 'benzina'

const TRANSMISSION_OPTIONS: { value: TransmissionFilter; label: string }[] = [
  { value: 'all', label: 'Toate' },
  { value: 'manuala', label: 'Manuală' },
  { value: 'automata', label: 'Automată' },
]

const FUEL_OPTIONS: { value: FuelFilter; label: string }[] = [
  { value: 'all', label: 'Toate' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'benzina', label: 'Benzină' },
]

function normalize(s: string | null | undefined) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // scoate diacritice
}

export function CarGrid({ cars }: { cars: Car[] }) {
  const [transmission, setTransmission] = useState<TransmissionFilter>('all')
  const [fuel, setFuel] = useState<FuelFilter>('all')

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      const trans = normalize(car.transmission)
      const fuelType = normalize(car.fuel_type)

      // Match transmisie
      if (transmission === 'manuala' && !trans.includes('manual')) return false
      if (transmission === 'automata' && !trans.includes('automat')) return false

      // Match combustibil
      if (fuel === 'diesel' && !fuelType.includes('diesel')) return false
      if (fuel === 'electric' && !fuelType.includes('electric')) return false
      if (fuel === 'benzina' && !(fuelType.includes('benzin') || fuelType.includes('petrol')))
        return false

      return true
    })
  }, [cars, transmission, fuel])

  return (
    <>
      {/* Filtre */}
      <div className="mb-8 space-y-4">
        <FilterGroup
          label="Cutie viteze"
          options={TRANSMISSION_OPTIONS}
          value={transmission}
          onChange={setTransmission}
        />
        <FilterGroup
          label="Combustibil"
          options={FUEL_OPTIONS}
          value={fuel}
          onChange={setFuel}
        />
        {(transmission !== 'all' || fuel !== 'all') && (
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? 'Nicio mașină nu corespunde filtrelor selectate.'
              : `${filtered.length} ${filtered.length === 1 ? 'mașină găsită' : 'mașini găsite'}`}
          </p>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <p className="text-lg text-muted-foreground mb-2">
            Nu există mașini disponibile cu aceste criterii.
          </p>
          <button
            onClick={() => {
              setTransmission('all')
              setFuel('all')
            }}
            className="text-primary font-medium hover:underline"
          >
            Resetează filtrele
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </>
  )
}

interface FilterGroupProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

function FilterGroup<T extends string>({ label, options, value, onChange }: FilterGroupProps<T>) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-slate-700 shrink-0">{label}:</span>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              value === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
