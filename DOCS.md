# Expert Doi Trans — Documentație Site

## Stack

| Componentă | Tehnologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Bază de date + Auth | Supabase (PostgreSQL + Auth) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Email | Resend |
| Hosting | Vercel |

---

## Variabile de mediu

Fișier: `.env.local` (nu se commitează)

```
NEXT_PUBLIC_SUPABASE_URL=        # URL proiect Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Cheie publică (RLS activ)
SUPABASE_SERVICE_ROLE_KEY=       # Cheie admin (ocolește RLS, doar server)
RESEND_API_KEY=                  # Cheie API Resend pentru emailuri
ADMIN_EMAIL=                     # Email la care ajung notificările
```

Pe Vercel: Settings → Environment Variables.

---

## Configurare business

Fișier: `lib/config.ts`

Editează aici fără să atingi codul:
- `SITE_URL` — domeniu final (actualizează după configurarea DNS)
- `BUSINESS` — nume, telefon, adresă, CUI
- `TRACTARI_STATS` — statistici afișate pe pagina Despre tractări
- `TRACTARI_DESPRE_IMAGE` — poza afișată pe pagina Despre

---

## Structura rutelor

### Public — Închirieri auto
| Rută | Descriere |
|---|---|
| `/` | Landing page + listing mașini cu filtre |
| `/masini/[id]` | Detaliu mașină + formular rezervare cu calendar |
| `/rezervare-confirmata` | Pagina de succes după trimiterea rezervării |

### Public — Tractări
| Rută | Descriere |
|---|---|
| `/tractari` | Landing page tractări + calculator preț + formular contact |
| `/tractari/despre` | Despre companie + statistici + galerie |
| `/tractari/contact` | Date contact + hartă + program |

### Admin (protejat prin autentificare)
| Rută | Descriere |
|---|---|
| `/admin/login` | Login cu email + parolă (cont Supabase Auth) |
| `/admin/dashboard` | Tabel rezervări cu filtre pe status (aprobă/respinge/șterge) |
| `/admin/masini` | CRUD mașini: adaugă, editează, poze principale + galerie |
| `/admin/contact` | Cereri contact tractări (marchează rezolvat/șterge) |

---

## Schema bază de date (Supabase)

### `cars`
| Coloană | Tip | Note |
|---|---|---|
| id | uuid | PK, auto |
| name | text | Ex: "Skoda Octavia 2020" |
| engine | text | Ex: "2.0 Diesel" |
| transmission | text | Ex: "Manuală 5+1" |
| fuel_type | text | diesel / petrol / electric |
| price_per_day | numeric | RON/zi |
| image_url | text | URL poză principală (Supabase Storage) |
| available | boolean | false = ascunsă din listing |
| description | text | Text liber |
| created_at | timestamptz | Auto |

### `car_images`
| Coloană | Tip | Note |
|---|---|---|
| id | uuid | PK |
| car_id | uuid | FK → cars.id |
| url | text | URL imagine din Storage |
| position | integer | Ordine în galerie |

### `reservations`
| Coloană | Tip | Note |
|---|---|---|
| id | uuid | PK |
| car_id | uuid | FK → cars.id |
| customer_name | text | |
| customer_phone | text | |
| customer_email | text | Opțional |
| start_date | date | Format YYYY-MM-DD |
| end_date | date | Format YYYY-MM-DD |
| total_price | numeric | Calculat server-side |
| status | text | pending / approved / rejected |
| notes | text | Mențiuni client, opțional |
| created_at | timestamptz | Auto |

### `contact_requests`
| Coloană | Tip | Note |
|---|---|---|
| id | uuid | PK |
| name | text | |
| phone | text | |
| email | text | Opțional |
| message | text | |
| resolved | boolean | Default false |
| created_at | timestamptz | Auto |

---

## Flux rezervare

1. Clientul selectează interval pe calendar (zilele deja rezervate sunt blocate)
2. Se calculează prețul în timp real (client-side, doar afișaj)
3. La submit: server action validează datele, verifică conflicte, calculează prețul din DB (nu din client)
4. Se inserează rezervarea cu status `pending`
5. Se trimit emailuri prin Resend (notificare admin, opțional confirmare client)
6. Redirect la `/rezervare-confirmata`
7. Adminul aprobă/respinge din `/admin/dashboard`

---

## Upload imagini

- Limita server action: **8MB** (`next.config.ts` → `experimental.serverActions.bodySizeLimit`)
- Bucket Supabase Storage: `cars`
- Structura path: `cars/{carId}/main-{timestamp}.{ext}` (principală) și `cars/{carId}/{timestamp}.{ext}` (galerie)
- La înlocuire imagine principală, fișierul vechi se șterge automat din Storage

---

## Emailuri (Resend)

- FROM: `onboarding@resend.dev` → de schimbat cu domeniu verificat în Resend
- Admin primește notificare la fiecare rezervare nouă și cerere de contact
- Confirmare client: comentată în `lib/email.ts` → decomentează după verificarea domeniului în Resend
- Template-uri: `lib/email.ts` — HTML inline, fără dependențe externe

---

## Autentificare admin

- Supabase Auth cu email + parolă
- Creare cont admin: Supabase Dashboard → Authentication → Users → Add user
- Protecție rute: `proxy.ts` (echivalentul `middleware.ts` în Next.js 16) verifică sesiunea la fiecare request spre `/admin/*`
- La logout: sesiunea se șterge și se face redirect la `/admin/login`

---

## SEO

- Metadata OpenGraph și Twitter pe fiecare pagină
- JSON-LD structured data (`AutoRental`) pe homepage
- Sitemap dinamic: `/sitemap.xml` — include toate mașinile disponibile + paginile tractări
- `robots.ts` — blochează indexarea rutelor `/admin/`
- Canonical URL setat din `SITE_URL`

---

## Deploy

```bash
# Local dev
npm run dev

# Build de verificare
npm run build

# Push → Vercel face deploy automat
git push
```

Vercel citește variabilele de mediu din Settings → Environment Variables. După orice modificare a env vars, e necesar un redeploy manual.

---

## Checklist post-lansare

- [ ] Actualizează `SITE_URL` în `lib/config.ts` cu domeniul final
- [ ] Actualizează `Sitemap:` URL în `app/robots.ts` (se face automat prin `SITE_URL`)
- [ ] Configurează DNS pentru domeniu pe Vercel
- [ ] Verifică domeniu în Resend → actualizează `FROM` în `lib/email.ts`
- [ ] Decomentează trimiterea emailului de confirmare client în `lib/email.ts`
- [ ] Înlocuiește testimonialele placeholder din `app/page.tsx` cu recenzii reale
- [ ] Adaugă paginile GDPR (Termeni și condiții, Politică de confidențialitate)
