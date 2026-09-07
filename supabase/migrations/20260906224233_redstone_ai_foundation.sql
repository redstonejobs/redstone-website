create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('website','whatsapp','admin','api')),
  external_thread_id text,
  candidate_user_id uuid references public.profiles(id) on delete set null,
  staff_client_id uuid references public.staff_clients(id) on delete set null,
  current_worker text not null default 'faith_reception',
  status text not null default 'open' check (status in ('open','handed_off','closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ai_conversations_channel_thread_uidx
  on public.ai_conversations(channel, external_thread_id)
  where external_thread_id is not null;
create index if not exists ai_conversations_candidate_idx on public.ai_conversations(candidate_user_id);
create index if not exists ai_conversations_status_updated_idx on public.ai_conversations(status, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound','internal')),
  sender_type text not null check (sender_type in ('candidate','ai','staff','system')),
  worker_key text,
  content text not null check (char_length(content) between 1 and 20000),
  openai_response_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages(conversation_id, created_at);

create table if not exists public.ai_leads (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.ai_conversations(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  job_interest text,
  country_interest text,
  stage text not null default 'new' check (stage in ('new','qualifying','qualified','ready','handoff','converted','disqualified')),
  qualification_score integer not null default 0 check (qualification_score between 0 and 100),
  consent_to_contact boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_leads_stage_score_idx on public.ai_leads(stage, qualification_score desc, updated_at desc);
create index if not exists ai_leads_phone_idx on public.ai_leads(phone) where phone is not null;
create index if not exists ai_leads_email_idx on public.ai_leads(lower(email)) where email is not null;

create table if not exists public.ai_handoffs (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','accepted','resolved','cancelled')),
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  summary text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  resolved_at timestamptz
);
create index if not exists ai_handoffs_status_created_idx on public.ai_handoffs(status, created_at);

create table if not exists public.ai_worker_runs (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.ai_conversations(id) on delete set null,
  worker_key text not null,
  model text not null,
  openai_response_id text,
  status text not null check (status in ('success','error')),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_code text,
  created_at timestamptz not null default now()
);
create index if not exists ai_worker_runs_conversation_created_idx on public.ai_worker_runs(conversation_id, created_at desc);
create index if not exists ai_worker_runs_worker_created_idx on public.ai_worker_runs(worker_key, created_at desc);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_leads enable row level security;
alter table public.ai_handoffs enable row level security;
alter table public.ai_worker_runs enable row level security;

revoke all on table public.ai_conversations, public.ai_messages, public.ai_leads, public.ai_handoffs, public.ai_worker_runs from anon, authenticated;
grant all on table public.ai_conversations, public.ai_messages, public.ai_leads, public.ai_handoffs, public.ai_worker_runs to service_role;

comment on table public.ai_conversations is 'Server-only Red Stone AI conversation state. No direct anon/authenticated Data API access.';
comment on table public.ai_messages is 'Server-only transcript records for Red Stone AI conversations.';
comment on table public.ai_leads is 'Server-only AI qualification state and lead contact details.';
comment on table public.ai_handoffs is 'Server-only AI-to-human handoff queue.';
comment on table public.ai_worker_runs is 'Server-only operational telemetry for AI worker calls.';
