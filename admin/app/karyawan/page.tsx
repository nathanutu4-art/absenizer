import { getSupabase } from "@/lib/supabase";
import type { Employee } from "@/lib/types";
import EmployeeManager from "./EmployeeManager";

export const dynamic = "force-dynamic";

/**
 * Ambil semua karyawan (termasuk nonaktif) terurut nama dari tabel employees.
 * Melempar Error bila query gagal.
 */
async function getEmployees(): Promise<Employee[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("employees")
    .select("*")
    .order("full_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Halaman Karyawan (Server Component): memuat daftar karyawan lalu
 * menyerahkannya ke EmployeeManager (client) untuk tambah/ubah data.
 */
export default async function KaryawanPage() {
  let employees: Employee[] = [];
  let error: string | null = null;
  try {
    employees = await getEmployees();
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data.";
  }

  return (
    <>
      <div className="page-head">
        <h1>Karyawan</h1>
        <p>Kelola data karyawan perusahaan.</p>
      </div>

      <div className="notice">
        <strong>Akun login otomatis:</strong> setiap karyawan baru langsung
        dibuatkan akun login dengan kata sandi acak yang kuat — kata sandi
        hanya ditampilkan sekali setelah karyawan ditambahkan, catat dan
        sampaikan ke karyawan. Setelah menambah karyawan, Anda akan keluar dan
        perlu login kembali sebagai HR.
      </div>

      {error && (
        <div className="notice error">
          Tidak dapat terhubung ke Supabase: {error}
        </div>
      )}

      {!error && <EmployeeManager employees={employees} />}
    </>
  );
}
