-- Red Stone security hardening phase.
-- Local migration only. Do not apply to production without review and approval.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

create or replace function private.redstone_current_jwt_role()
returns text
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_claims jsonb;
  v_raw_claims text;
begin
  v_raw_claims := nullif(current_setting('request.jwt.claims', true), '');

  if v_raw_claims is not null then
    begin
      v_claims := v_raw_claims::jsonb;
      return nullif(v_claims ->> 'role', '');
    exception
      when others then
        null;
    end;
  end if;

  v_raw_claims := nullif(current_setting('request.jwt', true), '');

  if v_raw_claims is not null then
    begin
      v_claims := v_raw_claims::jsonb;
      return nullif(v_claims ->> 'role', '');
    exception
      when others then
        null;
    end;
  end if;

  return null;
end;
$$;

create or replace function private.redstone_is_service_role()
returns boolean
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_effective_request_role text;
begin
  v_effective_request_role := nullif(current_setting('role', true), '');

  if v_effective_request_role = 'service_role' then
    return true;
  end if;

  return private.redstone_current_jwt_role() = 'service_role';
end;
$$;

create or replace function private.redstone_current_user_has_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.staff_roles sr on sr.user_id = p.id
    where p.id = auth.uid()
      and p.is_active = true
      and p.profile_type in ('staff', 'admin', 'super_admin')
      and sr.active = true
      and sr.role = any(p_roles)
  );
$$;

create or replace function private.redstone_current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.redstone_current_user_has_role(array['admin', 'super_admin']);
$$;

create or replace function private.redstone_current_user_is_finance_or_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.redstone_current_user_has_role(array['finance', 'admin', 'super_admin']);
$$;

create or replace function private.redstone_assert_admin()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'authenticated_user_required';
  end if;

  if not private.redstone_current_user_is_admin() then
    raise exception 'admin_required';
  end if;

  return v_actor;
end;
$$;

create or replace function private.redstone_jsonb_fields_changed(
  p_old jsonb,
  p_new jsonb,
  p_fields text[]
)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from unnest(p_fields) as f(field_name)
    where (p_old -> f.field_name) is distinct from (p_new -> f.field_name)
  );
$$;

grant execute on function private.redstone_current_jwt_role() to authenticated, service_role;
grant execute on function private.redstone_is_service_role() to authenticated, service_role;
grant execute on function private.redstone_current_user_has_role(text[]) to authenticated, service_role;
grant execute on function private.redstone_current_user_is_admin() to authenticated, service_role;
grant execute on function private.redstone_current_user_is_finance_or_admin() to authenticated, service_role;
grant execute on function private.redstone_assert_admin() to authenticated, service_role;
grant execute on function private.redstone_jsonb_fields_changed(jsonb, jsonb, text[]) to authenticated, service_role;

create or replace function public.protect_employer_system_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.redstone_is_service_role()
     or private.redstone_current_user_is_admin()
     or current_setting('app.redstone_employer_verification_submit', true) = 'on'
  then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.verification_status is distinct from old.verification_status
       or new.is_active is distinct from old.is_active
       or new.owner_user_id is distinct from old.owner_user_id
       or new.verification_submitted_at is distinct from old.verification_submitted_at
       or new.verification_note is distinct from old.verification_note
    then
      raise exception 'employer_system_fields_protected';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_employer_system_fields on public.employers;
create trigger protect_employer_system_fields
  before update on public.employers
  for each row
  execute function public.protect_employer_system_fields();

