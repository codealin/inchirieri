import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Fuel, Settings, Gauge } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { BookingForm } from '@/components/BookingForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatCurrency } from '@/lib/pricing'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CarPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [carResult, reservationsResult] = await Promise.all([
    supabase.from('cars').select('*').eq('id', id).single(),
    supabase
      .from('reservations')
      .select('start_date, end_date')
      .eq('car_id', id)
      .in('status', ['pending', 'approved']),
  ])

  if (carResult.error || !carResult.data) {
    notFound()
  }

  const car = carResult.data
  const bookedRanges = reservationsResult.data ?? []

  const specs = [
    { icon: Gauge, label: 'Motor', value: car.engine },
    { icon: Settings, label: 'Transmisie', value: car.transmission },
    { icon: Fuel, label: 'Combustibil', value: car.fuel_type },
  ].filter((s) => s.value)

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la toate mașinile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: car details */}
          <div>
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-6">
              {car.image_url ? (
                <Image
                  src={car.image_url}
                  alt={car.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="80"
                    height="80"
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
            </div>

            <h1 className="text-3xl font-bold mb-2">{car.name}</h1>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold text-primary">{formatCurrency(car.price_per_day)}</span>
              <span className="text-muted-foreground">/ zi</span>
            </div>

            {specs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="border rounded-lg p-3 text-center">
                    <Icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {car.description && (
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            )}
          </div>

          {/* Right: booking form */}
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6">Rezervă această mașină</h2>
            <BookingForm car={car} bookedRanges={bookedRanges} />
          </div>
        </div>
      </main>
    </>
  )
}
