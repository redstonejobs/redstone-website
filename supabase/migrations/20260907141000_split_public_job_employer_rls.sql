drop policy if exists "Public can view verified employers" on public.employers;

create policy "Public can view verified employers"
on public.employers
for select
to anon, authenticated
using (
  verification_status = 'verified'
  and is_active = true
);

create policy "Staff can view all employers"
on public.employers
for select
to authenticated
using (public.is_staff());

drop policy if exists "Public can view published jobs" on public.jobs;

create policy "Public can view published jobs"
on public.jobs
for select
to anon, authenticated
using (
  status = 'published'
  and (application_deadline is null or application_deadline >= current_date)
  and exists (
    select 1
    from public.employers e
    where e.id = jobs.employer_id
      and e.verification_status = 'verified'
      and e.is_active = true
  )
);

create policy "Staff can view all jobs"
on public.jobs
for select
to authenticated
using (public.is_staff());

create policy "Employer owners can view own jobs"
on public.jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.employers e
    where e.id = jobs.employer_id
      and e.owner_user_id = auth.uid()
  )
);
