import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "Absenizer — Panel Admin",
  description: "Panel admin HR untuk aplikasi absensi Absenizer",
};

/**
 * Layout akar (Server Component): membungkus semua halaman dengan Shell
 * (penjaga akses + sidebar/topbar) dan metadata panel admin.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
