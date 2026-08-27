begin;

-- =========================================================
-- ADVANCED CANDIDATE IMMIGRATION INTAKE
-- =========================================================

create table if not exists public.application_immigration_profiles (
  application_id uuid primary key
    references public.applications(id) on delete cascade,

  given_names text,
  family_name text,
  other_names text,
  previous_names text,

  sex text,
  date_of_birth date,
  place_of_birth text,
  country_of_birth text,

  nationality text,
  other_citizenships text[] not null default '{}'::text[],

  marital_status text,
  national_id_number text,

  passport_number text,
  passport_issue_country text,
  passport_issue_date date,
  passport_expiry_date date,

  residence_country text,
  residence_status text,

  primary_phone text,
  primary_email text,
  preferred_language text,

  has_dependants boolean,
  dependants_count integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint immigration_dependants_count_check
    check (
      dependants_count is null
      or dependants_count >= 0
    )
);


create table if not exists public.application_addresses (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  address_type text not null default 'residential',

  address_line_1 text,
  address_line_2 text,
  city text,
  state_province text,
  postal_code text,
  country text,

  from_date date,
  to_date date,
  is_current boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_dependants (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  full_name text not null,
  relationship text not null,

  date_of_birth date,
  nationality text,
  country_of_residence text,

  passport_number text,

  accompanying_applicant boolean not null default false,
  visa_required boolean,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_education_history (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  institution_name text not null,
  country text,

  qualification text,
  field_of_study text,

  start_date date,
  end_date date,

  completed boolean,
  graduation_date date,

  certificate_available boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_employment_history (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  employer_name text not null,
  job_title text not null,

  country text,
  city text,

  start_date date,
  end_date date,

  is_current boolean not null default false,

  duties text,
  reason_for_leaving text,

  supervisor_name text,
  supervisor_contact text,

  reference_permission boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_languages (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  language text not null,

  speaking_level text,
  reading_level text,
  writing_level text,
  listening_level text,

  test_name text,
  test_score text,
  test_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_professional_licenses (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  license_name text not null,
  issuing_authority text,

  license_number text,
  country text,

  issue_date date,
  expiry_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_travel_history (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  country text not null,
  purpose text,

  arrival_date date,
  departure_date date,

  visa_type text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_visa_history (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  country text not null,
  visa_type text,

  application_date date,
  decision text,
  decision_date date,

  visa_number text,
  valid_from date,
  valid_until date,

  refusal_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_emergency_contacts (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  full_name text not null,
  relationship text,

  phone text not null,
  alternate_phone text,
  email text,

  city text,
  country text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_references (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  full_name text not null,
  relationship text,

  organisation text,
  job_title text,

  phone text,
  email text,
  country text,

  can_contact boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_financial_information (
  application_id uuid primary key
    references public.applications(id) on delete cascade,

  funding_source text,

  sponsor_name text,
  sponsor_relationship text,

  currency text default 'KES',
  available_funds numeric(14,2),
  monthly_income numeric(14,2),

  proof_of_funds_available boolean not null default false,

  employer_sponsorship_expected boolean,
  employer_covers_visa boolean,
  employer_covers_flight boolean,
  employer_covers_accommodation boolean,
  employer_covers_medical boolean,

  financial_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint immigration_available_funds_check
    check (
      available_funds is null
      or available_funds >= 0
    ),

  constraint immigration_monthly_income_check
    check (
      monthly_income is null
      or monthly_income >= 0
    )
);


create table if not exists public.application_immigration_declarations (
  application_id uuid primary key
    references public.applications(id) on delete cascade,

  previous_visa_refusal boolean,
  previous_visa_refusal_details text,

  previous_overstay boolean,
  previous_overstay_details text,

  previous_deportation_or_removal boolean,
  previous_deportation_details text,

  immigration_violation boolean,
  immigration_violation_details text,

  criminal_charge_or_conviction boolean,
  criminal_details text,

  military_service boolean,
  military_service_details text,

  government_service boolean,
  government_service_details text,

  medical_disclosure_required boolean,
  medical_disclosure_details text,

  consent_to_data_processing boolean not null default false,
  consent_to_employer_sharing boolean not null default false,
  consent_to_authority_sharing boolean not null default false,

  certify_true_and_complete boolean not null default false,

  declaration_signed_name text,
  declaration_signed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.application_section_progress (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id) on delete cascade,

  section_key text not null,

  status text not null default 'incomplete',

  completed_at timestamptz,
  last_saved_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (application_id, section_key),

  constraint immigration_section_status_check
    check (
      status in (
        'incomplete',
        'in_progress',
        'complete',
        'review_required'
      )
    ),

  constraint immigration_section_key_check
    check (
      section_key in (
        'personal',
        'passport',
        'addresses',
        'family',
        'education',
        'employment',
        'languages',
        'licenses',
        'travel',
        'visas',
        'emergency',
        'references',
        'finances',
        'declarations',
        'documents',
        'review'
      )
    )
);


-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists application_addresses_application_idx
  on public.application_addresses(application_id);

create index if not exists application_dependants_application_idx
  on public.application_dependants(application_id);

create index if not exists application_education_application_idx
  on public.application_education_history(application_id);

create index if not exists application_employment_application_idx
  on public.application_employment_history(application_id);

create index if not exists application_languages_application_idx
  on public.application_languages(application_id);

create index if not exists application_licenses_application_idx
  on public.application_professional_licenses(application_id);

create index if not exists application_travel_application_idx
  on public.application_travel_history(application_id);

create index if not exists application_visa_application_idx
  on public.application_visa_history(application_id);

create index if not exists application_emergency_application_idx
  on public.application_emergency_contacts(application_id);

create index if not exists application_references_application_idx
  on public.application_references(application_id);

create index if not exists application_section_progress_application_idx
  on public.application_section_progress(application_id);


-- =========================================================
-- UPDATED_AT
-- =========================================================

create or replace function public.set_candidate_immigration_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();

  if tg_table_name = 'application_section_progress' then
    new.last_saved_at = now();
  end if;

  return new;
end;
$$;


-- =========================================================
-- SECURITY HELPERS
-- =========================================================

create or replace function public.candidate_owns_application(
  p_application_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    where a.id = p_application_id
      and a.candidate_id = auth.uid()
  );
$$;


create or replace function public.candidate_can_edit_immigration_case(
  p_application_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    join public.profiles p
      on p.id = a.candidate_id
    where a.id = p_application_id
      and a.candidate_id = auth.uid()
      and p.profile_type = 'candidate'
      and p.is_active = true
      and coalesce(a.status, 'draft') not in (
        'withdrawn',
        'rejected',
        'declined',
        'cancelled',
        'placed',
        'completed'
      )
  );
$$;


create or replace function public.staff_can_read_immigration_case(
  p_application_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    where a.id = p_application_id
      and (
        exists (
          select 1
          from public.staff_roles sr
          where sr.user_id = auth.uid()
            and sr.active = true
            and sr.role in (
              'admin',
              'super_admin',
              'hr'
            )
        )
        or (
          a.assigned_staff_id = auth.uid()
          and exists (
            select 1
            from public.staff_roles sr
            where sr.user_id = auth.uid()
              and sr.active = true
              and sr.role in (
                'recruiter',
                'staff',
                'moderator'
              )
          )
        )
      )
  );
$$;


revoke all
on function public.candidate_owns_application(uuid)
from public;

revoke all
on function public.candidate_can_edit_immigration_case(uuid)
from public;

revoke all
on function public.staff_can_read_immigration_case(uuid)
from public;


grant execute
on function public.candidate_owns_application(uuid)
to authenticated;

grant execute
on function public.candidate_can_edit_immigration_case(uuid)
to authenticated;

grant execute
on function public.staff_can_read_immigration_case(uuid)
to authenticated;


-- =========================================================
-- RLS + UPDATED_AT TRIGGERS
-- =========================================================

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'application_immigration_profiles',
    'application_addresses',
    'application_dependants',
    'application_education_history',
    'application_employment_history',
    'application_languages',
    'application_professional_licenses',
    'application_travel_history',
    'application_visa_history',
    'application_emergency_contacts',
    'application_references',
    'application_financial_information',
    'application_immigration_declarations',
    'application_section_progress'
  ]
  loop

    execute format(
      'alter table public.%I enable row level security',
      table_name
    );

    execute format(
      'drop trigger if exists set_candidate_immigration_updated_at on public.%I',
      table_name
    );

    execute format(
      'create trigger set_candidate_immigration_updated_at
       before update on public.%I
       for each row
       execute function public.set_candidate_immigration_updated_at()',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I',
      'Candidates can read own immigration data',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for select
       to authenticated
       using (
         public.candidate_owns_application(application_id)
       )',
      'Candidates can read own immigration data',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I',
      'Candidates can create own immigration data',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for insert
       to authenticated
       with check (
         public.candidate_can_edit_immigration_case(application_id)
       )',
      'Candidates can create own immigration data',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I',
      'Candidates can update own immigration data',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for update
       to authenticated
       using (
         public.candidate_can_edit_immigration_case(application_id)
       )
       with check (
         public.candidate_can_edit_immigration_case(application_id)
       )',
      'Candidates can update own immigration data',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I',
      'Candidates can delete own immigration data',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for delete
       to authenticated
       using (
         public.candidate_can_edit_immigration_case(application_id)
       )',
      'Candidates can delete own immigration data',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I',
      'Authorized staff can read immigration data',
      table_name
    );

    execute format(
      'create policy %I
       on public.%I
       for select
       to authenticated
       using (
         public.staff_can_read_immigration_case(application_id)
       )',
      'Authorized staff can read immigration data',
      table_name
    );

  end loop;
end;
$$;


-- =========================================================
-- AUTHENTICATED TABLE PRIVILEGES
-- RLS continues to control which records are accessible.
-- =========================================================

grant select, insert, update, delete
on table
  public.application_immigration_profiles,
  public.application_addresses,
  public.application_dependants,
  public.application_education_history,
  public.application_employment_history,
  public.application_languages,
  public.application_professional_licenses,
  public.application_travel_history,
  public.application_visa_history,
  public.application_emergency_contacts,
  public.application_references,
  public.application_financial_information,
  public.application_immigration_declarations,
  public.application_section_progress
to authenticated;


commit;