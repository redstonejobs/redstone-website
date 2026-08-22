create table if not exists public.country_recruitment_settings (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  country_name text not null,
  slug text not null unique,
  aliases text[] not null default '{}',
  region text not null,
  currency text,
  base_recruitment_fee numeric(12, 2),
  fee_currency text not null default 'KES',
  fee_label text not null default 'Estimated Programme Cost',
  processing_time_min integer,
  processing_time_max integer,
  processing_time_unit text,
  processing_time_note text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint country_recruitment_settings_processing_unit_allowed
    check (processing_time_unit is null or processing_time_unit in ('days', 'weeks', 'months')),
  constraint country_recruitment_settings_fee_nonnegative
    check (base_recruitment_fee is null or base_recruitment_fee >= 0)
);

create index if not exists country_recruitment_settings_active_order_idx
  on public.country_recruitment_settings (is_active, display_order, country_name);

create index if not exists country_recruitment_settings_region_idx
  on public.country_recruitment_settings (region);

alter table public.jobs
  add column if not exists short_description text,
  add column if not exists responsibilities text,
  add column if not exists requirements text,
  add column if not exists experience_requirements text,
  add column if not exists education_requirements text,
  add column if not exists language_requirements text,
  add column if not exists physical_requirements text,
  add column if not exists additional_requirements text,
  add column if not exists salary_confirmed boolean not null default false,
  add column if not exists salary_note text,
  add column if not exists contract_type text,
  add column if not exists contract_duration_value integer,
  add column if not exists contract_duration_unit text,
  add column if not exists contract_note text,
  add column if not exists working_hours_per_week numeric(5, 2),
  add column if not exists work_schedule text,
  add column if not exists overtime_note text,
  add column if not exists sponsorship_status text not null default 'not_confirmed',
  add column if not exists accommodation_status text not null default 'not_confirmed',
  add column if not exists meals_status text not null default 'not_confirmed',
  add column if not exists transport_status text not null default 'not_confirmed',
  add column if not exists medical_insurance_status text not null default 'not_confirmed',
  add column if not exists air_ticket_status text not null default 'not_confirmed',
  add column if not exists training_status text not null default 'not_confirmed',
  add column if not exists annual_leave_note text,
  add column if not exists other_benefits text,
  add column if not exists country_fee_override numeric(12, 2),
  add column if not exists country_fee_override_currency text,
  add column if not exists country_fee_override_note text,
  add column if not exists fee_relationship text not null default 'not_confirmed',
  add column if not exists processing_time_min integer,
  add column if not exists processing_time_max integer,
  add column if not exists processing_time_unit text,
  add column if not exists processing_time_note text,
  add constraint jobs_salary_period_allowed
    check (salary_period is null or salary_period in ('hour', 'day', 'week', 'month', 'year')) not valid,
  add constraint jobs_contract_duration_unit_allowed
    check (contract_duration_unit is null or contract_duration_unit in ('months', 'years')) not valid,
  add constraint jobs_processing_time_unit_allowed
    check (processing_time_unit is null or processing_time_unit in ('days', 'weeks', 'months')) not valid,
  add constraint jobs_benefit_status_allowed
    check (
      sponsorship_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and accommodation_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and meals_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and transport_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and medical_insurance_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and air_ticket_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
      and training_status in ('included', 'not_included', 'allowance', 'employer_specific', 'not_confirmed')
    ) not valid,
  add constraint jobs_fee_relationship_allowed
    check (fee_relationship in ('included_in_programme_fee', 'additional', 'candidate_provided', 'employer_covered', 'shared', 'not_confirmed')) not valid;

create index if not exists jobs_skill_category_idx
  on public.jobs (skill_level, category);

create index if not exists jobs_country_category_idx
  on public.jobs (country, category);

create table if not exists public.job_document_requirements (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  document_type text not null,
  required boolean not null default true,
  fee_applicable boolean not null default true,
  candidate_can_provide_existing boolean not null default true,
  cost_responsibility text not null default 'candidate',
  notes text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_document_requirements_responsibility_allowed
    check (cost_responsibility in ('candidate', 'employer', 'red_stone', 'shared', 'not_confirmed'))
);

create index if not exists job_document_requirements_job_order_idx
  on public.job_document_requirements (job_id, sort_order, document_type);

