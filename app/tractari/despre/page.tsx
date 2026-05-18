import type { Metadata } from 'next'
import Image from 'next/image'
import { Clock, BadgeCheck, Zap, Truck } from 'lucide-react'
import { TRACTARI_STATS } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Despre noi — Tractări Auto',
  description:
    'Servicii tractări auto profesioniste în Alba Iulia. Platforme moderne, disponibilitate 24/7, prețuri corecte.',
}

const features = [
  {
    icon: Clock,
    title: 'Disponibilitate 24/7',
    text: 'Suntem mereu pregătiți să intervenim, indiferent de oră.',
  },
  {
    icon: BadgeCheck,
    title: 'Servicii accesibile',
    text: 'Oferim prețuri corecte, fără surprize.',
  },
  {
    icon: Zap,
    title: 'Răspuns rapid',
    text: 'Intervenim prompt, în orice situație.',
  },
  {
    icon: Truck,
    title: 'Flotă modernă',
    text: 'Transportăm vehicule de până la 3T în siguranță.',
  },
]

export default function DesprePage() {
  return (
    <>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="font-medium mb-2 text-sm tracking-wide uppercase" style={{ color: '#16a34a' }}>
            Despre noi
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-10">Tractări Auto</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
              <Image
                src="/platforma.png"
                alt="Platformă tractări Expert Doi Trans"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div>
              <p className="text-slate-700 leading-relaxed mb-8">
                Alegând serviciile noastre de tractări auto, beneficiezi de intervenții rapide,
                tarife corecte și profesionalism. Dispunem de platforme moderne, adaptate pentru
                transportul vehiculelor de până la 3 tone, oferind un nivel ridicat de siguranță
                pe tot parcursul operațiunii. Indiferent dacă este vorba despre autoturisme,
                SUV-uri sau autoutilitare, echipa noastră este pregătită să intervină prompt și
                eficient, adaptându-se cerințelor tale.
              </p>

              <h2 className="text-2xl font-bold mb-5">De ce Tractări Auto Alba?</h2>
              <div className="space-y-4">
                {features.map((f) => {
                  const Icon = f.icon
                  return (
                    <div key={f.title} className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#f0fdf4' }}
                      >
                        <Icon className="h-5 w-5" style={{ color: '#16a34a' }} />
                      </div>
                      <div>
                        <p className="font-semibold mb-0.5">{f.title}</p>
                        <p className="text-sm text-muted-foreground">{f.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRACTARI_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border"
              >
                <p className="text-4xl font-bold mb-1" style={{ color: '#16a34a' }}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
