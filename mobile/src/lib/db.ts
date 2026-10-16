/**
 * Lapisan data ganda (dual-mode) Absenizer.
 *
 * - Bila Supabase terkonfigurasi (env terisi & bukan placeholder) DAN data
 *   tersedia, baca/tulis lewat Supabase.
 * - Bila tidak, diam-diam pakai data demo (src/data/demo.ts) — aplikasi
 *   tidak boleh terlihat rusak.
 *
 * Semua fungsi di sini bersifat best-effort: galat jaringan/DB ditangkap
 * dan dikembalikan sebagai fallback, bukan dilempar ke UI.
 */
import 'expo-blob'; // Polyfill Blob native agar res.blob() tidak memicu warning LogBox.
import * as FileSystem from 'expo-file-system';
import { showToast } from '../components/Toast';
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
  type HistoryRow,
  type LeaveRequest,
  type RequestStatus,
  type RequestType,
} from '../data/demo';
import { getSession, type DemoRole } from './session';
import { supabase } from './supabase';
import type { ThemePalette } from '../theme';

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
  /** Kuota default tahunan (HR dapat mengubah di admin panel). */
  cutiQuotaDefault: number;
  ijinQuotaDefault: number;
}

export const DEMO_SETTINGS: CompanySettings = {
  officeName: OFFICE_NAME,
  officeLat: OFFICE_COORD.latitude,
  officeLng: OFFICE_COORD.longitude,
  geofenceM: GEOFENCE_M,
  workStart: WORK_START,
  workEnd: WORK_END,
  cutiQuotaDefault: 12,
  ijinQuotaDefault: 12,
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
    // Coba baca kolom kuota default; bila migrasi belum dijalankan, ulangi
    // tanpa kolom itu.
    const full = await supabase
      .from('company_settings')
      .select(
        'office_name, office_lat, office_lng, geofence_radius_m, work_start, work_end, cuti_quota_default, ijin_quota_default',
      )
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    let data = full.data as Record<string, unknown> | null;
    let error = full.error;
    if (error) {
      const retry = await supabase
        .from('company_settings')
        .select('office_name, office_lat, office_lng, geofence_radius_m, work_start, work_end')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      data = retry.data as Record<string, unknown> | null;
      error = retry.error;
    }
    if (error || !data) return DEMO_SETTINGS;
    const row = data as {
      office_name?: string | null;
      office_lat?: number | null;
      office_lng?: number | null;
      geofence_radius_m?: number | null;
      work_start?: string | null;
      work_end?: string | null;
      cuti_quota_default?: number | null;
      ijin_quota_default?: number | null;
    };
    return {
      officeName: row.office_name ?? DEMO_SETTINGS.officeName,
      officeLat: Number(row.office_lat) || DEMO_SETTINGS.officeLat,
      officeLng: Number(row.office_lng) || DEMO_SETTINGS.officeLng,
      geofenceM: Number(row.geofence_radius_m) || DEMO_SETTINGS.geofenceM,
      workStart: formatJam(row.work_start) ?? DEMO_SETTINGS.workStart,
      workEnd: formatJam(row.work_end) ?? DEMO_SETTINGS.workEnd,
      cutiQuotaDefault: Number(row.cuti_quota_default) || 12,
      ijinQuotaDefault: Number(row.ijin_quota_default) || 12,
    };
  } catch {
    return DEMO_SETTINGS;
  }
}

/**
 * Palet tema aktif dari company_settings.theme_palette (JSON).
 * Null bila Supabase tidak dikonfigurasi, baris/kolom tidak ada, atau
 * nilainya tidak valid — tidak pernah melempar error.
 */
export async function getThemePalette(): Promise<ThemePalette | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('theme_palette')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const raw = (data as { theme_palette?: unknown }).theme_palette as {
      name?: unknown;
      indigo?: unknown;
      apricot?: unknown;
      olive?: unknown;
    } | null;
    if (!raw) return null;
    if (
      typeof raw.indigo !== 'string' ||
      typeof raw.apricot !== 'string' ||
      typeof raw.olive !== 'string'
    ) {
      return null;
    }
    return {
      name: typeof raw.name === 'string' ? raw.name : '',
      indigo: raw.indigo,
      apricot: raw.apricot,
      olive: raw.olive,
    };
  } catch {
    return null;
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
  photo_url: string | null;
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
    picId: row.pic_id ?? undefined,
    photoUrl: row.photo_url ?? undefined,
  };
}

