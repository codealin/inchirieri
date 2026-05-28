import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SITE_URL, BUSINESS } from '@/lib/config'

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Închirieri Auto Alba Iulia | ${BUSINESS.name}`,
    template: `%s | ${BUSINESS.name}`,
  },
  description: BUSINESS.description,
  keywords: [
    'închirieri auto Alba Iulia',
    'rent a car Alba Iulia',
    'inchirieri masini Alba Iulia',
    'Expert Doi Trans',
    'inchirieri auto Micesti',
    'masini de inchiriat Alba Iulia',
  ],
  authors: [{ name: BUSINESS.name }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    siteName: BUSINESS.name,
    title: `Închirieri Auto Alba Iulia | ${BUSINESS.name}`,
    description: BUSINESS.description,
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Închirieri Auto Alba Iulia | ${BUSINESS.name}`,
    description: BUSINESS.description,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ro" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Google Ads tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18194512466"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18194512466');
          `}
        </Script>
      </body>
    </html>
  )
}
