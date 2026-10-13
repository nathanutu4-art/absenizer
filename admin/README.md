# Absenizer — Panel Admin (Web)

Panel admin HR untuk aplikasi absensi Absenizer. Dibangun dengan Next.js
(App Router) + TypeScript + Supabase.

## Menjalankan lokal

```bash
cd admin
npm install
cp .env.local.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
# (dashboard Supabase → Project Settings → Data API)
npm run dev
```

Buka http://localhost:3000.

## Halaman

| Rute          | Fungsi                                                              |
| ------------- | ------------------------------------------------------------------- |
| `/`           | Dashboard: total karyawan, clock-in hari ini, pengajuan menunggu     |
| `/pengaturan` | Satu baris `company_settings`: titik kantor, geofence, jam kerja     |
| `/karyawan`   | Tabel + tambah/ubah karyawan                                         |
| `/pengajuan`  | Setujui/tolak cuti-ijin-sakit; keputusan dicatat di `approvals`      |
| `/audit`      | `audit_log` terbaru (100, baca-saja)                                 |

## Catatan penting

- **Akun login karyawan** dibuat terpisah di dashboard Supabase →
  _Authentication → Users_ (email perusahaan + kata sandi). Hubungkan ke profil
  karyawan dengan mengisi kolom `user_id` di tabel `employees` (via SQL/Table
  Editor). Panel ini hanya mengelola data profil, bukan kredensial.
- **Keputusan pengajuan** dicatat dengan `decided_by` = karyawan HR pertama
  yang ditemukan dan `taken_over_by_hr = true` (penyederhanaan MVP: panel ini
  dianggap bertindak sebagai HR). Penolakan wajib disertai catatan (aturan
  database).
- **RLS**: skema memakai policy `dev_all` yang permisif (lihat
  `../supabase/seed.sql`). TODO PRODUKSI: ganti dengan policy per peran dan
  tambahkan gerbang login di panel ini sebelum dipakai HR sungguhan.
- Keputusan approve/reject juga menulis baris ke `audit_log`.
