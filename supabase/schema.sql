-- ============================================================
-- Schema pentru aplicatia de inchirieri auto
-- Ruleaza in Supabase SQL Editor
-- ============================================================

-- Tabela masini
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  engine text,
  transmission text,
  fuel_type text,
  price_per_day numeric(10, 2) not null,
  image_url text,
  available boolean not null default true,
  description text,
  created_at timestamptz not null default now()
);

-- Tabela rezervari
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  start_date date not null,
  end_date date not null,
  total_price numeric(10, 2),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

-- Index pentru cautare rapida a rezervarilor pe masina
create index if not exists reservations_car_id_idx on public.reservations(car_id);
create index if not exists reservations_dates_idx on public.reservations(start_date, end_date);
create index if not exists reservations_status_idx on public.reservations(status);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.cars enable row level security;
alter table public.reservations enable row level security;

-- Oricine poate citi masinile disponibile
create policy "cars_public_read" on public.cars
  for select using (true);

-- Oricine poate crea o rezervare
create policy "reservations_public_insert" on public.reservations
  for insert with check (true);

-- ============================================================
-- Date initiale (seed) - modifica dupa nevoie
-- ============================================================
insert into public.cars (name, engine, transmission, fuel_type, price_per_day, available) values
  ('Skoda Octavia 2020', '2.0 Diesel', 'Manuala 5+1', 'Diesel', 120, true),
  ('Seat Leon 2017', '1.6 Diesel', 'Manuala 5+1', 'Diesel', 100, true),
  ('Skoda Fabia 2019', '1.4 TDI Diesel', 'Manuala 5+1', 'Diesel', 85, true),
  ('MG4 Electric 2026', 'Electric', 'Automata', 'Electric', 150, true)
on conflict do nothing;
