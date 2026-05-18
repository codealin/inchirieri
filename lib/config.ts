// Actualizează SITE_URL când ai domeniu propriu
export const SITE_URL = 'https://inchirieri.vercel.app'

export const BUSINESS = {
  name: 'Expert Doi Trans',
  legalName: 'EXPERT DOI TRANS',
  cui: 'RO46335357',
  phone: '+40732083657',
  phoneDisplay: '+40 732 083 657',
  whatsapp: 'https://wa.me/40732083657',
  address: 'Micești, Alba Iulia',
  fullAddress: 'Str. Pădurii, Micești, jud. Alba, România',
  schedule: 'Luni – Duminică · Non-Stop',
  city: 'Alba Iulia',
  region: 'Alba',
  country: 'RO',
  description: 'Închirieri auto în Alba Iulia. Mașini curate, verificate, prețuri transparente, plată la ridicare.',
} as const

// Statistici afișate pe pagina Despre. Editează liber.
export const TRACTARI_STATS = [
  { value: '12', label: 'Mașini' },
  { value: '4', label: 'Ani experiență' },
  { value: '52+', label: 'Clienți mulțumiți' },
  { value: '200+', label: 'Mașini tractate' },
] as const

// Imagini disponibile pentru pagina Despre tractări.
// Adaugă fișierul în /public/ și o intrare nouă aici.
export const TRACTARI_IMAGES = {
  platforma: '/platforma.png',
  tractari2: '/tractari2.png',
  tractari2Transparent: '/tractari2_transparent.png',
} as const

// Comută aici poza afișată pe /tractari/despre.
// Opțiuni: TRACTARI_IMAGES.platforma | .tractari2 | .tractari2Transparent
export const TRACTARI_DESPRE_IMAGE = TRACTARI_IMAGES.tractari2Transparent
