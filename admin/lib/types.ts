/** Tipe baris sesuai ~/workspace/absenizer/supabase/schema.sql */

/** Baris tabel employees — data karyawan; pic_id = atasan langsung (PIC), is_hr/is_top_boss menandai peran khusus. */
export interface Employee {
  id: string;
  user_id: string | null;
  employee_no: string;
  full_name: string;
  position: string;
  birth_date: string | null;
  email: string;
  phone: string | null;
  join_date: string;
  work_mode: "WFO" | "WFH";
  pic_id: string | null;
  is_hr: boolean;
  is_top_boss: boolean;
  is_active: boolean;
  photo_url: string | null;
  created_at: string;
}

/** Baris tabel company_settings — pengaturan perusahaan aktif: titik kantor, geofence, jam kerja, kuota default, dan tema. */
export interface CompanySettings {
  id: string;
  office_name: string;
  office_lat: number;
  office_lng: number;
  geofence_radius_m: number;
  work_start: string; // "HH:MM:SS"
  work_end: string;
  work_hours_per_day: number;
  late_tolerance_min: number;
  is_active: boolean;
  updated_at: string;
  /** Kolom dari migration-quota-defaults.sql; null bila migrasi belum jalan. */
  cuti_quota_default: number | null;
  ijin_quota_default: number | null;
  /** Kolom dari migration-theme-palette.sql; null bila migrasi belum jalan. */
  theme_palette: { name: string; indigo: string; apricot: string; olive: string } | null;
  /** Kolom dari add-auto-login-setting.sql; null bila migrasi belum jalan. */
  auto_login_enabled: boolean | null;
}

/** Jenis pengajuan ketidakhadiran. */
export type LeaveType = "cuti" | "ijin" | "sakit";
/** Status alur persetujuan pengajuan: menunggu → disetujui/ditolak. */
export type LeaveStatus = "menunggu" | "disetujui" | "ditolak";

/** Baris tabel leave_requests — pengajuan cuti/ijin/sakit beserta status persetujuannya. */
export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  is_half_day: boolean;
  reason: string;
  attachment_url: string | null;
  status: LeaveStatus;
  pic_id: string | null;
  created_at: string;
}

/** Baris tabel audit_log — jejak aksi penting (persetujuan, koreksi, pengambilalihan keputusan). */
export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  old_value: unknown;
  new_value: unknown;
  reason: string | null;
  created_at: string;
}

/** Label tampil Bahasa Indonesia untuk setiap jenis pengajuan. */
export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  cuti: "Cuti",
  ijin: "Ijin",
  sakit: "Sakit",
};

/** Label tampil Bahasa Indonesia untuk setiap status pengajuan. */
export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

/**
 * Format tanggal ISO menjadi "12 Jan 2026" (id-ID); string tanggal saja
 * (YYYY-MM-DD) diperlakukan sebagai tengah malam lokal. Null → "—".
 */
export function formatTanggal(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format timestamp ISO menjadi tanggal + jam (id-ID). Null → "—".
 */
export function formatWaktu(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
