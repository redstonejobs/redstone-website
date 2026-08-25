import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/lib/admin/actions.ts", "utf8");
const bulkPage = readFileSync("src/app/admin/jobs/bulk-create/page.tsx", "utf8");
const reviewPage = readFileSync("src/app/admin/jobs/bulk-create/review/page.tsx", "utf8");
const controls = readFileSync("src/components/admin/bulk-create-controls.tsx", "utf8");
const multiSelect = readFileSync("src/components/admin/multi-select.tsx", "utf8");
const helper = readFileSync("src/lib/admin/bulk-jobs.ts", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");

test("bulk job workflow converts catalogue selections into draft jobs only", () => {
  assert.match(actions, /JOB_OCCUPATIONS/);
  assert.match(actions, /status: "draft"/);
  assert.match(actions, /published_at: null/);
  assert.doesNotMatch(actions, /status:\s*"published"[\s\S]+bulkJobPayload/);
});

test("bulk job workflow requires real vacancy facts and salary tbd fallback", () => {
  for (const field of ["employer_id", "country", "vacancies", "application_deadline"]) {
    assert.match(`${actions}\n${bulkPage}`, new RegExp(field));
  }
  assert.match(actions, /enter confirmed salary details or mark salary as TBD/);
  assert.match(actions, /To be confirmed by employer\./);
});

test("bulk job workflow protects against accidental duplicate vacancies", () => {
  assert.match(actions, /findDuplicateBulkJob/);
  assert.match(actions, /\.eq\("employer_id"/);
  assert.match(actions, /\.eq\("country"/);
  assert.match(actions, /\.eq\("title"/);
  assert.match(actions, /\.eq\("vacancies"/);
  assert.match(actions, /\.eq\("application_deadline"/);
  assert.match(actions, /skippedDuplicates/);
  assert.match(reviewPage, /Existing \/ skipped/);
});

test("bulk publish remains controlled and audited", () => {
  assert.match(reviewPage, /Bulk Publish/);
  assert.match(actions, /bulkSetJobStatus/);
  assert.match(actions, /validateJobForPublication\(job\)/);
  assert.match(actions, /bulk_job_creation/);
  assert.match(actions, /bulk_publication/);
  assert.match(actions, /bulk_status_change/);
});

test("bulk page includes the required admin warning and public jobs remain published-only", () => {
  assert.match(helper, /Only publish vacancies that Red Stone is currently authorized to recruit for/);
  assert.match(bulkPage, /BULK_JOB_WARNING/);
  assert.match(reviewPage, /BULK_JOB_WARNING/);
  assert.match(publicJobs, /\.eq\("status", "published"\)/);
});

test("bulk workflow uses searchable multi-selects for countries, employers and occupations", () => {
  assert.match(bulkPage, /BulkCreateControls/);
  assert.match(controls, /name="country"/);
  assert.match(controls, /name="employer_id"/);
  assert.match(controls, /name="occupation"/);
  assert.match(multiSelect, /type="search"/);
  assert.match(multiSelect, /Select all visible/);
  assert.match(multiSelect, /Clear all/);
  assert.match(multiSelect, /aria-multiselectable="true"/);
  assert.match(multiSelect, /Select category/);
});

test("bulk workflow calculates all combinations and enforces a safe maximum", () => {
  assert.match(controls, /selectedCountries\.length \* selectedEmployers\.length \* selectedOccupations\.length/);
  assert.match(controls, /Prepare Draft Vacancies/);
  assert.match(helper, /BULK_JOB_LIMIT = 200/);
  assert.match(actions, /draftKeys\.length > BULK_JOB_LIMIT/);
  assert.match(bulkPage, /This selection exceeds the safe maximum/);
});

test("bulk workflow validates real server-side country employer occupation combinations", () => {
  assert.match(actions, /country_recruitment_settings/);
  assert.match(actions, /activeCountries/);
  assert.match(actions, /verification_status === "verified"/);
  assert.match(actions, /A selected occupation is not in the approved catalogue/);
  assert.match(bulkPage, /\.eq\("verification_status", "verified"\)/);
});

test("bulk workflow resolves country and occupation defaults without inventing vacancy facts", () => {
  assert.match(bulkPage, /countryFeeText/);
  assert.match(bulkPage, /processing_time_min/);
  assert.match(bulkPage, /draft\.occupation\.category/);
  assert.match(bulkPage, /draft\.occupation\.skill_level/);
  assert.match(bulkPage, /Salary TBD: To be confirmed by employer/);
  assert.doesNotMatch(bulkPage, /default_salary_min/);
});

test("review page supports controlled common-value bulk editing before publication", () => {
  assert.match(reviewPage, /Bulk Edit Common Values/);
  assert.match(reviewPage, /bulkUpdateJobCommonValues/);
  assert.match(actions, /bulk_job_common_values_updated/);
  assert.match(reviewPage, /Bulk publish validates every selected vacancy/);
});
