-- Migrasi: kolom foto profil karyawan.
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Bucket Storage "avatars" (publik) dibuat manual via dashboard:
-- Storage → New bucket → nama "avatars" → Public ON.
