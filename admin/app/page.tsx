import Link from "next/link";
import { getSupabase, todayJakarta } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Ambil tiga angka ringkasan dashboard secara paralel: total karyawan aktif,
 * jumlah clock-in hari ini (Asia/Jakarta), dan pengajuan berstatus menunggu.
 * Melempar Error bila salah satu query gagal.
 */
async function getStats() {
  const sb = getSupabase();
  const today = todayJakarta();

  const [empRes, attRes, reqRes] = await Promise.all([
    sb
      .from("employees")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    sb
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("date", today),
    sb
      .from("leave_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "menunggu"),
  ]);

  for (const r of [empRes, attRes, reqRes]) {
    if (r.error) throw new Error(r.error.message);
  }

  return {
    totalKaryawan: empRes.count ?? 0,
    clockInHariIni: attRes.count ?? 0,
    pengajuanMenunggu: reqRes.count ?? 0,
    today,
  };
}

/**
 * Halaman Dashboard (Server Component, selalu dinamis): kartu statistik
 * hari ini + tautan aksi cepat; kegagalan koneksi ditampilkan sebagai notice.
 */
export default async function DashboardPage() {
  let stats: Awaited<ReturnType<typeof getStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await getStats();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>Ringkasan kehadiran hari ini.</p>
      </div>

      {error && (
        <div className="notice error">
          Tidak dapat terhubung ke Supabase: {error} Periksa <span className="mono">.env.local</span>.
        </div>
      )}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="label">Total Karyawan</div>
            <div className="value">{stats.totalKaryawan}</div>
          </div>
          <div className="stat-card">
            <div className="label">Clock-in Hari Ini</div>
            <div className="value">{stats.clockInHariIni}</div>
          </div>
          <div className="stat-card">
            <div className="label">Pengajuan Menunggu</div>
            <div className="value">{stats.pengajuanMenunggu}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Aksi Cepat</h2>
        <p>
          <Link href="/pengajuan">Tinjau pengajuan cuti/ijin/sakit</Link>
          {" · "}
          <Link href="/karyawan">Kelola data karyawan</Link>
          {" · "}
          <Link href="/pengaturan">Ubah titik kantor &amp; jam kerja</Link>
        </p>
      </div>
    </>
  );
}
