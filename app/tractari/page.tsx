import type { Metadata } from 'next'
import { Phone, Truck, AlertTriangle, Package } from 'lucide-react'
import { ContactForm } from '@/components/ContactForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { PriceSimulator } from '@/components/PriceSimulator'

export const metadata: Metadata = {
  title: 'Tractări Auto Alba Iulia',
  description:
    'Tractări auto rapide în Alba Iulia și împrejurimi. Autoturisme, mașini avariate, autoutilitare. Prețuri de la 150 RON local, 4 lei/km extraurban.',
}

const tarife = [
  {
    icon: Truck,
    label: 'Tractări Autoturisme',
    local: '150 RON',
    extraurban: '4 lei/km',
  },
  {
    icon: AlertTriangle,
    label: 'Tractări Auto Avariate',
    local: '200 RON',
    extraurban: '4 lei/km',
    highlight: true,
  },
  {
    icon: Package,
    label: 'Tractări Autoutilitare',
    local: '250 RON',
    extraurban: '5 lei/km',
  },
]

export default function TractariPage() {
  return (
    <>
      {/* Hero */}
      {/* Overlay verde: "linear-gradient(rgba(20,83,45,0.88), rgba(20,83,45,0.88)), " in fata url-ului */}
      <section
        className="relative py-28 px-4 text-white overflow-hidden"
        style={{
          backgroundImage: "url('/platforma.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#14532d',
        }}
      >
        {/* decorative circles — vizibile doar fara poza */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tarife.map((t) => {
              const Icon = t.icon
              return (
                <div
                  key={t.label}
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
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#f0fdf4' }}
                  >
                    <Icon className="h-6 w-6" style={{ color: '#16a34a' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-3">{t.label}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500">Preț local (Alba Iulia)</span>
                        <span className="font-bold text-xl" style={{ color: '#16a34a' }}>
                          {t.local}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-500">Extraurban</span>
                        <span className="font-semibold text-slate-700">{t.extraurban}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            * Prețurile sunt orientative. Tariful final se stabilește în funcție de distanță și
            situație. Sună pentru un preț exact.
          </p>
        </div>
      </section>

      {/* Simulator pret */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">Calculează prețul</h2>
          <p className="text-muted-foreground text-center mb-10">
            Introdu distanța și tipul vehiculului pentru o estimare rapidă.
          </p>
          <PriceSimulator />
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
