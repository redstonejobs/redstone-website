import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rolePage = readFileSync(
  "src/app/(public)/sponsorship-jobs/[country]/[role]/page.tsx",
  "utf8",
);
const genericApply = readFileSync("src/app/(public)/apply/page.tsx", "utf8");

test("sponsorship role CTAs route through matching published vacancies", () => {
  assert.match(rolePage, /new URLSearchParams\(\{/);
  assert.match(rolePage, /q: job\.role/);
  assert.match(rolePage, /sort: "newest"/);
  assert.match(rolePage, /job\.country === "United States" \? "USA" : job\.country/);
  assert.match(rolePage, /href=\{vacanciesHref\}/);
  assert.doesNotMatch(rolePage, /href="\/apply"/);
  assert.doesNotMatch(rolePage, /\bsearch=/);
  assert.doesNotMatch(rolePage, /sponsorship: "true"/);
});

test("generic apply avoids mixed-job loading and requires a real vacancy selection", () => {
  assert.match(genericApply, /redirect\("\/jobs\?sort=newest"\)/);
  assert.doesNotMatch(genericApply, /redirect\("\/jobs"\)/);
});
