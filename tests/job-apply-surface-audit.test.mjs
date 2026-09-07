import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const jobCard = readFileSync("src/components/public/job-card.tsx", "utf8");
const jobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const jobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const applyPage = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");
const genericApply = readFileSync("src/app/(public)/apply/page.tsx", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const sponsorshipRole = readFileSync(
  "src/app/(public)/sponsorship-jobs/[country]/[role]/page.tsx",
  "utf8",
);
const homePage = readFileSync("src/app/(public)/home-page.tsx", "utf8");
const skilledPage = readFileSync("src/app/(public)/skilled-jobs/page.tsx", "utf8");
const unskilledPage = readFileSync("src/app/(public)/unskilled-jobs/page.tsx", "utf8");
const countryPage = readFileSync("src/app/(public)/countries/[slug]/page.tsx", "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return source.slice(from, to);
}

test("every public live-vacancy surface reuses the central JobCard Apply path", () => {
  for (const [name, source] of [
    ["home", homePage],
    ["skilled", skilledPage],
    ["unskilled", unskilledPage],
    ["country", countryPage],
  ]) {
    assert.match(source, /JobCard/, `${name} must render the shared job card`);
  }

  assert.match(jobCard, /publicJobApplyState\(\{ job \}\)/);
  assert.match(jobCard, /externalJobApplyUrl\(job\)/);
  assert.match(jobCard, /href=\{apply\.href\}/);
  assert.match(jobCard, /Apply at source/);
  assert.doesNotMatch(jobCard, /getCandidateApplications|getCandidateDocuments|JOB_OCCUPATIONS/);
});

test("job detail Apply buttons use one canonical lightweight Apply URL", () => {
  assert.match(jobDetail, /publicJobApplyHref/);
  assert.match(jobDetail, /const applyHref = closed \? "#" : publicJobApplyHref\(job\)/);
  assert.ok((jobDetail.match(/href=\{applyHref\}/g) ?? []).length >= 2);
  assert.doesNotMatch(
    jobDetail,
    /getPublishedJobs|getCandidateApplications|getCandidateDocuments|auth\.getUser|JOB_OCCUPATIONS/,
  );
});

test("Apply entry stays bounded for Cloudflare Workers", () => {
  assert.match(applyPage, /getPublishedJobBySlug\(slug\)/);
  assert.match(applyPage, /select\("profile_type, is_active"\)/);
  assert.match(applyPage, /await startApplication\(slug\)/);
  assert.doesNotMatch(
    applyPage,
    /getCandidateApplications|getCandidateDocuments|getJobDetailContext|getPublishedJobs|JOB_OCCUPATIONS/,
  );

  const lookup = between(
    candidateData,
    "export async function getPublishedJobBySlug",
    "function isCandidateVisibleJob",
  );
  assert.match(lookup, /\.eq\("slug", slug\)/);
  assert.match(lookup, /\.maybeSingle<CandidateRow>\(\)/);
  assert.doesNotMatch(lookup, /\.range\(|\.limit\(100|for \(|while \(/);

  const start = between(
    candidateActions,
    "export async function startApplication",
    "function applicationStartErrorReason",
  );
  assert.equal((start.match(/candidate_start_application/g) ?? []).length, 1);
  assert.doesNotMatch(start, /\.from\("jobs"\)|getPublishedJobs|getCandidateApplications/);
});

test("generic and sponsorship Apply entry points select a real confirmed vacancy before application", () => {
  assert.match(genericApply, /redirect\("\/jobs\?sort=newest"\)/);
  assert.match(jobsPage, /params\.sponsorship \?\? "confirmed"/);
  assert.match(jobsPage, /queryParams\.sponsorship = "true"/);

  assert.match(sponsorshipRole, /q: job\.role/);
  assert.match(sponsorshipRole, /sort: "newest"/);
  assert.match(sponsorshipRole, /vacancySearch\.set\("country", countryFilter\)/);
  assert.match(sponsorshipRole, /href=\{vacanciesHref\}/);
  assert.doesNotMatch(sponsorshipRole, /href="\/apply"/);
});
