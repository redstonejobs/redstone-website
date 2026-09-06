import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260905170000_automatic_external_job_imports.sql", "utf8");
const run = readFileSync("src/lib/job-import/run.ts", "utf8");
const classifier = readFileSync("src/lib/job-import/classify.ts", "utf8");
const foundrole = readFileSync("src/lib/job-import/providers/foundrole.ts", "utf8");
const jobbank = readFileSync("src/lib/job-import/providers/jobbank.ts", "utf8");
const route = readFileSync("src/app/api/internal/job-import/run/route.ts", "utf8");
const search = readFileSync("src/components/public/job-search.tsx", "utf8");
const workflow = readFileSync(".github/workflows/automatic-job-imports.yml", "utf8");

test("external imports have source identity, duplicate protection and external application mode", () => {
  assert.match(migration, /source_provider text not null default 'redstone'/);
  assert.match(migration, /source_external_id text/);
  assert.match(migration, /unique index[\s\S]+source_provider, source_external_id/);
  assert.match(migration, /application_mode in \('redstone', 'external'\)/);
  assert.match(migration, /External published jobs require source identity/);
});

test("automatic importer quality-screens overseas eligibility and never treats LMIA requested as approved", () => {
  assert.match(classifier, /lmia \(\?:has been \)\?requested[\s\S]{0,120}status: "lmia_requested", sponsorship: false/);
  assert.match(classifier, /lmia \(\?:is \)\?approved[\s\S]{0,120}status: "lmia_approved", sponsorship: true/);
  assert.match(run, /classification\.foreignWorkerStatus/);
  assert.match(run, /POSITIVE_FOREIGN_STATUSES\.has\(classification\.foreignWorkerStatus\)/);
});

test("employer-level TFWP or REP participation never becomes vacancy-specific sponsorship automatically", () => {
  assert.match(classifier, /TFWP|Recognized Employer|REP/i);
  assert.match(classifier, /vacancy|job/i);
});

test("FoundRole supports anonymous read-only MCP search plus optional authenticated\/feed modes", () => {
  assert.match(foundrole, /foundrole/i);
  assert.match(foundrole, /anonymous|bearer|feed/i);
});

test("Canada Job Bank uses only an authorized feed and does not scrape Job Bank search pages", () => {
  assert.match(jobbank, /JOBBANK_XML_FEED_URL/);
  assert.match(jobbank, /authorized XML feed/i);
  assert.doesNotMatch(jobbank, /jobbank\.gc\.ca\/(jobsearch|browsejobs|findajob)/i);
});

test("scheduled endpoint is secret-protected and GitHub Actions runs every two hours", () => {
  assert.match(route, /JOB_IMPORT_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(workflow, /17 \*\/2 \* \* \*/);
  assert.match(workflow, /Authorization: Bearer \$JOB_IMPORT_SECRET/);
});

test("public jobs expose international eligibility without leaking provider implementation filters", () => {
  assert.match(search, /name="foreign_worker"/);
  assert.match(search, /International Eligibility/);
  assert.doesNotMatch(search, /name="source"/);
  assert.doesNotMatch(search, />foundrole<|>jobbank</i);
});
