import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/candidate/applications/[id]/SimpleCandidateApplicationPage.tsx", "utf8");
const list = readFileSync("src/app/candidate/applications/page.tsx", "utf8");
const actions = readFileSync("src/lib/candidate/actions.ts", "utf8");

test("wizard exposes only the simplified required application sections", () => {
  for (const key of ["personal", "passport", "declarations", "documents", "review", "payment"]) {
    assert.match(page, new RegExp(`key: "${key}"`));
  }
  for (const legacy of ["addresses", "family", "education", "employment", "languages", "licenses", "travel", "visas", "emergency", "references", "finances"]) {
    assert.doesNotMatch(page, new RegExp(`key: "${legacy}"`));
  }
  assert.match(page, /const needsDocuments = section === "documents" \|\| section === "review"/);
  assert.match(page, /const needsPayments = section === "payment"/);
});

test("wizard navigation disables automatic Next prefetch", () => {
  assert.match(page, /key=\{step\.key\}[\s\S]{0,220}href=\{`\/candidate\/applications\/\$\{id\}\?section=\$\{target\}`\}[\s\S]{0,120}prefetch=\{false\}/);
  assert.ok((page.match(/prefetch=\{false\}/g) ?? []).length >= 4);
  assert.match(list, /prefetch=\{false\}[\s\S]{0,120}href=\{applicationHref\}/);
});

test("validation returns to the correct section and is visible", () => {
  assert.match(actions, /function failCandidateSection\(/);
  assert.match(actions, /error=\$\{encodeURIComponent\(message\)\}/);
  assert.match(page, /const error = typeof query\.error === "string" \? query\.error : ""/);
  assert.match(page, /title="Please check this section"/);
  assert.match(page, /text=\{error\}/);
});
