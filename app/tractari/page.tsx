import type { Metadata } from 'next'
import { Phone } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { PriceSimulator } from '@/components/PriceSimulator'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { DEFAULT_TRACTARI_CONFIG, type TractariConfig } from '@/lib/tractari-pricing'

export const metadata: Metadata = {
  title: 'Tractări Auto Alba Iulia',
  description:
    'Tractări auto rapide în Alba Iulia și împrejurimi. Autoturisme, mașini avariate, autoutilitare. Prețuri transparente, tarif per km.',
}

async function getTractariConfig(): Promise<TractariConfig> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data } = await supabase.from('tractari_config').select('*').eq('id', 1).single()
    if (!data) return DEFAULT_TRACTARI_CONFIG
    return {
      price_per_km: Number(data.price_per_km),
      local_fee: Number(data.local_fee),
      base_fee: Number(data.base_fee),
      base_fee_min_km: data.base_fee_min_km,
      long_distance_km: data.long_distance_km,
      schedule_label: data.schedule_label,
    }
  } catch {
    return DEFAULT_TRACTARI_CONFIG
  }
}

export default async function TractariPage() {
  const config = await getTractariConfig()

  return (
    <>
      {/* Hero */}
      <section
        className="relative py-28 px-4 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/platforma.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#14532d',
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: '#16a34a' }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10"
          style={{ backgroundColor: '#16a34a' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-green-300 font-medium mb-3 tracking-wide uppercase text-sm">
            Alba Iulia și împrejurimi · Disponibili rapid
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Tractări auto
            <br />
            <span className="text-green-300">când ai nevoie</span>
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
            Intervenție rapidă cu platforma auto. Autoturisme, mașini avariate și
            autoutilitare. Prețuri clare, fără surprize.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+40732083657"
              style={{ backgroundColor: '#16a34a', color: '#fff' }}
              className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg transition-colors hover:opacity-90"
            >
              <Phone className="h-5 w-5" />
              Sună acum — +40 732 083 657
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg border border-green-400 text-green-100 hover:bg-green-800 transition-colors"
            >
              Trimite un mesaj
            </a>
          </div>
        </div>
      </section>

      {/* Tarife */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Tarife tractări</h2>
          <p className="text-muted-foreground text-center mb-10">
            Prețuri valabile în zona Alba Iulia. Sună pentru detalii și disponibilitate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tarif local */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Tractare locală</p>
              <p className="text-3xl font-bold mb-1" style={{ color: '#16a34a' }}>
                {config.local_fee} RON
              </p>
              <p className="text-sm text-slate-500">Tarif fix, în Alba Iulia</p>
            </div>

            {/* Tarif extraurban */}
            <div className="bg-white rounded-xl border-2 border-green-500 p-6 shadow-sm">
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ backgroundColor: '#dcfce7', color: '#166534' }}
              >
                {config.schedule_label}
              </span>
              <p className="text-3xl font-bold mb-1" style={{ color: '#16a34a' }}>
                {config.price_per_km} RON<span className="text-lg font-medium text-slate-500">/km</span>
              </p>
              <p className="text-sm text-slate-500">
                Extraurban (dus-întors)
                {config.base_fee > 0 && (
                  <span className="block mt-1">
                    + taxă pornire {config.base_fee} RON (curse {config.base_fee_min_km * 2}–{config.long_distance_km * 2} km RT)
                  </span>
                )}
              </p>
            </div>

            {/* Distanță mare */}
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                Distanță mare (&gt;{config.long_distance_km} km)
              </p>
              <p className="text-3xl font-bold mb-1 text-slate-700">Negociat</p>
              <p className="text-sm text-slate-500">Fără taxă de pornire. Sună pentru preț exact.</p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            * Prețurile sunt orientative. Tariful final se stabilește în funcție de distanță și situație.
          </p>
        </div>
      </section>

      {/* Simulator pret */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Calculează prețul</h2>
          <p className="text-muted-foreground text-center mb-10">
            Introdu distanța pentru o estimare rapidă.
          </p>
          <PriceSimulator config={config} />
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Contactează-ne</h2>
          <p className="text-muted-foreground text-center mb-10">
            Completează formularul și te sunăm noi, sau sună direct la{' '}
            <a href="tel:+40732083657" className="font-medium" style={{ color: '#16a34a' }}>
              +40 732 083 657
            </a>
            .
          </p>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </>
  )
}
