import { getSupabase } from "@/lib/supabase";
import type { CompanySettings } from "@/lib/types";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

/**
 * Ambil baris company_settings aktif terbaru (is_active, updated_at desc).
 * Mengembalikan null bila belum ada pengaturan.
 */
async function getSettings(): Promise<CompanySettings | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("company_settings")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Halaman Pengaturan (Server Component): memuat pengaturan perusahaan lalu
 * menyerahkannya ke SettingsForm (client) untuk diedit.
 */
export default async function PengaturanPage() {
  let settings: CompanySettings | null = null;
  let error: string | null = null;
  try {
    settings = await getSettings();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <>
      <div className="page-head">
        <h1>Pengaturan Perusahaan</h1>
        <p>Satu baris pengaturan aktif: titik kantor, geofence, jam kerja, dan kuota cuti/ijin.</p>
      </div>

      {error && (
        <div className="notice error">
          Tidak dapat terhubung ke Supabase: {error}
        </div>
      )}

      {!error && <SettingsForm initial={settings} />}
    </>
  );
}
