import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260822233000_phase7_employer_portal.sql", "utf8");
const auth = readFileSync("src/lib/employer/auth.ts", "utf8");
const actions = readFileSync("src/lib/employer/actions.ts", "utf8");
const data = readFileSync("src/lib/employer/data.ts", "utf8");
const validation = readFileSync("src/lib/employer/validation.ts", "utf8");
const proxy = readFileSync("src/utils/supabase/proxy.ts", "utf8");
const redirectActions = readFileSync("src/lib/auth/actions.ts", "utf8");
const callback = readFileSync("src/app/auth/callback/route.ts", "utf8");
const applicantPage = readFileSync("src/app/employer/(portal)/applicants/[id]/page.tsx", "utf8");

test("employer migration creates owned portal tables with RLS", () => {
  for (const table of ["employer_job_requests", "employer_application_decisions", "employer_interview_requests", "employer_notifications", "employer_verification_documents"]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
});

test("employer auth requires employer profile and owned employer record", () => {
  assert.match(auth, /profile\.profile_type !== "employer"/);
  assert.match(auth, /\.eq\("owner_user_id", userData\.user\.id\)/);
  assert.match(auth, /requireVerifiedEmployer/);
});

test("registration only creates employer profile type and redirects through verification", () => {
  assert.match(actions, /profile_type: "employer"/);
  assert.doesNotMatch(actions, /profile_type:\s*"admin"|profile_type:\s*"staff"|profile_type:\s*"super_admin"/);
  assert.match(actions, /\/employer\/verify-email/);
});

test("login and callback route employers to employer portal", () => {
  assert.match(redirectActions, /profile\.profile_type === "employer"/);
  assert.match(callback, /profile\?\.profile_type === "employer"/);
  assert.match(proxy, /startsWith\("\/employer"\)/);
  assert.match(proxy, /\/employer\/register/);
});

test("vacancy validation enforces salary, vacancies and submission requirements", () => {
  assert.match(validation, /salaryMax < salaryMin/);
  assert.match(validation, /Vacancies must be greater than zero/);
  assert.match(validation, /requested_application_deadline/);
  assert.match(validation, /Invalid job category/);
});

test("employer decisions and interviews are owner checked and do not mutate application status", () => {
  assert.match(actions, /applicationBelongsToEmployer/);
  assert.match(actions, /employer_application_decisions/);
  assert.match(actions, /employer_interview_requests/);
  assert.doesNotMatch(actions, /\.from\("applications"\)\.update\(\{[^}]*status/s);
});

test("employer applicant data avoids internal notes and limits document types", () => {
  assert.doesNotMatch(`${data}\n${applicantPage}`, /internal_notes|candidate_notes|application_notes|admin_audit_logs|staff_roles/);
  assert.match(data, /\.in\("document_type", \["cv", "cv_cover_letter"\]\)/);
  assert.doesNotMatch(data, /select\("\*"\)/);
});

test("migration protects cross-employer access and country fee tables", () => {
  assert.match(migration, /owner_user_id = auth\.uid\(\)/);
  assert.match(migration, /join public\.jobs j on j\.id = a\.job_id/);
  assert.doesNotMatch(migration, /country_recruitment_settings[\s\S]+for update[\s\S]+profile_type = 'employer'/);
});
