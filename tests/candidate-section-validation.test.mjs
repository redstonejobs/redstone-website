import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const page = readFileSync(
  "src/app/candidate/applications/[id]/SimpleCandidateApplicationPage.tsx",
  "utf8",
);

test("candidate section completion validation redirects back with readable errors", () => {
  assert.match(actions, /function failCandidateSection\(/);
  assert.match(actions, /error=\$\{encodeURIComponent\(message\)\}/);

  const expected = [
    ["completeCandidateAddressSection", "addresses"],
    ["completeCandidateFamilySection", "family"],
    ["completeCandidateEducationSection", "education"],
    ["completeCandidateEmploymentSection", "employment"],
    ["completeCandidateLanguagesSection", "languages"],
    ["completeCandidateLicensesSection", "licenses"],
    ["completeCandidateTravelSection", "travel"],
    ["completeCandidateVisaSection", "visas"],
    ["completeCandidateEmergencySection", "emergency"],
    ["completeCandidateReferencesSection", "references"],
    ["completeCandidateFinancesSection", "finances"],
    ["completeCandidateDeclarationsSection", "declarations"],
  ];

  for (const [name, section] of expected) {
    const start = actions.indexOf(`export async function ${name}`);
    assert.notEqual(start, -1, `${name} must exist`);
    const next = actions.indexOf("\nexport async function ", start + 1);
    const block = actions.slice(start, next === -1 ? actions.length : next);
    assert.match(block, new RegExp(`failCandidateSection\\([\\s\\S]*?\\"${section}\\"`));
  }
});

test("simple candidate page shows readable section validation feedback", () => {
  assert.match(page, /const error = typeof query\.error === "string" \? query\.error : ""/);
  assert.match(page, /title="Please check this section"/);
  assert.match(page, /text=\{error\}/);
});
