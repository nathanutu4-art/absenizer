"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

type State = "checking" | "ok" | "denied";

/**
 * Kerangka + penjaga akses: semua halaman (kecuali /login) hanya bisa dibuka
 * oleh sesi login karyawan dengan is_hr = true. Mode setup: bila tabel
 * employees kosong, sesi login mana pun diizinkan agar HR pertama bisa
 * didaftarkan.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    if (pathname === "/login") {
      setState("ok");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const sb = getSupabase();
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (!alive) return;
        if (!session?.user) {
          window.location.replace("/login");
          return;
        }
        const { count } = await sb
          .from("employees")
          .select("id", { count: "exact", head: true });
        if (!alive) return;
        if ((count ?? 0) > 0) {
          let { data: emp } = await sb
            .from("employees")
            .select("is_hr")
            .eq("user_id", session.user.id)
            .maybeSingle();
          if (!emp && session.user.email) {
            const r = await sb
              .from("employees")
              .select("is_hr")
              .eq("email", session.user.email)
              .maybeSingle();
            emp = r.data;
          }
          if (!emp?.is_hr) {
            await sb.auth.signOut();
            if (alive) setState("denied");
            return;
          }
        }
        if (alive) setState("ok");
      } catch {
        if (alive) setState("denied");
      }
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (pathname === "/login") return <>{children}</>;
  if (state === "checking") {
    return (
      <div className="page-head">
        <p>Memeriksa akses…</p>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="page-head">
        <h1>Akses ditolak</h1>
        <p>Hanya karyawan dengan peran HR yang dapat membuka panel admin.</p>
        <p>
          <a href="/login">Kembali ke halaman login</a>
        </p>
      </div>
    );
  }
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
}
