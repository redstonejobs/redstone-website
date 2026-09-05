begin;

alter table public.applications
  add column if not exists relevant_experience text,
  add column if not exists availability text,
  add column if not exists candidate_message text,
  add column if not exists withdrawn_at timestamptz;

alter table public.applications
  alter column status set default 'draft',
  alter column submitted_at drop default;

alter table public.applications
  drop constraint if exists applications_status_allowed,
  drop constraint if exists applications_status_check,
  add constraint applications_status_allowed
  check (
    status in (
      'draft',
      'ready_for_payment',
      'payment_pending',
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

create table if not exists public.candidate_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists candidate_notifications_user_created_idx
  on public.candidate_notifications(user_id, created_at desc);

alter table public.candidate_notifications enable row level security;

drop policy if exists "Candidates can read own notifications" on public.candidate_notifications;
create policy "Candidates can read own notifications"
  on public.candidate_notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.candidate_notifications from anon, authenticated;
grant select on public.candidate_notifications to authenticated;

create table if not exists public.application_payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete restrict,
  provider text not null default 'mpesa',
  purpose text not null default 'CV_DOCUMENT_VERIFICATION',
  amount numeric(12, 2) not null,
  currency text not null default 'KES',
  phone_number text,
  internal_reference text not null unique,
  merchant_request_id text,
  checkout_request_id text,
  provider_receipt text,
  receipt_number text unique,
  receipt_issued_at timestamptz,
  status text not null default 'initiated',
  result_code text,
  result_description text,
  initiated_at timestamptz not null default now(),
  paid_at timestamptz,
  failed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_payments_provider_allowed
    check (provider in ('mpesa')),
  constraint application_payments_purpose_allowed
    check (purpose in ('CV_DOCUMENT_VERIFICATION')),
  constraint application_payments_currency_allowed
    check (currency in ('KES')),
  constraint application_payments_status_allowed
    check (status in ('initiated', 'pending', 'paid', 'failed', 'cancelled', 'expired')),
  constraint application_payments_amount_positive
    check (amount > 0),
  constraint application_payments_verification_fee_exact
    check (purpose <> 'CV_DOCUMENT_VERIFICATION' or (currency = 'KES' and amount = 2000)),
  constraint application_payments_receipt_complete
    check (
      (receipt_number is null and receipt_issued_at is null)
      or (receipt_number is not null and receipt_issued_at is not null and status = 'paid')
    )
);

create table if not exists public.application_payment_callbacks (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.application_payments(id) on delete set null,
  provider text not null default 'mpesa',
  checkout_request_id text,
  merchant_request_id text,
  result_code text,
  payload_hash text not null unique,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint application_payment_callbacks_provider_allowed
    check (provider in ('mpesa'))
);

create table if not exists public.application_payment_waivers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  payment_purpose text not null default 'CV_DOCUMENT_VERIFICATION',
  waived_by uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_payment_waivers_purpose_allowed
    check (payment_purpose in ('CV_DOCUMENT_VERIFICATION')),
  constraint application_payment_waivers_reason_required
    check (length(trim(reason)) >= 10)
);

create table if not exists public.application_payment_settings (
  id boolean primary key default true,
  payment_enforcement_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint application_payment_settings_singleton
    check (id = true)
);

insert into public.application_payment_settings (
  id,
  payment_enforcement_enabled
)
values (
  true,
  false
)
on conflict (id) do nothing;

create index if not exists application_payments_application_idx
  on public.application_payments(application_id, created_at desc);

create index if not exists application_payments_candidate_idx
  on public.application_payments(candidate_id, created_at desc);

create index if not exists application_payments_job_idx
  on public.application_payments(job_id, created_at desc);

create unique index if not exists application_payments_checkout_request_unique_idx
  on public.application_payments(checkout_request_id)
  where checkout_request_id is not null;

create unique index if not exists application_payments_active_unique_idx
  on public.application_payments(application_id, purpose)
  where status in ('initiated', 'pending');

create unique index if not exists application_payments_paid_unique_idx
  on public.application_payments(application_id, purpose)
  where status = 'paid';

create index if not exists application_payment_callbacks_payment_idx
  on public.application_payment_callbacks(payment_id, created_at desc);

create unique index if not exists application_payment_waivers_active_unique_idx
  on public.application_payment_waivers(application_id, payment_purpose)
  where active = true;

drop trigger if exists application_payment_settings_set_updated_at on public.application_payment_settings;

create or replace function public.set_application_payment_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists application_payments_set_updated_at on public.application_payments;
create trigger application_payments_set_updated_at
  before update on public.application_payments
  for each row
  execute function public.set_application_payment_updated_at();

