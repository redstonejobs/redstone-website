import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const proxy = readFileSync("proxy.ts", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const jobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const applyPage = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");
const genericApplyPage = readFileSync("src/app/apply/page.tsx", "utf8");
const homePage = readFileSync("src/app/(public)/home-page.tsx", "utf8");
const countries = readFileSync("src/lib/public/countries.ts", "utf8");

test("public jobs bypass auth proxy and duplicate legacy middleware is removed", () => {
  assert.match(proxy, /"\/admin\/:path\*"/);
  assert.match(proxy, /"\/candidate\/:path\*"/);
  assert.match(proxy, /"\/employer\/:path\*"/);
  assert.doesNotMatch(proxy, /\(\(\?!_next\/static/);
  assert.doesNotMatch(proxy, /"\/jobs/);
  assert.doesNotMatch(proxy, /"\/apply\/:path\*"/);
  assert.equal(existsSync("middleware.ts"), false);
});

test("jobs listing fetches only one database page using a reduced card projection", () => {
  assert.match(publicJobs, /const PUBLIC_JOB_CARD_SELECT/);
  assert.match(publicJobs, /\.select\(PUBLIC_JOB_CARD_SELECT, \{ count: "exact" \}\)/);
  assert.match(publicJobs, /\.range\(from, to\)/);
  assert.match(publicJobs, /export const PAGE_SIZE = 9/);
});

test("jobs catalogue grouping is precomputed instead of rebuilt for every request", () => {
  assert.match(jobsPage, /const CATALOGUE_GROUPS = catalogueGroups\(\)/);
  assert.doesNotMatch(jobsPage, /const occupationGroups = catalogueGroups\(\)/);
});

test("apply route performs no full candidate catalogue or application-list scans", () => {
  assert.match(applyPage, /getPublishedJobBySlug\(slug\)/);
  assert.match(applyPage, /select\("profile_type, is_active"\)/);
  assert.match(applyPage, /await startApplication\(slug\)/);
  assert.doesNotMatch(applyPage, /getCandidateApplications|getCandidateDocuments|getJobCatalogueContext|JOB_OCCUPATIONS/);
});


test("generic Apply entry routes visitors to real vacancies", () => {
  assert.match(genericApplyPage, /redirect\("\/jobs"\)/);
});

test("homepage avoids all-job country count scans", () => {
  assert.match(homePage, /getConfiguredCountries/);
  assert.doesNotMatch(homePage, /getCountriesWithPublishedCounts/);
});

test("country counts run as database head counts in bounded batches", () => {
  assert.match(countries, /select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(countries, /COUNTRY_COUNT_CONCURRENCY = 6/);
  assert.doesNotMatch(countries, /select\("country"\)/);
});
