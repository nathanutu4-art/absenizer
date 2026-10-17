import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

let browserCached: SupabaseClient | null = null;

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return { url, anonKey };
}

/**
 * Client untuk Client Component — sesi disimpan di cookie (bukan localStorage)
 * agar middleware & Server Component bisa membaca sesi yang sama.
 * Dibuat malas (lazy) agar `next build` tidak gagal saat env belum diisi.
 */
export function getSupabase(): SupabaseClient {
  if (browserCached) return browserCached;
  const { url, anonKey } = env();
  browserCached = createBrowserClient(url, anonKey);
  return browserCached;
}

/**
 * Client untuk Server Component / Route Handler — membaca sesi dari cookie
 * request. WAJIB await (cookies() async di Next 15).
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const { url, anonKey } = env();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Dipanggil dari Server Component (read-only) — aman diabaikan.
        }
      },
    },
  });
}

/**
 * Ambil employee record milik user yang sedang login (server-side).
 * Dipakai untuk decided_by / actor_id agar jejak audit menunjuk orang yang benar.
 */
export async function getMyEmployee(
  sb: SupabaseClient,
): Promise<{ id: string; full_name: string } | null> {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;
  let { data: emp } = await sb
    .from("employees")
    .select("id, full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!emp && user.email) {
    const r = await sb
      .from("employees")
      .select("id, full_name")
      .eq("email", user.email)
      .maybeSingle();
    emp = r.data;
  }
  return emp ?? null;
}

/** Tanggal hari ini (YYYY-MM-DD) dalam zona Asia/Jakarta. */
export function todayJakarta(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
