-- ============================================================
-- RED STONE EMPLOYMENT AGENCY
-- STAFF PERSONNEL PROFILE EXTENSION
--
-- Adds internal HR/personnel fields to existing profiles.
-- Existing candidate fields, auth, RLS and staff_roles remain intact.
-- ============================================================

begin;

-- ============================================================
-- 1. ADD STAFF PERSONNEL FIELDS
-- ============================================================

alter table public.profiles
  add column if not exists staff_id text,
  add column if not exists personnel_record_no text,
  add column if not exists referral_code text,
  add column if not exists job_title text,
  add column if not exists department text,
  add column if not exists employment_type text,
  add column if not exists duty_station text,
  add column if not exists appointment_date date,
  add column if not exists reporting_officer text,
  add column if not exists identity_number text;

-- avatar_url already exists in the current profiles architecture.
-- date_of_birth, phone, full_name, city, country, profile_type and
-- is_active also already exist and are intentionally not recreated.


-- ============================================================
-- 2. EMPLOYMENT TYPE VALIDATION
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_employment_type_check;

alter table public.profiles
  add constraint profiles_employment_type_check
  check (
    employment_type is null
    or employment_type in (
      'full_time',
      'part_time',
      'contract',
      'temporary',
      'intern'
    )
  );


-- ============================================================
-- 3. UNIQUE STAFF IDENTIFIERS
-- ============================================================

create unique index if not exists profiles_staff_id_unique_idx
  on public.profiles (staff_id)
  where staff_id is not null;

create unique index if not exists profiles_personnel_record_no_unique_idx
  on public.profiles (personnel_record_no)
  where personnel_record_no is not null;

create unique index if not exists profiles_referral_code_unique_idx
  on public.profiles (referral_code)
  where referral_code is not null;


-- ============================================================
-- 4. SEQUENCES
-- ============================================================

create sequence if not exists public.redstone_staff_id_seq
  start with 1
  increment by 1;

create sequence if not exists public.redstone_personnel_record_seq
  start with 1
  increment by 1;


-- ============================================================
-- 5. STAFF ID GENERATOR
--
-- Example:
-- RSE-STF-000001
-- ============================================================

create or replace function public.generate_redstone_staff_id()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number bigint;
begin
  v_number := nextval('public.redstone_staff_id_seq');

  return 'RSE-STF-' || lpad(v_number::text, 6, '0');
end;
$$;


-- ============================================================
-- 6. PERSONNEL RECORD NUMBER GENERATOR
--
-- Example:
-- RSE-HR-2026-000001
-- ============================================================

create or replace function public.generate_redstone_personnel_record_no()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number bigint;
begin
  v_number := nextval('public.redstone_personnel_record_seq');

  return
    'RSE-HR-' ||
    extract(year from current_date)::int::text ||
    '-' ||
    lpad(v_number::text, 6, '0');
end;
$$;


-- ============================================================
-- 7. REFERRAL CODE GENERATOR
--
-- Example:
-- RSE-7K4M9Q
--
-- Uses server-generated random UUID material.
-- It never relies on browser-generated values.
-- ============================================================

create or replace function public.generate_redstone_referral_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
begin
  loop
    v_code :=
      'RSE-' ||
      upper(
        substring(
          replace(gen_random_uuid()::text, '-', '')
          from 1
          for 6
        )
      );

    exit when not exists (
      select 1
      from public.profiles
      where referral_code = v_code
    );
  end loop;

  return v_code;
end;
$$;


-- ============================================================
-- 8. AUTOMATIC STAFF PERSONNEL PROVISIONING
--
-- Staff identifiers are generated when a user receives an
-- ACTIVE staff role.
--
-- This avoids generating staff IDs for normal candidates.
-- ============================================================

create or replace function public.provision_redstone_staff_personnel_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active is distinct from true then
    return new;
  end if;

  update public.profiles
  set
    staff_id = coalesce(
      staff_id,
      public.generate_redstone_staff_id()
    ),

    personnel_record_no = coalesce(
      personnel_record_no,
      public.generate_redstone_personnel_record_no()
    ),

    referral_code = coalesce(
      referral_code,
      public.generate_redstone_referral_code()
    ),

    updated_at = now()

  where id = new.user_id;

  return new;
end;
$$;


drop trigger if exists provision_staff_personnel_record
  on public.staff_roles;

create trigger provision_staff_personnel_record
after insert or update of active
on public.staff_roles
for each row
when (new.active = true)
execute function public.provision_redstone_staff_personnel_record();


-- ============================================================
-- 9. BACKFILL EXISTING STAFF
--
-- Existing users who already have an active staff role will
-- receive Staff ID, Personnel Record Number and Referral Code.
-- Existing values are preserved.
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  for v_user_id in
    select distinct sr.user_id
    from public.staff_roles sr
    where sr.active = true
  loop

    update public.profiles
    set
      staff_id = coalesce(
        staff_id,
        public.generate_redstone_staff_id()
      ),

      personnel_record_no = coalesce(
        personnel_record_no,
        public.generate_redstone_personnel_record_no()
      ),

      referral_code = coalesce(
        referral_code,
        public.generate_redstone_referral_code()
      ),

      updated_at = now()

    where id = v_user_id;

  end loop;
end;
$$;


-- ============================================================
-- 10. INDEXES FOR STAFF ADMINISTRATION
-- ============================================================

create index if not exists profiles_department_idx
  on public.profiles (department)
  where department is not null;

create index if not exists profiles_job_title_idx
  on public.profiles (job_title)
  where job_title is not null;

create index if not exists profiles_duty_station_idx
  on public.profiles (duty_station)
  where duty_station is not null;

create index if not exists profiles_appointment_date_idx
  on public.profiles (appointment_date)
  where appointment_date is not null;


-- ============================================================
-- 11. SECURITY
--
-- DO NOT grant these new HR fields to candidates for self-editing.
--
-- Existing candidate column-level grants remain unchanged.
-- Existing staff/admin RLS remains the enforcement layer.
-- ============================================================

comment on column public.profiles.staff_id is
  'Internal Red Stone staff identifier generated server-side.';

comment on column public.profiles.personnel_record_no is
  'Official internal personnel record reference generated server-side.';

comment on column public.profiles.referral_code is
  'Unique Red Stone staff referral code generated server-side.';

comment on column public.profiles.identity_number is
  'Restricted personnel identity reference. Must not be exposed publicly.';

comment on column public.profiles.job_title is
  'Official Red Stone staff job title.';

comment on column public.profiles.department is
  'Internal department assignment.';

comment on column public.profiles.duty_station is
  'Primary employee duty station or office assignment.';

comment on column public.profiles.reporting_officer is
  'Internal reporting officer or supervisor reference.';


commit;