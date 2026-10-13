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
  const DEFAULT_PALETTE = {
    name: "Wada No. 211 — Indigo",
    indigo: "#051230",
    apricot: "#f68c50",
    olive: "#a6a159",
  };
  const PALETTES = [
    DEFAULT_PALETTE,
    { name: "Wada No. 144 — Signal", indigo: "#111314", apricot: "#f37420", olive: "#b73f74" },
    { name: "Terracotta", indigo: "#3d1d0e", apricot: "#c96f4a", olive: "#d9a441" },
    { name: "Hutan", indigo: "#12261c", apricot: "#6a9f7b", olive: "#c9a227" },
    { name: "Samudra", indigo: "#0b2545", apricot: "#2ca6a4", olive: "#e9c46a" },
    { name: "Anggrek", indigo: "#2d1b2e", apricot: "#9b5de5", olive: "#e0a458" },
  ];
  const [palette, setPalette] = useState(
    initial?.theme_palette ?? DEFAULT_PALETTE
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
    const palettePayload = { theme_palette: palette };

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

    /** true bila error menandakan kolom theme_palette belum ada. */
    function isMissingPaletteColumn(err: unknown): boolean {
      const msg = err instanceof Error ? err.message : String(err);
      return msg.includes("42703") || msg.includes("theme_palette");
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
        await saveRow({ ...payload, ...quotaPayload, ...palettePayload });
      } catch (quotaErr) {
        if (!isMissingQuotaColumn(quotaErr) && !isMissingPaletteColumn(quotaErr))
          throw quotaErr;
        // Kolom kuota/palet belum ada — simpan sisanya, beri petunjuk migrasi.
        const missing: string[] = [];
        if (isMissingQuotaColumn(quotaErr))
          missing.push("supabase/migration-quota-defaults.sql");
        if (isMissingPaletteColumn(quotaErr))
          missing.push("supabase/migration-theme-palette.sql");
        try {
          await saveRow(payload);
        } catch {
          /* abaikan */
        }
        setMessage({
          kind: "warning",
          text: `Pengaturan tersimpan, tetapi sebagian tidak tersimpan: jalankan ${missing.join(" dan ")} di SQL Editor Supabase, lalu simpan lagi.`,
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

      <div className="card">
        <h2>Palet Warna Aplikasi</h2>
        <p className="hint">
          Trio warna Sanzo Wada untuk aplikasi mobile: primer (header & hero),
          aksen (tombol & tab aktif), sekunder. Berlaku setelah aplikasi dibuka
          ulang.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          {PALETTES.map((p) => {
            const active =
              palette.indigo.toLowerCase() === p.indigo.toLowerCase() &&
              palette.apricot.toLowerCase() === p.apricot.toLowerCase() &&
              palette.olive.toLowerCase() === p.olive.toLowerCase();
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setPalette({ ...p })}
                style={{
                  border: active ? "2px solid #1c2733" : "1px solid #c9bfa3",
                  borderRadius: 6,
                  padding: 10,
                  background: "#fffdf4",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {[p.indigo, p.apricot, p.olive].map((c) => (
                    <span
                      key={c}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        background: c,
                        border: "1px solid #1c2733",
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                {active && (
                  <div style={{ fontSize: 12, color: "#16a34a" }}>
                    ✓ Terpilih
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="pal_indigo">Primer (header)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="pal_indigo"
                type="color"
                value={palette.indigo}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", indigo: e.target.value })
                }
                style={{ width: 44, height: 34, padding: 2 }}
              />
              <input
                type="text"
                value={palette.indigo}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", indigo: e.target.value })
                }
                placeholder="#051230"
                style={{ width: 90 }}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="pal_apricot">Aksen (tombol)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="pal_apricot"
                type="color"
                value={palette.apricot}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", apricot: e.target.value })
                }
                style={{ width: 44, height: 34, padding: 2 }}
              />
              <input
                type="text"
                value={palette.apricot}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", apricot: e.target.value })
                }
                placeholder="#f68c50"
                style={{ width: 90 }}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="pal_olive">Sekunder</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                id="pal_olive"
                type="color"
                value={palette.olive}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", olive: e.target.value })
                }
                style={{ width: 44, height: 34, padding: 2 }}
              />
              <input
                type="text"
                value={palette.olive}
                onChange={(e) =>
                  setPalette({ ...palette, name: "Kustom", olive: e.target.value })
                }
                placeholder="#a6a159"
                style={{ width: 90 }}
              />
            </div>
          </div>
        </div>
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
