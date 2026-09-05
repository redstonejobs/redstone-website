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
  assert.match(classifier, /requires_existing_authorization/);
  assert.match(classifier, /lmia_requested/);
  assert.match(classifier, /lmia_approved/);
  assert.match(classifier, /must be .*eligible.*work in canada/i);
  assert.match(run, /require_foreign_worker_signal/);
  assert.match(run, /publish_threshold/);
  assert.match(run, /needs_review/);
});

test("FoundRole is connected through approved server feed or authenticated MCP, not scraped HTML", () => {
  assert.match(foundrole, /FOUNDROLE_FEED_URL/);
  assert.match(foundrole, /FOUNDROLE_MCP_ACCESS_TOKEN/);
  assert.match(foundrole, /tools\/call/);
  assert.match(foundrole, /jobs_search/);
  assert.doesNotMatch(foundrole, /cheerio|puppeteer|playwright/);
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

test("public jobs can search imported source and international eligibility", () => {
  assert.match(search, /name="source"/);
  assert.match(search, /foundrole/);
  assert.match(search, /jobbank/);
  assert.match(search, /name="foreign_worker"/);
});
