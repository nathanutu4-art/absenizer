/**
 * Lapisan data ganda (dual-mode) AbsensiKu.
 *
 * - Bila Supabase terkonfigurasi (env terisi & bukan placeholder) DAN data
 *   tersedia, baca/tulis lewat Supabase.
 * - Bila tidak, diam-diam pakai data demo (src/data/demo.ts) — aplikasi
 *   tidak boleh terlihat rusak.
 *
 * Semua fungsi di sini bersifat best-effort: galat jaringan/DB ditangkap
 * dan dikembalikan sebagai fallback, bukan dilempar ke UI.
 */
import type { AvatarGradientId } from '../components/Avatar';
import {
  EMPLOYEES,
  GEOFENCE_M,
  MY_REQUESTS,
  OFFICE_COORD,
  OFFICE_NAME,
  WORK_END,
  WORK_START,
  type AttendanceStatus,
  type Employee,
  type LeaveRequest,
  type RequestStatus,
  type RequestType,
} from '../data/demo';
import { getSession, type DemoRole } from './session';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Konfigurasi
// ---------------------------------------------------------------------------

/** True bila env Supabase terisi dan bukan nilai placeholder. */
export function isSupabaseConfigured(): boolean {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes('placeholder') &&
    !key.includes('placeholder') &&
    !url.includes('xyzcompany')
  );
}

// ---------------------------------------------------------------------------
// Pengaturan perusahaan
// ---------------------------------------------------------------------------

export interface CompanySettings {
  officeName: string;
  officeLat: number;
  officeLng: number;
  geofenceM: number;
  /** "09.00" */
  workStart: string;
  /** "18.00" */
  workEnd: string;
}

export const DEMO_SETTINGS: CompanySettings = {
  officeName: OFFICE_NAME,
  officeLat: OFFICE_COORD.latitude,
  officeLng: OFFICE_COORD.longitude,
  geofenceM: GEOFENCE_M,
  workStart: WORK_START,
  workEnd: WORK_END,
};

/** "09:00:00" -> "09.00" */
function formatJam(t: unknown): string | null {
  if (typeof t !== 'string') return null;
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : null;
}

/** Baris company_settings aktif; fallback ke konstanta demo bila gagal/kosong. */
export async function getCompanySettings(): Promise<CompanySettings> {
  if (!isSupabaseConfigured()) return DEMO_SETTINGS;
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('office_name, office_lat, office_lng, geofence_radius_m, work_start, work_end')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (error || !data) return DEMO_SETTINGS;
    const row = data as {
      office_name?: string | null;
      office_lat?: number | null;
      office_lng?: number | null;
      geofence_radius_m?: number | null;
      work_start?: string | null;
      work_end?: string | null;
    };
    return {
      officeName: row.office_name ?? DEMO_SETTINGS.officeName,
      officeLat: Number(row.office_lat) || DEMO_SETTINGS.officeLat,
      officeLng: Number(row.office_lng) || DEMO_SETTINGS.officeLng,
      geofenceM: Number(row.geofence_radius_m) || DEMO_SETTINGS.geofenceM,
      workStart: formatJam(row.work_start) ?? DEMO_SETTINGS.workStart,
      workEnd: formatJam(row.work_end) ?? DEMO_SETTINGS.workEnd,
    };
  } catch {
    return DEMO_SETTINGS;
  }
}

// ---------------------------------------------------------------------------
// Karyawan
// ---------------------------------------------------------------------------

