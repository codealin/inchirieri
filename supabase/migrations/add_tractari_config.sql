-- Rulează în Supabase SQL Editor
-- Tabel de configurare prețuri tractări (singleton, mereu un singur rând cu id=1).

CREATE TABLE IF NOT EXISTS tractari_config (
  id              int          PRIMARY KEY DEFAULT 1,
  price_per_km    numeric(6,2) NOT NULL DEFAULT 2.50,
  local_fee       numeric(6,2) NOT NULL DEFAULT 100.00,  -- tarif fix tractare locală (0 km)
  base_fee        numeric(6,2) NOT NULL DEFAULT 50.00,   -- taxă de pornire extraurban
  base_fee_min_km int          NOT NULL DEFAULT 25,      -- one-way km de la care se aplică taxa
  long_distance_km int         NOT NULL DEFAULT 100,     -- one-way km de la care nu se mai aplică taxa (negociere)
  schedule_label  text         NOT NULL DEFAULT 'Luni–Sâmbătă, 08:00–20:00',
  updated_at      timestamptz  DEFAULT now()
);

-- Inserează valorile inițiale (nu suprascrie dacă există deja)
INSERT INTO tractari_config (id, price_per_km, local_fee, base_fee, base_fee_min_km, long_distance_km, schedule_label)
VALUES (1, 2.50, 100.00, 50.00, 25, 100, 'Luni–Sâmbătă, 08:00–20:00')
ON CONFLICT (id) DO NOTHING;
