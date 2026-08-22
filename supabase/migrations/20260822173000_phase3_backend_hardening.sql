create table if not exists public.application_assignment_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  previous_staff_id uuid references auth.users(id) on delete set null,
  assigned_staff_id uuid references auth.users(id) on delete set null,
  changed_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists application_assignment_history_application_idx
  on public.application_assignment_history (application_id, created_at desc);

create index if not exists application_assignment_history_staff_idx
  on public.application_assignment_history (assigned_staff_id, created_at desc);

alter table public.application_assignment_history enable row level security;

drop policy if exists "Staff can read assignment history" on public.application_assignment_history;
create policy "Staff can read assignment history"
  on public.application_assignment_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
        and sr.role in ('staff', 'moderator', 'recruiter', 'hr', 'finance', 'admin', 'super_admin')
    )
  );

drop policy if exists "Staff can create assignment history" on public.application_assignment_history;
create policy "Staff can create assignment history"
  on public.application_assignment_history
  for insert
  to authenticated
  with check (
    changed_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
        and sr.role in ('recruiter', 'hr', 'admin', 'super_admin')
    )
  );

alter table public.application_status_history
  add column if not exists previous_status text,
  add column if not exists new_status text,
  add column if not exists changed_by uuid references auth.users(id) on delete set null,
  add column if not exists reason text,
  add column if not exists metadata jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists application_status_history_application_created_idx
  on public.application_status_history (application_id, created_at desc);

create index if not exists application_status_history_changed_by_idx
  on public.application_status_history (changed_by);

alter table public.application_status_history enable row level security;

drop policy if exists "Staff can read status history" on public.application_status_history;
create policy "Staff can read status history"
  on public.application_status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
    )
  );

drop policy if exists "Staff can create status history" on public.application_status_history;
create policy "Staff can create status history"
  on public.application_status_history
  for insert
  to authenticated
  with check (
    changed_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
        and sr.role in ('recruiter', 'hr', 'admin', 'super_admin')
    )
  );

create index if not exists applications_status_created_idx
  on public.applications (status, created_at desc);

create index if not exists applications_assigned_staff_idx
  on public.applications (assigned_staff_id, created_at desc);

create index if not exists applications_candidate_idx
  on public.applications (candidate_id, created_at desc);

create index if not exists applications_job_idx
  on public.applications (job_id, created_at desc);

create index if not exists jobs_status_created_idx
  on public.jobs (status, created_at desc);

create index if not exists jobs_employer_idx
  on public.jobs (employer_id);

create index if not exists jobs_deadline_idx
  on public.jobs (application_deadline);

create index if not exists employers_verification_created_idx
  on public.employers (verification_status, created_at desc);

create index if not exists employers_active_idx
  on public.employers (is_active);

create index if not exists application_documents_status_created_idx
  on public.application_documents (verification_status, created_at desc);

create index if not exists application_documents_application_idx
  on public.application_documents (application_id);

create index if not exists profiles_type_active_idx
  on public.profiles (profile_type, is_active);

create index if not exists staff_roles_user_active_idx
  on public.staff_roles (user_id, active);

create index if not exists staff_roles_role_active_idx
  on public.staff_roles (role, active);

alter table public.applications
  drop constraint if exists applications_status_allowed,
  add constraint applications_status_allowed
  check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'shortlisted',
      'interview',
      'employer_review',
      'offer_pending',
      'offer_issued',
      'documentation',
      'visa_processing',
      'approved',
      'deployed',
      'rejected',
      'withdrawn'
    )
  ) not valid;

alter table public.jobs
  drop constraint if exists jobs_status_allowed,
  add constraint jobs_status_allowed
  check (status in ('draft', 'published', 'paused', 'closed', 'archived')) not valid;

alter table public.staff_roles
  drop constraint if exists staff_roles_role_allowed,
  add constraint staff_roles_role_allowed
  check (role in ('staff', 'moderator', 'recruiter', 'hr', 'finance', 'admin', 'super_admin')) not valid;

grant select, insert on public.application_assignment_history to authenticated;
grant select, insert on public.application_status_history to authenticated;

create or replace function public.admin_update_application_status(
  p_application_id uuid,
  p_new_status text,
  p_changed_by uuid,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table(previous_status text, new_status text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous_status text;
begin
  select a.status
    into v_previous_status
  from public.applications a
  where a.id = p_application_id
  for update;

  if not found then
    raise exception 'application not found';
  end if;

  update public.applications
    set status = p_new_status,
        reviewed_at = now(),
        assigned_staff_id = p_changed_by
  where id = p_application_id;

  insert into public.application_status_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    reason,
    metadata
  )
  values (
    p_application_id,
    v_previous_status,
    p_new_status,
    p_changed_by,
    p_reason,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return query select v_previous_status, p_new_status;
end;
$$;

create or replace function public.admin_assign_application(
  p_application_id uuid,
  p_assigned_staff_id uuid,
  p_changed_by uuid,
  p_reason text default null
)
returns table(previous_staff_id uuid, assigned_staff_id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous_staff_id uuid;
begin
  select a.assigned_staff_id
    into v_previous_staff_id
  from public.applications a
  where a.id = p_application_id
  for update;

  if not found then
    raise exception 'application not found';
  end if;

  update public.applications
    set assigned_staff_id = p_assigned_staff_id
  where id = p_application_id;

  insert into public.application_assignment_history (
    application_id,
    previous_staff_id,
    assigned_staff_id,
    changed_by,
    reason
  )
  values (
    p_application_id,
    v_previous_staff_id,
    p_assigned_staff_id,
    p_changed_by,
    p_reason
  );

  return query select v_previous_staff_id, p_assigned_staff_id;
end;
$$;

grant execute on function public.admin_update_application_status(uuid, text, uuid, text, jsonb) to authenticated;
grant execute on function public.admin_assign_application(uuid, uuid, uuid, text) to authenticated;
