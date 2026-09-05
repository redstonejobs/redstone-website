import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const publicJobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const publicJobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const externalJobDetail = readFileSync("src/app/(public)/opportunities/[slug]/page.tsx", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidateApply = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");
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
  assert.match(publicJobs, /source_status\.is\.null,source_status\.eq\.active/);
  assert.match(publicJobs, /employer:employers\(company_name, verification_status, is_active\)/);
  assert.match(publicJobs, /isPublicJobVisible/);
  assert.match(publicJobs, /employer\.verification_status === "verified"/);
  assert.match(publicJobs, /employer\.is_active === true/);
  assert.doesNotMatch(publicJobs, /JOB_OCCUPATIONS\.map\(|JOB_OCCUPATIONS\.filter\(/);
});

test("jobs page contains only real vacancy results and no occupation-template catalogue", () => {
  assert.match(publicJobsPage, /getPublishedJobs\(params\)/);
  assert.match(publicJobsPage, /result\.jobs\.map/);
  assert.doesNotMatch(publicJobsPage, /catalogueGroups|JOB_OCCUPATIONS|occupationGroups/);
  assert.doesNotMatch(publicJobsPage, /JobPosting/);
});

test("job cards preserve Red Stone application state and source-directed external Apply", () => {
  assert.match(publicJobs, /publicJobApplyHref/);
  assert.match(publicJobs, /publicJobApplyState/);
  assert.match(publicJobs, /label: "Apply Now"/);
  assert.match(publicJobs, /label: "Applications Closed"/);
  assert.match(
    publicJobs,
    /href: `\/login\?next=\$\{encodeURIComponent\(href\)\}`/
  );

  assert.match(jobCard, /publicJobApplyState\(\{ job \}\)/);
  assert.match(jobCard, /externalJobApplyUrl/);
  assert.match(jobCard, /isExternalJob/);
  assert.match(jobCard, /Apply at source/);
  assert.match(jobCard, /Source application unavailable/);
  assert.match(jobCard, /aria-disabled=\{apply\.disabled\}/);
  assert.match(jobCard, /\{apply\.label\}/);

  assert.doesNotMatch(
    jobCard,
    /JOB_OCCUPATIONS|occupation\.slug|\/apply\?occupation/
  );
});

test("candidate apply lookup and sitemap exclude unavailable vacancies and inactive sources", () => {
  assert.match(candidateData, /getPublishedJobBySlug/);
  assert.match(candidateData, /\.eq\("status", "published"\)/);
  assert.match(candidateData, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(candidateData, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.match(candidateData, /source_status\.is\.null,source_status\.eq\.active/);
  assert.match(candidateData, /isCandidateVisibleJob/);
  assert.match(candidateData, /isExternalJob\(job as SourceAwareJob\)/);
  assert.match(
    candidateData,
    /employer:employers\(company_name, verification_status, is_active\)/
  );

  assert.match(candidateActions, /candidate_start_application/);
  assert.match(
    candidateActions,
    /redirect\(`\/candidate\/applications\/\$\{data\}`\)/
  );

  assert.match(sitemap, /getPublishedJobSitemapEntries/);
  assert.match(sitemap, /\$\{SITE_URL\}\$\{job\.route\}/);

  assert.match(publicJobs, /getPublishedJobSitemapCount/);
  assert.match(publicJobs, /getPublishedJobSitemapShardCount/);
  assert.match(publicJobs, /getPublishedJobSitemapEntries\(shardId = 0\)/);
  assert.match(publicJobs, /SITEMAP_SHARD_SIZE = 1000/);

  assert.match(countries, /vacancies\.is\.null,vacancies\.gt\.0/);
});

test("country job counts use database head counts without downloading all jobs", () => {
  assert.match(countries, /COUNTRY_COUNT_CONCURRENCY = 6/);
  assert.match(
    countries,
    /select\("id", \{ count: "exact", head: true \}\)/
  );
  assert.match(countries, /index \+= COUNTRY_COUNT_CONCURRENCY/);
  assert.match(countries, /Promise\.all/);
  assert.doesNotMatch(countries, /\.select\("country"\)/);
  assert.doesNotMatch(countries, /\.range\(from, to\)/);
});

test("public free-text search loads the occupation catalogue only on demand", () => {
  assert.match(
    publicJobs,
    /await import\("@\/lib\/jobs\/catalogue"\)/
  );
  assert.doesNotMatch(
    publicJobs,
    /^import .*occupationSearchTerms/m
  );
});

test("JobPosting JSON-LD remains limited to eligible open Red Stone job details", () => {
  assert.match(publicJobDetail, /isPublicJobClosed|schemaEligible/);
  assert.match(publicJobDetail, /JobPosting/);
  assert.match(publicJobDetail, /datePosted/);
  assert.match(publicJobDetail, /validThrough/);
  assert.match(
    publicJobDetail,
    /publicJobApplyHref|applicationContact/
  );
});

test("syndicated jobs receive a dedicated SEO page and source-directed application", () => {
  assert.match(publicJobs, /\/opportunities\/\$\{slug\}/);
  assert.match(publicJobs, /isExternalJob\(job\)/);

  assert.match(externalJobDetail, /"@type": "JobPosting"/);
  assert.match(externalJobDetail, /directApply: false/);
  assert.match(externalJobDetail, /Apply at Source/);
  assert.match(
    externalJobDetail,
    /does not claim a recruitment mandate/
  );

  assert.match(candidateApply, /externalJobApplyUrl/);
  assert.match(candidateApply, /redirect\(externalApply\)/);
});

test("external jobs do not require an internal Red Stone employer record", () => {
  assert.match(publicJobs, /employer:employers\(company_name, verification_status, is_active\)/);
  assert.doesNotMatch(
    publicJobs,
    /employer:employers!inner\(company_name, verification_status, is_active\)/
  );

  assert.match(publicJobs, /if \(isExternalJob\(job\)\)/);
  assert.match(candidateData, /if \(isExternalJob\(job as SourceAwareJob\)\) return true/);
});

test("Red Stone jobs still require a verified active employer", () => {
  assert.match(publicJobs, /employer\.verification_status === "verified"/);
  assert.match(publicJobs, /employer\.is_active === true/);

  assert.match(candidateData, /record\.verification_status === "verified"/);
  assert.match(candidateData, /record\.is_active === true/);
});

test("manual publication remains tied to active verified employers", () => {
  assert.match(adminActions, /assertVerifiedEmployerForPublication/);
  assert.match(adminActions, /verification_status !== "verified"/);
  assert.match(adminActions, /is_active !== true/);
  assert.match(
    adminActions,
    /Only vacancies for active verified employers can be published/
  );
  assert.match(adminActions, /payload\.status === "published"/);
  assert.match(
    adminActions,
    /status === "published"[\s\S]+assertVerifiedEmployerForPublication/
  );
});