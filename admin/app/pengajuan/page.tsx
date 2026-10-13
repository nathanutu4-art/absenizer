import { getSupabase } from "@/lib/supabase";
import type { Employee, LeaveRequest } from "@/lib/types";
import RequestActions from "./RequestActions";
import {
  LEAVE_STATUS_LABEL,
  LEAVE_TYPE_LABEL,
  formatTanggal,
  formatWaktu,
} from "@/lib/types";

export const dynamic = "force-dynamic";

async function getData() {
  const sb = getSupabase();
  const [reqRes, empRes] = await Promise.all([
    sb
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    sb.from("employees").select("id, full_name, is_hr"),
  ]);
  if (reqRes.error) throw new Error(reqRes.error.message);
  if (empRes.error) throw new Error(empRes.error.message);

  const requests = (reqRes.data ?? []) as LeaveRequest[];
  const employees = (empRes.data ?? []) as Pick<
    Employee,
    "id" | "full_name" | "is_hr"
  >[];
  const nameById = new Map(employees.map((e) => [e.id, e.full_name]));
  const hrEmployee = employees.find((e) => e.is_hr) ?? null;

  return { requests, nameById, hrEmployee };
}

const STATUS_BADGE: Record<string, string> = {
  menunggu: "badge-yellow",
  disetujui: "badge-green",
  ditolak: "badge-red",
};

const TYPE_BADGE: Record<string, string> = {
  cuti: "badge-blue",
  ijin: "badge-yellow",
  sakit: "badge-red",
};

export default async function PengajuanPage() {
  let data: Awaited<ReturnType<typeof getData>> | null = null;
  let error: string | null = null;
  try {
    data = await getData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <>
      <div className="page-head">
        <h1>Pengajuan</h1>
        <p>Setujui atau tolak pengajuan cuti, ijin, dan sakit.</p>
      </div>

      {error && (
        <div className="notice error">
          Tidak dapat terhubung ke Supabase: {error}
        </div>
      )}

      {data && !data.hrEmployee && (
        <div className="notice">
          Belum ada karyawan bertanda HR. Persetujuan membutuhkan satu akun HR —
          buat/ubah di halaman <a href="/karyawan">Karyawan</a> terlebih dahulu.
        </div>
      )}

      {data && (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Jenis</th>
                <th>Periode</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Diajukan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {data!.nameById.get(r.employee_id) ?? "—"}
                    </strong>
                  </td>
                  <td>
                    <span className={`badge ${TYPE_BADGE[r.type]}`}>
                      {LEAVE_TYPE_LABEL[r.type]}
                    </span>
                    {r.is_half_day && (
                      <>
                        {" "}
                        <span className="badge badge-gray">½ hari</span>
                      </>
                    )}
                  </td>
                  <td>
                    {formatTanggal(r.start_date)}
                    {r.end_date !== r.start_date &&
                      ` → ${formatTanggal(r.end_date)}`}
                  </td>
                  <td style={{ maxWidth: 260 }}>{r.reason}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>
                      {LEAVE_STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatWaktu(r.created_at)}
                  </td>
                  <td>
                    <RequestActions
                      requestId={r.id}
                      status={r.status}
                      hrEmployeeId={data!.hrEmployee?.id ?? null}
                      hrName={data!.hrEmployee?.full_name ?? null}
                    />
                  </td>
                </tr>
              ))}
              {data.requests.length === 0 && (
                <tr>
                  <td colSpan={7}>Belum ada pengajuan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
