alter table public.applications
  add column if not exists cover_letter text,
  add column if not exists relevant_experience text,
  add column if not exists availability text,
  add column if not exists candidate_message text,
  add column if not exists withdrawn_at timestamptz;

alter table public.application_documents
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists file_size bigint,
  add column if not exists mime_type text,
  add column if not exists uploaded_by uuid references auth.users(id) on delete set null,
  add column if not exists verification_status text not null default 'pending';

create table if not exists public.candidate_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists applications_candidate_status_idx
  on public.applications (candidate_id, status, created_at desc);

create unique index if not exists applications_job_candidate_unique_idx
  on public.applications (job_id, candidate_id);

create index if not exists application_documents_uploaded_by_idx
  on public.application_documents (uploaded_by, created_at desc);

create index if not exists candidate_notifications_user_created_idx
  on public.candidate_notifications (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.candidate_notifications enable row level security;

drop policy if exists "Candidates can read own profile" on public.profiles;
create policy "Candidates can read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Candidates can update safe own profile fields" on public.profiles;
create policy "Candidates can update safe own profile fields"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() and profile_type = 'candidate')
  with check (id = auth.uid() and profile_type = 'candidate' and is_active = true);

drop policy if exists "Candidates can read own applications" on public.applications;
create policy "Candidates can read own applications"
  on public.applications
  for select
  to authenticated
  using (candidate_id = auth.uid());

drop policy if exists "Candidates can read own status history" on public.application_status_history;
create policy "Candidates can read own status history"
  on public.application_status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_status_history.application_id
        and a.candidate_id = auth.uid()
    )
  );

drop policy if exists "Candidates can read own documents" on public.application_documents;
create policy "Candidates can read own documents"
  on public.application_documents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      where a.id = application_documents.application_id
        and a.candidate_id = auth.uid()
    )
  );

drop policy if exists "Candidates can create own pending documents" on public.application_documents;
create policy "Candidates can create own pending documents"
  on public.application_documents
  for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and verification_status = 'pending'
    and storage_path like auth.uid()::text || '/%'
    and exists (
      select 1
      from public.applications a
      where a.id = application_documents.application_id
        and a.candidate_id = auth.uid()
    )
  );

drop policy if exists "Candidates can read own notifications" on public.candidate_notifications;
create policy "Candidates can read own notifications"
  on public.candidate_notifications
  for select
  to authenticated
  using (user_id = auth.uid());

revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, nationality, date_of_birth, city, country, avatar_url, updated_at)
  on public.profiles to authenticated;
grant select on public.applications to authenticated;
grant select on public.application_documents to authenticated;
grant insert (application_id, document_type, file_name, file_size, mime_type, storage_path, uploaded_by, verification_status)
  on public.application_documents to authenticated;
grant select on public.candidate_notifications to authenticated;

create or replace function public.handle_new_candidate_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    nationality,
    date_of_birth,
    city,
    country,
    profile_type,
    is_active
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'nationality', ''),
    nullif(new.raw_user_meta_data->>'date_of_birth', '')::date,
    nullif(new.raw_user_meta_data->>'city', ''),
    nullif(new.raw_user_meta_data->>'country', ''),
    'candidate',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_candidate_profile on auth.users;
create trigger on_auth_user_created_candidate_profile
  after insert on auth.users
  for each row
  when (new.raw_user_meta_data->>'profile_type' = 'candidate')
  execute function public.handle_new_candidate_profile();

create or replace function public.candidate_start_application(p_job_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id uuid;
  v_application_id uuid;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_type = 'candidate'
      and p.is_active = true
  ) then
    raise exception 'candidate_required';
  end if;

  select j.id
    into v_job_id
  from public.jobs j
  where j.slug = p_job_slug
    and j.status = 'published'
    and (j.application_deadline is null or j.application_deadline >= current_date)
    and (j.vacancies is null or j.vacancies > 0);

  if v_job_id is null then
    raise exception 'job_not_available';
  end if;

  select a.id
    into v_application_id
  from public.applications a
  where a.job_id = v_job_id
    and a.candidate_id = auth.uid();

  if v_application_id is not null then
    return v_application_id;
  end if;

  insert into public.applications (job_id, candidate_id, status)
  values (v_job_id, auth.uid(), 'draft')
  returning id into v_application_id;

  insert into public.application_status_history (application_id, previous_status, new_status, changed_by)
  values (v_application_id, null, 'draft', auth.uid());

  return v_application_id;
end;
$$;

create or replace function public.candidate_submit_application(
  p_application_id uuid,
  p_cover_letter text,
  p_relevant_experience text,
  p_availability text,
  p_candidate_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_type = 'candidate'
      and p.is_active = true
  ) then
    raise exception 'candidate_required';
  end if;

  select a.status
    into v_current_status
  from public.applications a
  join public.jobs j on j.id = a.job_id
  where a.id = p_application_id
    and a.candidate_id = auth.uid()
    and j.status = 'published'
    and (j.application_deadline is null or j.application_deadline >= current_date)
    and (j.vacancies is null or j.vacancies > 0)
  for update of a;

  if v_current_status is null then
    raise exception 'application_not_available';
  end if;

  if v_current_status <> 'draft' then
    raise exception 'application_not_draft';
  end if;

  update public.applications
    set status = 'submitted',
        submitted_at = coalesce(submitted_at, now()),
        cover_letter = p_cover_letter,
        relevant_experience = p_relevant_experience,
        availability = p_availability,
        candidate_message = p_candidate_message
  where id = p_application_id
    and candidate_id = auth.uid();

  insert into public.application_status_history (application_id, previous_status, new_status, changed_by)
  values (p_application_id, 'draft', 'submitted', auth.uid());

  insert into public.candidate_notifications (user_id, title, message, type)
  values (auth.uid(), 'Application submitted', 'Your application has been submitted to Red Stone for review.', 'application');

  return p_application_id;
end;
$$;

create or replace function public.candidate_withdraw_application(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
begin
  if not exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.profile_type = 'candidate'
      and p.is_active = true
  ) then
    raise exception 'candidate_required';
  end if;

  select status
    into v_current_status
  from public.applications
  where id = p_application_id
    and candidate_id = auth.uid()
  for update;

  if v_current_status not in ('draft', 'submitted', 'under_review', 'shortlisted', 'interview', 'employer_review', 'offer_pending') then
    raise exception 'withdrawal_not_allowed';
  end if;

  update public.applications
    set status = 'withdrawn',
        withdrawn_at = now()
  where id = p_application_id
    and candidate_id = auth.uid();

  insert into public.application_status_history (application_id, previous_status, new_status, changed_by)
  values (p_application_id, v_current_status, 'withdrawn', auth.uid());

  insert into public.candidate_notifications (user_id, title, message, type)
  values (auth.uid(), 'Application withdrawn', 'Your application has been withdrawn.', 'application');

  return p_application_id;
end;
$$;

grant execute on function public.candidate_start_application(text) to authenticated;
grant execute on function public.candidate_submit_application(uuid, text, text, text, text) to authenticated;
grant execute on function public.candidate_withdraw_application(uuid) to authenticated;

drop policy if exists "Candidates can upload own private documents" on storage.objects;
create policy "Candidates can upload own private documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Candidates can read own private documents" on storage.objects;
create policy "Candidates can read own private documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
