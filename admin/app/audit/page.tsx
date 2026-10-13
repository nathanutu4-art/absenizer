import { getSupabase } from "@/lib/supabase";
import type { AuditLog, Employee } from "@/lib/types";
import { formatWaktu } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getLogs() {
  const sb = getSupabase();
  const [logRes, empRes] = await Promise.all([
    sb
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    sb.from("employees").select("id, full_name"),
  ]);
  if (logRes.error) throw new Error(logRes.error.message);
  if (empRes.error) throw new Error(empRes.error.message);

  const logs = (logRes.data ?? []) as AuditLog[];
  const nameById = new Map(
    ((empRes.data ?? []) as Pick<Employee, "id" | "full_name">[]).map((e) => [
      e.id,
      e.full_name,
    ])
  );
  return { logs, nameById };
}

function shortJson(value: unknown): string {
  if (value === null || value === undefined) return "—";
  const s = JSON.stringify(value);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

export default async function AuditPage() {
  let data: Awaited<ReturnType<typeof getLogs>> | null = null;
  let error: string | null = null;
  try {
    data = await getLogs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <>
      <div className="page-head">
        <h1>Audit Log</h1>
        <p>Jejak koreksi &amp; pengambilalihan keputusan (100 terbaru, baca-saja).</p>
      </div>

      {error && (
        <div className="notice error">
          Tidak dapat terhubung ke Supabase: {error}
        </div>
      )}

      {data && (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pelaku</th>
                <th>Aksi</th>
                <th>Entitas</th>
                <th>Perubahan</th>
                <th>Alasan</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatWaktu(l.created_at)}
                  </td>
                  <td>{(l.actor_id && data!.nameById.get(l.actor_id)) ?? "—"}</td>
                  <td>
                    <span className="badge badge-gray">{l.action}</span>
                  </td>
                  <td>
                    <span className="mono">{l.entity}</span>
                    {l.entity_id && (
                      <>
                        <br />
                        <span className="mono" style={{ color: "var(--muted)" }}>
                          {l.entity_id.slice(0, 8)}…
                        </span>
                      </>
                    )}
                  </td>
                  <td className="mono">
                    {shortJson(l.old_value)} → {shortJson(l.new_value)}
                  </td>
                  <td style={{ maxWidth: 220 }}>{l.reason ?? "—"}</td>
                </tr>
              ))}
              {data.logs.length === 0 && (
                <tr>
                  <td colSpan={6}>Belum ada jejak audit.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
