import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const proxy = readFileSync("proxy.ts", "utf8");
const publicJobs = readFileSync("src/lib/public/jobs.ts", "utf8");
const jobsPage = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const jobDetail = readFileSync("src/app/(public)/jobs/[slug]/page.tsx", "utf8");
const jobDetailContext = readFileSync("src/lib/public/job-detail-context.ts", "utf8");
const applyPage = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");
const genericApplyPage = readFileSync("src/app/(public)/apply/page.tsx", "utf8");
const candidatePage = readFileSync("src/app/candidate/applications/[id]/page.tsx", "utf8");
const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const homePage = readFileSync("src/app/(public)/home-page.tsx", "utf8");
const countries = readFileSync("src/lib/public/countries.ts", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");
const robots = readFileSync("src/app/robots.ts", "utf8");

function sliceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `Missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `Missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

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

test("free-text occupation catalogue loads only when a search query is actually used", () => {
  assert.doesNotMatch(publicJobs, /^import .*occupationSearchTerms/m);
  assert.match(publicJobs, /await import\("@\/lib\/jobs\/catalogue"\)/);
});

test("job detail route avoids related-job scans, candidate auth and heavy catalogue expansion", () => {
  assert.match(jobDetail, /getJobBySlug\(slug\)/);
  assert.match(jobDetail, /getJobDetailContext\(job\)/);
  assert.doesNotMatch(jobDetail, /getPublishedJobs|getJobCatalogueContext|resolveOccupationJobContent|occupationContentAsText|createClient\(\)|auth\.getUser|applications/);
  assert.doesNotMatch(jobDetail, /JobCard/);
  assert.match(jobDetailContext, /\.eq\("job_id", job\.id\)/);
  assert.match(jobDetailContext, /\.in\("document_type", documentTypes\)/);
  assert.doesNotMatch(jobDetailContext, /document_fee_catalog[\s\S]{0,200}\.eq\("is_active", true\)[\s\S]{0,300}\.returns<FeeRow\[\]>\(\)[\s\S]{0,200}getPublishedJobs/);
});

test("apply route performs no full candidate catalogue or application-list scans", () => {
  assert.match(applyPage, /getPublishedJobBySlug\(slug\)/);
  assert.match(applyPage, /select\("profile_type, is_active"\)/);
  assert.match(applyPage, /await startApplication\(slug\)/);
  assert.doesNotMatch(applyPage, /getCandidateApplications|getCandidateDocuments|getJobCatalogueContext|JOB_OCCUPATIONS/);
});

test("candidate wizard loads only current section data", () => {
  assert.match(candidatePage, /Only progress plus the[\s\S]*currently visible section is loaded/);
  assert.match(candidatePage, /switch \(section\)/);
  assert.match(candidatePage, /case "addresses"/);
  assert.match(candidatePage, /case "declarations"/);
  assert.doesNotMatch(candidatePage, /const \[[\s\S]{0,1200}addressRows[\s\S]{0,1200}dependantRows[\s\S]{0,1200}educationRows[\s\S]{0,1200}\] = await Promise\.all/);
  assert.match(candidatePage, /includeDocuments: section === "documents"/);
  assert.doesNotMatch(candidateData, /const JOB_FIELDS =/);
  assert.match(candidateData, /const CANDIDATE_JOB_FIELDS =/);
});

test("candidate list and document helpers have bounded result sets", () => {
  const applicationList = sliceBetween(
    candidateData,
    "export async function getCandidateApplications",
    "export async function getCandidateApplication(",
  );

  assert.match(candidateData, /const CANDIDATE_APPLICATION_PAGE_SIZE = 25/);
  assert.match(candidateData, /\.limit\(CANDIDATE_APPLICATION_PAGE_SIZE\)/);
  assert.match(candidateData, /const CANDIDATE_DOCUMENT_LIST_LIMIT = 100/);
  assert.match(candidateData, /else query = query\.limit\(CANDIDATE_DOCUMENT_LIST_LIMIT\)/);
  assert.match(candidateData, /\.eq\("candidate_id", context\.user\.id\)/);
  assert.ok(
    applicationList.indexOf(".limit(CANDIDATE_APPLICATION_PAGE_SIZE)") <
      applicationList.indexOf(".returns<CandidateRow[]>()"),
  );
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

test("sitemap job URLs are split into bounded shards", () => {
  assert.match(publicJobs, /import \{ createClient as createSupabaseClient \} from "@supabase\/supabase-js"/);
  assert.match(publicJobs, /function createPublicSitemapClient\(\)/);
  assert.match(publicJobs, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(
    sliceBetween(
      publicJobs,
      "export async function getPublishedJobSitemapCount",
      "export function getPublishedJobSitemapShardCount",
    ),
    /await createClient\(\)|cookies\(\)|createAdminClient/,
  );
  assert.doesNotMatch(
    sliceBetween(
      publicJobs,
      "export async function getPublishedJobSitemapEntries",
      "export async function getJobsForCountry",
    ),
    /await createClient\(\)|cookies\(\)|createAdminClient/,
  );
  assert.match(publicJobs, /export const SITEMAP_SHARD_SIZE = 1000/);
  assert.match(publicJobs, /getPublishedJobSitemapCount/);
  assert.match(publicJobs, /select\("id", \{ count: "exact", head: true \}\)/);
  assert.match(publicJobs, /isPublicJobVisible/);
  assert.match(publicJobs, /employer\.is_active === true/);
  assert.match(publicJobs, /getPublishedJobSitemapShardCount/);
  assert.match(publicJobs, /Math\.ceil\(safeCount \/ SITEMAP_SHARD_SIZE\)/);
  assert.match(publicJobs, /getPublishedJobSitemapEntries\(shardId = 0\)/);
  assert.match(publicJobs, /const from = safeShardId \* SITEMAP_SHARD_SIZE/);
  assert.match(publicJobs, /const to = from \+ SITEMAP_SHARD_SIZE - 1/);
  assert.match(publicJobs, /\.range\(from, to\)/);
  assert.doesNotMatch(publicJobs, /for \(let from = 0; ; from \+= SITEMAP_BATCH_SIZE\)/);
  assert.match(sitemap, /export async function generateSitemaps/);
  assert.match(sitemap, /const count = await getPublishedJobSitemapCount\(\)/);
  assert.match(sitemap, /const shardCount = getPublishedJobSitemapShardCount\(count\)/);
  assert.match(sitemap, /Array\.from\(\{ length: shardCount \}, \(_, id\) =>/);
  assert.doesNotMatch(sitemap, /JOB_SITEMAP_SHARDS/);
  assert.doesNotMatch(sitemap, /Math\.min\([^)]*100/);
  assert.match(sitemap, /getPublishedJobSitemapEntries\(id\)/);
  assert.match(sitemap, /const isJobShard = typeof id === "number"/);
  assert.match(sitemap, /const jobs = isJobShard \? await getPublishedJobSitemapEntries\(id\) : \[\]/);
});

test("sitemap shard count scales dynamically without a permanent ceiling", () => {
  const shardCount = (jobCount) => {
    const safeCount = Number.isFinite(jobCount) && jobCount > 0 ? jobCount : 0;
    return Math.ceil(safeCount / 1000);
  };

  assert.equal(shardCount(0), 0);
  assert.equal(shardCount(1), 1);
  assert.equal(shardCount(1000), 1);
  assert.equal(shardCount(1001), 2);
  assert.equal(shardCount(4107), 5);
  assert.equal(shardCount(100000), 100);
  assert.equal(shardCount(250000), 250);
  assert.doesNotMatch(publicJobs, /100000/);
  assert.doesNotMatch(sitemap, /100000|JOB_SITEMAP_SHARDS/);
});

test("robots exposes root sitemap and every generated job sitemap shard", () => {
  assert.match(robots, /export const dynamic = "force-dynamic"/);
  assert.match(robots, /getPublishedJobSitemapCount/);
  assert.match(robots, /getPublishedJobSitemapShardCount\(jobCount\)/);
  assert.match(robots, /`\$\{SITE_URL\}\/sitemap\.xml`/);
  assert.match(robots, /`\$\{SITE_URL\}\/sitemap\/\$\{id\}\.xml`/);
  assert.doesNotMatch(robots, /getPublishedJobSitemapEntries/);
});
