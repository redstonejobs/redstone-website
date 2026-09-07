import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const jobsPage = fs.readFileSync("src/app/(public)/jobs/page.tsx", "utf8");
const search = fs.readFileSync("src/components/public/job-search.tsx", "utf8");
const card = fs.readFileSync("src/components/public/job-card.tsx", "utf8");

test("public jobs defaults to Red Stone sponsorship programme vacancies", () => {
  assert.match(jobsPage, /params\.sponsorship \?\? "programme"/);
  assert.match(jobsPage, /queryParams\.source = "redstone"/);
  assert.match(jobsPage, /Sponsorship Job Opportunities/);
});

test("sponsorship filter distinguishes programme from confirmed employer sponsorship", () => {
  assert.match(search, /Red Stone programme/);
  assert.match(search, /Employer-confirmed visa sponsorship/);
  assert.match(jobsPage, /selectedSponsorship === "confirmed"/);
  assert.match(jobsPage, /queryParams\.sponsorship = "true"/);
});

test("internal Red Stone cards are visibly available through the sponsorship programme", () => {
  assert.match(card, /Sponsorship Programme/);
  assert.match(card, /Apply for Sponsorship/);
  assert.match(card, /Employer-specific visa sponsorship/);
});
