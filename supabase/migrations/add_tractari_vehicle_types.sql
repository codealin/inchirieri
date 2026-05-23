-- Rulează în Supabase SQL Editor
-- Tipuri vehicule cu prețuri individuale per tip.

CREATE TABLE IF NOT EXISTS tractari_vehicle_types (
  id        serial       PRIMARY KEY,
  label     text         NOT NULL,
  local_fee numeric(6,2) NOT NULL DEFAULT 150,
  per_km    numeric(6,2) NOT NULL DEFAULT 4,
  highlight boolean      NOT NULL DEFAULT false,
  position  int          NOT NULL DEFAULT 0
);

-- Inserează datele inițiale doar dacă tabela e goală
INSERT INTO tractari_vehicle_types (label, local_fee, per_km, highlight, position)
SELECT * FROM (VALUES
  ('Autoturism',    150::numeric, 4.00::numeric, false, 0),
  ('Auto avariat',  200::numeric, 4.00::numeric, true,  1),
  ('Autoutilitară', 250::numeric, 5.00::numeric, false, 2)
) AS v(label, local_fee, per_km, highlight, position)
WHERE NOT EXISTS (SELECT 1 FROM tractari_vehicle_types);
