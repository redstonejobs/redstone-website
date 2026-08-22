create table if not exists public.public_enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  enquiry_type text not null default 'general',
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_enquiries_status_created_idx
  on public.public_enquiries (status, created_at desc);

create index if not exists public_enquiries_type_created_idx
  on public.public_enquiries (enquiry_type, created_at desc);

alter table public.public_enquiries enable row level security;

drop policy if exists "Anyone can submit public enquiries" on public.public_enquiries;
create policy "Anyone can submit public enquiries"
  on public.public_enquiries
  for insert
  to anon, authenticated
  with check (
    length(full_name) between 2 and 160
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and length(subject) between 3 and 200
    and length(message) between 20 and 3000
    and status = 'new'
  );

drop policy if exists "Staff can read public enquiries" on public.public_enquiries;
create policy "Staff can read public enquiries"
  on public.public_enquiries
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

drop policy if exists "Admins can manage public enquiries" on public.public_enquiries;
create policy "Admins can manage public enquiries"
  on public.public_enquiries
  for update
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

grant insert on public.public_enquiries to anon, authenticated;
grant select, update on public.public_enquiries to authenticated;