create table if not exists public.document_fee_catalog (
  id uuid primary key default gen_random_uuid(),
  document_type text not null,
  label text not null,
  region text,
  country_id uuid references public.country_recruitment_settings(id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null default 'KES',
  is_active boolean not null default true,
  effective_from date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_fee_catalog_amount_nonnegative check (amount >= 0)
);

create index if not exists document_fee_catalog_lookup_idx
  on public.document_fee_catalog (document_type, region, country_id, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists country_recruitment_settings_set_updated_at on public.country_recruitment_settings;
create trigger country_recruitment_settings_set_updated_at
  before update on public.country_recruitment_settings
  for each row execute function public.set_updated_at();

drop trigger if exists job_document_requirements_set_updated_at on public.job_document_requirements;
create trigger job_document_requirements_set_updated_at
  before update on public.job_document_requirements
  for each row execute function public.set_updated_at();

drop trigger if exists document_fee_catalog_set_updated_at on public.document_fee_catalog;
create trigger document_fee_catalog_set_updated_at
  before update on public.document_fee_catalog
  for each row execute function public.set_updated_at();

insert into public.country_recruitment_settings (
  country_code,
  country_name,
  slug,
  aliases,
  region,
  base_recruitment_fee,
  fee_currency,
  fee_label,
  is_active,
  is_featured,
  display_order
) values
  ('US', 'United States', 'united-states', array['USA', 'US', 'United States'], 'North America', 450000, 'KES', 'Estimated Programme Cost', true, true, 10),
  ('CA', 'Canada', 'canada', array['Canada'], 'North America', 400000, 'KES', 'Estimated Programme Cost', true, true, 20),
  ('AE', 'UAE', 'uae', array['UAE', 'United Arab Emirates'], 'Gulf', 150000, 'KES', 'Estimated Programme Cost', true, true, 30),
  ('QA', 'Qatar', 'qatar', array['Qatar'], 'Gulf', 150000, 'KES', 'Estimated Programme Cost', true, true, 40),
  ('KW', 'Kuwait', 'kuwait', array['Kuwait'], 'Gulf', 150000, 'KES', 'Estimated Programme Cost', true, true, 50),
  ('BH', 'Bahrain', 'bahrain', array['Bahrain'], 'Gulf', 150000, 'KES', 'Estimated Programme Cost', true, false, 60),
  ('OM', 'Oman', 'oman', array['Oman'], 'Gulf', 150000, 'KES', 'Estimated Programme Cost', true, false, 70),
  ('AU', 'Australia', 'australia', array['Australia'], 'Oceania', 400000, 'KES', 'Estimated Programme Cost', true, true, 80),
  ('NZ', 'New Zealand', 'new-zealand', array['New Zealand'], 'Oceania', 300000, 'KES', 'Estimated Programme Cost', true, false, 90),
  ('CL', 'Chile', 'chile', array['Chile'], 'South America', 300000, 'KES', 'Estimated Programme Cost', true, false, 100),
  ('PE', 'Peru', 'peru', array['Peru'], 'South America', 300000, 'KES', 'Estimated Programme Cost', true, false, 110),
  ('SG', 'Singapore', 'singapore', array['Singapore'], 'Asia', 150000, 'KES', 'Estimated Programme Cost', true, true, 120),
  ('GB', 'United Kingdom', 'united-kingdom', array['UK', 'United Kingdom'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, true, 130),
  ('DE', 'Germany', 'germany', array['Germany'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, true, 140),
  ('FR', 'France', 'france', array['France'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, false, 150),
  ('IT', 'Italy', 'italy', array['Italy'], 'Europe', 300000, 'KES', 'Estimated Programme Cost', true, false, 160),
  ('NL', 'Netherlands', 'netherlands', array['Netherlands'], 'Europe', 250000, 'KES', 'Estimated Programme Cost', true, false, 170),
  ('CH', 'Switzerland', 'switzerland', array['Switzerland'], 'Europe', 300000, 'KES', 'Estimated Programme Cost', true, false, 180),
  ('SE', 'Sweden', 'sweden', array['Sweden'], 'Europe', 300000, 'KES', 'Estimated Programme Cost', true, false, 190),
  ('NO', 'Norway', 'norway', array['Norway'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, false, 200),
  ('DK', 'Denmark', 'denmark', array['Denmark'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, false, 210),
  ('FI', 'Finland', 'finland', array['Finland'], 'Europe', 350000, 'KES', 'Estimated Programme Cost', true, false, 220),
  ('PL', 'Poland', 'poland', array['Poland'], 'Europe', 300000, 'KES', 'Estimated Programme Cost', true, false, 230),
  ('AT', 'Austria', 'austria', array['Austria'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, false, 240),
  ('IE', 'Ireland', 'ireland', array['Ireland'], 'Europe', 400000, 'KES', 'Estimated Programme Cost', true, false, 250),
  ('LU', 'Luxembourg', 'luxembourg', array['Luxembourg'], 'Europe', 250000, 'KES', 'Estimated Programme Cost', true, false, 260)
on conflict (slug) do update set
  aliases = excluded.aliases,
  region = excluded.region,
  base_recruitment_fee = excluded.base_recruitment_fee,
  fee_currency = excluded.fee_currency,
  fee_label = excluded.fee_label,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  display_order = excluded.display_order;

insert into public.document_fee_catalog (document_type, label, region, amount, currency, notes) values
  ('passport', 'Passport', null, 12500, 'KES', 'Initial Phase 6 Red Stone business reference'),
  ('consultant_letter', 'Consultant Letter', null, 5000, 'KES', 'Initial Phase 6 Red Stone business reference'),
  ('nea_clearance', 'NEA Clearance', null, 5000, 'KES', 'Initial Phase 6 Red Stone business reference'),
  ('cv_cover_letter', 'CV / Cover Letter', null, 1000, 'KES', 'Initial Phase 6 Red Stone business reference'),
  ('health_certificate', 'Health Certificate', 'Gulf', 12500, 'KES', 'Gulf medical reference'),
  ('health_certificate', 'Health Certificate', 'North America', 31060, 'KES', 'Western / non-Gulf medical reference'),
  ('health_certificate', 'Health Certificate', 'Europe', 31060, 'KES', 'Western / non-Gulf medical reference'),
  ('health_certificate', 'Health Certificate', 'Oceania', 31060, 'KES', 'Western / non-Gulf medical reference'),
  ('health_certificate', 'Health Certificate', 'Asia', 31060, 'KES', 'Non-Gulf medical reference'),
  ('health_certificate', 'Health Certificate', 'South America', 31060, 'KES', 'Non-Gulf medical reference'),
  ('police_clearance', 'Police Clearance', null, 1050, 'KES', 'Initial Phase 6 Red Stone business reference'),
  ('ielts', 'IELTS / Language Test', null, 35000, 'KES', 'Apply only when the vacancy/country/employer requires it'),
  ('attestation', 'Attestation', null, 3500, 'KES', 'Initial Phase 6 Red Stone business reference')
on conflict do nothing;

alter table public.country_recruitment_settings enable row level security;
alter table public.job_document_requirements enable row level security;
alter table public.document_fee_catalog enable row level security;

drop policy if exists "Anyone can read active country settings" on public.country_recruitment_settings;
create policy "Anyone can read active country settings"
  on public.country_recruitment_settings
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage country settings" on public.country_recruitment_settings;
create policy "Admins can manage country settings"
  on public.country_recruitment_settings
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

drop policy if exists "Anyone can read published job document requirements" on public.job_document_requirements;
create policy "Anyone can read published job document requirements"
  on public.job_document_requirements
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.jobs j
      where j.id = job_document_requirements.job_id
        and j.status = 'published'
    )
  );

drop policy if exists "Admins can manage job document requirements" on public.job_document_requirements;
create policy "Admins can manage job document requirements"
  on public.job_document_requirements
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

drop policy if exists "Anyone can read active document fees" on public.document_fee_catalog;
create policy "Anyone can read active document fees"
  on public.document_fee_catalog
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage document fees" on public.document_fee_catalog;
create policy "Admins can manage document fees"
  on public.document_fee_catalog
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

grant select on public.country_recruitment_settings to anon, authenticated;
grant insert, update, delete on public.country_recruitment_settings to authenticated;
grant select on public.job_document_requirements to anon, authenticated;
grant insert, update, delete on public.job_document_requirements to authenticated;
grant select on public.document_fee_catalog to anon, authenticated;
grant insert, update, delete on public.document_fee_catalog to authenticated;
