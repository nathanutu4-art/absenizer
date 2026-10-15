"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Login khusus HR. Non-HR langsung dikeluarkan. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sb = getSupabase();
      const { data, error: authErr } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authErr) throw authErr;
      const user = data.user;
      if (!user) throw new Error("Login gagal.");

      // Mode setup: tabel employees masih kosong → izinkan masuk untuk
      // mendaftarkan HR pertama.
      const { count } = await sb
        .from("employees")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) > 0) {
        let { data: emp } = await sb
          .from("employees")
          .select("is_hr")
          .eq("user_id", user.id)
          .maybeSingle();
        if (!emp && user.email) {
          const r = await sb
            .from("employees")
            .select("is_hr")
            .eq("email", user.email)
            .maybeSingle();
          emp = r.data;
        }
        if (!emp?.is_hr) {
          await sb.auth.signOut();
          throw new Error("Hanya karyawan dengan peran HR yang dapat membuka panel admin.");
        }
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="login-brand">
          Absenizer
        </div>
        <div className="login-sub">Panel Admin HR — Login</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@perusahaan.co.id"
              required
            />
          </div>
          <div className="field">
            <label>Kata sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="notice error">{error}</div>}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
