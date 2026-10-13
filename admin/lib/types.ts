/** Tipe baris sesuai ~/workspace/absenizer/supabase/schema.sql */

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
  created_at: string;
}

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
}

export type LeaveType = "cuti" | "ijin" | "sakit";
export type LeaveStatus = "menunggu" | "disetujui" | "ditolak";

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

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  cuti: "Cuti",
  ijin: "Ijin",
  sakit: "Sakit",
};

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

export function formatTanggal(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
