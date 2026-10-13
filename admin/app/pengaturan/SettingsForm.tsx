"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { CompanySettings } from "@/lib/types";

interface Props {
  initial: CompanySettings | null;
}

export default function SettingsForm({ initial }: Props) {
  const [officeName, setOfficeName] = useState(initial?.office_name ?? "");
  const [officeLat, setOfficeLat] = useState(
    initial ? String(initial.office_lat) : ""
  );
  const [officeLng, setOfficeLng] = useState(
    initial ? String(initial.office_lng) : ""
  );
  const [radius, setRadius] = useState(
    initial ? String(initial.geofence_radius_m) : "1000"
  );
  const [workStart, setWorkStart] = useState(
    (initial?.work_start ?? "08:00").slice(0, 5)
  );
  const [workEnd, setWorkEnd] = useState(
    (initial?.work_end ?? "17:00").slice(0, 5)
  );
  const [workHours, setWorkHours] = useState(
    initial ? String(initial.work_hours_per_day) : "8"
  );
  const [tolerance, setTolerance] = useState(
    initial ? String(initial.late_tolerance_min) : "15"
  );
  const [cutiQuota, setCutiQuota] = useState(
    initial?.cuti_quota_default != null ? String(initial.cuti_quota_default) : "12"
  );
  const [ijinQuota, setIjinQuota] = useState(
    initial?.ijin_quota_default != null ? String(initial.ijin_quota_default) : "12"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "ok" | "error" | "warning";
    text: string;
  } | null>(null);

  const mapsUrl =
    officeLat && officeLng
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          `${officeLat},${officeLng}`
        )}`
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      office_name: officeName.trim(),
      office_lat: Number(officeLat),
      office_lng: Number(officeLng),
      geofence_radius_m: Number(radius),
      work_start: workStart,
      work_end: workEnd,
      work_hours_per_day: Number(workHours),
      late_tolerance_min: Number(tolerance),
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const quotaPayload = {
      cuti_quota_default: Number(cutiQuota),
      ijin_quota_default: Number(ijinQuota),
    };

    if (
      !payload.office_name ||
      Number.isNaN(payload.office_lat) ||
      Number.isNaN(payload.office_lng)
    ) {
      setMessage({
        kind: "error",
        text: "Nama kantor, latitude, dan longitude wajib diisi dengan benar.",
      });
      setSaving(false);
      return;
    }
    if (
      !Number.isInteger(quotaPayload.cuti_quota_default) ||
      quotaPayload.cuti_quota_default < 0 ||
      !Number.isInteger(quotaPayload.ijin_quota_default) ||
      quotaPayload.ijin_quota_default < 0
    ) {
      setMessage({
        kind: "error",
        text: "Kuota cuti/ijin harus bilangan bulat ≥ 0.",
      });
      setSaving(false);
      return;
    }

    /** true bila error menandakan kolom kuota belum ada (migrasi belum jalan). */
    function isMissingQuotaColumn(err: unknown): boolean {
      const msg = err instanceof Error ? err.message : String(err);
      return (
        msg.includes("42703") ||
        msg.includes("cuti_quota_default") ||
        msg.includes("ijin_quota_default")
      );
    }

    async function saveRow(row: Record<string, unknown>) {
      const sb = getSupabase();
      if (initial) {
        const { error } = await sb
          .from("company_settings")
          .update(row)
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("company_settings").insert(row);
        if (error) throw error;
      }
    }

    try {
      try {
        await saveRow({ ...payload, ...quotaPayload });
      } catch (quotaErr) {
        if (!isMissingQuotaColumn(quotaErr)) throw quotaErr;
        // Kolom kuota belum ada — simpan sisanya, beri petunjuk migrasi.
        await saveRow(payload);
        setMessage({
          kind: "warning",
          text: "Pengaturan tersimpan, tetapi kuota cuti/ijin tidak tersimpan: jalankan supabase/migration-quota-defaults.sql di SQL Editor Supabase, lalu simpan lagi.",
        });
        return;
      }
      setMessage({ kind: "ok", text: "Pengaturan berhasil disimpan." });
    } catch (err) {
      setMessage({
        kind: "error",
        text:
          err instanceof Error ? err.message : "Gagal menyimpan pengaturan.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h2>Titik Kantor</h2>
        <div className="field">
          <label htmlFor="office_name">Nama kantor</label>
          <input
            id="office_name"
            type="text"
            value={officeName}
            onChange={(e) => setOfficeName(e.target.value)}
            placeholder="Kantor Pusat — Kendari"
          />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="office_lat">Latitude</label>
            <input
              id="office_lat"
              type="number"
              step="any"
              value={officeLat}
              onChange={(e) => setOfficeLat(e.target.value)}
              placeholder="-3.9984"
            />
          </div>
          <div className="field">
            <label htmlFor="office_lng">Longitude</label>
            <input
              id="office_lng"
              type="number"
              step="any"
              value={officeLng}
              onChange={(e) => setOfficeLng(e.target.value)}
              placeholder="122.5187"
            />
          </div>
        </div>
        <p className="hint">
          Ambil koordinat dari Google Maps (klik kanan titik → salin koordinat).
          {mapsUrl && (
            <>
              {" "}
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                Buka titik ini di Google Maps
              </a>
            </>
          )}
        </p>
        <div className="field">
          <label htmlFor="radius">Radius geofence (meter)</label>
          <input
            id="radius"
            type="number"
            min={1}
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
          <p className="hint">
            Karyawan di luar radius ini tetap bisa clock-in, tetapi diberi
            penanda “Di Luar Area”.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Jam Kerja</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="work_start">Jam mulai</label>
            <input
              id="work_start"
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="work_end">Jam selesai</label>
            <input
              id="work_end"
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="work_hours">Jam kerja per hari</label>
            <input
              id="work_hours"
              type="number"
              min={1}
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tolerance">Toleransi keterlambatan (menit)</label>
            <input
              id="tolerance"
              type="number"
              min={0}
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Kuota Cuti & Ijin</h2>
        <div className="row">
          <div className="field">
            <label htmlFor="cuti_quota">Kuota cuti default (hari/tahun)</label>
            <input
              id="cuti_quota"
              type="number"
              min={0}
              step={1}
              value={cutiQuota}
              onChange={(e) => setCutiQuota(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ijin_quota">Kuota ijin default (kali/tahun)</label>
            <input
              id="ijin_quota"
              type="number"
              min={0}
              step={1}
              value={ijinQuota}
              onChange={(e) => setIjinQuota(e.target.value)}
            />
          </div>
        </div>
        <p className="hint">
          Dipakai sebagai kuota awal karyawan baru di aplikasi. Sakit tidak
          mengurangi kuota.
        </p>
      </div>

      {message && (
        <div
          className={`notice ${
            message.kind === "ok"
              ? "ok"
              : message.kind === "warning"
                ? "warning"
                : "error"
          }`}
        >
          {message.text}
        </div>
      )}

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Menyimpan…" : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