create or replace function public.employer_submit_company_verification(p_employer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'authenticated_user_required';
  end if;

  perform set_config('app.redstone_employer_verification_submit', 'on', true);

  update public.employers
    set verification_status = 'under_review',
        verification_submitted_at = now()
  where id = p_employer_id
    and owner_user_id = v_actor
    and is_active = true
    and verification_status in ('pending', 'rejected');

  if not found then
    raise exception 'employer_verification_submit_not_allowed';
  end if;

  return p_employer_id;
end;
$$;

create or replace function public.protect_job_publication_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.redstone_is_service_role()
     or private.redstone_current_user_is_admin()
  then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if coalesce(new.status, 'draft') <> 'draft' then
      raise exception 'job_publication_requires_admin';
    end if;

    if not (
      private.redstone_current_user_has_role(array['recruiter', 'hr'])
      or exists (
        select 1
        from public.employers e
        where e.id = new.employer_id
          and e.owner_user_id = auth.uid()
          and e.is_active = true
      )
    ) then
      raise exception 'job_write_not_allowed';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status
       and new.status in ('published', 'paused', 'closed', 'archived')
    then
      raise exception 'job_publication_requires_admin';
    end if;

    if old.status <> 'draft' and not private.redstone_current_user_is_admin() then
      raise exception 'job_update_requires_admin';
    end if;

    if not (
      private.redstone_current_user_has_role(array['recruiter', 'hr'])
      or exists (
        select 1
        from public.employers e
        where e.id = old.employer_id
          and e.owner_user_id = auth.uid()
          and e.is_active = true
      )
    ) then
      raise exception 'job_write_not_allowed';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_job_publication_fields on public.jobs;
create trigger protect_job_publication_fields
  before insert or update on public.jobs
  for each row
  execute function public.protect_job_publication_fields();

create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_protected_fields constant text[] := array[
    'profile_type',
    'is_active',
    'staff_id',
    'personnel_record_no',
    'referral_code',
    'referred_by_staff_id',
    'referral_attributed_at',
    'job_title',
    'department',
    'employment_type',
    'duty_station',
    'appointment_date',
    'employment_start_date',
    'reporting_officer',
    'identity_number',
    'must_change_password',
    'temporary_password_issued_at',
    'password_changed_at',
    'salary_amount',
    'salary_currency',
    'salary_period',
    'working_days_per_week',
    'working_hours_per_day',
    'working_hours_per_week',
    'work_schedule',
    'probation_period_months'
  ];
begin
  if private.redstone_is_service_role()
     or private.redstone_current_user_is_admin()
  then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and private.redstone_jsonb_fields_changed(to_jsonb(old), to_jsonb(new), v_protected_fields)
  then
    raise exception 'profile_system_fields_protected';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_system_fields on public.profiles;
create trigger protect_profile_system_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_system_fields();

create or replace function public.protect_application_system_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transition text;
begin
  v_transition := current_setting('app.redstone_application_status_transition', true);

  if private.redstone_is_service_role()
     or private.redstone_current_user_is_admin()
     or v_transition in ('candidate_submit', 'candidate_withdraw')
  then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if auth.uid() is null or new.candidate_id <> auth.uid() then
      raise exception 'candidate_application_owner_mismatch';
    end if;

    if new.status <> 'draft'
       or new.submitted_at is not null
       or new.reviewed_at is not null
       or new.assigned_staff_id is not null
       or new.internal_notes is not null
    then
      raise exception 'application_system_fields_protected';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.candidate_id is distinct from old.candidate_id
       or new.job_id is distinct from old.job_id
       or new.status is distinct from old.status
       or new.assigned_staff_id is distinct from old.assigned_staff_id
       or new.submitted_at is distinct from old.submitted_at
       or new.reviewed_at is distinct from old.reviewed_at
       or new.internal_notes is distinct from old.internal_notes
    then
      raise exception 'application_system_fields_protected';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_candidate_application_system_fields on public.applications;
drop trigger if exists protect_application_system_fields on public.applications;
create trigger protect_application_system_fields
  before insert or update on public.applications
  for each row
  execute function public.protect_application_system_fields();

do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
      and cmd = 'UPDATE'
  loop
    execute format('drop policy if exists %I on public.applications', v_policy.policyname);
  end loop;
end $$;

create policy "Candidates can update own application draft content"
  on public.applications
  for update
  to authenticated
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

create policy "Assigned recruiters can update application recruitment fields"
  on public.applications
  for update
  to authenticated
  using (
    assigned_staff_id = auth.uid()
    and private.redstone_current_user_has_role(array['recruiter', 'hr'])
  )
  with check (
    assigned_staff_id = auth.uid()
    and private.redstone_current_user_has_role(array['recruiter', 'hr'])
  );

create policy "Admins can update applications"
  on public.applications
  for update
  to authenticated
  using (private.redstone_current_user_is_admin())
  with check (private.redstone_current_user_is_admin());

drop policy if exists "Staff can create assignment history" on public.application_assignment_history;
create policy "Admins can create assignment history"
  on public.application_assignment_history
  for insert
  to authenticated
  with check (
    changed_by = auth.uid()
    and private.redstone_current_user_is_admin()
  );

create or replace function public.admin_assign_application(
  p_application_id uuid,
  p_assigned_staff_id uuid,
  p_changed_by uuid default null,
  p_reason text default null
)
returns table(previous_staff_id uuid, assigned_staff_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous_staff_id uuid;
  v_actor uuid;
begin
  v_actor := private.redstone_assert_admin();

  if not exists (
    select 1
    from public.profiles p
    join public.staff_roles sr on sr.user_id = p.id
    where p.id = p_assigned_staff_id
      and p.is_active = true
      and p.profile_type in ('staff', 'admin', 'super_admin')
      and sr.active = true
      and sr.role in ('recruiter', 'hr', 'admin', 'super_admin')
  ) then
    raise exception 'assigned_staff_not_active';
  end if;

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
    v_actor,
    p_reason
  );

  return query select v_previous_staff_id, p_assigned_staff_id;
end;
$$;

create or replace function public.admin_update_application_status(
  p_application_id uuid,
  p_new_status text,
  p_changed_by uuid default null,
  p_reason text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table(previous_status text, new_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous_status text;
  v_actor uuid;
begin
  v_actor := private.redstone_assert_admin();

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
        assigned_staff_id = coalesce(assigned_staff_id, v_actor)
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
    v_actor,
    p_reason,
    coalesce(p_metadata, '{}'::jsonb)
  );

  return query select v_previous_status, p_new_status;
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
set search_path = ''
as $$
declare
  v_current_status text;
  v_job_id uuid;
  v_enforcement_enabled boolean;
  v_has_paid_payment boolean;
  v_has_active_waiver boolean;
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

  select a.status, a.job_id
    into v_current_status, v_job_id
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

  v_enforcement_enabled := public.application_payment_enforcement_enabled();

  if v_enforcement_enabled then
    select exists (
      select 1
      from public.application_payments ap
      where ap.application_id = p_application_id
        and ap.candidate_id = auth.uid()
        and ap.job_id = v_job_id
        and ap.purpose = 'CV_DOCUMENT_VERIFICATION'
        and ap.currency = 'KES'
        and ap.amount = 2000
        and ap.status = 'paid'
    )
    into v_has_paid_payment;

    select exists (
      select 1
      from public.application_payment_waivers aw
      where aw.application_id = p_application_id
        and aw.payment_purpose = 'CV_DOCUMENT_VERIFICATION'
        and aw.active = true
    )
    into v_has_active_waiver;

    if not coalesce(v_has_paid_payment, false)
      and not coalesce(v_has_active_waiver, false)
    then
      raise exception 'PAYMENT_REQUIRED';
    end if;
  end if;

  perform set_config('app.redstone_application_status_transition', 'candidate_submit', true);

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
set search_path = ''
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

  if v_current_status not in (
    'draft',
    'ready_for_payment',
    'payment_pending',
    'submitted',
    'under_review',
    'shortlisted',
    'interview',
    'employer_review',
    'offer_pending'
  ) then
    raise exception 'withdrawal_not_allowed';
  end if;

  perform set_config('app.redstone_application_status_transition', 'candidate_withdraw', true);

  update public.applications
    set status = 'withdrawn',
        withdrawn_at = now(),
        updated_at = now()
  where id = p_application_id
    and candidate_id = auth.uid();

  insert into public.application_status_history (
    application_id,
    previous_status,
    new_status,
    changed_by
  )
  values (
    p_application_id,
    v_current_status,
    'withdrawn',
    auth.uid()
  );

  insert into public.candidate_notifications (
    user_id,
    title,
    message,
    type
  )
  values (
    auth.uid(),
    'Application withdrawn',
    'Your application has been withdrawn.',
    'application'
  );

  return p_application_id;
end;
$$;

do $$
declare
  v_policy record;
begin
  for v_policy in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'DELETE'
      and (
        coalesce(qual, '') ilike '%candidate-documents%'
        or coalesce(with_check, '') ilike '%candidate-documents%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', v_policy.policyname);
  end loop;
end $$;

create policy "Candidates can delete own candidate documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'candidate-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can delete candidate documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'candidate-documents'
    and private.redstone_current_user_is_admin()
  );

drop policy if exists "Authorized staff can read payment records" on public.application_payments;
create policy "Finance and admins can read payment records"
  on public.application_payments
  for select
  to authenticated
  using (
    private.redstone_current_user_is_finance_or_admin()
  );

drop policy if exists "Authorized staff can read payment waivers" on public.application_payment_waivers;
create policy "Admins can read payment waivers"
  on public.application_payment_waivers
  for select
  to authenticated
  using (
    private.redstone_current_user_is_admin()
  );

do $$
declare
  v_function regprocedure;
begin
  foreach v_function in array array[
    to_regprocedure('public.redstone_assert_admin()'),
    to_regprocedure('public.redstone_current_user_is_finance_or_admin()'),
    to_regprocedure('public.redstone_current_user_is_admin()'),
    to_regprocedure('public.redstone_current_user_has_role(text[])')
  ]
  loop
    if v_function is not null then
      execute format('revoke execute on function %s from public, anon, authenticated', v_function);

      if not exists (
        select 1
        from pg_depend d
        where d.refobjid = v_function::oid
          and d.deptype = 'n'
      ) then
        execute format('drop function %s', v_function);
      else
        raise notice 'Leaving obsolete helper % in place because dependencies still exist.', v_function;
      end if;
    end if;
  end loop;
end $$;

do $$
declare
  v_function regprocedure;
begin
  foreach v_function in array array[
    to_regprocedure('public.handle_new_user()'),
    to_regprocedure('public.handle_new_candidate_profile()'),
    to_regprocedure('public.handle_new_employer_profile()'),
    to_regprocedure('public.log_application_status_change()'),
    to_regprocedure('public.provision_redstone_staff_personnel_record()'),
    to_regprocedure('public.set_staff_client_updated_at()'),
    to_regprocedure('public.set_application_payment_updated_at()'),
    to_regprocedure('public.prevent_receipt_reissue()'),
    to_regprocedure('public.redstone_payment_receipt_number()'),
    to_regprocedure('public.protect_employer_system_fields()'),
    to_regprocedure('public.protect_job_publication_fields()'),
    to_regprocedure('public.protect_profile_system_fields()'),
    to_regprocedure('public.protect_application_system_fields()')
  ]
  loop
    if v_function is not null then
      execute format('revoke execute on function %s from public, anon, authenticated', v_function);
    end if;
  end loop;
end $$;

grant execute on function public.employer_submit_company_verification(uuid) to authenticated;
grant execute on function public.candidate_submit_application(uuid, text, text, text, text) to authenticated;
grant execute on function public.candidate_withdraw_application(uuid) to authenticated;
grant execute on function public.admin_assign_application(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.admin_update_application_status(uuid, text, uuid, text, jsonb) to authenticated;

revoke execute on function public.employer_submit_company_verification(uuid) from public, anon;
revoke execute on function public.candidate_submit_application(uuid, text, text, text, text) from public, anon;
revoke execute on function public.candidate_withdraw_application(uuid) from public, anon;
revoke execute on function public.admin_assign_application(uuid, uuid, uuid, text) from public, anon;
revoke execute on function public.admin_update_application_status(uuid, text, uuid, text, jsonb) from public, anon;

revoke truncate on all tables in schema public from anon, authenticated;

commit;
