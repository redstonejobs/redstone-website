import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "src/app/candidate/applications/[id]/SimpleCandidateApplicationPage.tsx",
  "utf8",
);

test("candidate application loads only data needed by the active simple section", () => {
  assert.match(source, /const requestedSection = typeof query\.section === "string" \? query\.section : "personal"/);
  assert.match(source, /const section = STEPS\.find\(\(step\) => step\.key === requestedSection\)\?\.key \?\? "personal"/);
  assert.match(source, /const needsDocuments = section === "documents" \|\| section === "review"/);
  assert.match(source, /const needsPayments = section === "payment"/);
  assert.match(source, /includeDocuments: needsDocuments/);
  assert.match(source, /includePayments: needsPayments/);
  assert.match(source, /includeTimeline: false/);
  assert.doesNotMatch(source, /application_addresses|application_dependants|application_education|application_employment|application_languages|application_licenses|application_travel_history|application_visas|application_references|application_financial_information/);
});
