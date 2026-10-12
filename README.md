# Absenizer

Aplikasi mobile absensi karyawan: clock in/out dengan **selfie + lokasi GPS**,
plus pengajuan **cuti tahunan, ijin, dan sakit** dengan alur approval.
Bahasa aplikasi: **Bahasa Indonesia saja**.

## Tech stack

| Lapisan | Teknologi |
|---|---|
| Mobile | Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript (strict) |
| Navigasi | Expo Router (tabs + stack) |
| Kamera / lokasi / notifikasi | expo-camera, expo-location, expo-notifications |
| Penyimpanan aman | expo-secure-store (sesi), expo-sqlite (antrean offline) |
| Peta | react-native-maps |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Verifikasi wajah | CompreFace / DeepFace **self-hosted** via Docker di VPS (gratis, data biometrik tidak keluar ke cloud pihak ketiga) |
| Liveness MVP | Tantangan kedip on-device (ML Kit face detection), gratis |

## Struktur repo

```
absenizer/
  README.md            <- file ini
  mobile/              <- aplikasi Expo (Android & iOS, satu basis kode)
    app/               <- rute Expo Router (lihat bawah)
    src/
      theme.ts         <- palet Sanzo Wada Combination No. 218 + skala UI
      lib/
        businessRules.ts  <- SEMUA aturan bisnis PRD sebagai konstanta
        supabase.ts       <- klien Supabase (dari env)
        geo.ts            <- jarak haversine untuk geofence
        mockLocation.ts   <- deteksi fake GPS (flag, bukan blokir — BR-09)
        offlineQueue.ts   <- antrean SQLite untuk clock in/out offline
      components/      <- primitif UI (ThemedButton, Avatar, StatusChip, ...)
  supabase/
    schema.sql         <- tabel Postgres + RLS (terapkan via SQL editor / db push)
  docker/
    docker-compose.yml <- CompreFace self-hosted untuk verifikasi wajah
```

Rute aplikasi (`mobile/app`):

- `index.tsx` — Opening/onboarding → `login.tsx` — login email perusahaan
- `(tabs)/home.tsx` — Beranda (status hari ini, tombol Clock In/Out)
- `(tabs)/history.tsx` — Riwayat kehadiran
- `(tabs)/team.tsx` — Info karyawan (sedang cuti/ijin/sakit, ulang tahun, direktori)
- `(tabs)/requests.tsx` — Pengajuan saya + sisa kuota
- `(tabs)/profile.tsx` — Profil karyawan + info PIC
- `clock-in/selfie.tsx` → `liveness.tsx` → `confirm.tsx` → `success.tsx`
- `leave/new.tsx` — form pengajuan cuti/ijin/sakit; `leave/quota.tsx` — sisa kuota
- `pic/approvals.tsx`, `pic/detail.tsx` — persetujuan PIC
- `hr/takeover.tsx` — pengambilalihan approval oleh HR

## Aturan bisnis PRD (ringkasan — lihat `mobile/src/lib/businessRules.ts`)

- **Geofence**: radius **1000 m** dari **1 titik kantor** (ditentukan HR). Hanya untuk **WFO**;
  karyawan **WFH bebas lokasi** (koordinat tetap direkam untuk audit).
- Di luar geofence: **tetap diterima**, diberi penanda "Di Luar Area" untuk ditinjau HR/PIC.
- **Verifikasi wajah**: threshold **60%**; skor < 60% → **soft-flag saja, tidak pernah memblokir**
  absensi. Skor numerik wajib disimpan untuk audit.
- **Fake GPS / mock location**: diberi penanda "Fake GPS"; pada MVP **tidak otomatis
  membatalkan** kehadiran — tindak lanjut wewenang HR (BR-09).
- **Kuota**: cuti tahunan **12 hari/tahun**; ijin **12/tahun** (ijin setengah hari memotong **1**,
  bukan 0,5); sakit **tidak memotong kuota apa pun** tetapi **wajib lampiran surat dokter**,
  boleh retroaktif tanpa batas waktu.
- **Jam kerja**: 8 jam/hari (jam mulai/selesai dikonfigurasi HR); **toleransi telat 15 menit**.
- **Retensi**: selfie + lokasi disimpan **1 bulan**; penghapusan **wajib persetujuan HR**.
- **Approval**: 1 tingkat ke **PIC** karyawan (snapshot saat pengajuan dibuat). Bila PIC
  berhalangan, **HR dapat mengambil alih** (tercatat di audit log). **HR wajib clock in**
  seperti karyawan; pengajuan milik HR **dilarang self-approval** → langsung ke atasan teratas.
- **Waktu resmi** = waktu server, bukan waktu perangkat (BR-03).
- **Login**: email perusahaan + kata sandi; akun dibuatkan HR (tanpa registrasi mandiri).
- **Pengingat otomatis**: belum clock in, belum clock out, pengajuan menunggu persetujuan.
- **Offline**: clock in/out masuk **antrean lokal** (SQLite) lalu **sinkron otomatis** saat online.

## Cara menjalankan

### 1. Mobile app

```bash
cd mobile
cp .env.example .env
# isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npx expo start
```

Catatan: fitur kamera, lokasi presisi, dan notifikasi push butuh **dev build**
(`npx expo run:android` / `npx expo run:ios`) — tidak jalan penuh di Expo Go.
Lihat TODO di `src/lib/mockLocation.ts` dan layar `clock-in/`.

### 2. Supabase

1. Buat project di Supabase, salin URL + anon key ke `mobile/.env`.
2. Buka SQL Editor → jalankan `supabase/schema.sql` (atau `supabase db push` via CLI).
3. Buat bucket Storage privat `selfies` (foto selfie) dan `attachments` (surat sakit).
4. Daftarkan 1 titik kantor + jam kerja di tabel `company_settings` via dashboard.

### 3. Verifikasi wajah (CompreFace, self-hosted)

```bash
cd docker
cp .env.example .env   # bila ada — atau sesuaikan port di docker-compose.yml
docker compose up -d
```

Lihat `docker/README.md`. Daftarkan foto referensi tiap karyawan via API CompreFace
(subject = employee id), lalu isi URL layanan ke backend.

## Roadmap fase

- **Fase 1**: auth + clock in/out (selfie, GPS, geofence, mock detection) + antrean offline
- **Fase 2**: verifikasi wajah 60% + soft-flag + liveness kedip
- **Fase 3**: cuti/ijin/sakit + approval PIC/HR + notifikasi & pengingat
- **Fase 4**: dashboard HR + laporan/export + penghapusan retensi terjadwal

## Status

Scaffold awal — layar fungsional-lean, panggilan Supabase nyata lewat klien dengan
komentar TODO di bagian yang butuh dev build / layanan verifikasi wajah.
