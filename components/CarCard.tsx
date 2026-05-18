import Link from 'next/link'
import Image from 'next/image'
import { Fuel, Settings, Gauge, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/pricing'
import type { Car } from '@/types/database'

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  const inner = (
    <Card
      className={`overflow-hidden flex flex-col h-full transition-all duration-200 ${
        car.available
          ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
          : 'opacity-75'
      }`}
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        {car.image_url ? (
          <Image
            src={car.image_url}
            alt={car.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
              <circle cx="12" cy="19" r="1" />
              <circle cx="20" cy="19" r="1" />
            </svg>
          </div>
        )}
        {!car.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">Indisponibilă</Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg mb-3">{car.name}</h3>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {car.engine && (
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 shrink-0" />
              <span>{car.engine}</span>
            </div>
          )}
          {car.transmission && (
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 shrink-0" />
              <span>{car.transmission}</span>
            </div>
          )}
          {car.fuel_type && (
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 shrink-0" />
              <span>{car.fuel_type}</span>
            </div>
          )}
        </div>
        {car.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{car.description}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 pt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{formatCurrency(car.price_per_day)}</span>
          <span className="text-muted-foreground text-sm">/ zi</span>
        </div>
        {car.available && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
            Detalii
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </CardFooter>
    </Card>
  )

  if (!car.available) return inner

  return (
    <Link href={`/masini/${car.id}`} className="block h-full">
      {inner}
    </Link>
  )
}
