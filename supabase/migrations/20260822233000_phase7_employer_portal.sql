alter table public.employers
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists company_type text,
  add column if not exists industry text,
  add column if not exists company_size text,
  add column if not exists primary_contact_name text,
  add column if not exists primary_contact_position text,
  add column if not exists recruitment_needs text,
  add column if not exists preferred_job_categories text[],
  add column if not exists verification_submitted_at timestamptz,
  add column if not exists verification_note text,
  add constraint employers_verification_status_allowed
    check (verification_status in ('pending', 'under_review', 'verified', 'rejected', 'suspended')) not valid;

create index if not exists employers_owner_user_idx
  on public.employers (owner_user_id);

create index if not exists employers_owner_active_idx
  on public.employers (owner_user_id, is_active);

create table if not exists public.employer_job_requests (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  country text,
  city text,
  category text,
  job_type text,
  skill_level text,
  short_description text,
  description text,
  responsibilities text,
  requirements text,
  experience_requirements text,
  education_requirements text,
  language_requirements text,
  salary_min numeric(12, 2),
  salary_max numeric(12, 2),
  currency text,
  salary_period text,
  salary_confirmed boolean not null default false,
  contract_type text,
  contract_duration_value integer,
  contract_duration_unit text,
  working_hours_per_week numeric(5, 2),
  work_schedule text,
  vacancies integer,
  requested_application_deadline date,
  sponsorship_status text not null default 'not_confirmed',
  accommodation_status text not null default 'not_confirmed',
  meals_status text not null default 'not_confirmed',
  transport_status text not null default 'not_confirmed',
  medical_insurance_status text not null default 'not_confirmed',
  air_ticket_status text not null default 'not_confirmed',
  required_documents text[],
  notes_to_red_stone text,
  admin_notes text,
  linked_job_id uuid references public.jobs(id) on delete set null,
  status text not null default 'employer_draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employer_job_requests_status_allowed
    check (status in ('employer_draft', 'submitted_for_review', 'under_review', 'changes_requested', 'approved', 'rejected', 'published', 'paused', 'closed', 'archived')),
  constraint employer_job_requests_salary_valid
    check (salary_min is null or salary_max is null or salary_max >= salary_min),
  constraint employer_job_requests_vacancies_positive
    check (vacancies is null or vacancies > 0),
  constraint employer_job_requests_salary_period_allowed
    check (salary_period is null or salary_period in ('hour', 'day', 'week', 'month', 'year')),
  constraint employer_job_requests_contract_duration_unit_allowed
    check (contract_duration_unit is null or contract_duration_unit in ('months', 'years')),
  constraint employer_job_requests_benefit_status_allowed
    check (
      sponsorship_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and accommodation_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and meals_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and transport_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and medical_insurance_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and air_ticket_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
    )
);

create index if not exists employer_job_requests_employer_status_idx
  on public.employer_job_requests (employer_id, status, created_at desc);

create index if not exists employer_job_requests_review_idx
  on public.employer_job_requests (status, submitted_at desc);

create table if not exists public.employer_application_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  decision text not null default 'pending',
  note text,
  decided_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employer_application_decisions_allowed
    check (decision in ('pending', 'reviewing', 'shortlisted', 'interview_requested', 'selected', 'not_selected', 'on_hold')),
  constraint employer_application_decisions_unique unique (application_id, employer_id)
);

create index if not exists employer_application_decisions_employer_idx
  on public.employer_application_decisions (employer_id, decision, updated_at desc);

create table if not exists public.employer_interview_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  requested_by_user_id uuid references auth.users(id) on delete set null,
  preferred_times text not null,
  timezone text,
  method text,
  interviewer_name text,
  interviewer_contact text,
  notes_to_red_stone text,
  employer_private_notes text,
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employer_interview_requests_status_allowed
    check (status in ('requested', 'scheduled', 'completed', 'cancelled', 'reschedule_requested'))
);

create index if not exists employer_interview_requests_employer_status_idx
  on public.employer_interview_requests (employer_id, status, created_at desc);

create table if not exists public.employer_application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employer_application_notes_employer_application_idx
  on public.employer_application_notes (employer_id, application_id, created_at desc);

