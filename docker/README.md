# Docker — CompreFace untuk Absenizer

## Menjalankan

```bash
cd docker
FACE_API_KEY=kunci-acak-yang-kuat docker compose up -d
```

Buka `http://<ip-vps>:8000`, buat akun admin, lalu buat API key baru untuk
aplikasi dan simpan sebagai `EXPO_PUBLIC_FACE_API_KEY` di `mobile/.env`
(serta `FACE_API_KEY` di environment compose bila ingin konsisten).

## Mendaftarkan foto referensi karyawan

Via API (contoh memakai curl):

```bash
curl -X POST "http://<ip-vps>:8000/api/v1/recognition/faces" \
  -H "x-api-key: <API_KEY>" \
  -F "file=@foto-referensi.jpg;type=image/jpeg" \
  -F "subject=<employee_id>"
```

`subject` = id karyawan (kolom `employees.id`) agar verifikasi clock in
tinggal memanggil endpoint verify dengan subject yang sama.

## Verifikasi saat clock in (Fase 2)

`POST /api/v1/recognition/faces/{subject}/verify` dengan file selfie →
respons berisi `similarity` (0..1). Aplikasi membandingkan dengan threshold
0.6 (`FACE_MATCH_THRESHOLD` di `mobile/src/lib/businessRules.ts`):
skor di bawahnya → penanda soft-flag, absensi tetap disimpan.

## Catatan

- Butuh RAM ±2 GB untuk menjalankan model deteksi + recognition.
- Backup volume `compreface-data` berkala (berisi model & data wajah).
- Jangan expose port 8000 ke publik tanpa firewall/reverse proxy + TLS.
