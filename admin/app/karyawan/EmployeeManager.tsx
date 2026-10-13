"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import type { Employee } from "@/lib/types";
import { formatTanggal } from "@/lib/types";

interface Props {
  employees: Employee[];
}

/** Gambar dummy bila karyawan tidak mengunggah foto. */
const DUMMY_PHOTO = "/dummy-avatar.png";
/** Batas ukuran file foto. */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    kind: "ok" | "error" | "warning";
    text: string;
  } | null>(null);

  // Bersihkan object URL pratinjau saat tidak dipakai lagi.
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY);
    setPhotoFile(null);
    setPhotoPreview(null);
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
    setPhotoFile(null);
    setPhotoPreview(emp.photo_url ?? null);
    setMessage(null);
    setShowForm(true);
  }

  function set<K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_PHOTO_BYTES) {
      setMessage({ kind: "error", text: "Ukuran foto maksimal 5 MB." });
      e.target.value = "";
      return;
    }
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(f);
    setPhotoPreview(f ? URL.createObjectURL(f) : editing?.photo_url ?? null);
    setMessage(null);
  }

  /** True bila error berarti kolom photo_url belum ada (migrasi belum jalan). */
  function isMissingPhotoColumn(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;
    const e = err as { code?: string; message?: string };
    return e.code === "42703" || (e.message ?? "").includes("photo_url");
  }

  /**
   * Simpan baris karyawan; bila kolom photo_url belum ada di database,
   * ulangi tanpa kolom itu agar tidak gagal total.
   */
  async function saveEmployeeRow(
    sb: ReturnType<typeof getSupabase>,
    payload: Record<string, unknown>,
    editingId: string | null,
  ): Promise<{ error: unknown; id?: string }> {
    const withoutPhoto = { ...payload };
    delete withoutPhoto.photo_url;
    if (editingId) {
      const first = await sb.from("employees").update(payload).eq("id", editingId);
      if (first.error && isMissingPhotoColumn(first.error)) {
        const retry = await sb.from("employees").update(withoutPhoto).eq("id", editingId);
        return { error: retry.error };
      }
      return { error: first.error };
    }
    const first = await sb.from("employees").insert(payload).select("id").single();
    if (first.error && isMissingPhotoColumn(first.error)) {
      const retry = await sb.from("employees").insert(withoutPhoto).select("id").single();
      return { error: retry.error, id: retry.data?.id };
    }
    return { error: first.error, id: first.data?.id };
  }

  /**
   * Unggah foto ke bucket Storage "avatars" (publik).
   * Gagal upload TIDAK menggagalkan penyimpanan karyawan — dipakai dummy.
   */
  async function uploadPhoto(
    sb: ReturnType<typeof getSupabase>,
    file: File,
    employeeNo: string,
  ): Promise<{ url: string; warning: string | null }> {
    const rawExt = file.name.split(".").pop() ?? "";
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const safeNo = employeeNo.replace(/[^a-zA-Z0-9_-]/g, "_") || "karyawan";
    const path = `${safeNo}/${Date.now()}.${ext}`;
    try {
      const { error: upErr } = await sb.storage
        .from("avatars")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
      if (upErr) throw upErr;
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("URL publik tidak tersedia.");
      return { url: data.publicUrl, warning: null };
    } catch (e) {
      const reason = e instanceof Error ? e.message : "kesalahan tidak diketahui";
      return {
        url: DUMMY_PHOTO,
        warning: `Foto gagal diupload (${reason}); dipakai gambar dummy.`,
      };
    }
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

    const sb = getSupabase();

    // Selesaikan foto dulu: unggah bila ada file baru, dummy bila tidak ada,
    // pertahankan yang lama saat ubah tanpa file baru.
    let photoUrl: string | null;
    let photoWarning: string | null = null;
    if (photoFile) {
      const up = await uploadPhoto(sb, photoFile, form.employee_no.trim());
      photoUrl = up.url;
      photoWarning = up.warning;
    } else {
      photoUrl = editing ? editing.photo_url ?? null : DUMMY_PHOTO;
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
      photo_url: photoUrl,
      is_hr: form.is_hr,
      is_active: form.is_active,
    };

    const doneMsg = (base: string) =>
      photoWarning ? { kind: "warning" as const, text: `${base} ${photoWarning}` } : { kind: "ok" as const, text: base };

    try {
      if (editing) {
        const res = await saveEmployeeRow(sb, payload, editing.id);
        if (res.error) throw res.error;
        setMessage(doneMsg("Data karyawan diperbarui."));
      } else {
        // 1) Buat baris karyawan dulu.
        const saved = await saveEmployeeRow(sb, payload, null);
        if (saved.error) throw saved.error;
        const insertedId = saved.id;
        if (!insertedId) throw new Error("Gagal membuat data karyawan.");

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
              .eq("id", insertedId);
            if (linkErr) throw linkErr;
          }
          if (authData.session) {
            await sb.auth.signOut();
            sessionSwitched = true;
          }
          setMessage(
            identities.length > 0
              ? doneMsg(
                  `Karyawan ditambahkan. Akun login: ${payload.email} / kata sandi "secret123".`,
                )
              : doneMsg(
                  `Karyawan ditambahkan. Akun ${payload.email} sudah ada di Authentication — dipakai yang itu (kata sandi tidak diubah).`,
                ),
          );
        } catch (authE) {
          // Rollback: hapus baris karyawan bila akun gagal dibuat.
          await sb.from("employees").delete().eq("id", insertedId);
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
        <div className={`notice ${message.kind}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2>{editing ? "Ubah Karyawan" : "Tambah Karyawan"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="field">
                <label>Foto profil</label>
                <div className="photo-picker">
                  <img
                    src={photoPreview ?? DUMMY_PHOTO}
                    alt="Pratinjau foto profil"
                    className="photo-preview"
                  />
                  <div className="photo-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <small className="hint">
                      Opsional — bila kosong dipakai gambar dummy. Maksimal 5 MB.
                    </small>
                  </div>
                </div>
              </div>
            </div>
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
              <div className={`notice ${message.kind}`}>
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