create table if not exists public.employer_notifications (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists employer_notifications_employer_created_idx
  on public.employer_notifications (employer_id, created_at desc);

create table if not exists public.employer_activity_logs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists employer_activity_logs_employer_created_idx
  on public.employer_activity_logs (employer_id, created_at desc);

create table if not exists public.employer_verification_documents (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  document_type text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  storage_path text not null,
  status text not null default 'submitted',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employer_verification_documents_status_allowed
    check (status in ('submitted', 'accepted', 'rejected', 'needs_replacement'))
);

create index if not exists employer_verification_documents_employer_idx
  on public.employer_verification_documents (employer_id, created_at desc);

create or replace function public.handle_new_employer_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_employer_id uuid;
begin
  if new.raw_user_meta_data->>'profile_type' <> 'employer' then
    return new;
  end if;

  insert into public.profiles (
    id,
    full_name,
    phone,
    city,
    country,
    profile_type,
    is_active
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'contact_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'country', ''),
    'employer',
    true
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    city = excluded.city,
    country = excluded.country,
    profile_type = 'employer',
    is_active = true,
    updated_at = now();

  insert into public.employers (
    owner_user_id,
    company_name,
    registration_number,
    website,
    email,
    phone,
    country,
    city,
    company_type,
    industry,
    company_size,
    primary_contact_name,
    verification_status,
    is_active
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'company_name', ''),
    nullif(new.raw_user_meta_data->>'registration_number', ''),
    nullif(new.raw_user_meta_data->>'website', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'country', ''),
    nullif(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'company_type', ''),
    nullif(new.raw_user_meta_data->>'industry', ''),
    nullif(new.raw_user_meta_data->>'company_size', ''),
    nullif(new.raw_user_meta_data->>'contact_name', ''),
    'pending',
    true
  )
  returning id into v_employer_id;

  insert into public.employer_notifications (employer_id, notification_type, title, body)
  values (
    v_employer_id,
    'company_verification_updated',
    'Company verification pending',
    'Your company profile has been received and is awaiting Red Stone review.'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_employer_profile on auth.users;
create trigger on_auth_user_created_employer_profile
  after insert on auth.users
  for each row
  when (new.raw_user_meta_data->>'profile_type' = 'employer')
  execute function public.handle_new_employer_profile();

drop trigger if exists employer_job_requests_set_updated_at on public.employer_job_requests;
create trigger employer_job_requests_set_updated_at
  before update on public.employer_job_requests
  for each row execute function public.set_updated_at();

drop trigger if exists employer_application_decisions_set_updated_at on public.employer_application_decisions;
create trigger employer_application_decisions_set_updated_at
  before update on public.employer_application_decisions
  for each row execute function public.set_updated_at();

drop trigger if exists employer_interview_requests_set_updated_at on public.employer_interview_requests;
create trigger employer_interview_requests_set_updated_at
  before update on public.employer_interview_requests
  for each row execute function public.set_updated_at();

drop trigger if exists employer_application_notes_set_updated_at on public.employer_application_notes;
create trigger employer_application_notes_set_updated_at
  before update on public.employer_application_notes
  for each row execute function public.set_updated_at();

drop trigger if exists employer_verification_documents_set_updated_at on public.employer_verification_documents;
create trigger employer_verification_documents_set_updated_at
  before update on public.employer_verification_documents
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('employer-verification-documents', 'employer-verification-documents', false)
on conflict (id) do update set public = false;

alter table public.employer_job_requests enable row level security;
alter table public.employer_application_decisions enable row level security;
alter table public.employer_interview_requests enable row level security;
alter table public.employer_application_notes enable row level security;
alter table public.employer_notifications enable row level security;
alter table public.employer_activity_logs enable row level security;
alter table public.employer_verification_documents enable row level security;

drop policy if exists "Employers can read own company" on public.employers;
create policy "Employers can read own company"
  on public.employers
  for select
  to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "Employers can update safe own company fields" on public.employers;
create policy "Employers can update safe own company fields"
  on public.employers
  for update
  to authenticated
  using (owner_user_id = auth.uid() and is_active = true)
  with check (owner_user_id = auth.uid());

drop policy if exists "Employers can read own job requests" on public.employer_job_requests;
create policy "Employers can read own job requests"
  on public.employer_job_requests
  for select
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Verified employers can create own job requests" on public.employer_job_requests;
create policy "Verified employers can create own job requests"
  on public.employer_job_requests
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.employers e
      where e.id = employer_id
        and e.owner_user_id = auth.uid()
        and e.is_active = true
    )
  );

drop policy if exists "Employers can update own draft requests" on public.employer_job_requests;
create policy "Employers can update own draft requests"
  on public.employer_job_requests
  for update
  to authenticated
  using (
    status in ('employer_draft', 'changes_requested')
    and exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid() and e.is_active = true)
  )
  with check (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid() and e.is_active = true));

