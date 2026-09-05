-- Advanced automatic external job ingestion.
-- External listings are deliberately separated from Red Stone-authorized recruitment.
-- A published external listing must send applicants back to its original source.

alter table public.jobs
  add column if not exists source_provider text not null default 'redstone',
  add column if not exists source_external_id text,
  add column if not exists source_url text,
  add column if not exists source_apply_url text,
  add column if not exists source_employer_name text,
  add column if not exists source_posted_at timestamptz,
  add column if not exists source_last_seen_at timestamptz,
  add column if not exists source_payload_hash text,
  add column if not exists source_fingerprint text,
  add column if not exists source_attribution text,
  add column if not exists source_status text not null default 'active',
  add column if not exists auto_imported boolean not null default false,
  add column if not exists application_mode text not null default 'redstone',
  add column if not exists foreign_worker_status text not null default 'unknown',
  add column if not exists immigration_evidence text,
  add column if not exists import_quality_score integer,
  add constraint jobs_source_status_allowed
    check (source_status in ('active', 'stale', 'closed', 'removed')) not valid,
  add constraint jobs_application_mode_allowed
    check (application_mode in ('redstone', 'external')) not valid,
  add constraint jobs_foreign_worker_status_allowed
    check (foreign_worker_status in (
      'verified_foreign_recruitment',
      'international_applicants_accepted',
      'lmia_requested',
      'lmia_approved',
      'sponsorship_confirmed',
      'sponsorship_unconfirmed',
      'requires_existing_authorization',
      'not_suitable',
      'unknown'
    )) not valid,
  add constraint jobs_import_quality_score_range
    check (import_quality_score is null or (import_quality_score between 0 and 100)) not valid;

create unique index if not exists jobs_source_external_id_unique
  on public.jobs (source_provider, source_external_id)
  where source_external_id is not null;

create index if not exists jobs_source_provider_seen_idx
  on public.jobs (source_provider, source_last_seen_at desc)
  where auto_imported = true;

create index if not exists jobs_foreign_worker_status_idx
  on public.jobs (foreign_worker_status, status)
  where auto_imported = true;

create index if not exists jobs_source_fingerprint_idx
  on public.jobs (source_fingerprint)
  where source_fingerprint is not null;

create table if not exists public.job_import_sources (
  provider text primary key,
  display_name text not null,
  enabled boolean not null default false,
  auto_publish_enabled boolean not null default false,
  publish_threshold integer not null default 80,
  external_apply_only boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_import_sources_threshold_range check (publish_threshold between 0 and 100)
);

create table if not exists public.job_import_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null references public.job_import_sources(provider) on delete restrict,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  fetched_count integer not null default 0,
  published_count integer not null default 0,
  updated_count integer not null default 0,
  duplicate_count integer not null default 0,
  rejected_count integer not null default 0,
  review_count integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  constraint job_import_runs_status_allowed
    check (status in ('running', 'succeeded', 'partial', 'failed', 'skipped'))
);

create index if not exists job_import_runs_provider_started_idx
  on public.job_import_runs (provider, started_at desc);

