/**
 * Dataset demo AbsensiKu — mengikuti fixture high-fidelity prototype.
 * Nanti digantikan data Supabase; konstanta perusahaan/kantor/geofence/kuota
 * mengikuti spek desain.
 */
import type { AvatarGradientId } from '../components/Avatar';
import type { DemoRole } from '../lib/session';

// ---------------------------------------------------------------------------
// Perusahaan & kantor
// ---------------------------------------------------------------------------

export const COMPANY_NAME = 'PT Nusantara Karya Bersama';
export const APP_VERSION = '1.0.0';
export const OFFICE_NAME = 'Kantor Pusat — Kendari';
export const OFFICE_ADDRESS = 'Jl. Merdeka Raya No. 88';
export const WORK_START = '08.00';
export const WORK_END = '17.00';
export const LATE_TOLERANCE_MIN = 15;
export const GEOFENCE_M = 1000;

// ---------------------------------------------------------------------------
// Karyawan
// ---------------------------------------------------------------------------

export type AttendanceStatus = 'hadir' | 'sakit' | 'cuti' | 'ijin';

export interface Employee {
  id: string;
  gradientId: AvatarGradientId;
  name: string;
  employeeNo: string;
  position: string;
  birthDate: string; // "14 Maret 1996"
  birthISO: string; // "1996-03-14"
  email: string;
  phone: string;
  joinDate: string; // "Juli 2021"
  tenure: string; // "5 tahun 3 bulan"
  status: AttendanceStatus;
  role: DemoRole;
}

