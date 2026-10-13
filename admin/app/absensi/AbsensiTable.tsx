"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { formatTanggal } from "@/lib/types";

export interface EmployeeStat {
  employee_id: string;
  full_name: string;
  employee_no: string;
  hadir: number;
  ijin: number;
  cuti: number;
  sakit: number;
}

export interface AttendanceRow {
  employee_id: string;
  date: string;
  clock_in_at: string | null;
  clock_out_at: string | null;
  is_late: boolean;
  clock_in_selfie_url: string | null;
  clock_in_lat: number | null;
  clock_in_lng: number | null;
  clock_out_lat: number | null;
  clock_out_lng: number | null;
}

export interface LeaveRow {
  employee_id: string;
  type: "cuti" | "ijin" | "sakit";
  start_date: string;
  end_date: string;
  reason: string;
}

interface Props {
  month: string;
  stats: EmployeeStat[];
  attendance: Record<string, AttendanceRow[]>;
  leaves: Record<string, LeaveRow[]>;
}

const TYPE_LABEL: Record<LeaveRow["type"], string> = {
  cuti: "Cuti",
  ijin: "Ijin",
  sakit: "Sakit",
};

function jam(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapsUrl(lat: number | null, lng: number | null): string | null {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Thumbnail selfie dari bucket privat via signed URL. */
function SelfieThumb({ path }: { path: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    getSupabase()
      .storage.from("selfies")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (alive && data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => {
      alive = false;
    };
  }, [path]);
  if (!path) return <span className="muted">Tidak ada foto</span>;
  if (!url) return <span className="muted">Memuat…</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Selfie absensi" className="selfie-thumb" />
    </a>
  );
}

export default function AbsensiTable({ month, stats, attendance, leaves }: Props) {
  const router = useRouter();
  const [detailId, setDetailId] = useState<string | null>(null);

  const detail = detailId ? stats.find((s) => s.employee_id === detailId) : null;
  const attRows = detailId ? (attendance[detailId] ?? []) : [];
  const leaveRows = detailId ? (leaves[detailId] ?? []) : [];

  return (
    <>
      <div className="toolbar">
        <span>
          {stats.length} karyawan · {stats.reduce((n, s) => n + s.hadir, 0)}{" "}
          kehadiran
        </span>
        <label className="month-picker">
          Bulan{" "}
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) router.push(`/absensi?month=${e.target.value}`);
            }}
          />
        </label>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIP</th>
              <th className="num">Hadir</th>
              <th className="num">Ijin</th>
              <th className="num">Cuti</th>
              <th className="num">Sakit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.employee_id}>
                <td>{s.full_name}</td>
                <td className="mono">{s.employee_no}</td>
                <td className="num">{s.hadir}</td>
                <td className="num">{s.ijin}</td>
                <td className="num">{s.cuti}</td>
                <td className="num">{s.sakit}</td>
                <td>
                  <button
                    className="btn small"
                    onClick={() => setDetailId(s.employee_id)}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">
                  Belum ada karyawan aktif.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="modal-backdrop" onClick={() => setDetailId(null)}>
          <div
            className="card modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-head">
              <div>
                <h2>{detail.full_name}</h2>
                <p className="muted">
                  {detail.employee_no} · {attRows.length} kehadiran bulan ini
                </p>
              </div>
              <button className="btn small" onClick={() => setDetailId(null)}>
                Tutup
              </button>
            </div>

            {attRows.length === 0 && leaveRows.length === 0 && (
              <p className="muted">Belum ada catatan bulan ini.</p>
            )}

            {attRows.length > 0 && (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Selfie</th>
                      <th>Lokasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attRows.map((a, i) => {
                      const loc = mapsUrl(a.clock_in_lat, a.clock_in_lng);
                      return (
                        <tr key={`${a.date}-${i}`}>
                          <td>
                            {formatTanggal(a.date)}
                            {a.is_late && (
                              <span className="stamp late">Terlambat</span>
                            )}
                          </td>
                          <td className="mono">{jam(a.clock_in_at)}</td>
                          <td className="mono">{jam(a.clock_out_at)}</td>
                          <td>
                            <SelfieThumb path={a.clock_in_selfie_url} />
                          </td>
                          <td>
                            {loc ? (
                              <a
                                href={loc}
                                target="_blank"
                                rel="noreferrer"
                                className="mono"
                              >
                                {a.clock_in_lat?.toFixed(5)},{" "}
                                {a.clock_in_lng?.toFixed(5)}
                              </a>
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {leaveRows.length > 0 && (
              <>
                <h3>Pengajuan disetujui</h3>
                <ul className="leave-list">
                  {leaveRows.map((l, i) => (
                    <li key={i}>
                      <strong>{TYPE_LABEL[l.type]}</strong>:{" "}
                      {formatTanggal(l.start_date)}
                      {l.end_date !== l.start_date &&
                        ` → ${formatTanggal(l.end_date)}`}
                      <span className="muted"> · {l.reason}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
