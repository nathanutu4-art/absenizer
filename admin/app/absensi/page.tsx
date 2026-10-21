import { getSupabase, todayJakarta } from "@/lib/supabase";
import AbsensiTable, {
  type AttendanceRow,
  type EmployeeStat,
  type LeaveRow,
} from "./AbsensiTable";

export const dynamic = "force-dynamic";

/**
 * Hitung tanggal awal & akhir (YYYY-MM-DD) dari bulan "YYYY-MM" untuk
 * membatasi query rekap per bulan.
 */
function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

/**
 * Halaman Log Absensi (Server Component): mengambil karyawan aktif,
 * attendance, dan pengajuan disetujui pada bulan terpilih (?month=YYYY-MM,
 * default bulan berjalan), lalu mengagregasi hitungan hadir/ijin/cuti/sakit
 * per karyawan untuk dirender AbsensiTable.
 */
export default async function AbsensiPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = sp.month ?? "";
  const month = /^\d{4}-\d{2}$/.test(raw) ? raw : todayJakarta().slice(0, 7);
  const { start, end } = monthBounds(month);

  const sb = getSupabase();
  const [empRes, attRes, leaveRes] = await Promise.all([
    sb
      .from("employees")
      .select("id, full_name, employee_no")
      .eq("is_active", true)
      .order("full_name", { ascending: true }),
    sb
      .from("attendance")
      .select(
        "employee_id, date, clock_in_at, clock_out_at, is_late, clock_in_selfie_url, clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng"
      )
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false }),
    sb
      .from("leave_requests")
      .select("employee_id, type, start_date, end_date, reason")
      .eq("status", "disetujui")
      .lte("start_date", end)
      .gte("end_date", start),
  ]);

  const error =
    empRes.error?.message ?? attRes.error?.message ?? leaveRes.error?.message;

  const stats = new Map<string, EmployeeStat>();
  for (const e of empRes.data ?? []) {
    stats.set(e.id, {
      employee_id: e.id,
      full_name: e.full_name,
      employee_no: e.employee_no,
      hadir: 0,
      ijin: 0,
      cuti: 0,
      sakit: 0,
    });
  }

  const attByEmp = new Map<string, AttendanceRow[]>();
  for (const a of (attRes.data ?? []) as AttendanceRow[]) {
    const s = stats.get(a.employee_id);
    if (s) s.hadir += 1;
    const list = attByEmp.get(a.employee_id) ?? [];
    list.push(a);
    attByEmp.set(a.employee_id, list);
  }

  const leaveByEmp = new Map<string, LeaveRow[]>();
  for (const l of (leaveRes.data ?? []) as LeaveRow[]) {
    const s = stats.get(l.employee_id);
    if (s) {
      const sDate = l.start_date < start ? start : l.start_date;
      const eDate = l.end_date > end ? end : l.end_date;
      // Hitung hari dalam bulan berjalan.
      let d = sDate;
      while (d <= eDate) {
        if (l.type === "ijin") s.ijin += 1;
        else if (l.type === "cuti") s.cuti += 1;
        else if (l.type === "sakit") s.sakit += 1;
        const [yy, mm, dd] = d.split("-").map(Number);
        const next = new Date(yy, mm - 1, dd + 1);
        d = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
      }
    }
    const list = leaveByEmp.get(l.employee_id) ?? [];
    list.push(l);
    leaveByEmp.set(l.employee_id, list);
  }

  return (
    <>
      <div className="page-head">
        <h1>Log Absensi</h1>
        <p>Rekap kehadiran karyawan per bulan.</p>
      </div>

      {error && (
        <div className="notice error">Tidak dapat memuat data: {error}</div>
      )}

      {!error && (
        <AbsensiTable
          month={month}
          stats={[...stats.values()]}
          attendance={Object.fromEntries(attByEmp)}
          leaves={Object.fromEntries(leaveByEmp)}
        />
      )}
    </>
  );
}
