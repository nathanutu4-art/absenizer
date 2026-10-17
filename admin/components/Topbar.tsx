"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/** Topbar ala dashboard modern: notifikasi pengajuan, avatar pengguna. */
export default function Topbar() {
  const [pending, setPending] = useState<number | null>(null);
  const [initial, setInitial] = useState("A");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = getSupabase();
        const {
          data: { session },
        } = await sb.auth.getSession();
        if (!alive) return;
        const email = session?.user?.email ?? "";
        if (email) setInitial(email.trim().charAt(0).toUpperCase());
        const { count } = await sb
          .from("leave_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "menunggu");
        if (alive && typeof count === "number") setPending(count);
      } catch {
        // best-effort: topbar tetap tampil tanpa badge
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-icons">
        <span className="topbar-icon" title="Pengajuan menunggu">
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {pending != null && pending > 0 && (
            <span className="icon-badge">{pending > 99 ? "99+" : pending}</span>
          )}
        </span>
        <span className="topbar-user" title="Akun">
          <span className="avatar-circle">{initial}</span>
          <svg viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
    </header>
  );
}