export const EMPLOYEES: Employee[] = [
  {
    id: 'nadia',
    gradientId: '01',
    name: 'Nadia Prameswari',
    employeeNo: 'NK-2021-0147',
    position: 'Staf Keuangan',
    birthDate: '14 Maret 1996',
    birthISO: '1996-03-14',
    email: 'nadia.prameswari@perusahaan.co.id',
    phone: '+62 812-3456-7890',
    joinDate: 'Juli 2021',
    tenure: '5 tahun 3 bulan',
    status: 'hadir',
    role: 'karyawan',
  },
  {
    id: 'dimas',
    gradientId: '02',
    name: 'Dimas Prasetyo',
    employeeNo: 'NK-2019-0089',
    position: 'Supervisor Keuangan',
    birthDate: '22 Agustus 1990',
    birthISO: '1990-08-22',
    email: 'dimas.prasetyo@perusahaan.co.id',
    phone: '+62 813-2200-1188',
    joinDate: 'Maret 2019',
    tenure: '7 tahun 7 bulan',
    status: 'hadir',
    role: 'pic',
  },
  {
    id: 'sari',
    gradientId: '03',
    name: 'Sari Wulandari',
    employeeNo: 'NK-2018-0031',
    position: 'HR Manager',
    birthDate: '5 Januari 1988',
    birthISO: '1988-01-05',
    email: 'sari.wulandari@perusahaan.co.id',
    phone: '+62 821-4400-9921',
    joinDate: 'Juni 2018',
    tenure: '8 tahun 4 bulan',
    status: 'hadir',
    role: 'hr',
  },
  {
    id: 'rizky',
    gradientId: '04',
    name: 'Rizky Ramadhan',
    employeeNo: 'NK-2020-0112',
    position: 'Staf Operasional',
    birthDate: '17 November 1994',
    birthISO: '1994-11-17',
    email: 'rizky.ramadhan@perusahaan.co.id',
    phone: '+62 812-7788-3344',
    joinDate: 'Oktober 2020',
    tenure: '6 tahun',
    status: 'sakit',
    role: 'karyawan',
  },
  {
    id: 'andika',
    gradientId: '05',
    name: 'Andika Saputra',
    employeeNo: 'NK-2022-0203',
    position: 'Staf Marketing',
    birthDate: '30 Oktober 1997',
    birthISO: '1997-10-30',
    email: 'andika.saputra@perusahaan.co.id',
    phone: '+62 856-1122-7788',
    joinDate: 'Februari 2022',
    tenure: '4 tahun 8 bulan',
    status: 'cuti',
    role: 'karyawan',
  },
  {
    id: 'dewi',
    gradientId: '06',
    name: 'Dewi Anggraini',
    employeeNo: 'NK-2021-0160',
    position: 'Staf HR',
    birthDate: '9 Desember 1995',
    birthISO: '1995-12-09',
    email: 'dewi.anggraini@perusahaan.co.id',
    phone: '+62 813-9900-1122',
    joinDate: 'September 2021',
    tenure: '5 tahun 1 bulan',
    status: 'hadir',
    role: 'karyawan',
  },
  {
    id: 'budi',
    gradientId: '07',
    name: 'Budi Santoso',
    employeeNo: 'NK-2019-0095',
    position: 'Koordinator Lapangan',
    birthDate: '25 Februari 1991',
    birthISO: '1991-02-25',
    email: 'budi.santoso@perusahaan.co.id',
    phone: '+62 822-3344-5566',
    joinDate: 'April 2019',
    tenure: '7 tahun 6 bulan',
    status: 'ijin',
    role: 'karyawan',
  },
  {
    id: 'rina',
    gradientId: '08',
    name: 'Rina Marlina',
    employeeNo: 'NK-2023-0241',
    position: 'Staf Keuangan',
    birthDate: '12 Juli 1998',
    birthISO: '1998-07-12',
    email: 'rina.marlina@perusahaan.co.id',
    phone: '+62 812-6677-8899',
    joinDate: 'Mei 2023',
    tenure: '3 tahun 5 bulan',
    status: 'hadir',
    role: 'karyawan',
  },
  {
    id: 'agus',
    gradientId: '09',
    name: 'Agus Wijaya',
    employeeNo: 'NK-2020-0128',
    position: 'Teknisi',
    birthDate: '3 April 1993',
    birthISO: '1993-04-03',
    email: 'agus.wijaya@perusahaan.co.id',
    phone: '+62 813-5566-0011',
    joinDate: 'November 2020',
    tenure: '5 tahun 11 bulan',
    status: 'hadir',
    role: 'karyawan',
  },
  {
    id: 'maya',
    gradientId: '10',
    name: 'Maya Putri',
    employeeNo: 'NK-2022-0215',
    position: 'Desainer Grafis',
    birthDate: '19 Juni 1996',
    birthISO: '1996-06-19',
    email: 'maya.putri@perusahaan.co.id',
    phone: '+62 821-2233-4455',
    joinDate: 'Agustus 2022',
    tenure: '4 tahun 2 bulan',
    status: 'cuti',
    role: 'karyawan',
  },
  {
    id: 'fajar',
    gradientId: '11',
    name: 'Fajar Nugroho',
    employeeNo: 'NK-2021-0178',
    position: 'Staf Logistik',
    birthDate: '27 September 1995',
    birthISO: '1995-09-27',
    email: 'fajar.nugroho@perusahaan.co.id',
    phone: '+62 856-7890-1234',
    joinDate: 'Desember 2021',
    tenure: '4 tahun 10 bulan',
    status: 'hadir',
    role: 'karyawan',
  },
  {
    id: 'lestari',
    gradientId: '12',
    name: 'Lestari Handayani',
    employeeNo: 'NK-2023-0256',
    position: 'Resepsionis',
    birthDate: '8 Mei 1999',
    birthISO: '1999-05-08',
    email: 'lestari.handayani@perusahaan.co.id',
    phone: '+62 812-3450-9876',
    joinDate: 'Oktober 2023',
    tenure: '3 tahun',
    status: 'sakit',
    role: 'karyawan',
  },
];

export function getEmployee(id: string): Employee {
  const found = EMPLOYEES.find((e) => e.id === id);
  if (!found) throw new Error(`Karyawan tidak ditemukan: ${id}`);
  return found;
}

/** PIC dari seorang karyawan (demo: Dimas untuk semua non-PIC/HR). */
export function getPicOf(employee: Employee): Employee {
  if (employee.role !== 'karyawan') return getEmployee('dimas');
  return getEmployee('dimas');
}

