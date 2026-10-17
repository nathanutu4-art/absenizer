-- ============================================================================
-- Absenizer — RPC: decide_leave_request
-- ============================================================================
-- Membungkus 3 write persetujuan dalam SATU transaksi Postgres:
--   1. leave_requests  → status = 'disetujui' | 'ditolak' (hanya bila masih 'menunggu')
--   2. approvals       → catat keputusan + decided_by
--   3. audit_log       → jejak audit
--
-- Pengurangan kuota cuti/ijin TETAP di aplikasi (applyLeaveBalance) karena
-- butuh logika fallback kuota default; RPC ini fokus pada atomicity keputusan.
--
-- Cara pakai (Supabase SQL Editor): jalankan seluruh file ini sekali.
-- Panggil dari aplikasi:
--   sb.rpc("decide_leave_request", { p_request_id, p_decision, p_hr_employee_id, p_note })
-- Return: 'ok' bila berhasil; error bila request tidak ditemukan / sudah diproses.
-- ============================================================================

create or replace function public.decide_leave_request(
  p_request_id uuid,
  p_decision text,
  p_hr_employee_id uuid,
  p_note text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows int;
begin
  -- Validasi decision
  if p_decision not in ('disetujui', 'ditolak') then
    raise exception 'decision harus disetujui atau ditolak';
  end if;

  -- 1) Update status — hanya bila masih menunggu (guard race condition).
  update public.leave_requests
     set status = p_decision
   where id = p_request_id
     and status = 'menunggu';
  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'pengajuan tidak ditemukan atau sudah diproses';
  end if;

  -- 2) Catat keputusan.
  insert into public.approvals (
    leave_request_id, decided_by, decision, note, taken_over_by_hr, takeover_reason
  ) values (
    p_request_id,
    p_hr_employee_id,
    p_decision,
    nullif(trim(coalesce(p_note, '')), ''),
    true,
    'Diputuskan via panel admin (HR)'
  );

  -- 3) Jejak audit.
  insert into public.audit_log (
    actor_id, action, entity, entity_id, old_value, new_value, reason
  ) values (
    p_hr_employee_id,
    case when p_decision = 'disetujui' then 'approve_pengajuan' else 'reject_pengajuan' end,
    'leave_requests',
    p_request_id,
    jsonb_build_object('status', 'menunggu'),
    jsonb_build_object('status', p_decision),
    case when p_decision = 'disetujui'
      then 'Disetujui via panel admin'
      else coalesce(nullif(trim(p_note), ''), 'Ditolak via panel admin')
    end
  );

  return 'ok';
end;
$$;

-- Catatan: p_note opsional (dipakai untuk catatan penolakan).
-- TODO: pindahkan applyLeaveBalance ke trigger Postgres agar kuota juga transaksional.