interface DbEmployeeRow {
  id: string;
  employee_no: string;
  full_name: string;
  position: string;
  birth_date: string | null;
  email: string;
  phone: string | null;
  join_date: string;
  pic_id: string | null;
  is_hr: boolean;
  is_active: boolean;
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function parseISODate(iso: string | null): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** Gradient avatar deterministik dari id (01–12). */
function gradientFor(id: string): AvatarGradientId {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return String((h % 12) + 1).padStart(2, '0') as AvatarGradientId;
}

function tenureSejak(joinISO: string): { joinDate: string; tenure: string } {
  const p = parseISODate(joinISO);
  if (!p) return { joinDate: '—', tenure: '—' };
  const now = new Date();
  let years = now.getFullYear() - p.y;
  let months = now.getMonth() + 1 - p.m;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const joinDate = `${MONTHS_ID[p.m - 1]} ${p.y}`;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (months > 0) parts.push(`${months} bulan`);
  return { joinDate, tenure: parts.length > 0 ? parts.join(' ') : 'kurang dari sebulan' };
}

function mapDbEmployee(row: DbEmployeeRow): Employee {
  const b = parseISODate(row.birth_date);
  const { joinDate, tenure } = tenureSejak(row.join_date);
  return {
    id: row.id,
    gradientId: gradientFor(row.id),
    name: row.full_name,
    employeeNo: row.employee_no,
    position: row.position,
    birthDate: b ? `${b.d} ${MONTHS_ID[b.m - 1]} ${b.y}` : '—',
    birthISO: row.birth_date ?? '',
    email: row.email,
    phone: row.phone ?? '—',
    joinDate,
    tenure,
    // DB tidak menyimpan status harian; default hadir.
    status: 'hadir' as AttendanceStatus,
    role: row.is_hr ? 'hr' : 'karyawan',
  };
}

/** Daftar karyawan aktif; fallback ke EMPLOYEES demo bila gagal/kosong. */
export async function getEmployees(): Promise<Employee[]> {
  if (!isSupabaseConfigured()) return EMPLOYEES;
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(
        'id, employee_no, full_name, position, birth_date, email, phone, join_date, pic_id, is_hr, is_active',
      )
      .eq('is_active', true)
      .order('full_name');
    if (error || !data || data.length === 0) return EMPLOYEES;
    return (data as DbEmployeeRow[]).map(mapDbEmployee);
  } catch {
    return EMPLOYEES;
  }
}

