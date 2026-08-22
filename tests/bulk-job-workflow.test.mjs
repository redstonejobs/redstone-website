import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/lib/admin/actions.ts", "utf8");
const bulkPage = readFileSync("src/app/admin/jobs/bulk-create/page.tsx", "utf8");
const reviewPage = readFileSync("src/app/admin/jobs/bulk-create/review/page.tsx", "utf8");
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
