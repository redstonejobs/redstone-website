-- ============================================================
-- RED STONE EMPLOYMENT AGENCY
-- STAFF DASHBOARD / RECRUITER CRM / REFERRAL ATTRIBUTION
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Referral ownership on candidate profiles
-- ------------------------------------------------------------

alter table public.profiles
  add column if not exists referred_by_staff_id uuid
    references public.profiles(id)
    on delete set null,
  add column if not exists referral_attributed_at timestamptz;

create index if not exists profiles_referred_by_staff_idx
  on public.profiles (referred_by_staff_id, created_at desc)
  where referred_by_staff_id is not null;

-- ------------------------------------------------------------
-- 2. Recruiter / staff CRM clients
-- ------------------------------------------------------------

create table if not exists public.staff_clients (
  id uuid primary key default gen_random_uuid(),

  staff_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  candidate_user_id uuid
    references auth.users(id)
    on delete set null,

  full_name text not null,
  email text,
  phone text,
  nationality text,
  country text,

  interested_job text,
  preferred_country text,

  status text not null default 'lead',

  source text not null default 'manual',

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint staff_clients_status_check
    check (
      status in (
        'lead',
        'contacted',
        'registered',
        'applied',
        'processing',
        'placed',
        'closed'
      )
    ),

  constraint staff_clients_source_check
    check (
      source in (
        'manual',
        'referral_link',
        'walk_in',
        'phone',
        'whatsapp',
        'other'
      )
    ),

  constraint staff_clients_staff_candidate_unique
    unique (staff_user_id, candidate_user_id)
);

create index if not exists staff_clients_staff_created_idx
  on public.staff_clients (staff_user_id, created_at desc);

create index if not exists staff_clients_candidate_idx
  on public.staff_clients (candidate_user_id)
  where candidate_user_id is not null;

create index if not exists staff_clients_status_idx
  on public.staff_clients (staff_user_id, status);

-- ------------------------------------------------------------
-- 3. updated_at trigger
-- ------------------------------------------------------------

create or replace function public.set_staff_client_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists staff_clients_set_updated_at
  on public.staff_clients;

create trigger staff_clients_set_updated_at
before update on public.staff_clients
for each row
execute function public.set_staff_client_updated_at();

-- ------------------------------------------------------------
-- 4. RLS
-- ------------------------------------------------------------

alter table public.staff_clients enable row level security;

drop policy if exists
  "Staff can read own clients"
  on public.staff_clients;

create policy
  "Staff can read own clients"
on public.staff_clients
for select
to authenticated
using (
  staff_user_id = auth.uid()
  or exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
      and sr.role in ('admin', 'super_admin')
  )
);

drop policy if exists
  "Staff can create own clients"
  on public.staff_clients;

create policy
  "Staff can create own clients"
on public.staff_clients
for insert
to authenticated
with check (
  staff_user_id = auth.uid()
  and exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
  )
);

drop policy if exists
  "Staff can update own clients"
  on public.staff_clients;

create policy
  "Staff can update own clients"
on public.staff_clients
for update
to authenticated
using (
  staff_user_id = auth.uid()
  or exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
      and sr.role in ('admin', 'super_admin')
  )
)
with check (
  staff_user_id = auth.uid()
  or exists (
    select 1
    from public.staff_roles sr
    where sr.user_id = auth.uid()
      and sr.active = true
      and sr.role in ('admin', 'super_admin')
  )
);

-- ------------------------------------------------------------
-- 5. Staff avatar storage
-- Only profile photographs. Never identity documents here.
-- ------------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'staff-avatars',
  'staff-avatars',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;