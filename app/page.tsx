import Link from 'next/link'
import { Phone, CheckCircle2 } from 'lucide-react'
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
