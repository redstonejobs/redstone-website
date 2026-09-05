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
  assert.match(publicJobs, /employer:employers!inner/);
  assert.match(publicJobs, /\.eq\("employer\.verification_status", "verified"\)/);
  assert.match(publicJobs, /\.eq\("employer\.is_active", true\)/);
  assert.doesNotMatch(publicJobs, /JOB_OCCUPATIONS\.map\(|JOB_OCCUPATIONS\.filter\(/);
});

test("jobs page contains only real vacancy results and no occupation-template catalogue", () => {
  assert.match(publicJobsPage, /getPublishedJobs\(params\)/);
  assert.match(publicJobsPage, /result\.jobs\.map/);
  assert.doesNotMatch(publicJobsPage, /catalogueGroups|JOB_OCCUPATIONS|occupationGroups/);
  assert.doesNotMatch(publicJobsPage, /JobPosting/);
});

test("job cards use real job slugs and do not build occupation apply links", () => {
  assert.match(publicJobs, /publicJobApplyHref/);
  assert.match(publicJobs, /publicJobApplyState/);
  assert.match(publicJobs, /label: "Apply Now"/);
  assert.match(publicJobs, /label: "Applications Closed"/);
  assert.match(publicJobs, /href: `\/login\?next=\$\{encodeURIComponent\(href\)\}`/);
  assert.match(jobCard, /publicJobApplyState\(\{ job \}\)/);
  assert.match(jobCard, /aria-disabled=\{apply\.disabled\}/);
  assert.match(jobCard, /\{apply\.label\}/);
  assert.doesNotMatch(jobCard, /JOB_OCCUPATIONS|occupation\.slug|\/apply\?occupation/);
});

test("candidate apply lookup and sitemap exclude expired or unavailable public vacancies", () => {
  assert.match(candidateData, /getPublishedJobBySlug/);
  assert.match(candidateData, /\.eq\("status", "published"\)/);
  assert.match(candidateData, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(candidateData, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.match(candidateData, /employer_filter:employers!inner\(id\)/);
  assert.match(candidateData, /\.eq\("employer_filter\.verification_status", "verified"\)/);
  assert.match(candidateData, /\.eq\("employer_filter\.is_active", true\)/);
  assert.match(candidateActions, /candidate_start_application/);
  assert.match(candidateActions, /redirect\(`\/candidate\/applications\/\$\{data\}`\)/);
  assert.match(sitemap, /getPublishedJobSitemapEntries/);
  assert.match(sitemap, /\/jobs\/\$\{job\.route\}/);
  assert.match(publicJobs, /getPublishedJobSitemapEntries/);
  assert.match(publicJobs, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(publicJobs, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.match(countries, /vacancies\.is\.null,vacancies\.gt\.0/);
});

test("country job counts use database head counts without downloading all jobs", () => {
  assert.match(countries, /COUNTRY_COUNT_CONCURRENCY = 6/);
  assert.match(countries, /select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(countries, /index \+= COUNTRY_COUNT_CONCURRENCY/);
  assert.match(countries, /Promise\.all/);
  assert.doesNotMatch(countries, /\.select\("country"\)/);
  assert.doesNotMatch(countries, /\.range\(from, to\)/);
});

test("JobPosting JSON-LD is generated only for a real open job detail", () => {
  assert.match(publicJobDetail, /const closed = isPublicJobClosed\(job\)/);
  assert.match(publicJobDetail, /!closed && job\.title && job\.country && job\.published_at/);
  assert.match(publicJobDetail, /<StructuredData data=\{structuredData\}/);
  assert.match(publicJobDetail, /"@type": "JobPosting"/);
  assert.match(publicJobDetail, /datePosted: job\.published_at/);
  assert.match(publicJobDetail, /validThrough: job\.application_deadline/);
  assert.match(publicJobDetail, /employmentType: job\.job_type/);
  assert.match(publicJobDetail, /publicJobApplyHref\(job\)/);
});

test("JobPosting hiring organization comes from a verified active employer", () => {
  assert.match(publicJobs, /employer:employers!inner\(company_name, verification_status, is_active\)/);
  assert.match(candidateData, /employer:employers!inner\(company_name, verification_status, is_active\)/);
  assert.match(publicJobs, /\.eq\("employer\.verification_status", "verified"\)/);
  assert.match(publicJobs, /\.eq\("employer\.is_active", true\)/);
  assert.match(publicJobDetail, /relationValue\(job\.employer, "company_name"\)/);
  assert.doesNotMatch(publicJobDetail, /hiringOrganizationName\s*=\s*SITE_NAME/);
});

test("publication remains tied to active verified employers", () => {
  assert.match(adminActions, /assertVerifiedEmployerForPublication/);
  assert.match(adminActions, /verification_status !== "verified"/);
  assert.match(adminActions, /is_active !== true/);
  assert.match(adminActions, /Only vacancies for active verified employers can be published/);
  assert.match(adminActions, /payload\.status === "published"/);
  assert.match(adminActions, /status === "published"[\s\S]+assertVerifiedEmployerForPublication/);
});
