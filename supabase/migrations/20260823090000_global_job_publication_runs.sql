create table if not exists public.bulk_job_publication_runs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  mode text not null default 'global_active_job_matrix',
  employer_id uuid not null references public.employers(id) on delete restrict,
  total_combinations integer not null,
  processed_count integer not null default 0,
  created_count integer not null default 0,
  published_count integer not null default 0,
  skipped_count integer not null default 0,
  failed_count integer not null default 0,
  status text not null default 'ready',
  current_offset integer not null default 0,
  batch_size integer not null default 200,
  publish_mode text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint bulk_job_publication_runs_status_allowed
    check (status in ('ready', 'processing', 'paused', 'completed', 'cancelled', 'failed')),
  constraint bulk_job_publication_runs_publish_mode_allowed
    check (publish_mode in ('draft', 'publish')),
  constraint bulk_job_publication_runs_batch_size_allowed
    check (batch_size between 1 and 200)
);

create index if not exists bulk_job_publication_runs_status_created_idx
  on public.bulk_job_publication_runs (status, created_at desc);

create index if not exists bulk_job_publication_runs_created_by_idx
  on public.bulk_job_publication_runs (created_by, created_at desc);

create table if not exists public.bulk_job_publication_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.bulk_job_publication_runs(id) on delete cascade,
  occupation_slug text not null,
  occupation_title text not null,
  country text not null,
  employer_id uuid not null references public.employers(id) on delete restrict,
  job_id uuid references public.jobs(id) on delete set null,
  status text not null,
  error_message text,
  batch_number integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bulk_job_publication_items_status_allowed
    check (status in ('created', 'published', 'duplicate_skipped', 'validation_failed', 'failed')),
  constraint bulk_job_publication_items_unique
    unique (run_id, occupation_slug, country, employer_id)
);

create index if not exists bulk_job_publication_items_run_status_idx
  on public.bulk_job_publication_items (run_id, status, created_at desc);

create index if not exists bulk_job_publication_items_job_idx
  on public.bulk_job_publication_items (job_id);

alter table public.bulk_job_publication_runs enable row level security;
alter table public.bulk_job_publication_items enable row level security;

drop policy if exists "Admins can manage bulk job publication runs" on public.bulk_job_publication_runs;
create policy "Admins can manage bulk job publication runs"
  on public.bulk_job_publication_runs
  for all
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
  )
  with check (
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

drop policy if exists "Admins can manage bulk job publication items" on public.bulk_job_publication_items;
create policy "Admins can manage bulk job publication items"
  on public.bulk_job_publication_items
  for all
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
  )
  with check (
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

drop trigger if exists bulk_job_publication_runs_set_updated_at on public.bulk_job_publication_runs;
create trigger bulk_job_publication_runs_set_updated_at
  before update on public.bulk_job_publication_runs
  for each row execute function public.set_updated_at();

drop trigger if exists bulk_job_publication_items_set_updated_at on public.bulk_job_publication_items;
create trigger bulk_job_publication_items_set_updated_at
  before update on public.bulk_job_publication_items
  for each row execute function public.set_updated_at();

grant select, insert, update on public.bulk_job_publication_runs to authenticated;
grant select, insert, update on public.bulk_job_publication_items to authenticated;
