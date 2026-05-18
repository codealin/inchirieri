-- Rulează în Supabase SQL Editor
-- Adaugă coloana "type" la contact_requests.
-- Înregistrările existente primesc automat valoarea 'tractari'.

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'tractari';
