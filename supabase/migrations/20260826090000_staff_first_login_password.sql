-- ============================================================
-- RED STONE EMPLOYMENT AGENCY
-- Staff First-Login Password Security
--
-- Purpose:
--   - Mark staff accounts that are using a temporary password
--   - Force password change after first successful login
--   - Record when the password was changed
--   - Record when a temporary password was issued
--
-- IMPORTANT:
--   Temporary passwords are NEVER stored in this table.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Add first-login password security fields
-- ------------------------------------------------------------

alter table public.profiles
  add column if not exists must_change_password boolean not null default false;

alter table public.profiles
  add column if not exists temporary_password_issued_at timestamptz;

alter table public.profiles
  add column if not exists password_changed_at timestamptz;


-- ------------------------------------------------------------
-- 2. Documentation
-- ------------------------------------------------------------

comment on column public.profiles.must_change_password is
  'True when a staff user must replace an administrator-issued temporary password before accessing protected staff areas.';

comment on column public.profiles.temporary_password_issued_at is
  'Timestamp when an administrator last issued a temporary login password. The temporary password itself is never stored.';

comment on column public.profiles.password_changed_at is
  'Timestamp when the user successfully replaced the temporary password with their own password.';


-- ------------------------------------------------------------
-- 3. Existing accounts
--
-- Do NOT force existing users to change password automatically.
-- New staff accounts will explicitly set this field to TRUE.
-- ------------------------------------------------------------

update public.profiles
set must_change_password = false
where must_change_password is null;


-- ------------------------------------------------------------
-- 4. Useful index for administrative/security queries
-- ------------------------------------------------------------

create index if not exists profiles_must_change_password_idx
  on public.profiles (must_change_password)
  where must_change_password = true;


-- ------------------------------------------------------------
-- 5. Security helper
--
-- Used after the staff member successfully chooses a new
-- password. This updates the profile security state only.
-- Supabase Auth remains responsible for storing the password.
-- ------------------------------------------------------------

create or replace function public.complete_staff_first_login_password_change()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.profiles
  set
    must_change_password = false,
    password_changed_at = now()
  where id = auth.uid()
    and must_change_password = true;
end;
$$;

comment on function public.complete_staff_first_login_password_change() is
  'Marks the authenticated user first-login password requirement as completed after their Supabase Auth password has been changed.';


-- ------------------------------------------------------------
-- 6. Allow authenticated users to execute the helper.
--
-- The function can only update the row matching auth.uid().
-- ------------------------------------------------------------

revoke all on function public.complete_staff_first_login_password_change()
from public;

grant execute
on function public.complete_staff_first_login_password_change()
to authenticated;

commit;