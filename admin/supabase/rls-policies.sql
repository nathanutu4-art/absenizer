-- ============================================================================
-- Absenizer — RLS Policies (HR-only untuk panel admin)
-- ============================================================================
-- TUJUAN: kunci seluruh tabel agar hanya user login dengan employees.is_hr = true
-- (join via auth.uid() = employees.user_id) yang bisa baca/tulis.
--
-- CARA PAKAI:
--   1. Buka Supabase Dashboard → SQL Editor.
--   2. Copy-paste SELURUH file ini, jalankan sekali.
--   3. Verifikasi: sebagai user non-HR, query harus mengembalikan 0 baris / error.
--
-- CATATAN PENTING:
--   - Kebijakan ini untuk PANEL ADMIN. Aplikasi mobile memakai pola yang sama
--     (anon key + RLS); bila mobile butuh akses karyawan biasa (mis. baca
--     data sendiri), tambahkan policy SELECT tambahan per tabel, contoh:
--         create policy "karyawan baca data sendiri" on public.attendance
--           for select using (auth.uid() = (select user_id from public.employees where id = attendance.employee_id));
--   - Service role key (server-only) selalu bypass RLS — jangan pernah expose.
--   - Setelah RLS aktif, pastikan kolom employees.user_id terisi untuk semua
--     akun HR, atau mereka akan terkunci dari panel.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper: true bila user yang login adalah HR.
-- SECURITY DEFINER agar bisa baca employees tanpa policy rekursif.
-- ----------------------------------------------------------------------------
create or replace function public.is_hr()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.employees
    where user_id = auth.uid()
      and is_hr = true
      and is_active = true
  );
$$;

-- ============================================================================
-- employees
-- ============================================================================
alter table public.employees enable row level security;

drop policy if exists "hr full access employees" on public.employees;
create policy "hr full access employees"
  on public.employees
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- attendance
-- ============================================================================
alter table public.attendance enable row level security;

drop policy if exists "hr full access attendance" on public.attendance;
create policy "hr full access attendance"
  on public.attendance
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- attendance_flags
-- ============================================================================
alter table public.attendance_flags enable row level security;

drop policy if exists "hr full access attendance_flags" on public.attendance_flags;
create policy "hr full access attendance_flags"
  on public.attendance_flags
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- leave_requests
-- ============================================================================
alter table public.leave_requests enable row level security;

drop policy if exists "hr full access leave_requests" on public.leave_requests;
create policy "hr full access leave_requests"
  on public.leave_requests
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- approvals
-- ============================================================================
alter table public.approvals enable row level security;

drop policy if exists "hr full access approvals" on public.approvals;
create policy "hr full access approvals"
  on public.approvals
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- audit_log (HR boleh baca + tulis; tidak boleh ubah/hapus jejak)
-- ============================================================================
alter table public.audit_log enable row level security;

drop policy if exists "hr read audit_log" on public.audit_log;
create policy "hr read audit_log"
  on public.audit_log
  for select
  using (public.is_hr());

drop policy if exists "hr insert audit_log" on public.audit_log;
create policy "hr insert audit_log"
  on public.audit_log
  for insert
  with check (public.is_hr());

-- ============================================================================
-- company_settings
-- ============================================================================
alter table public.company_settings enable row level security;

drop policy if exists "hr full access company_settings" on public.company_settings;
create policy "hr full access company_settings"
  on public.company_settings
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- leave_balances
-- ============================================================================
alter table public.leave_balances enable row level security;

drop policy if exists "hr full access leave_balances" on public.leave_balances;
create policy "hr full access leave_balances"
  on public.leave_balances
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- work_calendar
-- ============================================================================
alter table public.work_calendar enable row level security;

drop policy if exists "hr full access work_calendar" on public.work_calendar;
create policy "hr full access work_calendar"
  on public.work_calendar
  for all
  using (public.is_hr())
  with check (public.is_hr());

-- ============================================================================
-- Verifikasi cepat (jalankan sebagai user HR login):
--   select public.is_hr();  -- harus true
-- ============================================================================