/** Daftar karyawan aktif; fallback ke EMPLOYEES demo bila gagal/kosong. */
export async function getEmployees(): Promise<Employee[]> {
  if (!isSupabaseConfigured()) return EMPLOYEES;
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(
        'id, employee_no, full_name, position, birth_date, email, phone, join_date, pic_id, photo_url, is_hr, is_active',
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

/** Employee lengkap milik sesi aktif; null di mode demo / tak ditemukan. */
export async function getMyEmployee(): Promise<Employee | null> {
  const empId = await getMyEmployeeId();
  if (!empId) return null;
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(
        'id, employee_no, full_name, position, birth_date, email, phone, join_date, pic_id, photo_url, is_hr, is_active',
      )
      .eq('id', empId)
      .maybeSingle();
    if (error || !data) return null;
    return mapDbEmployee(data as DbEmployeeRow);
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
  isFar?: boolean;
  distanceM?: number | null;
  coords: { latitude: number; longitude: number; accuracy: number | null } | null;
  /** Path storage foto selfie (bucket "selfies"); null bila tak ada/gagal. */
  selfieUrl?: string | null;
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
          clock_in_selfie_url: input.selfieUrl ?? null,
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
// Upload selfie ke Storage
// ---------------------------------------------------------------------------

/**
 * Upload foto selfie ke bucket "selfies" di path
 * `<employeeId>/<YYYY-MM-DD>_<kind>.jpg`.
 * (Resize dinonaktifkan sementara — expo-image-manipulator dicurigai
 * menyebabkan crash; foto diupload apa adanya dari kamera quality 0.7.)
 * Mengembalikan storage path bila sukses, null bila gagal (bucket belum
 * ada, jaringan, dsb.) — tidak pernah melempar error.
 */
/** Decode base64 ke Uint8Array (tanpa atob, aman di Hermes). */
function base64ToBytes(base64: string): Uint8Array {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = base64.replace(/\s/g, '');
  const padLen = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const outLen = Math.floor((clean.length * 3) / 4) - padLen;
  const out = new Uint8Array(outLen);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const e1 = chars.indexOf(clean[i] ?? '');
    const e2 = chars.indexOf(clean[i + 1] ?? '');
    const e3 = chars.indexOf(clean[i + 2] ?? '');
    const e4 = chars.indexOf(clean[i + 3] ?? '');
    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;
    out[p++] = c1;
    if (p < outLen) out[p++] = c2;
    if (p < outLen) out[p++] = c3;
  }
  return out;
}

export async function uploadSelfie(
  localUri: string,
  employeeId: string,
  kind: 'in' | 'out',
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    showToast('Debug: supabase tidak terkonfigurasi');
    return null;
  }
  if (!localUri) {
    showToast('Debug: localUri kosong (foto tidak tersimpan)');
    return null;
  }
  if (!employeeId) {
    showToast('Debug: employeeId kosong');
    return null;
  }
  try {
    // Baca file sebagai base64 lalu konversi ke bytes — lebih andal
    // daripada fetch().blob() di React Native.
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) {
      showToast('Debug: file selfie kosong');
      return null;
    }
    const bytes = base64ToBytes(base64);
    const path = `${employeeId}/${jakartaToday()}_${kind}.jpg`;
    const { error } = await supabase.storage
      .from('selfies')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
    if (error) {
      showToast(`Debug upload: ${error.message}`);
      return null;
    }
    return path;
  } catch (e) {
    showToast(`Debug upload ex: ${e instanceof Error ? e.message : 'unknown'}`);
    return null;
  }
}

export interface ClockOutInput {
  coords: { latitude: number; longitude: number } | null;
  /** Path storage foto selfie clock-out (bucket "selfies"); null bila tak ada/gagal. */
  selfieUrl?: string | null;
}

/**
 * Simpan clock-out ke Supabase (best-effort): update baris kehadiran hari
 * ini dengan clock_out_at (+ selfie & lokasi bila ada).
 * Dilewati total di mode demo / tanpa employee. Mengembalikan true bila
 * baris berhasil diperbarui.
 */
