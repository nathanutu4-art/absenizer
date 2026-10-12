-- ============================================================================
-- Absenizer — skema PostgreSQL (Supabase)
-- Dibuat dari model data PRD v0.5 (Bab 8) + aturan bisnis BR-01..BR-36.
--
-- Cara pakai: jalankan seluruh file ini di Supabase SQL Editor
-- (atau: supabase db push bila memakai Supabase CLI dengan migrasi).
--
-- CATATAN RLS: semua tabel di-ENABLE RLS di bawah. Policy contoh
-- disertakan sebagai komentar — sesuaikan dengan model peran Anda
-- (karyawan hanya baris miliknya; PIC membaca pengajuan timnya;
-- HR membaca/menulis semua). Jangan jalankan di produksi tanpa policy nyata.
-- ============================================================================

-- --------------------------------------------------------------------------
-- employees — profil karyawan (1–1 dengan auth.users)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_no   TEXT UNIQUE NOT NULL,          -- nomor karyawan, mis. K-2024-0117
  full_name     TEXT NOT NULL,
  position      TEXT NOT NULL,                 -- jabatan
  birth_date    DATE,                          -- tanggal lahir
  email         TEXT UNIQUE NOT NULL,          -- email perusahaan (BR-31)
  phone         TEXT,
  join_date     DATE NOT NULL,                 -- untuk hitung lama bekerja
  work_mode     TEXT NOT NULL DEFAULT 'WFO'    -- 'WFO' | 'WFH' (BR-08)
                CHECK (work_mode IN ('WFO', 'WFH')),
  pic_id        UUID REFERENCES employees(id) ON DELETE SET NULL, -- PIC (BR-12)
  is_hr         BOOLEAN NOT NULL DEFAULT FALSE,
  is_top_boss   BOOLEAN NOT NULL DEFAULT FALSE, -- atasan teratas (BR-33)
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employees_pic ON employees(pic_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- --------------------------------------------------------------------------
-- company_settings — SATU pengaturan perusahaan (BR-28, Q-08)
-- Hanya satu baris aktif: 1 titik kantor (ditentukan HR), jam kerja, toleransi.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_name         TEXT NOT NULL,
  office_lat          DOUBLE PRECISION NOT NULL,
  office_lng          DOUBLE PRECISION NOT NULL,
  geofence_radius_m   INTEGER NOT NULL DEFAULT 1000,  -- BR-05
  work_start          TIME NOT NULL DEFAULT '08:00',  -- BR-27 (contoh default)
  work_end            TIME NOT NULL DEFAULT '17:00',
  work_hours_per_day  INTEGER NOT NULL DEFAULT 8,     -- BR-27
  late_tolerance_min  INTEGER NOT NULL DEFAULT 15,    -- BR-18
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- face_references — foto referensi wajah (BR-11; disetujui HR)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS face_references (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  photo_url   TEXT NOT NULL,                       -- path di Storage bucket privat
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_face_refs_employee ON face_references(employee_id);

-- --------------------------------------------------------------------------
-- attendance — catatan clock in/out harian (BR-04: satu pasang per hari)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id             UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date                    DATE NOT NULL,              -- tanggal kerja (Asia/Jakarta)

  clock_in_at             TIMESTAMPTZ,                -- waktu server (BR-03)
  clock_in_selfie_url     TEXT,
  clock_in_lat            DOUBLE PRECISION,
  clock_in_lng            DOUBLE PRECISION,
  clock_in_accuracy       DOUBLE PRECISION,
  clock_in_face_score     DOUBLE PRECISION,         -- skor 0..1, wajib disimpan (BR-25)
  clock_in_face_match     BOOLEAN,                  -- >= 0.6 = cocok

  clock_out_at            TIMESTAMPTZ,
  clock_out_selfie_url    TEXT,
  clock_out_lat           DOUBLE PRECISION,
  clock_out_lng           DOUBLE PRECISION,

  is_late                 BOOLEAN NOT NULL DEFAULT FALSE,  -- BR-18

  -- Status antrean offline (BR-26): 'synced' | 'pending_sync'
  sync_status             TEXT NOT NULL DEFAULT 'synced'
                          CHECK (sync_status IN ('synced', 'pending_sync')),
  device_time             TIMESTAMPTZ,              -- waktu perangkat saat ditekan
  synced_at               TIMESTAMPTZ,

  -- Retensi 1 bulan + persetujuan HR (BR-30)
  retention_due_date      DATE,                     -- date + 30 hari
  retention_status        TEXT NOT NULL DEFAULT 'active'
                          CHECK (retention_status IN
                            ('active','due_for_deletion','pending_hr_approval','deleted')),

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, date)                        -- BR-04
);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_retention ON attendance(retention_status, retention_due_date)
  WHERE retention_status <> 'deleted';