drop trigger if exists application_payment_waivers_set_updated_at on public.application_payment_waivers;
create trigger application_payment_waivers_set_updated_at
  before update on public.application_payment_waivers
  for each row
  execute function public.set_application_payment_updated_at();

create trigger application_payment_settings_set_updated_at
  before update on public.application_payment_settings
  for each row
  execute function public.set_application_payment_updated_at();

create or replace function public.prevent_receipt_reissue()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.receipt_number is not null and new.receipt_number is distinct from old.receipt_number then
    raise exception 'receipt_number_immutable';
  end if;

  if old.receipt_issued_at is not null and new.receipt_issued_at is distinct from old.receipt_issued_at then
    raise exception 'receipt_issued_at_immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists application_payments_prevent_receipt_reissue on public.application_payments;
create trigger application_payments_prevent_receipt_reissue
  before update on public.application_payments
  for each row
  execute function public.prevent_receipt_reissue();

create or replace function public.redstone_payment_receipt_number()
returns text
language plpgsql
set search_path = public
as $$
declare
  v_candidate text;
begin
  loop
    v_candidate := 'RS-PAY-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.application_payments where receipt_number = v_candidate
    );
  end loop;

  return v_candidate;
end;
$$;

alter table public.application_payments enable row level security;
alter table public.application_payment_callbacks enable row level security;
alter table public.application_payment_waivers enable row level security;
alter table public.application_payment_settings enable row level security;

drop policy if exists "Candidates can read own payment records" on public.application_payments;
create policy "Candidates can read own payment records"
  on public.application_payments
  for select
  to authenticated
  using (candidate_id = (select auth.uid()));

drop policy if exists "Authorized staff can read payment records" on public.application_payments;
create policy "Authorized staff can read payment records"
  on public.application_payments
  for select
  to authenticated
  using ((select public.is_staff()));

drop policy if exists "Authorized staff can read payment waivers" on public.application_payment_waivers;
create policy "Authorized staff can read payment waivers"
  on public.application_payment_waivers
  for select
  to authenticated
  using ((select public.is_staff()));

revoke all on public.application_payments from anon, authenticated;
revoke all on public.application_payment_callbacks from anon, authenticated;
revoke all on public.application_payment_waivers from anon, authenticated;
revoke all on public.application_payment_settings from anon, authenticated;

grant select on public.application_payments to authenticated;
grant select on public.application_payment_waivers to authenticated;

create or replace function public.application_payment_enforcement_enabled()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (
      select payment_enforcement_enabled
      from public.application_payment_settings
      where id = true
    ),
    false
  );
$$;

create or replace function public.has_payment_waive_capability(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.staff_roles sr on sr.user_id = p.id
    where p.id = p_user_id
      and p.is_active = true
      and p.profile_type = 'super_admin'
      and sr.active = true
      and sr.role = 'super_admin'
  );
$$;

create or replace function public.record_mpesa_callback(
  p_checkout_request_id text,
  p_merchant_request_id text,
  p_result_code text,
  p_result_description text,
  p_payload_hash text,
  p_provider_receipt text,
  p_verified_amount numeric,
  p_verified_phone text,
  p_provider_confirmed_success boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.application_payments%rowtype;
  v_failure_status text;
begin
  if nullif(trim(coalesce(p_checkout_request_id, '')), '') is null then
    raise exception 'checkout_request_id_required';
  end if;

  if nullif(trim(coalesce(p_payload_hash, '')), '') is null then
    raise exception 'payload_hash_required';
  end if;

  select *
    into v_payment
  from public.application_payments
  where checkout_request_id = p_checkout_request_id
  for update;

  if v_payment.id is null then
    insert into public.application_payment_callbacks (
      provider,
      checkout_request_id,
      merchant_request_id,
      result_code,
      payload_hash
    )
    values (
      'mpesa',
      p_checkout_request_id,
      p_merchant_request_id,
      p_result_code,
      p_payload_hash
    )
    on conflict (payload_hash) do nothing;

    return jsonb_build_object('ok', false, 'status', 'unknown_payment', 'should_finalize', false);
  end if;

  insert into public.application_payment_callbacks (
    payment_id,
    provider,
    checkout_request_id,
    merchant_request_id,
    result_code,
    payload_hash
  )
  values (
    v_payment.id,
    'mpesa',
    p_checkout_request_id,
    p_merchant_request_id,
    p_result_code,
    p_payload_hash
  )
  on conflict (payload_hash) do nothing;

  if v_payment.status = 'paid' then
    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', 'paid', 'should_finalize', false);
  end if;

  if v_payment.status not in ('initiated', 'pending') then
    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_payment.status, 'should_finalize', false);
  end if;

  if p_result_code = '0' then
    if p_provider_confirmed_success is not true then
      return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_payment.status, 'should_finalize', false);
    end if;

    if v_payment.provider <> 'mpesa'
      or v_payment.purpose <> 'CV_DOCUMENT_VERIFICATION'
      or v_payment.currency <> 'KES'
      or v_payment.amount <> 2000
    then
      raise exception 'payment_record_mismatch';
    end if;

    if p_verified_amount is not null and p_verified_amount <> v_payment.amount then
      raise exception 'payment_amount_conflict';
    end if;

    if p_verified_phone is not null
      and v_payment.phone_number is not null
      and p_verified_phone <> v_payment.phone_number
    then
      raise exception 'payment_phone_conflict';
    end if;

    update public.application_payments
      set status = 'paid',
          provider_receipt = nullif(trim(coalesce(p_provider_receipt, '')), ''),
          result_code = p_result_code,
          result_description = p_result_description,
          paid_at = now()
    where id = v_payment.id;

    return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', 'paid', 'should_finalize', true);
  end if;

  v_failure_status := case
    when p_result_code = '1032' then 'cancelled'
    when p_result_code = '1037' then 'expired'
    else 'failed'
  end;

  update public.application_payments
    set status = v_failure_status,
        result_code = p_result_code,
        result_description = p_result_description,
        failed_at = now()
  where id = v_payment.id
    and status in ('initiated', 'pending');

  update public.applications
    set status = 'ready_for_payment',
        updated_at = now()
  where id = v_payment.application_id
    and status = 'payment_pending';

  return jsonb_build_object('ok', true, 'payment_id', v_payment.id, 'status', v_failure_status, 'should_finalize', false);
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

