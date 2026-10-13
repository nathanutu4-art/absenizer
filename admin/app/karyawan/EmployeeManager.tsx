"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Employee } from "@/lib/types";
import { formatTanggal } from "@/lib/types";

interface Props {
  employees: Employee[];
}

const EMPTY = {
  full_name: "",
  employee_no: "",
  email: "",
  position: "",
  birth_date: "",
  phone: "",
  join_date: new Date().toISOString().slice(0, 10),
  work_mode: "WFO" as "WFO" | "WFH",
  pic_id: "",
  user_id: "",
  is_hr: false,
  is_active: true,
};

export default function EmployeeManager({ employees }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setMessage(null);
    setShowForm(true);
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({
      full_name: emp.full_name,
      employee_no: emp.employee_no,
      email: emp.email,
      position: emp.position,
      birth_date: emp.birth_date ?? "",
      phone: emp.phone ?? "",
      join_date: emp.join_date,
      work_mode: emp.work_mode,
      pic_id: emp.pic_id ?? "",
      user_id: emp.user_id ?? "",
      is_hr: emp.is_hr,
      is_active: emp.is_active,
    });
    setMessage(null);
    setShowForm(true);
  }

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (!form.full_name.trim() || !form.employee_no.trim() || !form.email.trim()) {
      setMessage({
        kind: "error",
        text: "Nama, NIP, dan email wajib diisi.",
      });
      setSaving(false);
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      employee_no: form.employee_no.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      birth_date: form.birth_date || null,
      phone: form.phone.trim() || null,
      join_date: form.join_date,
      work_mode: form.work_mode,
      pic_id: form.pic_id || null,
      user_id: form.user_id.trim() || null,
      is_hr: form.is_hr,
      is_active: form.is_active,
    };

    try {
      const sb = getSupabase();
      if (editing) {
        const { error } = await sb
          .from("employees")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        setMessage({ kind: "ok", text: "Data karyawan diperbarui." });
      } else {
        // 1) Buat baris karyawan dulu.
        const { data: inserted, error: insErr } = await sb
          .from("employees")
          .insert(payload)
          .select("id")
          .single();
        if (insErr) throw insErr;

        // 2) Buatkan akun login dengan kata sandi default "secret123".
        //    Bila email sudah terdaftar di Authentication, pakai akun itu
        //    (tidak dibuat duplikat). signUp yang berhasil mengalihkan sesi
        //    ke user baru → admin perlu login kembali.
        let sessionSwitched = false;
        try {
          const { data: authData, error: authErr } = await sb.auth.signUp({
            email: payload.email,
            password: "secret123",
            options: { data: { full_name: payload.full_name } },
          });
          if (authErr) throw authErr;
          const identities = authData.user?.identities ?? [];
          if (authData.user?.id && identities.length > 0) {
            const { error: linkErr } = await sb
              .from("employees")
              .update({ user_id: authData.user.id })
              .eq("id", inserted.id);
            if (linkErr) throw linkErr;
          }
          if (authData.session) {
            await sb.auth.signOut();
            sessionSwitched = true;
          }
          setMessage({
            kind: "ok",
            text:
              identities.length > 0
                ? `Karyawan ditambahkan. Akun login: ${payload.email} / kata sandi "secret123".`
                : `Karyawan ditambahkan. Akun ${payload.email} sudah ada di Authentication — dipakai yang itu (kata sandi tidak diubah).`,
          });
        } catch (authE) {
          // Rollback: hapus baris karyawan bila akun gagal dibuat.
          await sb.from("employees").delete().eq("id", inserted.id);
          throw authE;
        }

        setShowForm(false);
        if (sessionSwitched) {
          // Sesi kini milik user baru → kembali ke halaman login.
          router.replace("/login");
          return;
        }
        router.refresh();
      }
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Gagal menyimpan data.",
      });
    } finally {
      setSaving(false);
    }
  }

  const picName = (id: string | null) =>
    employees.find((e) => e.id === id)?.full_name ?? "—";

  return (
    <>
      <div className="toolbar">
        <span>
          {employees.length} karyawan terdaftar
        </span>
        <button className="btn" onClick={openAdd}>
          + Tambah Karyawan
        </button>
      </div>

      {message && !showForm && (
        <div className={`notice ${message.kind === "ok" ? "ok" : "error"}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2>{editing ? "Ubah Karyawan" : "Tambah Karyawan"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>Nama lengkap *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </div>
              <div className="field">
                <label>NIP *</label>
                <input
                  type="text"
                  value={form.employee_no}
                  onChange={(e) => set("employee_no", e.target.value)}
                  placeholder="K-2024-0117"
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Email perusahaan *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Jabatan</label>
                <input
                  type="text"
                  value={form.position}
                  onChange={(e) => set("position", e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Tanggal lahir</label>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set("birth_date", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Telepon</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Tanggal bergabung</label>
                <input
                  type="date"
                  value={form.join_date}
                  onChange={(e) => set("join_date", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Mode kerja</label>
                <select
                  value={form.work_mode}
                  onChange={(e) =>
                    set("work_mode", e.target.value as "WFO" | "WFH")
                  }
                >
                  <option value="WFO">WFO</option>
                  <option value="WFH">WFH</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>PIC / atasan langsung</label>
              <select
                value={form.pic_id}
                onChange={(e) => set("pic_id", e.target.value)}
              >
                <option value="">— Tidak ada —</option>
                {employees
                  .filter((e) => !editing || e.id !== editing.id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.full_name} ({e.position})
                    </option>
                  ))}
              </select>
            </div>
            <div className="row">
              <div className="field check-row">
                <input
                  id="is_hr"
                  type="checkbox"
                  checked={form.is_hr}
                  onChange={(e) => set("is_hr", e.target.checked)}
                />
                <label htmlFor="is_hr">HR</label>
              </div>
              <div className="field check-row">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                />
                <label htmlFor="is_active">Aktif</label>
              </div>
            </div>
            {editing && (
              <div className="row">
                <div className="field">
                  <label>UID Auth (opsional)</label>
                  <input
                    type="text"
                    value={form.user_id}
                    onChange={(e) => set("user_id", e.target.value)}
                    placeholder="UID dari Authentication → Users"
                  />
                  <small className="hint">
                    Hubungkan manual ke akun yang sudah ada di Authentication.
                  </small>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`notice ${message.kind === "ok" ? "ok" : "error"}`}
              >
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="data">
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIP</th>
              <th>Jabatan</th>
              <th>Email</th>
              <th>PIC</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>
                  <strong>{e.full_name}</strong>
                  {e.is_hr && (
                    <>
                      {" "}
                      <span className="badge badge-blue">HR</span>
                    </>
                  )}
                  <br />
                  <span style={{ color: "#4d5a68", fontSize: "0.82rem" }}>
                    Lahir: {formatTanggal(e.birth_date)}
                  </span>
                </td>
                <td className="mono">{e.employee_no}</td>
                <td>{e.position}</td>
                <td className="mono">{e.email}</td>
                <td>{picName(e.pic_id)}</td>
                <td>
                  <span
                    className={`badge ${
                      e.is_active ? "badge-green" : "badge-gray"
                    }`}
                  >
                    {e.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem" }}
                    onClick={() => openEdit(e)}
                  >
                    Ubah
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={7}>Belum ada data karyawan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
