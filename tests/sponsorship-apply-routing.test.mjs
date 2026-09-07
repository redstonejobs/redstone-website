import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sponsorshipPage = readFileSync(
  "src/app/(public)/sponsorship-jobs/page.tsx",
  "utf8",
);
const rolePage = readFileSync(
  "src/app/(public)/sponsorship-jobs/[country]/[role]/page.tsx",
  "utf8",
);
const genericApply = readFileSync("src/app/(public)/apply/page.tsx", "utf8");
const jobCard = readFileSync("src/components/public/job-card.tsx", "utf8");
const jobApply = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");

test("sponsorship start buttons resolve to confirmed sponsorship vacancies", () => {
  assert.match(sponsorshipPage, /Start Sponsorship Application/);
  assert.match(sponsorshipPage, /Begin Application/);
  assert.match(sponsorshipPage, /Apply Now/);
  assert.ok((sponsorshipPage.match(/href="\/apply"/g) ?? []).length >= 3);

  assert.match(
    genericApply,
    /redirect\("\/jobs\?sponsorship=confirmed&sort=newest"\)/,
  );
});

test("sponsorship role CTAs route through matching published vacancies", () => {
  assert.match(rolePage, /new URLSearchParams\(\{/);
  assert.match(rolePage, /q: job\.role/);
  assert.match(rolePage, /sort: "newest"/);
  assert.match(rolePage, /job\.country === "United States" \? "USA" : job\.country/);
  assert.match(rolePage, /href=\{vacanciesHref\}/);
  assert.doesNotMatch(rolePage, /href="\/apply"/);
  assert.doesNotMatch(rolePage, /\bsearch=/);
});

test("published sponsorship vacancy Apply buttons enter the real candidate workflow", () => {
  assert.match(jobCard, /publicJobApplyState\(\{ job \}\)/);
  assert.match(jobCard, /href=\{apply\.href\}/);
  assert.match(jobCard, /\{apply\.label\}/);

  assert.match(jobApply, /getPublishedJobBySlug\(slug\)/);
  assert.match(jobApply, /await startApplication\(slug\)/);
  assert.match(jobApply, /candidate_start_application is idempotent/);
});
