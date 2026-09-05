import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hardening = readFileSync(
  "supabase/migrations/20260905090000_security_hardening_phase.sql",
  "utf8",
);
const employerActions = readFileSync("src/lib/employer/actions.ts", "utf8");
const adminActions = readFileSync("src/lib/admin/actions.ts", "utf8");
const paymentMigration = readFileSync(
  "supabase/migrations/20260901202311_application_payments_mpesa_prod_compat.sql",
  "utf8",
);
const paymentService = readFileSync(
  "src/lib/payments/application-payments.ts",
  "utf8",
);

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("trusted service-role bypass uses request JWT role, not postgres current_user", () => {
  assert.doesNotMatch(hardening, /current_user\s*=\s*'service_role'/);
  assert.doesNotMatch(hardening, /request\.jwt\.claim\.role/);
  assert.match(hardening, /create schema if not exists private/);
  assert.match(hardening, /function private\.redstone_current_jwt_role/);
  assert.match(hardening, /current_setting\('role', true\)/);
  assert.match(hardening, /v_effective_request_role = 'service_role'/);
  assert.match(hardening, /current_setting\('request\.jwt\.claims', true\)/);
  assert.match(hardening, /current_setting\('request\.jwt', true\)/);
  assert.doesNotMatch(hardening, /auth\.role\(\)/);
  assert.match(hardening, /function private\.redstone_is_service_role/);
  assert.match(hardening, /private\.redstone_current_jwt_role\(\) = 'service_role'/);
  assert.match(hardening, /grant usage on schema private to authenticated, service_role/);
});

test("privileged security definer functions use hardened empty search path", () => {
  const functionNames = [
    "private.redstone_current_user_has_role",
    "private.redstone_current_user_is_admin",
    "private.redstone_current_user_is_finance_or_admin",
    "private.redstone_assert_admin",
    "public.protect_employer_system_fields",
    "public.employer_submit_company_verification",
    "public.protect_job_publication_fields",
    "public.protect_profile_system_fields",
    "public.protect_application_system_fields",
    "public.admin_assign_application",
    "public.admin_update_application_status",
    "public.candidate_submit_application",
    "public.candidate_withdraw_application",
  ];

  for (const functionName of functionNames) {
    const functionSql = between(
      hardening,
      `create or replace function ${functionName}`,
      "$$;"
    );
    assert.match(functionSql, /security definer/);
    assert.match(functionSql, /set search_path = ''/);
  }
});

test("private authorization helpers stay callable by policies but are not public RPC helpers", () => {
  assert.match(hardening, /function private\.redstone_current_user_has_role\(p_roles text\[\]\)/);
  assert.match(hardening, /function private\.redstone_current_user_is_admin\(\)/);
  assert.match(hardening, /function private\.redstone_current_user_is_finance_or_admin\(\)/);
  assert.match(hardening, /function private\.redstone_assert_admin\(\)/);
  assert.match(hardening, /grant execute on function private\.redstone_current_user_has_role\(text\[\]\) to authenticated, service_role/);
  assert.match(hardening, /grant execute on function private\.redstone_current_user_is_admin\(\) to authenticated, service_role/);
  assert.match(hardening, /to_regprocedure\('public\.redstone_current_user_has_role\(text\[\]\)'\)/);
  assert.match(hardening, /revoke execute on function %s from public, anon, authenticated/);
  assert.match(hardening, /pg_depend d/);
  assert.match(hardening, /d\.refobjid = v_function::oid/);
  assert.match(hardening, /execute format\('drop function %s', v_function\)/);
  assert.doesNotMatch(hardening, /to_regprocedure\('private\.redstone_current_user_is_admin\(\)'\)/);
});

