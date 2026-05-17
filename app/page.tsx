import Link from 'next/link'
import { Phone, CheckCircle2, Star, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { CarCard } from '@/components/CarCard'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Car } from '@/types/database'

async function getCars(): Promise<Car[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const cars = await getCars()

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-400 font-medium mb-3 tracking-wide uppercase text-sm">
            Alba Iulia · Micești
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Închiriază o mașină
            <br />
            <span className="text-blue-400">fără bătăi de cap</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Mașini curate, verificate și pregătite. Prețuri transparente, fără surprize.
            Rezervare simplă, plată la ridicare.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#masini">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Vezi mașinile disponibile
              </Button>
            </a>
            <a href="tel:+40732083657">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                +40 732 083 657
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      <section className="border-b bg-blue-50 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-4 justify-center text-sm font-medium text-blue-900">
          {[
            'Inspecție tehnică inclusă',
            'Prețuri transparente',
            'Plată la ridicare',
            'Asistență pe parcursul închirierii',
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              {benefit}
            </div>
          ))}
        </div>
      </section>

      {/* Cars listing */}
      <section id="masini" className="py-16 px-4 flex-1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Flota noastră</h2>
          <p className="text-muted-foreground mb-10">
            Alege mașina potrivită pentru tine și selectează intervalul de timp.
          </p>

          {cars.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">Nu există mașini disponibile momentan.</p>
              <p className="mt-2">
                Sunați la{' '}
                <a href="tel:+40732083657" className="text-primary font-medium">
                  +40 732 083 657
                </a>{' '}
                pentru mai multe informații.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Ce spun clienții noștri</h2>
          <p className="text-muted-foreground text-center mb-10">
            Experiențe reale de la persoane care au ales Expert Doi Trans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Alexandru M.',
                location: 'Alba Iulia',
                text: 'Mașina era curată, bine întreținută și gata la ora stabilită. Prețul afișat a fost exact prețul plătit. O să revin cu siguranță.',
              },
              {
                name: 'Maria D.',
                location: 'Cluj-Napoca',
                text: 'Am închiriat Skoda Octavia pentru o săptămână. Proces simplu, fără birocrație. Oameni serioși și de încredere.',
              },
              {
                name: 'Bogdan T.',
                location: 'Sibiu',
                text: 'Cel mai simplu proces de închiriere auto pe care l-am întâlnit. Rezervare online, ridicare rapidă, fără surprize la final.',
              },
            ].map((review) => (
              <div key={review.name} className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{review.name}</p>
                  <p className="text-muted-foreground text-xs">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Map */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Unde ne găsești</h2>
          <p className="text-muted-foreground mb-8">
            Ridicarea și returnarea mașinii se face din Alba Iulia, Micești.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-5">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Adresă</p>
                  <p className="text-muted-foreground text-sm">Alba Iulia, Micești</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Telefon</p>
                  <a
                    href="tel:+40732083657"
                    className="text-sm text-primary hover:underline"
                  >
                    +40 732 083 657
                  </a>
                </div>
              </div>
              <a
                href="https://maps.app.goo.gl/cY2PnrWXhNDqAvJXA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Obține direcții
              </a>
            </div>
            <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-sm h-64 lg:h-80">
              <iframe
                src="https://www.google.com/maps?q=Expert+Doi+Trans+Micești+Alba+Iulia&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locație Expert Doi Trans"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-white font-semibold text-lg mb-1">Expert Doi Trans</p>
            <p>Alba Iulia, Micești</p>
            <a
              href="tel:+40732083657"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              +40 732 083 657
            </a>
          </div>
          <div className="text-sm">
            <p>© {new Date().getFullYear()} Expert Doi Trans. Toate drepturile rezervate.</p>
            <Link href="/admin/login" className="text-slate-600 hover:text-slate-400 text-xs mt-1 block">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}
