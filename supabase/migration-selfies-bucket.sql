-- Bucket "selfies" (PRIVATE) dibuat manual via dashboard:
-- Storage → New bucket → nama "selfies" → Public OFF.
--
-- Lalu jalankan policy ini di SQL Editor agar aplikasi bisa upload foto:
CREATE POLICY "auth_upload_selfies"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'selfies');

-- Opsional (dev): bila ingin HR bisa lihat/hapus via anon key juga,
-- jalankan ini. HAPUS sebelum production.
-- CREATE POLICY "dev_all_selfies"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'selfies') WITH CHECK (bucket_id = 'selfies');
