create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

create index if not exists admin_audit_logs_entity_idx
  on public.admin_audit_logs (entity_type, entity_id);

create index if not exists admin_audit_logs_actor_idx
  on public.admin_audit_logs (actor_user_id);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Admins can read audit logs" on public.admin_audit_logs;
create policy "Admins can read audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('admin', 'super_admin')
        and sr.active = true
        and sr.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Staff can create audit logs" on public.admin_audit_logs;
create policy "Staff can create audit logs"
  on public.admin_audit_logs
  for insert
  to authenticated
  with check (
    actor_user_id = auth.uid()
    and exists (
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

create table if not exists public.candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidate_notes_candidate_idx
  on public.candidate_notes (candidate_id, created_at desc);

alter table public.candidate_notes enable row level security;

drop policy if exists "Staff can read candidate notes" on public.candidate_notes;
create policy "Staff can read candidate notes"
  on public.candidate_notes
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

drop policy if exists "Staff can create candidate notes" on public.candidate_notes;
create policy "Staff can create candidate notes"
  on public.candidate_notes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
    )
  );

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists application_notes_application_idx
  on public.application_notes (application_id, created_at desc);

alter table public.application_notes enable row level security;

drop policy if exists "Staff can read application notes" on public.application_notes;
create policy "Staff can read application notes"
  on public.application_notes
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

drop policy if exists "Staff can create application notes" on public.application_notes;
create policy "Staff can create application notes"
  on public.application_notes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('staff', 'admin', 'super_admin')
        and sr.active = true
    )
  );

alter table public.application_documents
  add column if not exists verification_note text;

grant select, insert on public.admin_audit_logs to authenticated;
grant select, insert on public.candidate_notes to authenticated;
grant select, insert on public.application_notes to authenticated;