drop policy if exists "Admins can manage employer job requests" on public.employer_job_requests;
create policy "Admins can manage employer job requests"
  on public.employer_job_requests
  for all
  to authenticated
  using (exists (select 1 from public.profiles p join public.staff_roles sr on sr.user_id = p.id where p.id = auth.uid() and p.is_active = true and p.profile_type in ('admin', 'super_admin') and sr.active = true and sr.role in ('admin', 'super_admin')))
  with check (exists (select 1 from public.profiles p join public.staff_roles sr on sr.user_id = p.id where p.id = auth.uid() and p.is_active = true and p.profile_type in ('admin', 'super_admin') and sr.active = true and sr.role in ('admin', 'super_admin')));

drop policy if exists "Employers can read own decisions" on public.employer_application_decisions;
create policy "Employers can read own decisions"
  on public.employer_application_decisions
  for select
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Employers can manage own decisions" on public.employer_application_decisions;
create policy "Employers can manage own decisions"
  on public.employer_application_decisions
  for all
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid() and e.verification_status = 'verified' and e.is_active = true))
  with check (
    decided_by_user_id = auth.uid()
    and exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.employers e on e.id = j.employer_id
      where a.id = application_id
        and e.id = employer_id
        and e.owner_user_id = auth.uid()
        and e.verification_status = 'verified'
        and e.is_active = true
    )
  );

drop policy if exists "Employers can manage own interview requests" on public.employer_interview_requests;
create policy "Employers can manage own interview requests"
  on public.employer_interview_requests
  for all
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()))
  with check (
    requested_by_user_id = auth.uid()
    and exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      join public.employers e on e.id = j.employer_id
      where a.id = application_id
        and e.id = employer_id
        and e.owner_user_id = auth.uid()
        and e.verification_status = 'verified'
        and e.is_active = true
    )
  );

drop policy if exists "Employers can manage own application notes" on public.employer_application_notes;
create policy "Employers can manage own application notes"
  on public.employer_application_notes
  for all
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()))
  with check (created_by = auth.uid() and exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Employers can read own notifications" on public.employer_notifications;
create policy "Employers can read own notifications"
  on public.employer_notifications
  for select
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Employers can read own activity" on public.employer_activity_logs;
create policy "Employers can read own activity"
  on public.employer_activity_logs
  for select
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Employers can create own activity" on public.employer_activity_logs;
create policy "Employers can create own activity"
  on public.employer_activity_logs
  for insert
  to authenticated
  with check (actor_user_id = auth.uid() and exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Staff can read employer activity" on public.employer_activity_logs;
create policy "Staff can read employer activity"
  on public.employer_activity_logs
  for select
  to authenticated
  using (exists (select 1 from public.profiles p join public.staff_roles sr on sr.user_id = p.id where p.id = auth.uid() and p.is_active = true and p.profile_type in ('staff', 'admin', 'super_admin') and sr.active = true));

drop policy if exists "Employers can read own verification documents" on public.employer_verification_documents;
create policy "Employers can read own verification documents"
  on public.employer_verification_documents
  for select
  to authenticated
  using (exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid()));

drop policy if exists "Employers can upload own verification documents" on public.employer_verification_documents;
create policy "Employers can upload own verification documents"
  on public.employer_verification_documents
  for insert
  to authenticated
  with check (uploaded_by = auth.uid() and exists (select 1 from public.employers e where e.id = employer_id and e.owner_user_id = auth.uid() and e.is_active = true));

drop policy if exists "Staff can read employer verification documents" on public.employer_verification_documents;
create policy "Staff can read employer verification documents"
  on public.employer_verification_documents
  for select
  to authenticated
  using (exists (select 1 from public.profiles p join public.staff_roles sr on sr.user_id = p.id where p.id = auth.uid() and p.is_active = true and p.profile_type in ('staff', 'admin', 'super_admin') and sr.active = true));

drop policy if exists "Employers can upload own verification storage" on storage.objects;
create policy "Employers can upload own verification storage"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'employer-verification-documents'
    and exists (select 1 from public.employers e where e.owner_user_id = auth.uid() and e.id::text = (storage.foldername(name))[1])
  );

drop policy if exists "Employers can read own verification storage" on storage.objects;
create policy "Employers can read own verification storage"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'employer-verification-documents'
    and exists (select 1 from public.employers e where e.owner_user_id = auth.uid() and e.id::text = (storage.foldername(name))[1])
  );

grant select, insert, update on public.employer_job_requests to authenticated;
grant select, insert, update on public.employer_application_decisions to authenticated;
grant select, insert, update on public.employer_interview_requests to authenticated;
grant select, insert, update on public.employer_application_notes to authenticated;
grant select on public.employer_notifications to authenticated;
grant select, insert on public.employer_activity_logs to authenticated;
grant select, insert on public.employer_verification_documents to authenticated;
