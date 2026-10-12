# Supabase — Absenizer

## Terapkan skema

**Opsi A — SQL Editor (paling mudah):**

1. Buka project Supabase → SQL Editor → New query.
2. Salin seluruh isi `schema.sql` → Run.
3. Ulangi bila ada perubahan (file memakai `CREATE TABLE IF NOT EXISTS`).

**Opsi B — Supabase CLI:**

```bash
supabase link --project-ref <project-ref>
supabase db push   # bila schema.sql dijadikan migrasi di supabase/migrations/
```

## Setelah skema teraplikasi

1. **Storage** — buat dua bucket **privat**:
   - `selfies` — foto selfie clock in/out.
   - `attachments` — lampiran surat dokter.
2. **Data awal** — via Table Editor:
   - `company_settings`: 1 baris — nama kantor, lat/lng titik kantor (ditentukan HR),
     radius 1000, jam mulai/selesai, 8 jam kerja, toleransi 15 menit.
   - `employees`: buat akun Auth dulu (Authentication → Users, email perusahaan),
     lalu baris employee dengan `user_id` tsb, `pic_id`, `is_hr` sesuai peran.
   - `leave_balances`: 1 baris per karyawan per tahun (cuti 12, ijin 12).
   - `work_calendar`: tandai hari libur nasional/cuti bersama (`is_working_day = false`).
3. **RLS** — tulis policy per peran sebelum dipakai produksi (lihat komentar di
   akhir `schema.sql`): karyawan↔baris miliknya, PIC↔pengajuan timnya, HR↔semua.
4. **Realtime** (opsional, Fase 3): aktifkan replication untuk `leave_requests`
   agar daftar PIC ter-update otomatis.

## Kunci yang dipakai aplikasi mobile

Hanya **anon key** (`EXPO_PUBLIC_SUPABASE_ANON_KEY`). Jangan pernah menaruh
`service_role` di aplikasi mobile.
