export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Fuel, Settings, Gauge } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { BookingForm } from '@/components/BookingForm'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { CarImageGallery } from '@/components/CarImageGallery'
import { formatCurrency } from '@/lib/pricing'
import { SITE_URL, BUSINESS } from '@/lib/config'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()

  let carSlug = slug
  if (UUID_RE.test(slug)) {
    const { data } = await supabase.from('cars').select('slug').eq('id', slug).single()
    if (!data) return {}
    carSlug = data.slug
  }

  const { data: car } = await supabase
    .from('cars')
    .select('name, description, price_per_day, image_url')
    .eq('slug', carSlug)
    .single()
  if (!car) return {}

  const title = `${car.name} — Închirieri Auto Alba Iulia`
  const description =
    car.description ??
    `Închiriază ${car.name} în Alba Iulia. ${car.price_per_day} RON/zi, prețuri transparente, plată la ridicare.`
  const url = `${SITE_URL}/masini/${carSlug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: BUSINESS.name,
      ...(car.image_url ? { images: [{ url: car.image_url, alt: car.name }] } : {}),
    },
  }
}

export default async function CarPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()

  // Redirect old UUID-based URLs to canonical slug URL (308 Permanent)
  if (UUID_RE.test(slug)) {
    const { data } = await supabase.from('cars').select('slug').eq('id', slug).single()
    if (!data) notFound()
    permanentRedirect(`/masini/${data.slug}`)
  }

  const { data: car, error: carError } = await supabase
    .from('cars')
    .select('*')
    .eq('slug', slug)
    .single()

  if (carError || !car) notFound()

  const [reservationsResult, imagesResult] = await Promise.all([
    supabase
      .from('reservations')
      .select('start_date, end_date')
      .eq('car_id', car.id)
      .in('status', ['pending', 'approved']),
    supabase
      .from('car_images')
      .select('url')
      .eq('car_id', car.id)
      .order('position', { ascending: true }),
  ])

  const bookedRanges = reservationsResult.data ?? []
  const additionalImages = (imagesResult.data ?? []).map((r) => r.url)
  const allImages = [car.image_url, ...additionalImages].filter(Boolean) as string[]

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
          href="/inchirieri"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la toate mașinile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: car details */}
          <div>
            <CarImageGallery images={allImages} carName={car.name} />

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
