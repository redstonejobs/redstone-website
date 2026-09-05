import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalogue = readFileSync("src/lib/jobs/catalogue.ts", "utf8");
const adminJobForm = readFileSync("src/components/admin/job-form.tsx", "utf8");
const employerVacancyForm = readFileSync("src/components/employer/vacancy-request-form.tsx", "utf8");
const publicJobSearch = readFileSync("src/components/public/job-search.tsx", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const publicJobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const publicJobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const globalJobMatrix = readFileSync("src/lib/admin/global-job-matrix.ts", "utf8");
const validation = readFileSync("src/lib/admin/validation.ts", "utf8");
const phase6Migration = readFileSync("supabase/migrations/20260822220000_phase6_advanced_jobs.sql", "utf8");
const phase7Migration = readFileSync("supabase/migrations/20260822233000_phase7_employer_portal.sql", "utf8");
const occupationContentBlock = catalogue.slice(catalogue.indexOf("function occupationContent(occupation"), catalogue.indexOf("function normalizeSearchText"));

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

test("occupation description library covers every canonical occupation", () => {
  for (const field of [
    "short_description",
    "full_description",
    "responsibilities",
    "requirements",
    "experience_guidance",
    "education_guidance",
    "language_guidance",
    "physical_requirements",
  ]) {
    assert.match(catalogue, new RegExp(`${field}:`), field);
  }

  assert.match(catalogue, /type OccupationContent =/);
  assert.match(catalogue, /\.\.\.occupationContent\(occupation\)/);
  assert.match(catalogue, /export const JOB_OCCUPATIONS = occupationGroups\.flatMap/);
  assert.match(globalJobMatrix, /GLOBAL_JOB_MATRIX_EXPECTED_TOTAL = JOB_OCCUPATIONS\.length \* GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES/);
});

test("occupation description library avoids guaranteed outcomes and vacancy-specific facts", () => {
  assert.doesNotMatch(occupationContentBlock, /guaranteed\s+(visa|job|employment)|visa\s+guaranteed/i);
  assert.doesNotMatch(occupationContentBlock, /must have \d|IELTS required|licen[cs]e mandatory|visa guaranteed/i);
  assert.doesNotMatch(occupationContentBlock, /salary_min|salary_max|KES|USD|EUR|GBP|CAD|AUD|\$\d|\d+\s*(?:KES|USD|EUR|GBP)/i);
  assert.doesNotMatch(occupationContentBlock, /United States|Canada|UAE|Qatar|Saudi Arabia|United Kingdom|Luxembourg/i);
});

test("country-specific generated jobs can reuse occupation defaults without duplicating content", () => {
  assert.match(globalJobMatrix, /short_description: null/);
  assert.match(globalJobMatrix, /description: null/);
  assert.match(globalJobMatrix, /responsibilities: null/);
  assert.match(globalJobMatrix, /requirements: null/);
  assert.match(validation, /resolveOccupationJobContent/);
  assert.match(validation, /occupationContent\.occupation/);
});

test("public job detail falls back to occupation content after job-specific overrides", () => {
  assert.match(publicJobDetail, /resolveOccupationJobContent\(job\)/);
  assert.match(publicJobDetail, /jobContent\.description/);
  assert.match(catalogue, /resolveText\(job\.description, occupation\?\.full_description/);
  assert.match(catalogue, /resolveList\(job\.responsibilities, occupation\?\.responsibilities/);
  assert.match(catalogue, /resolveList\(job\.requirements, occupation\?\.requirements/);
  assert.match(catalogue, /if \(jobText\?\.trim\(\)\) return "job"/);
});

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