test("employer system fields are trigger protected and verification submission uses a controlled RPC", () => {
  const employerProtection = between(
    hardening,
    "create or replace function public.protect_employer_system_fields()",
    "drop trigger if exists protect_employer_system_fields",
  );

  assert.match(employerProtection, /private\.redstone_is_service_role\(\)/);
  assert.match(employerProtection, /private\.redstone_current_user_is_admin\(\)/);
  assert.match(employerProtection, /current_setting\('app\.redstone_employer_verification_submit', true\) = 'on'/);
  assert.match(employerProtection, /new\.verification_status is distinct from old\.verification_status/);
  assert.match(employerProtection, /new\.is_active is distinct from old\.is_active/);
  assert.match(employerProtection, /new\.owner_user_id is distinct from old\.owner_user_id/);
  assert.match(employerProtection, /new\.verification_submitted_at is distinct from old\.verification_submitted_at/);
  assert.match(employerProtection, /new\.verification_note is distinct from old\.verification_note/);
  assert.match(employerProtection, /raise exception 'employer_system_fields_protected'/);
  assert.match(hardening, /function public\.employer_submit_company_verification/);
  assert.match(hardening, /owner_user_id = v_actor/);
  assert.match(hardening, /verification_status in \('pending', 'rejected'\)/);
  assert.match(hardening, /grant execute on function public\.employer_submit_company_verification\(uuid\) to authenticated/);
  assert.match(employerActions, /rpc\("employer_submit_company_verification"/);
  assert.doesNotMatch(employerActions, /\.update\(\{\s*verification_status: "under_review"/);
});

test("non-admin users cannot directly publish or lifecycle-manage jobs", () => {
  const jobProtection = between(
    hardening,
    "create or replace function public.protect_job_publication_fields()",
    "drop trigger if exists protect_job_publication_fields",
  );

  assert.match(jobProtection, /private\.redstone_is_service_role\(\)/);
  assert.match(jobProtection, /new\.status in \('published', 'paused', 'closed', 'archived'\)/);
  assert.match(jobProtection, /raise exception 'job_publication_requires_admin'/);
  assert.match(jobProtection, /private\.redstone_current_user_has_role\(array\['recruiter', 'hr'\]\)/);
  assert.doesNotMatch(jobProtection, /array\['finance'[^\]]*\]/);
  assert.match(jobProtection, /exists \(\s*select 1\s*from public\.employers e[\s\S]+e\.owner_user_id = auth\.uid\(\)[\s\S]+e\.is_active = true/);
});

test("application system fields are protected while controlled status transitions remain possible", () => {
  const appProtection = between(
    hardening,
    "create or replace function public.protect_application_system_fields()",
    "drop trigger if exists protect_candidate_application_system_fields",
  );

  assert.match(appProtection, /private\.redstone_is_service_role\(\)/);
  assert.match(appProtection, /private\.redstone_current_user_is_admin\(\)/);
  assert.match(appProtection, /current_setting\('app\.redstone_application_status_transition', true\)/);
  assert.match(appProtection, /v_transition in \('candidate_submit', 'candidate_withdraw'\)/);

  for (const field of [
    "candidate_id",
    "job_id",
    "status",
    "assigned_staff_id",
    "submitted_at",
    "reviewed_at",
    "internal_notes",
  ]) {
    assert.match(appProtection, new RegExp(`new\\.${field} is distinct from old\\.${field}`));
  }

  assert.match(appProtection, /raise exception 'application_system_fields_protected'/);
  assert.match(hardening, /drop trigger if exists protect_candidate_application_system_fields/);
  assert.match(hardening, /where schemaname = 'public'\s+and tablename = 'applications'\s+and cmd = 'UPDATE'/);
  assert.match(hardening, /Assigned recruiters can update application recruitment fields/);
  assert.match(hardening, /assigned_staff_id = auth\.uid\(\)/);
  assert.match(hardening, /private\.redstone_current_user_has_role\(array\['recruiter', 'hr'\]\)/);
});

test("candidate submit and withdraw RPCs set controlled status-transition flags", () => {
  const submitRpc = between(
    hardening,
    "create or replace function public.candidate_submit_application",
    "create or replace function public.candidate_withdraw_application",
  );
  const withdrawRpc = between(
    hardening,
    "create or replace function public.candidate_withdraw_application",
    "do $$\r\ndeclare\r\n  v_policy record;",
  );

  assert.match(submitRpc, /p\.profile_type = 'candidate'/);
  assert.match(submitRpc, /p\.is_active = true/);
  assert.match(submitRpc, /public\.application_payment_enforcement_enabled\(\)/);
  assert.match(submitRpc, /ap\.purpose = 'CV_DOCUMENT_VERIFICATION'/);
  assert.match(submitRpc, /ap\.amount = 2000/);
  assert.match(submitRpc, /perform set_config\('app\.redstone_application_status_transition', 'candidate_submit', true\)/);
  assert.match(submitRpc, /set status = 'submitted'/);
  assert.match(withdrawRpc, /perform set_config\('app\.redstone_application_status_transition', 'candidate_withdraw', true\)/);
  assert.match(withdrawRpc, /set status = 'withdrawn'/);
  assert.match(hardening, /grant execute on function public\.candidate_submit_application\(uuid, text, text, text, text\) to authenticated/);
  assert.match(hardening, /grant execute on function public\.candidate_withdraw_application\(uuid\) to authenticated/);
});

test("admin assignment and status RPCs derive the actor from auth.uid and exclude finance-only assignment", () => {
  const assignmentAction = between(
    adminActions,
    "export async function assignApplication",
    "export async function addApplicationNote",
  );
  const assignRpc = between(
    hardening,
    "create or replace function public.admin_assign_application",
    "create or replace function public.admin_update_application_status",
  );

  assert.match(assignRpc, /v_actor := private\.redstone_assert_admin\(\)/);
  assert.match(assignRpc, /p\.id = p_assigned_staff_id/);
  assert.match(assignRpc, /p\.is_active = true/);
  assert.match(assignRpc, /sr\.active = true/);
  assert.match(assignRpc, /sr\.role in \('recruiter', 'hr', 'admin', 'super_admin'\)/);
  assert.doesNotMatch(assignRpc, /'finance'/);
  assert.match(assignRpc, /raise exception 'assigned_staff_not_active'/);
  assert.match(assignRpc, /changed_by,\s+reason[\s\S]+v_actor,\s+p_reason/);
  assert.match(hardening, /function public\.admin_update_application_status/);
  assert.match(hardening, /assigned_staff_id = coalesce\(assigned_staff_id, v_actor\)/);
  assert.doesNotMatch(assignmentAction, /p_changed_by: context\.user\.id/);
});

test("profile and referral system fields include production compensation fields and are schema-drift tolerant", () => {
  const profileProtection = between(
    hardening,
    "create or replace function public.protect_profile_system_fields()",
    "drop trigger if exists protect_profile_system_fields",
  );

  assert.match(profileProtection, /private\.redstone_jsonb_fields_changed\(to_jsonb\(old\), to_jsonb\(new\), v_protected_fields\)/);
  for (const field of [
    "profile_type",
    "is_active",
    "staff_id",
    "personnel_record_no",
    "referral_code",
    "referred_by_staff_id",
    "referral_attributed_at",
    "job_title",
    "department",
    "employment_type",
    "duty_station",
    "appointment_date",
    "employment_start_date",
    "reporting_officer",
    "identity_number",
    "must_change_password",
    "temporary_password_issued_at",
    "password_changed_at",
    "salary_amount",
    "salary_currency",
    "salary_period",
    "working_days_per_week",
    "working_hours_per_day",
    "working_hours_per_week",
    "work_schedule",
    "probation_period_months",
  ]) {
    assert.match(profileProtection, new RegExp(`'${field}'`));
  }
  assert.match(profileProtection, /raise exception 'profile_system_fields_protected'/);
});

test("candidate document storage delete policies no longer grant broad staff deletion", () => {
  assert.match(hardening, /tablename = 'objects'\s+and cmd = 'DELETE'/);
  assert.match(hardening, /candidate-documents/);
  assert.match(hardening, /Candidates can delete own candidate documents/);
  assert.match(hardening, /\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
  assert.match(hardening, /Admins can delete candidate documents/);
  assert.match(hardening, /private\.redstone_current_user_is_admin\(\)/);
  assert.doesNotMatch(hardening, /is_staff\(\)[\s\S]{0,160}for delete/);
});

test("payment writes remain privileged while payment read visibility is narrowed", () => {
  assert.match(paymentMigration, /revoke all on public\.application_payments from anon, authenticated/);
  assert.doesNotMatch(paymentMigration, /grant insert on public\.application_payments to authenticated/);
  assert.doesNotMatch(paymentMigration, /grant update on public\.application_payments to authenticated/);
  assert.match(paymentService, /const admin = createAdminClient\(\)/);
  assert.match(paymentService, /admin\s*\.\s*from\("application_payments"\)\s*\.\s*insert/);
  assert.match(paymentService, /const candidateClient = await createClient\(\)/);
  assert.match(paymentService, /const privileged = createAdminClient\(\)/);
  assert.match(hardening, /drop policy if exists "Authorized staff can read payment records"/);
  assert.match(hardening, /Finance and admins can read payment records/);
  assert.match(hardening, /private\.redstone_current_user_is_finance_or_admin\(\)/);
  assert.match(hardening, /Admins can read payment waivers/);
});

test("helper and trigger SECURITY DEFINER functions have direct EXECUTE privileges revoked without touching candidate RPC grants", () => {
  assert.match(hardening, /to_regprocedure\('public\.handle_new_user\(\)'\)/);
  assert.match(hardening, /to_regprocedure\('public\.handle_new_employer_profile\(\)'\)/);
  assert.match(hardening, /to_regprocedure\('public\.log_application_status_change\(\)'\)/);
  assert.match(hardening, /to_regprocedure\('public\.provision_redstone_staff_personnel_record\(\)'\)/);
  assert.match(hardening, /revoke execute on function %s from public, anon, authenticated/);
  assert.doesNotMatch(hardening, /revoke execute on function public\.candidate_start_application\(text\) from authenticated/);
  assert.doesNotMatch(hardening, /revoke execute on function public\.candidate_submit_application\(uuid, text, text, text, text\) from authenticated/);
  assert.doesNotMatch(hardening, /revoke execute on function public\.candidate_withdraw_application\(uuid\) from authenticated/);
});

test("ordinary roles lose unnecessary truncate privileges without changing payment fee constants", () => {
  assert.match(hardening, /revoke truncate on all tables in schema public from anon, authenticated/);
  assert.match(paymentMigration, /amount = 2000/);
  assert.match(paymentMigration, /purpose text not null default 'CV_DOCUMENT_VERIFICATION'/);
});
