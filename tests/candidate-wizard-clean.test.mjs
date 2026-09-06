import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/candidate/applications/[id]/page.tsx", "utf8");
const list = readFileSync("src/app/candidate/applications/page.tsx", "utf8");
const actions = readFileSync("src/lib/candidate/actions.ts", "utf8");

test("wizard loads only the active immigration section", () => {
  assert.match(page, /switch \(section\)/);
  for (const key of ["addresses", "family", "education", "employment", "languages", "licenses", "travel", "visas", "emergency", "references", "finances", "declarations"]) {
    assert.match(page, new RegExp(`case "${key}"`));
  }
  assert.match(page, /needsImmigrationProfile = \["personal", "passport", "family"\]\.includes\(section\)/);
});

test("wizard navigation disables automatic Next prefetch", () => {
  assert.match(page, /key=\{item\.key\}[\s\S]{0,120}prefetch=\{false\}[\s\S]{0,180}section=\$\{item\.key\}/);
  assert.ok((page.match(/prefetch=\{false\}/g) ?? []).length >= 4);
  assert.match(page, /Review \{item\.label\}/);
  assert.match(list, /prefetch=\{false\}[\s\S]{0,120}href=\{applicationHref\}/);
});

test("validation returns to the correct section and is visible", () => {
  assert.match(actions, /function failCandidateSection\(/);
  assert.match(actions, /error=\$\{encodeURIComponent\(message\)\}/);
  assert.match(page, /typeof query\.error === "string"/);
  assert.match(page, /Please check this section before continuing\./);
  assert.match(page, /\{sectionError\}/);
});
