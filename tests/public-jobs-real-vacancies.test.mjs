import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const publicJobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const publicJobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const jobCard = readFileSync("src/components/public/job-card.tsx", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
const countries = readFileSync("src/lib/public/countries.ts", "utf8");
const adminActions = readFileSync("src/lib/admin/actions.ts", "utf8");

test("public vacancy surfaces read active published jobs from Supabase only", () => {
  assert.match(publicJobs, /\.from\("jobs"\)/);
  assert.match(publicJobs, /\.eq\("status", "published"\)/);
  assert.match(publicJobs, /\.not\("slug", "is", null\)/);
  assert.match(publicJobs, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(publicJobs, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.doesNotMatch(publicJobs, /JOB_OCCUPATIONS\.map\(|JOB_OCCUPATIONS\.filter\(/);
});

test("catalogue entries remain labelled as non-vacancy templates", () => {
  assert.match(publicJobsPage, /not current vacancies/);
  assert.match(publicJobsPage, /Apply buttons appear only on published job vacancies above/);
  assert.doesNotMatch(publicJobsPage, /JobPosting/);
});

test("job cards use real job slugs and do not build occupation apply links", () => {
  assert.match(jobCard, /href=\{`\/apply\/\$\{job\.slug\}`\}/);
  assert.doesNotMatch(jobCard, /JOB_OCCUPATIONS|occupation\.slug|\/apply\?occupation/);
});

test("candidate apply lookup and sitemap exclude expired or unavailable public vacancies", () => {
  assert.match(candidateData, /getPublishedJobBySlug/);
  assert.match(candidateData, /\.eq\("status", "published"\)/);
  assert.match(candidateActions, /candidate_start_application/);
  assert.match(sitemap, /getPublishedJobSitemapEntries/);
  assert.match(sitemap, /\/jobs\/\$\{job\.route\}/);
  assert.match(publicJobs, /getPublishedJobSitemapEntries/);
  assert.match(publicJobs, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(publicJobs, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.match(countries, /vacancies\.is\.null,vacancies\.gt\.0/);
});

test("JobPosting JSON-LD is only generated for real open job detail pages", () => {
  assert.match(publicJobDetail, /schemaEligible/);
  assert.match(publicJobDetail, /!closed/);
  assert.match(publicJobDetail, /<StructuredData data=\{structuredJob\}/);
  assert.match(publicJobDetail, /"@type": "JobPosting"/);
  assert.match(publicJobDetail, /datePosted: job\.published_at/);
  assert.match(publicJobDetail, /validThrough = deadlineIso\(job\.application_deadline\)/);
  assert.match(publicJobDetail, /employmentTypeFor\(job\)/);
  assert.match(publicJobDetail, /applicationContact/);
  assert.match(publicJobDetail, /salary_confirmed/);
  assert.match(publicJobDetail, /baseSalary/);
});

test("JobPosting hiring organization is verified employer or confidential", () => {
  assert.match(publicJobs, /employer:employers\(company_name, verification_status, is_active\)/);
  assert.match(candidateData, /employer:employers\(company_name, verification_status, is_active\)/);
  assert.match(publicJobDetail, /publicEmployerName/);
  assert.match(publicJobDetail, /verification_status === "verified"/);
  assert.match(publicJobDetail, /is_active === true/);
  assert.match(publicJobDetail, /return "confidential"/);
  assert.doesNotMatch(publicJobDetail, /hiringOrganizationName\s*=\s*SITE_NAME|Red Stone Employment Agency"\s*\}/);
});

test("publication remains tied to active verified employers", () => {
  assert.match(adminActions, /assertVerifiedEmployerForPublication/);
  assert.match(adminActions, /verification_status !== "verified"/);
  assert.match(adminActions, /is_active !== true/);
  assert.match(adminActions, /Only vacancies for active verified employers can be published/);
  assert.match(adminActions, /payload\.status === "published"/);
  assert.match(adminActions, /status === "published"[\s\S]+assertVerifiedEmployerForPublication/);
});
