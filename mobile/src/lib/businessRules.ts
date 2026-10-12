/**
 * businessRules.ts — SEMUA aturan bisnis PRD Absenizer sebagai konstanta.
 * Setiap konstanta merujuk ke kode aturan (BR-xx) dan keputusan diskusi (Q-xx)
 * dari PRD v0.5. Ubah nilai di sini bila PRD direvisi — jangan hardcode angka
 * aturan di layar/komponen.
 */

// ---------------------------------------------------------------------------
// Geofence & lokasi (BR-05, BR-06, BR-07, BR-08, BR-28 — Q-01, Q-08)
// ---------------------------------------------------------------------------

/** Radius geofence dalam meter — hanya untuk karyawan WFO (BR-05). */
export const GEOFENCE_RADIUS_M = 1000;

/**
 * Karyawan WFH bebas absen dari lokasi mana saja; koordinat tetap direkam
 * untuk audit tetapi tidak pernah jadi alasan penolakan/penanda (BR-07).
 */
export type WorkMode = 'WFO' | 'WFH';

/** Clock in/out di luar geofence TETAP DITERIMA + penanda "Di Luar Area" (BR-06). */
export const OUT_OF_GEOFENCE_BEHAVIOR = 'accept_with_flag' as const;

// ---------------------------------------------------------------------------
// Verifikasi wajah (BR-10, BR-11, BR-25, BR-36 — Q-04, Q-05)
// ---------------------------------------------------------------------------

/** Threshold kecocokan wajah 60% — skor >= 60% dianggap COCOK (BR-25). */
export const FACE_MATCH_THRESHOLD = 0.6;

/**
 * Skor di bawah threshold TIDAK PERNAH memblokir absensi — hanya soft-flag
 * "Wajah tidak cocok, perlu verifikasi manual" untuk HR/PIC (BR-10).
 */
export const FACE_MISMATCH_BLOCKS_CLOCK_IN = false;

/** Penyedia verifikasi wajah: self-hosted di VPS perusahaan (BR-36, Q-04). */
export const FACE_PROVIDER = 'self_hosted_compreface' as const;

// ---------------------------------------------------------------------------
// Anti-fraud: fake GPS (BR-09)
// ---------------------------------------------------------------------------

/**
 * CATATAN KEPUTUSAN PRD (BR-09): indikasi mock/fake GPS selalu diberi penanda
 * "Fake GPS", tetapi pada MVP TIDAK otomatis membatalkan kehadiran —
 * tindak lanjut adalah wewenang HR. Konstanta ini sengaja `false` agar kode
 * mengikuti PRD, bukan asumsi.
 */
export const MOCK_LOCATION_BLOCKS_CLOCK_IN = false;
export const MOCK_LOCATION_FLAG = 'Fake GPS';

// ---------------------------------------------------------------------------
// Kuota cuti / ijin / sakit (BR-16, BR-21, BR-22, BR-23 — Q-02, Q-03)
// ---------------------------------------------------------------------------

/** Kuota cuti tahunan: 12 hari per tahun per karyawan (BR-16). */
export const ANNUAL_LEAVE_QUOTA_PER_YEAR = 12;

/** Kuota ijin: 12 per tahun per karyawan, terpisah dari cuti (BR-21). */
export const IJIN_QUOTA_PER_YEAR = 12;

/**
 * Ijin setengah hari memotong kuota sebesar 1 — sama seperti sehari penuh
 * (BR-22). Tidak ada pemotongan 0,5.
 */
export const HALF_DAY_IJIN_DEDUCTION = 1;

/** Sakit TIDAK memotong kuota cuti maupun ijin, berapa pun durasinya (BR-23). */
export const SICK_LEAVE_DEDUCTS_QUOTA = false;

/** Setiap pengajuan sakit WAJIB melampirkan surat dokter; boleh retroaktif (BR-24). */
export const SICK_LEAVE_REQUIRES_DOCTOR_NOTE = true;

/** Jenis pengajuan yang didukung MVP. */
export type LeaveType = 'cuti' | 'ijin' | 'sakit';

// ---------------------------------------------------------------------------
// Jam kerja & keterlambatan (BR-18, BR-27 — Q-07)
// ---------------------------------------------------------------------------

