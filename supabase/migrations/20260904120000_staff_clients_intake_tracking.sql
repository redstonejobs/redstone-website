-- Staff CRM intake tracking fields.
-- Local migration only; do not apply to production without approval.

begin;

alter table public.staff_clients
  add column if not exists passport_status text not null default 'unknown',
  add column if not exists medical_status text not null default 'unknown',
  add column if not exists follow_up_date date;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_clients_passport_status_check'
      and conrelid = 'public.staff_clients'::regclass
  ) then
    alter table public.staff_clients
      add constraint staff_clients_passport_status_check
      check (
        passport_status in (
          'unknown',
          'none',
          'valid',
          'expired',
          'processing'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'staff_clients_medical_status_check'
      and conrelid = 'public.staff_clients'::regclass
  ) then
    alter table public.staff_clients
      add constraint staff_clients_medical_status_check
      check (
        medical_status in (
          'unknown',
          'not_started',
          'pending',
          'booked',
          'completed',
          'failed',
          'waived',
          'expired'
        )
      );
  end if;
end $$;

create index if not exists staff_clients_staff_follow_up_idx
  on public.staff_clients (staff_user_id, follow_up_date)
  where follow_up_date is not null;

create index if not exists staff_clients_staff_email_idx
  on public.staff_clients (staff_user_id, lower(email))
  where email is not null;

create index if not exists staff_clients_staff_phone_idx
  on public.staff_clients (staff_user_id, phone)
  where phone is not null;

commit;
