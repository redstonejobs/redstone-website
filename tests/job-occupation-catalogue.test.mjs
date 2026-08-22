import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalogue = readFileSync("src/lib/jobs/catalogue.ts", "utf8");
const adminJobForm = readFileSync("src/components/admin/job-form.tsx", "utf8");
const employerVacancyForm = readFileSync("src/components/employer/vacancy-request-form.tsx", "utf8");
const publicJobSearch = readFileSync("src/components/public/job-search.tsx", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const publicJobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const phase6Migration = readFileSync("supabase/migrations/20260822220000_phase6_advanced_jobs.sql", "utf8");
const phase7Migration = readFileSync("supabase/migrations/20260822233000_phase7_employer_portal.sql", "utf8");

test("poster occupations are represented as a centralized catalogue, not published vacancies", () => {
  assert.match(catalogue, /export const JOB_OCCUPATIONS = occupationGroups\.flatMap/);
  assert.match(catalogue, /name: string/);
  assert.match(catalogue, /slug: string/);
  assert.match(catalogue, /category: string/);
  assert.match(catalogue, /skill_level: SkillLevelValue/);
  assert.match(catalogue, /is_active: true/);
  assert.match(catalogue, /sort_order: number/);
  assert.doesNotMatch(`${phase6Migration}\n${phase7Migration}`, /insert into public\.jobs[\s\S]+Housekeeper|insert into public\.jobs[\s\S]+Warehouse Worker|insert into public\.jobs[\s\S]+Registered Nurse/i);
});

test("duplicate poster titles have one canonical catalogue entry", () => {
  for (const title of ["Waiter / Waitress", "Kitchen Assistant", "Dishwasher", "Restaurant Cleaner", "Housekeeper", "Warehouse Worker", "Factory Worker"]) {
    assert.equal(occurrences(catalogue, `"${title}"`), 1, title);
  }
});

test("entry-level categories and hospitality classifications remain entry level", () => {
  for (const category of [
    "General Support & Maintenance",
    "Agriculture, Farm & Forestry",
    "Construction & Site Support",
    "Cleaning & Housekeeping",
    "Hospitality & Restaurant",
    "Factory & Warehouse",
    "Retail & Customer Support",
    "Transport & Delivery Support",
  ]) {
    assert.match(catalogue, new RegExp(escapeRegExp(`"${category}"`)));
  }

  assert.match(catalogue, /category: "Hospitality & Restaurant",\s+skill_level: "unskilled"[\s\S]+"Waiter \/ Waitress"[\s\S]+"Bakery Assistant"/);
  assert.match(catalogue, /category: "Cleaning & Housekeeping",\s+skill_level: "unskilled"[\s\S]+"Housekeeper"/);
});

test("skilled and professional defaults cover poster examples", () => {
  assert.match(catalogue, /category: "Construction & Trades",\s+skill_level: "skilled"[\s\S]+"Electrician"[\s\S]+"Heavy Equipment Operator"/);
  assert.match(catalogue, /category: "Business & Professional",\s+skill_level: "professional"[\s\S]+"Accountant"/);
  assert.match(catalogue, /category: "Healthcare & Medical",\s+skill_level: "professional"[\s\S]+"Registered Nurse"/);
  assert.match(catalogue, /category: "IT & Technology",\s+skill_level: "professional"[\s\S]+"Software Engineer"/);
  assert.match(catalogue, /"Welder \(Certified\)"/);
  assert.match(catalogue, /certified welder/);
});

test("admin, employer and public search surfaces use the shared occupation catalogue", () => {
  assert.match(adminJobForm, /JOB_OCCUPATIONS/);
  assert.match(adminJobForm, /admin-job-occupation-options/);
  assert.match(employerVacancyForm, /JOB_OCCUPATIONS/);
  assert.match(employerVacancyForm, /employer-job-occupation-options/);
  assert.match(publicJobSearch, /JOB_OCCUPATIONS/);
  assert.match(publicJobSearch, /public-job-occupation-options/);
});

test("public search expands occupation keywords while returning only published jobs", () => {
  assert.match(publicJobs, /occupationSearchTerms/);
  assert.match(publicJobs, /\.eq\("status", "published"\)/);
  assert.match(publicJobs, /job_type\.ilike/);
  assert.match(catalogue, /housekeeping/);
  assert.match(catalogue, /warehouse/);
});

test("public catalogue presentation is distinct from current vacancies", () => {
  assert.match(publicJobsPage, /Job Categories \/ Occupations We Recruit For/);
  assert.match(publicJobsPage, /not current vacancies/);
  assert.match(publicJobsPage, /Apply buttons appear only on published job vacancies above/);
  assert.doesNotMatch(publicJobsPage, /href=\{`\/apply\?\$\{occupation|Apply Now[\s\S]+JOB_OCCUPATIONS/);
});

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
