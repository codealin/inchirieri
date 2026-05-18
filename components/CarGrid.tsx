'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { CarCard } from '@/components/CarCard'
import type { Car } from '@/types/database'

type TransmissionFilter = 'manuala' | 'automata'
type FuelFilter = 'diesel' | 'electric' | 'benzina'

const TRANSMISSION_OPTIONS: { value: TransmissionFilter; label: string }[] = [
  { value: 'manuala', label: 'Manuală' },
  { value: 'automata', label: 'Automată' },
]

const FUEL_OPTIONS: { value: FuelFilter; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'benzina', label: 'Benzină' },
]

function normalize(s: string | null | undefined) {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function matchTransmission(car: Car, sel: TransmissionFilter[]) {
  if (sel.length === 0) return true
  const trans = normalize(car.transmission)
  return sel.some((v) => {
    if (v === 'manuala') return trans.includes('manual')
    if (v === 'automata') return trans.includes('automat')
    return false
  })
}

function matchFuel(car: Car, sel: FuelFilter[]) {
  if (sel.length === 0) return true
  const fuel = normalize(car.fuel_type)
  return sel.some((v) => {
    if (v === 'diesel') return fuel.includes('diesel')
    if (v === 'electric') return fuel.includes('electric')
    if (v === 'benzina') return fuel.includes('benzin') || fuel.includes('petrol')
    return false
  })
}

interface CarGridProps {
  cars: Car[]
  title?: string
  subtitle?: string
}

export function CarGrid({ cars, title, subtitle }: CarGridProps) {
  const [transmissions, setTransmissions] = useState<TransmissionFilter[]>([])
  const [fuels, setFuels] = useState<FuelFilter[]>([])

  const filtered = useMemo(
    () => cars.filter((c) => matchTransmission(c, transmissions) && matchFuel(c, fuels)),
    [cars, transmissions, fuels]
  )

  const hasFilters = transmissions.length > 0 || fuels.length > 0

  return (
    <>
      {/* Header row cu titlu + filtre inline */}
      <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
        <div className="min-w-0">
          {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <MultiSelectDropdown
            label="Cutie"
            options={TRANSMISSION_OPTIONS}
            selected={transmissions}
            onChange={setTransmissions}
          />
          <MultiSelectDropdown
            label="Combustibil"
            options={FUEL_OPTIONS}
            selected={fuels}
            onChange={setFuels}
          />
        </div>
      </div>

      {hasFilters && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length === 0
            ? 'Nicio mașină nu corespunde filtrelor.'
            : `${filtered.length} ${filtered.length === 1 ? 'mașină găsită' : 'mașini găsite'}`}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <p className="text-lg text-muted-foreground mb-2">
            Nu există mașini disponibile cu aceste criterii.
          </p>
          <button
            onClick={() => {
              setTransmissions([])
              setFuels([])
            }}
            className="text-primary font-semibold hover:underline"
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

interface MultiSelectProps<T extends string> {
  label: string
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (next: T[]) => void
}

function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function toggle(value: T) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const displayText =
    selected.length === 0
      ? 'Toate'
      : selected
          .map((s) => options.find((o) => o.value === s)?.label)
          .filter(Boolean)
          .join(', ')

  const isFiltered = selected.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
          isFiltered
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
        }`}
      >
        <span>
          {label}: <span className="font-medium opacity-90">{displayText}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[180px] bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b ${
              selected.length === 0 ? 'font-semibold text-primary' : 'text-slate-700'
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {selected.length === 0 && <Check className="h-4 w-4" />}
            </span>
            Toate
          </button>
          {options.map((opt) => {
            const checked = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${
                  checked ? 'font-semibold text-primary' : 'text-slate-700'
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {checked && <Check className="h-4 w-4" />}
                </span>
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
