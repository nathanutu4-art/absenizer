"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { LeaveStatus } from "@/lib/types";

interface Props {
  requestId: string;
  status: LeaveStatus;
  hrEmployeeId: string | null;
  hrName: string | null;
}

/**
 * Tombol Setujui / Tolak untuk satu pengajuan.
 * Keputusan dicatat di tabel approvals (decided_by = karyawan HR yang login,
 * taken_over_by_hr = true) + jejak di audit_log. Penolakan wajib ada catatan.
 */
export default function RequestActions({
  requestId,
  status,
  hrEmployeeId,
  hrName,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);

  if (status !== "menunggu") {
    return <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Selesai</span>;
  }

  /** Jumlah hari kalender dari start s.d. end (inklusif). */
  function dayCount(startISO: string, endISO: string): number {
    const toUTC = (s: string) => {
      const [y, m, d] = s.split("-").map(Number);
      return Date.UTC(y, m - 1, d);
    };
    return Math.max(1, Math.round((toUTC(endISO) - toUTC(startISO)) / 86400000) + 1);
  }

  /**
   * Kurangi kuota cuti/ijin karyawan di leave_balances untuk tahun pengajuan.
   * Sakit tidak menyentuh kuota. Idempoten: bila sudah ada >1 approval untuk
   * request ini, pengurangan dilewati (cegah potong ganda saat retry).
   * Gagal di sini tidak menggagalkan persetujuan.
   */
  async function applyLeaveBalance(
    sb: ReturnType<typeof getSupabase>,
    leaveRequestId: string
  ): Promise<void> {
    // Cek idempotency: approval barusan + yang lama = sudah pernah diproses.
    const { count: apprCount, error: countErr } = await sb
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("leave_request_id", leaveRequestId);
    if (countErr) throw countErr;
    if ((apprCount ?? 0) > 1) return;

    const { data: req, error: reqErr } = await sb
      .from("leave_requests")
      .select("employee_id, type, start_date, end_date")
      .eq("id", leaveRequestId)
      .maybeSingle();
    if (reqErr) throw reqErr;
    if (!req || req.type === "sakit") return;

    const year = Number(String(req.start_date).slice(0, 4));
    const days = dayCount(req.start_date, req.end_date); // ijin setengah hari tetap 1

    // Kuota default dari pengaturan perusahaan (fallback 12 bila kolom belum ada).
    let cutiQuota = 12;
    let ijinQuota = 12;
    try {
      const { data: settings, error: setErr } = await sb
        .from("company_settings")
        .select("cuti_quota_default, ijin_quota_default")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (setErr) throw setErr;
      if (settings?.cuti_quota_default != null) cutiQuota = settings.cuti_quota_default;
      if (settings?.ijin_quota_default != null) ijinQuota = settings.ijin_quota_default;
    } catch {
      // Kolom kuota belum ada (migrasi belum jalan) — pakai 12/12.
    }

    const { data: bal, error: balErr } = await sb
      .from("leave_balances")
      .select("id, cuti_used, ijin_used")
      .eq("employee_id", req.employee_id)
      .eq("year", year)
      .maybeSingle();
    if (balErr) throw balErr;

    if (!bal) {
      const { error: insErr } = await sb.from("leave_balances").insert({
        employee_id: req.employee_id,
        year,
        cuti_quota: cutiQuota,
        cuti_used: req.type === "cuti" ? days : 0,
        ijin_quota: ijinQuota,
        ijin_used: req.type === "ijin" ? days : 0,
      });
      if (insErr) throw insErr;
    } else {
      const field = req.type === "cuti" ? "cuti_used" : "ijin_used";
      const { error: updErr } = await sb
        .from("leave_balances")
        .update({ [field]: (bal[field] ?? 0) + days })
        .eq("id", bal.id);
      if (updErr) throw updErr;
    }
  }

  /**
   * Fallback bila RPC decide_leave_request belum dibuat di database:
   * 3 write berurutan dengan guard status. Tidak setransaksional RPC.
   */
  async function decideFallback(
    sb: ReturnType<typeof getSupabase>,
    decision: "disetujui" | "ditolak",
    rejectNote: string,
  ): Promise<void> {
    const { data: updated, error: updErr } = await sb
      .from("leave_requests")
      .update({ status: decision })
      .eq("id", requestId)
      .eq("status", "menunggu")
      .select("id");
    if (updErr) throw updErr;
    if (!updated || updated.length === 0) {
      throw new Error("Pengajuan ini sudah diproses sebelumnya.");
    }
    const { error: apprErr } = await sb.from("approvals").insert({
      leave_request_id: requestId,
      decided_by: hrEmployeeId,
      decision,
      note: decision === "ditolak" ? rejectNote.trim() : null,
      taken_over_by_hr: true,
      takeover_reason: "Diputuskan via panel admin (HR)",
    });
    if (apprErr) throw apprErr;
    const { error: auditErr } = await sb.from("audit_log").insert({
      actor_id: hrEmployeeId,
      action: decision === "disetujui" ? "approve_pengajuan" : "reject_pengajuan",
      entity: "leave_requests",
      entity_id: requestId,
      old_value: { status: "menunggu" },
      new_value: { status: decision },
      reason: decision === "ditolak" ? rejectNote.trim() : "Disetujui via panel admin",
    });
    if (auditErr) throw auditErr;
  }

  /**
   * Eksekusi keputusan: utamakan RPC decide_leave_request (satu transaksi:
   * update status + approvals + audit_log); fallback ke decideFallback bila
   * function belum ada di DB. Persetujuan cuti/ijin dilanjutkan dengan
   * pemotongan kuota (applyLeaveBalance) — kegagalannya hanya peringatan.
   */
  async function decide(decision: "disetujui" | "ditolak", rejectNote: string) {
    if (!hrEmployeeId) {
      setError("Tidak ada karyawan HR untuk mencatat keputusan.");
      return;
    }
    if (decision === "ditolak" && !rejectNote.trim()) {
      setError("Penolakan wajib disertai catatan.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const sb = getSupabase();

      // Satu transaksi via RPC: update status (guard "menunggu") + insert
      // approvals + insert audit_log. RPC: supabase/decide-request.sql.
      // Fallback ke 3 write berurutan bila function belum ada di DB.
      const rpcRes = await sb.rpc("decide_leave_request", {
        p_request_id: requestId,
        p_decision: decision,
        p_hr_employee_id: hrEmployeeId,
        p_note: decision === "ditolak" ? rejectNote.trim() : null,
      });
      if (rpcRes.error) {
        if (/sudah diproses|tidak ditemukan/i.test(rpcRes.error.message)) {
          setError("Pengajuan ini sudah diproses sebelumnya.");
          return;
        }
        if (/function.*does not exist|not found/i.test(rpcRes.error.message)) {
          await decideFallback(sb, decision, rejectNote);
        } else {
          throw rpcRes.error;
        }
      }

      // Persetujuan cuti/ijin mengurangi kuota — gagal di sini hanya peringatan.
      if (decision === "disetujui") {
        try {
          await applyLeaveBalance(sb, requestId);
        } catch (balErr) {
          setWarn(
            `Pengajuan disetujui, tetapi kuota gagal diperbarui: ${
              balErr instanceof Error ? balErr.message : "kesalahan tak dikenal"
            }`
          );
        }
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan keputusan."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {!rejecting ? (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            className="btn btn-approve"
            disabled={busy || !hrEmployeeId}
            onClick={() => decide("disetujui", "")}
            title={hrName ? `Dicatat atas nama ${hrName}` : undefined}
          >
            Setujui
          </button>
          <button
            className="btn btn-reject"
            disabled={busy || !hrEmployeeId}
            onClick={() => {
              setRejecting(true);
              setError(null);
            }}
          >
            Tolak
          </button>
        </div>
      ) : (
        <div style={{ minWidth: 220 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan penolakan (wajib)"
            rows={2}
            style={{ width: "100%", marginBottom: "0.4rem" }}
          />
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              className="btn btn-reject"
              disabled={busy}
              onClick={() => decide("ditolak", note)}
            >
              {busy ? "…" : "Konfirmasi"}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
              disabled={busy}
              onClick={() => {
                setRejecting(false);
                setNote("");
                setError(null);
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
      {error && (
        <div style={{ color: "var(--red-ink)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
          {error}
        </div>
      )}
      {warn && (
        <div style={{ color: "var(--accent-ink)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
          {warn}
        </div>
      )}
    </div>
  );
}
