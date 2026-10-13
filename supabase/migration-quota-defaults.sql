-- Migrasi: kuota cuti/ijin default per tahun.
-- Nilai ini diatur HR lewat panel admin (halaman Pengaturan) dan dipakai
-- sebagai fallback kuota karyawan di aplikasi mobile.
--
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS cuti_quota_default INTEGER NOT NULL DEFAULT 12;
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS ijin_quota_default INTEGER NOT NULL DEFAULT 12;