/** Jam kerja: 8 jam per hari (BR-27). Jam mulai/selesai dikonfigurasi HR. */
export const WORK_HOURS_PER_DAY = 8;

/** Toleransi keterlambatan: 15 menit setelah jam mulai (BR-18). */
export const LATE_TOLERANCE_MIN = 15;

/** Contoh default jam kerja — ASUMSI, BELUM DIKONFIRMASI (BR-27). */
export const DEFAULT_WORK_START = '08:00';
export const DEFAULT_WORK_END = '17:00';

// ---------------------------------------------------------------------------
// Retensi data (BR-30 — Q-10)
// ---------------------------------------------------------------------------

/** Selfie + lokasi disimpan 1 bulan sejak tanggal absensi (BR-30). */
export const RETENTION_DAYS = 30;

/** Penghapusan setelah retensi WAJIB persetujuan HR (BR-30). */
export const DELETION_REQUIRES_HR_APPROVAL = true;

// ---------------------------------------------------------------------------
// Approval (BR-12, BR-13, BR-14, BR-29, BR-32, BR-33 — Q-09, Q-12)
// ---------------------------------------------------------------------------

/** Approval 1 tingkat ke PIC karyawan (snapshot saat pengajuan dibuat) (BR-12/13). */
export const APPROVAL_LEVELS = 1;

/** Bila PIC berhalangan, HR dapat mengambil alih & memutus pengajuan (BR-29). */
export const HR_CAN_TAKE_OVER_APPROVAL = true;

/** Admin HR WAJIB clock in/out seperti karyawan biasa (BR-32). */
export const HR_MUST_CLOCK_IN = true;

/**
 * Pengajuan milik Admin HR dilarang self-approval (termasuk via ambil alih) —
 * langsung dirutekan ke atasan teratas (BR-33).
 */
export const HR_SELF_APPROVAL_FORBIDDEN = true;

/** Penolakan wajib disertai catatan (BR-14). */
export const REJECTION_REQUIRES_NOTE = true;

// ---------------------------------------------------------------------------
// Akun & sesi (BR-31 — Q-11)
// ---------------------------------------------------------------------------

/** Login = email perusahaan + kata sandi; akun dibuatkan HR (BR-31). */
export const LOGIN_IDENTITY = 'company_email' as const;

// ---------------------------------------------------------------------------
// Pengingat (BR-20, BR-34 — Q-13)
// ---------------------------------------------------------------------------

/** Jenis pengingat otomatis yang wajib ada pada MVP. */
export const REMINDER_TYPES = [
  'belum_clock_in',
  'belum_clock_out',
  'pengajuan_menunggu',
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

// ---------------------------------------------------------------------------
// Penanda absensi (AttendanceFlag)
// ---------------------------------------------------------------------------

export const FLAG_TYPES = [
  'di_luar_area', // BR-06
  'wajah_tidak_cocok', // BR-10
  'fake_gps', // BR-09
  'terlambat', // BR-18
  'tidak_lengkap', // BR-04: clock out tanpa clock in
] as const;
export type FlagType = (typeof FLAG_TYPES)[number];

/** Label Bahasa Indonesia untuk setiap penanda (BR-35: Bahasa Indonesia saja). */
export const FLAG_LABELS: Record<FlagType, string> = {
  di_luar_area: 'Di Luar Area',
  wajah_tidak_cocok: 'Wajah Tidak Cocok',
  fake_gps: 'Fake GPS',
  terlambat: 'Terlambat',
  tidak_lengkap: 'Tidak Lengkap',
};

// ---------------------------------------------------------------------------
// Lainnya
// ---------------------------------------------------------------------------

/** Waktu resmi = waktu server, bukan waktu perangkat (BR-03). */
export const AUTHORITATIVE_TIME_SOURCE = 'server' as const;

/** Satu hari = satu pasang clock in/out utama (BR-04). */
export const ONE_CLOCK_PAIR_PER_DAY = true;

/** Seluruh teks aplikasi Bahasa Indonesia saja (BR-35). */
export const APP_LANGUAGE = 'id' as const;
