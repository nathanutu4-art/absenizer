-- Palet warna aplikasi (HR-configurable) — AbsensiKu
-- Jalankan di Supabase SQL Editor (project fzvphovffdhewpcjqjje).
--
-- Menyimpan trio warna Sanzo Wada (primer/sekunder/aksen) yang dipakai
-- aplikasi mobile. Admin memilih dari daftar preset di /pengaturan.

ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS theme_palette JSONB NOT NULL DEFAULT
    '{"name":"Wada No. 211 — Indigo","indigo":"#051230","apricot":"#f68c50","olive":"#a6a159"}'::jsonb;