// ---------------------------------------------------------------------------
// Riwayat kehadiran (Oktober 2026)
// ---------------------------------------------------------------------------

export interface HistoryRow {
  id: string;
  dateLabel: string; // "Sen"
  dayNum: string; // "12"
  monthYear: string; // "Okt 2026"
  clockIn: string;
  clockOut: string;
  status: 'Hadir' | 'Terlambat' | 'Cuti' | 'Sakit' | 'Ijin';
  flags: string[];
}

export const HISTORY_SUMMARY = [
  { label: 'Hadir', value: 6, tone: 'green' },
  { label: 'Terlambat', value: 1, tone: 'yellow' },
  { label: 'Cuti', value: 1, tone: 'blue' },
  { label: 'Sakit', value: 1, tone: 'red' },
  { label: 'Ijin', value: 1, tone: 'yellow' },
] as const;

export const HISTORY_ROWS: HistoryRow[] = [
  { id: 'h1', dateLabel: 'Sen', dayNum: '12', monthYear: 'Okt 2026', clockIn: '08.02', clockOut: '17.05', status: 'Hadir', flags: [] },
  { id: 'h2', dateLabel: 'Min', dayNum: '11', monthYear: 'Okt 2026', clockIn: '08.25', clockOut: '17.10', status: 'Terlambat', flags: [] },
  { id: 'h3', dateLabel: 'Sab', dayNum: '10', monthYear: 'Okt 2026', clockIn: '07.58', clockOut: '16.55', status: 'Hadir', flags: ['Di Luar Area'] },
  { id: 'h4', dateLabel: 'Jum', dayNum: '09', monthYear: 'Okt 2026', clockIn: '08.05', clockOut: '17.00', status: 'Hadir', flags: ['Wajah Tidak Cocok'] },
  { id: 'h5', dateLabel: 'Kam', dayNum: '08', monthYear: 'Okt 2026', clockIn: '-', clockOut: '-', status: 'Cuti', flags: [] },
  { id: 'h6', dateLabel: 'Rab', dayNum: '07', monthYear: 'Okt 2026', clockIn: '-', clockOut: '-', status: 'Sakit', flags: [] },
  { id: 'h7', dateLabel: 'Sel', dayNum: '06', monthYear: 'Okt 2026', clockIn: '-', clockOut: '-', status: 'Ijin', flags: [] },
  { id: 'h8', dateLabel: 'Sen', dayNum: '05', monthYear: 'Okt 2026', clockIn: '08.10', clockOut: '17.02', status: 'Hadir', flags: [] },
  { id: 'h9', dateLabel: 'Jum', dayNum: '02', monthYear: 'Okt 2026', clockIn: '07.55', clockOut: '17.08', status: 'Hadir', flags: [] },
];

// ---------------------------------------------------------------------------
// Pengajuan
// ---------------------------------------------------------------------------

export type RequestType = 'cuti' | 'ijin' | 'sakit';
export type RequestStatus = 'menunggu' | 'disetujui' | 'ditolak';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: RequestType;
  dateRange: string;
  reason: string;
  attachment?: string;
  status: RequestStatus;
  submittedAt: string;
  /** True bila PIC belum merespons → bisa diambil alih HR. */
  escalated?: boolean;
  takenOverBy?: string;
  decidedNote?: string;
}

