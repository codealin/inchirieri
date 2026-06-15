import type { Metadata } from 'next'
import { Phone } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { PriceSimulator } from '@/components/PriceSimulator'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  DEFAULT_TRACTARI_CONFIG,
  DEFAULT_VEHICLE_TYPES,
  type TractariConfig,
  type VehicleType,
} from '@/lib/tractari-pricing'
import { SITE_URL, BUSINESS } from '@/lib/config'

const TRACTARI_TITLE = 'Tractări Auto Alba Iulia | Expert Doi Trans'
const TRACTARI_DESC =
  'Tractări auto rapide în Alba Iulia și împrejurimi. Autoturisme, mașini avariate, autoutilitare. Prețuri transparente, tarif per km.'

export const metadata: Metadata = {
  title: 'Tractări Auto Alba Iulia',
  description: TRACTARI_DESC,
  alternates: { canonical: `${SITE_URL}/tractari` },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: BUSINESS.name,
    title: TRACTARI_TITLE,
    description: TRACTARI_DESC,
    url: `${SITE_URL}/tractari`,
  },
  twitter: {
    card: 'summary_large_image',
    title: TRACTARI_TITLE,
    description: TRACTARI_DESC,
  },
  keywords: [
    'tractari auto Alba Iulia',
    'tractari Alba Iulia',
    'asistenta rutiera Alba Iulia',
    'tractari masini avariate',
    'tractari autoutilitare',
    'platforma auto Alba Iulia',
    'Expert Doi Trans',
  ],
}

async function getPageData(): Promise<{ config: TractariConfig; vehicleTypes: VehicleType[] }> {
  try {
    const supabase = createSupabaseAdminClient()
    const [{ data: configData }, { data: typesData }] = await Promise.all([
      supabase.from('tractari_config').select('*').eq('id', 1).single(),
      supabase.from('tractari_vehicle_types').select('*').order('position'),
    ])

    const config: TractariConfig = configData
      ? {
          price_per_km: Number(configData.price_per_km),
          local_fee: Number(configData.local_fee),
          base_fee: Number(configData.base_fee),
          base_fee_min_km: configData.base_fee_min_km,
          long_distance_km: configData.long_distance_km,
          schedule_label: configData.schedule_label,
        }
      : DEFAULT_TRACTARI_CONFIG

    const vehicleTypes: VehicleType[] = (typesData ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      local_fee: Number(t.local_fee),
      per_km: Number(t.per_km),
      highlight: t.highlight,
      position: t.position,
    }))

    return { config, vehicleTypes: vehicleTypes.length ? vehicleTypes : DEFAULT_VEHICLE_TYPES }
  } catch {
    return { config: DEFAULT_TRACTARI_CONFIG, vehicleTypes: DEFAULT_VEHICLE_TYPES }
  }
}

export default async function TractariPage() {
  const { config, vehicleTypes } = await getPageData()
  const sorted = [...vehicleTypes].sort((a, b) => a.position - b.position)

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
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#16a34a' }} />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10" style={{ backgroundColor: '#16a34a' }} />

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
              href="tel:+40721999922"
              style={{ backgroundColor: '#16a34a', color: '#fff' }}
              className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-lg transition-colors hover:opacity-90"
            >
              <Phone className="h-5 w-5" />
              Sună acum — +40 721 999 922
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

      {/* Tarife per tip vehicul */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Tarife tractări</h2>
          <p className="text-muted-foreground text-center mb-10">
            Prețuri valabile în zona Alba Iulia. Sună pentru detalii și disponibilitate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {sorted.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-xl border-2 p-6 shadow-sm flex flex-col gap-4 ${
                  t.highlight ? 'border-green-500' : 'border-slate-200'
                }`}
              >
                {t.highlight && (
                  <span
                    className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#dcfce7', color: '#166534' }}
                  >
                    Cel mai solicitat
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg mb-3">{t.label}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Preț local (Alba Iulia)</span>
                      <span className="font-bold text-xl" style={{ color: '#16a34a' }}>
                        {t.local_fee} RON
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-500">Extraurban</span>
                      <span className="font-semibold text-slate-700">{t.per_km} lei/km</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {config.base_fee > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              * Taxă de pornire de <strong>{config.base_fee} RON</strong> pentru curse între{' '}
              {config.base_fee_min_km * 2}–{config.long_distance_km * 2} km (dus-întors).
              Prețurile sunt orientative — tariful final se confirmă telefonic.
            </p>
          )}
        </div>
      </section>

      {/* Simulator pret */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Calculează prețul</h2>
          <p className="text-muted-foreground text-center mb-10">
            Selectează tipul vehiculului și introdu distanța pentru o estimare rapidă.
          </p>
          <PriceSimulator config={config} vehicleTypes={sorted} />
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Contactează-ne</h2>
          <p className="text-muted-foreground text-center mb-10">
            Completează formularul și te sunăm noi, sau sună direct la{' '}
            <a href="tel:+40721999922" className="font-medium" style={{ color: '#16a34a' }}>
              +40 721 999 922
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
