import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalogue = readFileSync("src/lib/jobs/catalogue.ts", "utf8");
const matrix = readFileSync("src/lib/admin/global-job-matrix.ts", "utf8");
const actions = readFileSync("src/lib/admin/actions.ts", "utf8");
const bulkPage = readFileSync("src/app/admin/jobs/bulk-create/page.tsx", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const jobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const migration = readFileSync("supabase/migrations/20260823090000_global_job_publication_runs.sql", "utf8");

test("global job matrix calculates 201 occupations by 26 configured countries", () => {
  assert.match(matrix, /GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES = 26/);
  assert.match(matrix, /GLOBAL_JOB_MATRIX_EXPECTED_TOTAL = JOB_OCCUPATIONS\.length \* GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES/);
  assert.match(catalogue, /export const JOB_OCCUPATIONS = occupationGroups\.flatMap/);
  assert.match(bulkPage, /Total jobs/);
  assert.match(bulkPage, /Expected matrix/);
});

test("global job matrix uses durable run storage and bounded batch processing", () => {
  assert.match(migration, /create table if not exists public\.bulk_job_publication_runs/);
  assert.match(migration, /create table if not exists public\.bulk_job_publication_items/);
  assert.match(migration, /batch_size integer not null default 200/);
  assert.match(migration, /check \(batch_size between 1 and 200\)/);
  assert.match(matrix, /GLOBAL_JOB_MATRIX_BATCH_SIZE = 200/);
  assert.match(matrix, /current_offset/);
  assert.match(matrix, /batchStart \+ run\.batch_size/);
  assert.match(bulkPage, /Process Next Batch/);
});

test("global job matrix requires admin-provided employer vacancies and deadline", () => {
  assert.match(bulkPage, /global_employer_id/);
  assert.match(bulkPage, /global_default_vacancies/);
  assert.match(bulkPage, /global_application_deadline/);
  assert.match(matrix, /positiveInteger\(formData, "global_default_vacancies"\)/);
  assert.match(matrix, /Application deadline is required/);
  assert.match(matrix, /verification_status !== "verified"/);
});

test("global job matrix keeps salaries unconfirmed and does not invent benefits", () => {
  assert.match(matrix, /salary_confirmed: false/);
  assert.match(matrix, /To be confirmed by employer\./);
  assert.match(matrix, /salary_min: null/);
  assert.match(matrix, /salary_max: null/);
  assert.match(matrix, /not_confirmed/);
  assert.doesNotMatch(matrix, /salary_min:\s*[1-9]/);
});

test("global job matrix uses stable slugs and duplicate-safe retry behavior", () => {
  assert.match(matrix, /stableGlobalSlug/);
  assert.match(matrix, /occupation\.slug/);
  assert.match(matrix, /slugify\(country\)/);
  assert.match(matrix, /findGlobalDuplicate/);
  assert.match(matrix, /employerId\.slice\(0, 8\)/);
  assert.match(matrix, /deadlineToken/);
  assert.match(matrix, /\.eq\("slug", slug\)/);
  assert.match(matrix, /duplicate_skipped/);
});

test("global job matrix supports publish validation without one failed row aborting the run", () => {
  assert.match(matrix, /validateJobForPublication/);
  assert.match(matrix, /status: "published"/);
  assert.match(matrix, /validation_failed/);
  assert.match(matrix, /catch \(error\)/);
  assert.match(matrix, /failed \+= 1/);
  assert.match(matrix, /continue/);
});

test("global job matrix separates country fees and document requirements", () => {
  assert.match(matrix, /country_recruitment_settings/);
  assert.match(matrix, /processing_time_note/);
  assert.match(matrix, /Processing time varies by employer and immigration process/);
  assert.match(matrix, /job_document_requirements/);
  assert.match(matrix, /baselineDocuments/);
  assert.doesNotMatch(matrix, /ielts\|required/);
});

test("global job matrix actions and audit events are wired", () => {
  assert.match(actions, /createGlobalJobPublicationRun/);
  assert.match(actions, /processGlobalJobPublicationBatch/);
  assert.match(actions, /cancelGlobalJobPublicationRun/);
  for (const action of [
    "global_job_run_created",
    "global_job_batch_processed",
    "global_job_created",
    "global_job_published",
    "global_job_duplicate_skipped",
    "global_job_validation_failed",
    "global_job_run_completed",
    "global_job_run_cancelled",
  ]) {
    assert.match(matrix, new RegExp(action));
  }
});

test("public jobs remain published-only and server paginated", () => {
  assert.match(publicJobs, /\.eq\("status", "published"\)/);
  assert.match(publicJobs, /\.range\(/);
  assert.match(jobsPage, /result\.pageSize/);
  assert.match(jobsPage, /Next/);
});