/** Id employee milik sesi aktif (cocokkan user_id lalu email); null di mode demo. */
export async function getMyEmployeeId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const session = await getSession();
    if (!session || session.demo) return null;
    const { userId, email } = session;
    if (userId) {
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      const id = (data as { id?: string } | null)?.id;
      if (id) return id;
    }
    if (email) {
      const { data } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      const id = (data as { id?: string } | null)?.id;
      if (id) return id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Peran pengguna dari DB: HR bila is_hr, PIC bila ada bawahan,
 * selain itu karyawan. Fallback ke peran terpilih saat login.
 */
export async function resolveMyRole(fallback: DemoRole): Promise<DemoRole> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    const empId = await getMyEmployeeId();
    if (!empId) return fallback;
    const { data } = await supabase
      .from('employees')
      .select('is_hr')
      .eq('id', empId)
      .maybeSingle();
    if ((data as { is_hr?: boolean } | null)?.is_hr) return 'hr';
    const { count } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('pic_id', empId);
    if ((count ?? 0) > 0) return 'pic';
    return 'karyawan';
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Waktu (Asia/Jakarta)
// ---------------------------------------------------------------------------

/** Tanggal hari ini "YYYY-MM-DD" dalam zona Asia/Jakarta. */
export function jakartaToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Tambah N hari ke tanggal "YYYY-MM-DD". */
function addDays(iso: string, n: number): string {
  const parts = iso.split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Kehadiran
// ---------------------------------------------------------------------------

export interface AttendanceInput {
  simFace?: boolean;
  isFar?: boolean;
  distanceM?: number | null;
  coords: { latitude: number; longitude: number; accuracy: number | null } | null;
}

/**
 * Simpan clock-in ke Supabase (best-effort).
 * Dilewati total di mode demo / tanpa employee. Mengembalikan true bila
 * baris kehadiran tersimpan.
 */
export async function saveAttendance(input: AttendanceInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const employeeId = await getMyEmployeeId();
    if (!employeeId) return false;

    const now = new Date();
    const date = jakartaToday();
    const score = input.simFace ? 0.4 : 0.96;

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        {
          employee_id: employeeId,
          date,
          clock_in_at: now.toISOString(),
          clock_in_lat: input.coords?.latitude ?? null,
          clock_in_lng: input.coords?.longitude ?? null,
          clock_in_accuracy: input.coords?.accuracy ?? null,
          clock_in_face_score: score,
          clock_in_face_match: score >= 0.6,
          sync_status: 'synced',
          device_time: now.toISOString(),
          synced_at: now.toISOString(),
          retention_due_date: addDays(date, 30),
        },
        { onConflict: 'employee_id,date' },
      )
      .select('id')
      .single();
    if (error || !data) return false;

    const attendanceId = (data as { id: string }).id;
    const flags: {
      attendance_id: string;
      flag_type: string;
      reason: string;
      related_score: number | null;
    }[] = [];
    if (input.isFar) {
      flags.push({
        attendance_id: attendanceId,
        flag_type: 'di_luar_area',
        reason: 'Di luar radius geofence kantor',
        related_score: input.distanceM ?? null,
      });
    }
    if (input.simFace) {
      flags.push({
        attendance_id: attendanceId,
        flag_type: 'wajah_tidak_cocok',
        reason: 'Skor verifikasi wajah di bawah ambang batas',
        related_score: score,
      });
    }
    if (flags.length > 0) {
      const { error: flagError } = await supabase
        .from('attendance_flags')
        .insert(flags);
      if (flagError) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Pengajuan cuti/ijin/sakit
// ---------------------------------------------------------------------------

export interface LeaveRequestInput {
  type: RequestType;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" */
  endDate: string;
  isHalfDay?: boolean;
  reason: string;
  attachmentUrl?: string | null;
}

/**
 * Kirim pengajuan ke Supabase (best-effort).
 * Mengembalikan { ok:false } di mode demo / tanpa employee / bila validasi
 * DB menolak (mis. sakit tanpa surat dokter).
 */
export async function submitLeaveRequest(
  input: LeaveRequestInput,
): Promise<{ ok: boolean; id?: string }> {
  if (!isSupabaseConfigured()) return { ok: false };
  try {
    const employeeId = await getMyEmployeeId();
    if (!employeeId) return { ok: false };
    const { data: me } = await supabase
      .from('employees')
      .select('pic_id')
      .eq('id', employeeId)
      .maybeSingle();
    const picId = ((me as { pic_id?: string | null } | null)?.pic_id ?? null) as
      | string
      | null;
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: employeeId,
        type: input.type,
        start_date: input.startDate,
        end_date: input.endDate,
        is_half_day: input.isHalfDay ?? false,
        reason: input.reason,
        attachment_url: input.attachmentUrl ?? null,
        pic_id: picId,
      })
      .select('id')
      .single();
    if (error || !data) return { ok: false };
    return { ok: true, id: (data as { id: string }).id };
  } catch {
    return { ok: false };
  }
}

const SHORT_MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatDateRange(startISO: string, endISO: string): string {
  const s = parseISODate(startISO);
  const e = parseISODate(endISO);
  if (!s || !e) return `${startISO} – ${endISO}`;
  const a = `${s.d} ${SHORT_MONTHS_ID[s.m - 1]} ${s.y}`;
  if (startISO === endISO) return a;
  return `${a} – ${e.d} ${SHORT_MONTHS_ID[e.m - 1]} ${e.y}`;
}

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const time = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(d)
      .replace(':', '.');
    return `${date} • ${time}`;
  } catch {
    return iso;
  }
}

interface DbLeaveRow {
  id: string;
  employee_id: string;
  type: RequestType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url: string | null;
  status: RequestStatus;
  created_at: string;
}

/** Pengajuan milikku; fallback ke MY_REQUESTS demo bila mode demo. */
export async function getMyLeaveRequests(): Promise<LeaveRequest[]> {
  const employeeId = await getMyEmployeeId();
  if (!employeeId) return MY_REQUESTS;
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(
        'id, employee_id, type, start_date, end_date, reason, attachment_url, status, created_at',
      )
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return (data as DbLeaveRow[]).map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      type: r.type,
      dateRange: formatDateRange(r.start_date, r.end_date),
      reason: r.reason,
      attachment: r.attachment_url ?? undefined,
      status: r.status,
      submittedAt: formatSubmittedAt(r.created_at),
    }));
  } catch {
    return [];
  }
}