create table if not exists public.job_import_items (
  id uuid primary key default gen_random_uuid(),
  provider text not null references public.job_import_sources(provider) on delete restrict,
  external_id text not null,
  run_id uuid references public.job_import_runs(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  source_url text,
  source_apply_url text,
  fingerprint text,
  payload_hash text,
  normalized_payload jsonb not null default '{}'::jsonb,
  decision text not null default 'needs_review',
  decision_reason text,
  quality_score integer,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_import_items_provider_external_unique unique (provider, external_id),
  constraint job_import_items_decision_allowed
    check (decision in ('published', 'updated', 'rejected', 'needs_review', 'duplicate', 'expired', 'skipped')),
  constraint job_import_items_quality_range
    check (quality_score is null or (quality_score between 0 and 100))
);

create index if not exists job_import_items_decision_seen_idx
  on public.job_import_items (decision, last_seen_at desc);

create index if not exists job_import_items_job_idx
  on public.job_import_items (job_id)
  where job_id is not null;

insert into public.job_import_sources (
  provider,
  display_name,
  enabled,
  auto_publish_enabled,
  publish_threshold,
  external_apply_only,
  config
) values
  (
    'foundrole',
    'FoundRole',
    true,
    true,
    80,
    true,
    jsonb_build_object(
      'posted_days_ago', 7,
      'require_foreign_worker_signal', true,
      'searches', jsonb_build_array(
        jsonb_build_object('query', 'Caregiver', 'location', 'Canada'),
        jsonb_build_object('query', 'Cleaner', 'location', 'Canada'),
        jsonb_build_object('query', 'Housekeeper', 'location', 'Canada'),
        jsonb_build_object('query', 'Warehouse Worker', 'location', 'Canada'),
        jsonb_build_object('query', 'Security Guard', 'location', 'Canada'),
        jsonb_build_object('query', 'Delivery Driver', 'location', 'Canada'),
        jsonb_build_object('query', 'Construction Labourer', 'location', 'Canada'),
        jsonb_build_object('query', 'Farm Worker', 'location', 'Canada'),
        jsonb_build_object('query', 'Hotel Worker', 'location', 'Canada')
      )
    )
  ),
  (
    'jobbank',
    'Canada Job Bank',
    false,
    true,
    85,
    true,
    jsonb_build_object(
      'require_foreign_worker_signal', true,
      'connection_note', 'Enable only after Red Stone receives authorized Job Bank XML feed access.'
    )
  )
on conflict (provider) do update set
  display_name = excluded.display_name,
  publish_threshold = excluded.publish_threshold,
  external_apply_only = excluded.external_apply_only,
  config = public.job_import_sources.config || excluded.config;

create or replace function public.set_job_import_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_import_sources_set_updated_at on public.job_import_sources;
create trigger job_import_sources_set_updated_at
  before update on public.job_import_sources
  for each row execute function public.set_job_import_updated_at();

drop trigger if exists job_import_items_set_updated_at on public.job_import_items;
create trigger job_import_items_set_updated_at
  before update on public.job_import_items
  for each row execute function public.set_job_import_updated_at();

-- Defense in depth: manual Red Stone recruitment still requires a verified active employer.
-- Syndicated external jobs may be published only as source-directed applications.
create or replace function public.enforce_job_publication_origin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' then
    if coalesce(new.source_provider, 'redstone') = 'redstone' then
      if new.employer_id is null or not exists (
        select 1
        from public.employers e
        where e.id = new.employer_id
          and e.verification_status = 'verified'
          and e.is_active = true
      ) then
        raise exception 'Only vacancies for active verified employers can be published.';
      end if;
    else
      if coalesce(new.auto_imported, false) is not true
        or new.application_mode <> 'external'
        or nullif(trim(coalesce(new.source_url, '')), '') is null
        or nullif(trim(coalesce(new.source_external_id, '')), '') is null
      then
        raise exception 'External published jobs require source identity, source URL, automatic-import provenance, and external application mode.';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists jobs_enforce_publication_origin on public.jobs;
create trigger jobs_enforce_publication_origin
  before insert or update of status, employer_id, source_provider, source_url, source_external_id, auto_imported, application_mode
  on public.jobs
  for each row execute function public.enforce_job_publication_origin();

alter table public.job_import_sources enable row level security;
alter table public.job_import_runs enable row level security;
alter table public.job_import_items enable row level security;

drop policy if exists "Admins can read job import sources" on public.job_import_sources;
create policy "Admins can read job import sources"
  on public.job_import_sources
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('admin', 'super_admin')
        and sr.active = true
        and sr.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can read job import runs" on public.job_import_runs;
create policy "Admins can read job import runs"
  on public.job_import_runs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('admin', 'super_admin')
        and sr.active = true
        and sr.role in ('admin', 'super_admin')
    )
  );

drop policy if exists "Admins can read job import items" on public.job_import_items;
create policy "Admins can read job import items"
  on public.job_import_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      join public.staff_roles sr on sr.user_id = p.id
      where p.id = auth.uid()
        and p.is_active = true
        and p.profile_type in ('admin', 'super_admin')
        and sr.active = true
        and sr.role in ('admin', 'super_admin')
    )
  );

grant select on public.job_import_sources to authenticated;
grant select on public.job_import_runs to authenticated;
grant select on public.job_import_items to authenticated;