-- --------------------------------------------------------------------------
-- attendance_flags — penanda: di_luar_area / wajah_tidak_cocok / fake_gps / ...
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id   UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  flag_type       TEXT NOT NULL CHECK (flag_type IN
                    ('di_luar_area','wajah_tidak_cocok','fake_gps','terlambat','tidak_lengkap')),
  reason          TEXT,
  related_score   DOUBLE PRECISION,             -- mis. skor wajah / jarak meter
  hr_reviewed     BOOLEAN NOT NULL DEFAULT FALSE,
  hr_reviewed_at  TIMESTAMPTZ,
  hr_note         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flags_attendance ON attendance_flags(attendance_id);
CREATE INDEX IF NOT EXISTS idx_flags_unreviewed ON attendance_flags(hr_reviewed)
  WHERE hr_reviewed = FALSE;

-- --------------------------------------------------------------------------
-- leave_balances — kuota per karyawan per tahun (BR-16, BR-21, BR-22, BR-23)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_balances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  cuti_quota  INTEGER NOT NULL DEFAULT 12,   -- BR-16
  cuti_used   INTEGER NOT NULL DEFAULT 0,
  ijin_quota  INTEGER NOT NULL DEFAULT 12,   -- BR-21
  ijin_used   INTEGER NOT NULL DEFAULT 0,     -- setengah hari tetap potong 1 (BR-22)
  UNIQUE (employee_id, year)
);

-- --------------------------------------------------------------------------
-- leave_requests — pengajuan cuti/ijin/sakit
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('cuti','ijin','sakit')),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  is_half_day   BOOLEAN NOT NULL DEFAULT FALSE,  -- hanya untuk ijin (BR-22)
  reason        TEXT NOT NULL,
  attachment_url TEXT,                            -- WAJIB untuk sakit (BR-24)
  status        TEXT NOT NULL DEFAULT 'menunggu'
                CHECK (status IN ('menunggu','disetujui','ditolak')),
  pic_id        UUID REFERENCES employees(id),   -- snapshot PIC saat dibuat (BR-12)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_half_day_ijin_only CHECK (is_half_day = FALSE OR type = 'ijin'),
  CONSTRAINT chk_sakit_attachment CHECK (type <> 'sakit' OR attachment_url IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_leave_emp_status ON leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_pic_status ON leave_requests(pic_id, status);

-- --------------------------------------------------------------------------
-- approvals — keputusan (PIC / HR ambil alih / atasan teratas)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS approvals (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id   UUID NOT NULL UNIQUE REFERENCES leave_requests(id) ON DELETE CASCADE,
  decided_by         UUID NOT NULL REFERENCES employees(id),
  decision           TEXT NOT NULL CHECK (decision IN ('disetujui','ditolak')),
  note               TEXT,                          -- wajib bila ditolak (BR-14)
  taken_over_by_hr   BOOLEAN NOT NULL DEFAULT FALSE,-- BR-29
  takeover_reason    TEXT,
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_reject_note CHECK (decision <> 'ditolak' OR note IS NOT NULL)
);

-- --------------------------------------------------------------------------
-- reminder_log — log pengingat otomatis (BR-34)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reminder_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN
                  ('belum_clock_in','belum_clock_out','pengajuan_menunggu')),
  recipient_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  related_id    UUID,                              -- attendance / leave_request terkait
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reminder_recipient ON reminder_log(recipient_id, sent_at);

-- --------------------------------------------------------------------------
-- data_deletion_approvals — persetujuan HR sebelum hapus retensi (BR-30)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_deletion_approvals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  approved_by   UUID REFERENCES employees(id),      -- HR penyetuju
  approved_at   TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'menunggu'
                CHECK (status IN ('menunggu','disetujui','ditolak','dihapus')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------------
-- work_calendar — kalender kerja perusahaan (BR-17)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_calendar (
  date          DATE PRIMARY KEY,
  is_working_day BOOLEAN NOT NULL DEFAULT TRUE,
  description   TEXT
);

-- --------------------------------------------------------------------------
-- audit_log — jejak audit koreksi & pengambilalihan (BR-19, BR-29)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES employees(id),
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);

-- ============================================================================
-- RLS — aktifkan di semua tabel. Tulis policy sesuai peran sebelum produksi.
-- Contoh pola (JANGAN langsung pakai tanpa tinjau):
--   CREATE POLICY "karyawan_baca_miliknya" ON attendance FOR SELECT
--     USING (employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid()));
--   CREATE POLICY "hr_semua" ON attendance FOR ALL
--     USING (EXISTS (SELECT 1 FROM employees e
--                    WHERE e.user_id = auth.uid() AND e.is_hr));
-- ============================================================================
ALTER TABLE employees               ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_references         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance              ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_calendar           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log               ENABLE ROW LEVEL SECURITY;
