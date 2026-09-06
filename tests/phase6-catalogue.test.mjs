import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260822220000_phase6_advanced_jobs.sql", "utf8");
const costs = readFileSync("src/lib/jobs/costs.ts", "utf8");
const catalogue = readFileSync("src/lib/jobs/catalogue.ts", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const jobDetailContext = readFileSync("src/lib/public/job-detail-context.ts", "utf8");
const jobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const jobCard = readFileSync("src/components/public/job-card.tsx", "utf8");
const validation = readFileSync("src/lib/admin/validation.ts", "utf8");
const jobForm = readFileSync("src/components/admin/job-form.tsx", "utf8");

test("phase 6 migration uses current job schema names", () => {
  assert.match(`${publicJobs}\n${validation}`, /application_deadline/);
  assert.match(`${publicJobs}\n${validation}`, /vacancies/);
  assert.doesNotMatch(migration, /number_of_vacancies|jobs\.deadline|public\.jobs\s*\(\s*deadline\s*\)/);
});

test("country default fees are seeded as numeric KES values", () => {
  for (const [slug, amount] of [
    ["united-states", 450000],
    ["canada", 400000],
    ["uae", 150000],
    ["united-kingdom", 400000],
    ["luxembourg", 250000],
  ]) {
    assert.match(migration, new RegExp(`'${slug}'[\\s\\S]+${amount}`));
  }
  assert.doesNotMatch(migration, /KSH\s*\d|KES\s*\d/);
});

test("fee resolution prefers job override then country default", () => {
  assert.match(costs, /country_fee_override/);
  assert.match(costs, /source: "job_override"/);
  assert.match(costs, /source: "country_default"/);
});

test("document fee catalogue supports Gulf and non-Gulf medical plus IELTS opt-in", () => {
  assert.match(migration, /'health_certificate', 'Health Certificate', 'Gulf', 12500/);
  assert.match(migration, /'health_certificate', 'Health Certificate', 'Europe', 31060/);
  assert.match(migration, /'ielts', 'IELTS \/ Language Test', null, 35000/);
  assert.match(costs, /findFee/);
});

test("calculator accounts for existing candidate documents and safe public fields", () => {
  assert.match(costs, /alreadyUploaded/);
  assert.match(costs, /candidate_can_provide_existing/);
  assert.match(jobDetailContext, /getJobDetailContext/);
  assert.doesNotMatch(jobDetailContext, /document_fee_catalog[\s\S]{0,100}select\("\*"\)/);
});

test("salary TBD and confirmed salary are both supported", () => {
  assert.match(publicJobs, /salary_confirmed/);
  assert.match(`${jobDetail}\n${jobCard}`, /To be confirmed/);
  assert.match(validation, /salary_period/);
});

test("contract formatting and centralized categories exist", () => {
  assert.match(costs, /formatContract/);
  assert.match(catalogue, /ENTRY_LEVEL_JOB_CATEGORIES/);
  assert.match(catalogue, /SKILLED_JOB_CATEGORIES/);
  assert.match(catalogue, /semi_skilled/);
});

test("admin job form covers Phase 6 fields and publication validation requires live vacancy basics", () => {
  for (const field of ["responsibilities", "requirements", "salary_confirmed", "contract_type", "country_fee_override", "document_requirements"]) {
    assert.match(jobForm, new RegExp(field));
  }
  assert.match(validation, /"category"/);
  assert.match(validation, /"skill_level"/);
  assert.match(validation, /"application_deadline"/);
});
