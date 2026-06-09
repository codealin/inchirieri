-- Migration: add SEO-friendly slug column to cars table
-- Apply in Supabase SQL Editor before deploying the updated app.

create extension if not exists unaccent;

-- 1. add nullable column
alter table public.cars add column if not exists slug text;

-- 2. backfill existing rows from name, ensuring uniqueness
do $$
declare
  r record;
  base_slug text;
  candidate text;
  n int;
begin
  for r in select id, name from public.cars where slug is null or slug = '' loop
    base_slug := regexp_replace(
                   regexp_replace(
                     lower(unaccent(coalesce(r.name, ''))),
                     '[^a-z0-9]+', '-', 'g'
                   ),
                   '(^-+|-+$)', '', 'g'
                 );
    if base_slug = '' then base_slug := 'masina'; end if;

    candidate := base_slug;
    n := 2;
    while exists (select 1 from public.cars where slug = candidate) loop
      candidate := base_slug || '-' || n;
      n := n + 1;
    end loop;

    update public.cars set slug = candidate where id = r.id;
  end loop;
end $$;

-- 3. enforce constraints
alter table public.cars alter column slug set not null;
create unique index if not exists cars_slug_key on public.cars (slug);