create or replace function public.submit_application_after_verified_payment(p_payment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.application_payments%rowtype;
  v_application public.applications%rowtype;
begin
  select *
    into v_payment
  from public.application_payments
  where id = p_payment_id
  for update;

  if v_payment.id is null then
    raise exception 'payment_not_found';
  end if;

  if v_payment.provider <> 'mpesa'
    or v_payment.purpose <> 'CV_DOCUMENT_VERIFICATION'
    or v_payment.currency <> 'KES'
    or v_payment.amount <> 2000
    or v_payment.status <> 'paid'
  then
    raise exception 'payment_not_verified';
  end if;

  select *
    into v_application
  from public.applications
  where id = v_payment.application_id
    and candidate_id = v_payment.candidate_id
    and job_id = v_payment.job_id
  for update;

  if v_application.id is null then
    raise exception 'application_not_found';
  end if;

  if v_application.status not in ('ready_for_payment', 'payment_pending', 'submitted') then
    raise exception 'application_not_ready_for_payment_finalization';
  end if;

  if v_application.status <> 'submitted' then
    update public.applications
      set status = 'submitted',
          submitted_at = coalesce(submitted_at, now()),
          updated_at = now()
    where id = v_application.id;

    insert into public.application_status_history (
      application_id,
      previous_status,
      new_status,
      changed_by,
      reason,
      metadata
    )
    values (
      v_application.id,
      v_application.status,
      'submitted',
      v_payment.candidate_id,
      'Verified CV and document payment received',
      jsonb_build_object('payment_id', v_payment.id, 'purpose', v_payment.purpose)
    );

    insert into public.admin_audit_logs (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      description,
      metadata
    )
    values (
      v_payment.candidate_id,
      'application_payment_finalized',
      'application',
      v_application.id,
      'Verified payment finalized candidate application submission',
      jsonb_build_object('payment_id', v_payment.id, 'purpose', v_payment.purpose)
    );
  end if;

  if v_payment.receipt_number is null then
    update public.application_payments
      set receipt_number = public.redstone_payment_receipt_number(),
          receipt_issued_at = now()
    where id = v_payment.id;
  end if;

  return v_application.id;
end;
$$;

drop function if exists public.admin_waive_application_payment(uuid, text, uuid, text);

create or replace function public.admin_waive_application_payment(
  p_application_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_waiver_id uuid;
  v_actor uuid;
begin
  v_actor := auth.uid();

  if v_actor is null then
    raise exception 'authenticated_user_required';
  end if;

  if length(trim(coalesce(p_reason, ''))) < 10 then
    raise exception 'waiver_reason_required';
  end if;

  if not public.has_payment_waive_capability(v_actor) then
    raise exception 'payments_waive_required';
  end if;

  if not exists (
    select 1
    from public.applications
    where id = p_application_id
  ) then
    raise exception 'application_not_found';
  end if;

  insert into public.application_payment_waivers (
    application_id,
    payment_purpose,
    waived_by,
    reason,
    active
  )
  values (
    p_application_id,
    'CV_DOCUMENT_VERIFICATION',
    v_actor,
    p_reason,
    true
  )
  on conflict (application_id, payment_purpose) where active = true
  do nothing
  returning id into v_waiver_id;

  if v_waiver_id is null then
    raise exception 'active_payment_waiver_exists';
  end if;

  insert into public.admin_audit_logs (
    actor_user_id,
    action,
    entity_type,
    entity_id,
    description,
    metadata
  )
  values (
    v_actor,
    'application_payment_waived',
    'application',
    p_application_id,
    'CV and document verification payment waived',
    jsonb_build_object('purpose', 'CV_DOCUMENT_VERIFICATION')
  );

  return v_waiver_id;
end;
$$;


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
  join public.employers e on e.id = j.employer_id
  where j.slug = p_job_slug
    and j.status = 'published'
    and (j.application_deadline is null or j.application_deadline >= current_date)
    and (j.vacancies is null or j.vacancies > 0)
    and e.verification_status = 'verified'
    and e.is_active = true;

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

  insert into public.applications (
    job_id,
    candidate_id,
    status,
    submitted_at
  )
  values (
    v_job_id,
    auth.uid(),
    'draft',
    null
  )
  returning id into v_application_id;

  insert into public.application_status_history (
    application_id,
    previous_status,
    new_status,
    changed_by
  )
  values (
    v_application_id,
    null,
    'draft',
    auth.uid()
  );

  return v_application_id;
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

create or replace function public.protect_candidate_application_system_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated'
     and auth.uid() is not null
     and not public.is_staff()
  then
    if tg_op = 'INSERT' then
      if new.candidate_id <> auth.uid() then
        raise exception 'candidate_application_owner_mismatch';
      end if;

      if new.status <> 'draft'
         or new.submitted_at is not null
         or new.reviewed_at is not null
         or new.assigned_staff_id is not null
         or new.internal_notes is not null
      then
        raise exception 'candidate_application_protected_fields';
      end if;

      return new;
    end if;

    if old.candidate_id = auth.uid() then
      if new.candidate_id is distinct from old.candidate_id
         or new.job_id is distinct from old.job_id
         or new.submitted_at is distinct from old.submitted_at
         or new.reviewed_at is distinct from old.reviewed_at
         or new.assigned_staff_id is distinct from old.assigned_staff_id
         or new.internal_notes is distinct from old.internal_notes
      then
        raise exception 'candidate_application_protected_fields';
      end if;

      if new.status is distinct from old.status
         and new.status not in ('draft', 'ready_for_payment', 'payment_pending')
      then
        raise exception 'candidate_application_status_requires_server_action';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_candidate_application_system_fields on public.applications;
create trigger protect_candidate_application_system_fields
  before insert or update on public.applications
  for each row
  execute function public.protect_candidate_application_system_fields();

drop policy if exists "Candidates can create own applications" on public.applications;
create policy "Candidates can create own applications"
  on public.applications
  for insert
  to authenticated
  with check (
    candidate_id = (select auth.uid())
    and status = 'draft'
    and submitted_at is null
    and exists (
      select 1
      from public.jobs j
      join public.employers e on e.id = j.employer_id
      where j.id = applications.job_id
        and j.status = 'published'
        and (j.application_deadline is null or j.application_deadline >= current_date)
        and (j.vacancies is null or j.vacancies > 0)
        and e.verification_status = 'verified'
        and e.is_active = true
    )
  );

revoke truncate on public.applications from anon, authenticated;

revoke execute on function public.candidate_start_application(text) from public, anon;
revoke execute on function public.candidate_withdraw_application(uuid) from public, anon;
grant execute on function public.candidate_start_application(text) to authenticated;
grant execute on function public.candidate_withdraw_application(uuid) to authenticated;

revoke execute on function public.application_payment_enforcement_enabled() from public, anon, authenticated;
revoke execute on function public.has_payment_waive_capability(uuid) from public, anon, authenticated;
revoke execute on function public.record_mpesa_callback(text, text, text, text, text, text, numeric, text, boolean) from public, anon, authenticated;
revoke execute on function public.candidate_submit_application(uuid, text, text, text, text) from public, anon;
revoke execute on function public.submit_application_after_verified_payment(uuid) from public, anon, authenticated;
revoke execute on function public.admin_waive_application_payment(uuid, text) from public, anon;

grant execute on function public.candidate_submit_application(uuid, text, text, text, text) to authenticated;
grant execute on function public.record_mpesa_callback(text, text, text, text, text, text, numeric, text, boolean) to service_role;
grant execute on function public.submit_application_after_verified_payment(uuid) to service_role;
grant execute on function public.admin_waive_application_payment(uuid, text) to authenticated;

alter table public.applications
  validate constraint applications_status_allowed;

commit;