export const TYPE_LABEL: Record<RequestType, string> = {
  cuti: 'Cuti',
  ijin: 'Ijin',
  sakit: 'Sakit',
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
  menunggu: 'Menunggu',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

/** Daftar untuk Persetujuan PIC (4 menunggu → badge "4"). */
export const PIC_REQUESTS: LeaveRequest[] = [
  {
    id: 'rq1',
    employeeId: 'rizky',
    type: 'sakit',
    dateRange: '12 – 13 Okt 2026',
    reason: 'Demam tinggi dan disarankan istirahat total oleh dokter.',
    attachment: 'surat-dokter-rizky.pdf',
    status: 'menunggu',
    submittedAt: '12 Okt 2026 • 07.40',
    escalated: true,
  },
  {
    id: 'rq2',
    employeeId: 'andika',
    type: 'cuti',
    dateRange: '20 – 22 Okt 2026',
    reason: 'Acara keluarga di luar kota, sudah dikoordinasikan dengan tim.',
    status: 'menunggu',
    submittedAt: '11 Okt 2026 • 16.20',
    escalated: true,
  },
  {
    id: 'rq3',
    employeeId: 'dewi',
    type: 'ijin',
    dateRange: '14 Okt 2026 (setengah hari)',
    reason: 'Keperluan administrasi kependudukan di kelurahan.',
    status: 'menunggu',
    submittedAt: '11 Okt 2026 • 09.05',
  },
  {
    id: 'rq4',
    employeeId: 'budi',
    type: 'cuti',
    dateRange: '26 – 27 Okt 2026',
    reason: 'Istirahat setelah proyek lapangan selesai.',
    status: 'menunggu',
    submittedAt: '10 Okt 2026 • 13.55',
  },
  {
    id: 'rq5',
    employeeId: 'rina',
    type: 'sakit',
    dateRange: '5 Okt 2026',
    reason: 'Sakit kepala berat, melampirkan surat dokter.',
    attachment: 'surat-dokter-rina.pdf',
    status: 'disetujui',
    submittedAt: '5 Okt 2026 • 07.15',
    decidedNote: 'Semoga lekas sembuh.',
  },
  {
    id: 'rq6',
    employeeId: 'agus',
    type: 'ijin',
    dateRange: '2 Okt 2026',
    reason: 'Ada urusan mendadak.',
    status: 'ditolak',
    submittedAt: '1 Okt 2026 • 17.40',
    decidedNote: 'Alasan kurang jelas, silakan ajukan ulang dengan detail.',
  },
];

/** Pengajuanku (tab Pengajuan → segmen Pengajuanku). */
export const MY_REQUESTS: LeaveRequest[] = [
  {
    id: 'mq1',
    employeeId: 'nadia',
    type: 'cuti',
    dateRange: '10 – 12 Nov 2026',
    reason: 'Liburan keluarga akhir tahun.',
    status: 'menunggu',
    submittedAt: '9 Okt 2026 • 10.30',
  },
  {
    id: 'mq2',
    employeeId: 'nadia',
    type: 'ijin',
    dateRange: '3 Okt 2026',
    reason: 'Mengantar orang tua kontrol ke rumah sakit.',
    status: 'disetujui',
    submittedAt: '2 Okt 2026 • 08.12',
  },
  {
    id: 'mq3',
    employeeId: 'nadia',
    type: 'sakit',
    dateRange: '28 Sep 2026',
    reason: 'Flu berat disertai surat dokter.',
    attachment: 'surat-dokter-nadia.pdf',
    status: 'disetujui',
    submittedAt: '28 Sep 2026 • 07.05',
  },
  {
    id: 'mq4',
    employeeId: 'nadia',
    type: 'cuti',
    dateRange: '15 – 16 Agu 2026',
    reason: 'Keperluan pribadi.',
    status: 'ditolak',
    submittedAt: '12 Agu 2026 • 14.20',
    decidedNote: 'Bertepatan dengan tutup buku bulanan.',
  },
];

// ---------------------------------------------------------------------------
// Kuota
// ---------------------------------------------------------------------------

export interface Quota {
  type: RequestType;
  used: number;
  total: number | null; // null = tanpa batas
  usedLabel: string;
}

export const QUOTAS: Quota[] = [
  { type: 'cuti', used: 8, total: 12, usedLabel: 'Terpakai 8 dari 12 hari' },
  { type: 'ijin', used: 9.5, total: 12, usedLabel: 'Terpakai 9,5 dari 12' },
  { type: 'sakit', used: 3, total: null, usedLabel: 'Tanpa batas • wajib surat dokter' },
];