export async function saveClockOut(input: ClockOutInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const employeeId = await getMyEmployeeId();
    if (!employeeId) return false;

    const now = new Date();
    const date = jakartaToday();

    const { data, error } = await supabase
      .from('attendance')
      .update({
        clock_out_at: now.toISOString(),
        clock_out_selfie_url: input.selfieUrl ?? null,
        clock_out_lat: input.coords?.latitude ?? null,
        clock_out_lng: input.coords?.longitude ?? null,
        synced_at: now.toISOString(),
      })
      .eq('employee_id', employeeId)
      .eq('date', date)
      .select('id')
      .maybeSingle();
    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * URL bertanda tangan (signed URL, berlaku 1 jam) untuk file di bucket
 * privat "selfies". null bila path kosong / gagal dibuat.
 */
export async function getSelfieSignedUrl(
  path: string | null | undefined,
): Promise<string | null> {
  if (!isSupabaseConfigured() || !path) return null;
  try {
    const { data, error } = await supabase.storage
      .from('selfies')
      .createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
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
export async function getMyLeaveRequests(): Promise<LeaveRequest[]> {  const employeeId = await getMyEmployeeId();
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

export interface LeaveBalance {
  cutiQuota: number;
  cutiUsed: number;
  ijinQuota: number;
  ijinUsed: number;
}

/**
 * Saldo cuti/ijin milikku tahun berjalan. Null bila mode demo atau baris
 * belum ada (pemanggil memakai default dari company_settings).
 */
export async function getMyLeaveBalance(): Promise<LeaveBalance | null> {
  const employeeId = await getMyEmployeeId();
  if (!employeeId) return null;
  try {
    const year = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
    ).getFullYear();
    const { data, error } = await supabase
      .from('leave_balances')
      .select('cuti_quota, cuti_used, ijin_quota, ijin_used')
      .eq('employee_id', employeeId)
      .eq('year', year)
      .maybeSingle();
    if (error || !data) return null;
    const r = data as {
      cuti_quota?: number | null;
      cuti_used?: number | null;
      ijin_quota?: number | null;
      ijin_used?: number | null;
    };
    return {
      cutiQuota: Number(r.cuti_quota) || 0,
      cutiUsed: Number(r.cuti_used) || 0,
      ijinQuota: Number(r.ijin_quota) || 0,
      ijinUsed: Number(r.ijin_used) || 0,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Riwayat kehadiran & ketidakhadiran
// ---------------------------------------------------------------------------

const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const FLAG_LABEL: Record<string, string> = {
  di_luar_area: 'Di Luar Area',
  wajah_tidak_cocok: 'Wajah Tidak Cocok',
  fake_gps: 'GPS Palsu',
  terlambat: 'Terlambat',
  tidak_lengkap: 'Tidak Lengkap',
};

/** "2026-10-13T08:02:11Z" -> "08.02" (Asia/Jakarta); null -> "-". */
function formatJamSingkat(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(new Date(iso))
      .replace(':', '.');
  } catch {
    return '-';
  }
}

interface DbAttendanceRow {
  id: string;
  date: string; // "YYYY-MM-DD"
  clock_in_at: string | null;
  clock_out_at: string | null;
  is_late: boolean;
  clock_in_selfie_url: string | null;
  clock_out_selfie_url: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
}

/**
 * Riwayat kehadiran milik pengguna yang login, terbaru dulu.
 * [] bila mode demo / tanpa employee / DB kosong / galat → pemanggil
 * memakai fallback demo.
 */
export async function getMyAttendance(): Promise<HistoryRow[]> {
  const employeeId = await getMyEmployeeId();
  if (!employeeId) return [];
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(
        'id, date, clock_in_at, clock_out_at, is_late, clock_in_selfie_url, clock_out_selfie_url, clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng',
      )
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
      .limit(30);
    if (error || !data || data.length === 0) return [];

    const rows = data as DbAttendanceRow[];
    const { data: flagRows } = await supabase
      .from('attendance_flags')
      .select('attendance_id, flag_type')
      .in(
        'attendance_id',
        rows.map((r) => r.id),
      );
    const flagsById = new Map<string, string[]>();
    for (const f of (flagRows ?? []) as {
      attendance_id: string;
      flag_type: string;
    }[]) {
      const arr = flagsById.get(f.attendance_id) ?? [];
      arr.push(FLAG_LABEL[f.flag_type] ?? f.flag_type);
      flagsById.set(f.attendance_id, arr);
    }

    return rows.map((r) => {
      const [y = 1970, m = 1, d = 1] = r.date.split('-').map(Number);
      const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      return {
        id: r.id,
        dateLabel: HARI_PENDEK[dow] ?? '',
        dayNum: String(d),
        monthYear: `${SHORT_MONTHS_ID[m - 1]} ${y}`,
        clockIn: formatJamSingkat(r.clock_in_at),
        clockOut: formatJamSingkat(r.clock_out_at),
        status: (r.is_late ? 'Terlambat' : 'Hadir') as HistoryRow['status'],
        flags: flagsById.get(r.id) ?? [],
        // Detail untuk popup: path storage selfie + koordinat.
        clockInSelfiePath: r.clock_in_selfie_url,
        clockOutSelfiePath: r.clock_out_selfie_url,
        clockInLat: r.clock_in_lat,
        clockInLng: r.clock_in_lng,
        clockOutLat: r.clock_out_lat,
        clockOutLng: r.clock_out_lng,
      };
    });
  } catch {
    return [];
  }
}

export interface AwayEmployee {
  employeeId: string;
  name: string;
  type: 'ijin' | 'sakit' | 'cuti';
}

/**
 * Absensi hari ini (Asia/Jakarta) untuk user yang login.
 * null bila belum ada record / DB tak terkonfigurasi.
 */
export async function getTodayAttendance(): Promise<{
  clockIn: string;
  clockOut: string;
} | null> {
  const employeeId = await getMyEmployeeId();
  if (!employeeId) return null;
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('clock_in_at, clock_out_at')
      .eq('employee_id', employeeId)
      .eq('date', jakartaToday())
      .maybeSingle();
    if (error || !data) return null;
    return {
      clockIn: formatJamSingkat(data.clock_in_at),
      clockOut: formatJamSingkat(data.clock_out_at),
    };
  } catch {
    return null;
  }
}

/**
 * Hapus record absensi hari ini (untuk testing/reset sementara).
 */
export async function deleteTodayAttendance(): Promise<boolean> {
  const employeeId = await getMyEmployeeId();
  if (!employeeId) return false;
  try {
    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('employee_id', employeeId)
      .eq('date', jakartaToday());
    return !error;
  } catch {
    return false;
  }
}

/**
 * Karyawan yang sedang tidak masuk hari ini: pengajuan berstatus disetujui
 * yang rentang tanggalnya mencakup hari ini (Asia/Jakarta).
 * null bila Supabase tak terkonfigurasi / galat → pemanggil memakai demo.
 * [] bila DB baik-baik saja tapi tak ada yang tidak masuk → seksi disembunyikan.
 */
export async function getAwayEmployees(): Promise<AwayEmployee[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const today = jakartaToday();
    const { data, error } = await supabase
      .from('leave_requests')
      .select('employee_id, type, employees(full_name)')
      .eq('status', 'disetujui')
      .in('type', ['ijin', 'sakit', 'cuti'])
      .lte('start_date', today)
      .gte('end_date', today);
    if (error) return null;
    const rows = (data ?? []) as {
      employee_id: string;
      type: string;
      employees: { full_name: string } | { full_name: string }[] | null;
    }[];
    return rows.map((r) => {
      const emp = Array.isArray(r.employees) ? r.employees[0] : r.employees;
      const t = r.type === 'sakit' || r.type === 'cuti' ? r.type : 'ijin';
      return {
        employeeId: r.employee_id,
        name: emp?.full_name ?? '—',
        type: t as AwayEmployee['type'],
      };
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Aktivitas terakhir
// ---------------------------------------------------------------------------

export interface RecentActivity {
  id: string;
  /** 'clockin' | 'clockout' | 'cuti' | 'ijin' | 'sakit' */
  kind: 'clockin' | 'clockout' | 'cuti' | 'ijin' | 'sakit';
  title: string;
  subtitle: string;
  /** 'Hadir' | 'Terlambat' | 'Cuti' | 'Ijin' | 'Sakit' | 'Menunggu' | ... */
  badge: string;
}

/**
 * Aktivitas terakhir milikku: clock-in/out terakhir + pengajuan terakhir.
 * [] bila tak ada data → pemanggil menyembunyikan seksi.
 */
export async function getRecentActivities(): Promise<RecentActivity[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const [attendance, requests] = await Promise.all([
      getMyAttendance(),
      getMyLeaveRequests(),
    ]);
    const out: RecentActivity[] = [];
    // Kehadiran terakhir
    const last = attendance[0];
    if (last) {
      const late = last.status === 'Terlambat';
      out.push({
        id: `att-${last.id}`,
        kind: last.clockOut !== '-' ? 'clockout' : 'clockin',
        title:
          last.clockOut !== '-'
            ? `Clock out • ${last.clockOut}`
            : `Clock in • ${last.clockIn}`,
        subtitle: `${last.dateLabel}, ${last.dayNum} ${last.monthYear} • ${
          late ? 'Terlambat' : 'Tepat waktu'
        }`,
        badge: last.status,
      });
    }
    // Pengajuan terakhir
    const req = requests[0];
    if (req) {
      const typeLabel =
        req.type === 'cuti' ? 'Cuti' : req.type === 'ijin' ? 'Ijin' : 'Sakit';
      const statusLabel =
        req.status === 'disetujui'
          ? 'Disetujui'
          : req.status === 'ditolak'
            ? 'Ditolak'
            : 'Menunggu';
      out.push({
        id: `req-${req.id}`,
        kind: req.type,
        title: `Pengajuan ${typeLabel.toLowerCase()} ${statusLabel.toLowerCase()}`,
        subtitle: `${req.dateRange} • ${req.submittedAt}`,
        badge: statusLabel,
      });
    }
    return out;
  } catch {
    return [];
  }
}
