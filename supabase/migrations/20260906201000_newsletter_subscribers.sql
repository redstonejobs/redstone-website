create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  status text not null default 'active' check (status in ('active','unsubscribed')),
  source_path text,
  consent_text text,
  subscribed_at timestamptz not null default now(),
  last_subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_key on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status, last_subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from anon, authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;
