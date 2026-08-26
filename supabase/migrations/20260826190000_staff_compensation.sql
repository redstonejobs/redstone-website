-- ============================================================
-- RED STONE EMPLOYMENT AGENCY
-- STAFF COMPENSATION / PAYROLL PROFILE
-- Migration: 20260826190000_staff_compensation.sql
--
-- Purpose:
-- - Store sensitive employee salary information separately
--   from the general profiles table.
-- - Allow staff to view their OWN compensation.
-- - Allow authorized HR / Finance / Admin personnel to manage it.
-- ============================================================

begin;

-- ============================================================
-- 1. STAFF COMPENSATION TABLE
-- ============================================================

create table if not exists public.staff_compensation (
  user_id uuid primary key
    references public.profiles(id)
    on delete cascade,

  monthly_salary numeric(14,2),

  salary_currency text not null default 'KES',

  pay_frequency text not null default 'monthly',

  salary_effective_date date,

  bank_payment_status text not null default 'not_configured',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint staff_compensation_monthly_salary_check
    check (
      monthly_salary is null
      or monthly_salary >= 0
    ),

  constraint staff_compensation_currency_check
    check (
      salary_currency ~ '^[A-Z]{3}$'
    ),

  constraint staff_compensation_pay_frequency_check
    check (
      pay_frequency in (
        'monthly',
        'biweekly',
        'weekly',
        'daily',
        'hourly'
      )
    ),

  constraint staff_compensation_bank_status_check
    check (
      bank_payment_status in (
        'not_configured',
        'pending',
        'verified',
        'on_hold'
      )
    )
);


-- ============================================================
-- 2. COMMENTS
-- ============================================================

comment on table public.staff_compensation is
  'Confidential compensation records for Red Stone staff personnel.';

comment on column public.staff_compensation.user_id is
  'Staff profile/user identifier.';

comment on column public.staff_compensation.monthly_salary is
  'Current employee salary amount.';

comment on column public.staff_compensation.salary_currency is
  'ISO-style three-letter salary currency such as KES, USD, GBP or CAD.';

comment on column public.staff_compensation.pay_frequency is
  'Frequency at which the employee is paid.';

comment on column public.staff_compensation.salary_effective_date is
  'Date from which the recorded salary became effective.';

comment on column public.staff_compensation.bank_payment_status is
  'Administrative status of the employee payroll payment setup.';


-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_staff_compensation_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  trg_staff_compensation_updated_at
  on public.staff_compensation;

create trigger trg_staff_compensation_updated_at
before update
on public.staff_compensation
for each row
execute function public.set_staff_compensation_updated_at();


-- ============================================================
-- 4. AUTHORIZATION HELPER
--
-- Authorized management roles:
-- super_admin
-- admin
-- hr
-- finance
-- ============================================================

create or replace function public.can_manage_staff_compensation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
      and sr.role in (
        'super_admin',
        'admin',
        'hr',
        'finance'
      )
  );
$$;

revoke all
on function public.can_manage_staff_compensation()
from public;

grant execute
on function public.can_manage_staff_compensation()
to authenticated;


-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

alter table public.staff_compensation
enable row level security;


-- ============================================================
-- 6. STAFF CAN VIEW THEIR OWN COMPENSATION
-- ============================================================

drop policy if exists
  "staff_can_view_own_compensation"
  on public.staff_compensation;

create policy
  "staff_can_view_own_compensation"
on public.staff_compensation
for select
to authenticated
using (
  user_id = auth.uid()
);


-- ============================================================
-- 7. AUTHORIZED MANAGEMENT CAN VIEW ALL COMPENSATION
-- ============================================================

drop policy if exists
  "management_can_view_staff_compensation"
  on public.staff_compensation;

create policy
  "management_can_view_staff_compensation"
on public.staff_compensation
for select
to authenticated
using (
  public.can_manage_staff_compensation()
);


-- ============================================================
-- 8. AUTHORIZED MANAGEMENT CAN CREATE COMPENSATION RECORDS
-- ============================================================

drop policy if exists
  "management_can_create_staff_compensation"
  on public.staff_compensation;

create policy
  "management_can_create_staff_compensation"
on public.staff_compensation
for insert
to authenticated
with check (
  public.can_manage_staff_compensation()
);


-- ============================================================
-- 9. AUTHORIZED MANAGEMENT CAN UPDATE COMPENSATION
-- ============================================================

drop policy if exists
  "management_can_update_staff_compensation"
  on public.staff_compensation;

create policy
  "management_can_update_staff_compensation"
on public.staff_compensation
for update
to authenticated
using (
  public.can_manage_staff_compensation()
)
with check (
  public.can_manage_staff_compensation()
);


-- ============================================================
-- 10. ONLY SUPER ADMIN / ADMIN / HR CAN DELETE RECORDS
-- ============================================================

create or replace function public.can_delete_staff_compensation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
      and sr.role in (
        'super_admin',
        'admin',
        'hr'
      )
  );
$$;

revoke all
on function public.can_delete_staff_compensation()
from public;

grant execute
on function public.can_delete_staff_compensation()
to authenticated;


drop policy if exists
  "authorized_management_can_delete_staff_compensation"
  on public.staff_compensation;

create policy
  "authorized_management_can_delete_staff_compensation"
on public.staff_compensation
for delete
to authenticated
using (
  public.can_delete_staff_compensation()
);


-- ============================================================
-- 11. INDEXES
-- ============================================================

create index if not exists
  staff_compensation_salary_effective_date_idx
on public.staff_compensation(salary_effective_date);

create index if not exists
  staff_compensation_pay_frequency_idx
on public.staff_compensation(pay_frequency);

create index if not exists
  staff_compensation_bank_payment_status_idx
on public.staff_compensation(bank_payment_status);


-- ============================================================
-- 12. TABLE PERMISSIONS
-- ============================================================

grant select, insert, update, delete
on public.staff_compensation
to authenticated;


commit;