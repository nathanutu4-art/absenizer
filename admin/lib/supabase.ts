import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Client Supabase memakai anon key (NEXT_PUBLIC_*).
 * Dibuat malas (lazy) agar `next build` tidak gagal saat env belum diisi;
 * halaman-halaman menangkap error koneksi dan menampilkan pesan ramah.
 */
export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  cached = createClient(url, anonKey);
  return cached;
}

/** Tanggal hari ini (YYYY-MM-DD) dalam zona Asia/Jakarta. */
export function todayJakarta(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
