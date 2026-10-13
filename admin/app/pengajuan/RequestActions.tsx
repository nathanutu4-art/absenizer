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
 * Keputusan dicatat di tabel approvals (decided_by = karyawan HR pertama,
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

  if (status !== "menunggu") {
    return <span style={{ color: "#4d5a68", fontSize: "0.85rem" }}>Selesai</span>;
  }

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

      const { error: updErr } = await sb
        .from("leave_requests")
        .update({ status: decision })
        .eq("id", requestId);
      if (updErr) throw updErr;

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
        reason:
          decision === "ditolak"
            ? rejectNote.trim()
            : "Disetujui via panel admin",
      });
      if (auditErr) throw auditErr;

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
        <div style={{ color: "#dc2626", fontSize: "0.82rem", marginTop: "0.35rem" }}>
          {error}
        </div>
      )}
    </div>
  );
}
