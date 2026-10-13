"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/pengaturan", label: "Pengaturan" },
  { href: "/karyawan", label: "Karyawan" },
  { href: "/pengajuan", label: "Pengajuan" },
  { href: "/audit", label: "Audit" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">Absenizer</div>
      <div className="brand-sub">Panel Admin HR</div>
      <nav>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Keluar
      </button>
    </aside>
  );
}
