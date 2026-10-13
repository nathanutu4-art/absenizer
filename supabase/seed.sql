-- ---------------------------------------------------------------------------
-- Seed awal Absenizer (development)
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
-- ---------------------------------------------------------------------------

-- 1) Kebijakan RLS sementara untuk DEVELOPMENT.
--    Mengizinkan semua operasi lewat API key (anon).
--    TODO PRODUKSI: ganti dengan policy per peran (karyawan hanya datanya
--    sendiri, HR semua) mengikuti contoh komentar di schema.sql.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'employees','company_settings','face_references','attendance',
    'attendance_flags','leave_balances','leave_requests','approvals',
    'reminder_log','data_deletion_approvals','work_calendar','audit_log'
  ] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "dev_all" ON %I; CREATE POLICY "dev_all" ON %I FOR ALL USING (true) WITH CHECK (true);',
      t, t
    );
  END LOOP;
END $$;

-- 2) Pengaturan perusahaan awal (1 baris).
--    Titik kantor: pusat Kota Kendari (perkiraan) — HR bisa ubah via admin panel.
INSERT INTO company_settings
  (office_name, office_lat, office_lng, geofence_radius_m,
   work_start, work_end, work_hours_per_day, late_tolerance_min, is_active)
VALUES
  ('Kantor Pusat — Kendari', -3.9984, 122.5187, 1000,
   '08:00', '17:00', 8, 15, true)
ON CONFLICT DO NOTHING;
