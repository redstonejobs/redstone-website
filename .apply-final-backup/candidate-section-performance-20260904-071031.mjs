import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "src/app/candidate/applications/[id]/page.tsx",
  "utf8",
);

test("candidate application loads only the active section data", () => {
  for (const section of [
    "addresses",
    "family",
    "education",
    "employment",
    "languages",
    "licenses",
    "travel",
    "visas",
    "emergency",
    "references",
    "finances",
    "declarations",
  ]) {
    assert.match(source, new RegExp(`section === \\"${section}\\"`));
  }

  assert.ok(
    source.indexOf("const requestedSection") <
      source.indexOf("await Promise.all(["),
  );
  assert.match(
    source,
    /section === "addresses"[\s\S]*?\.from\("application_addresses"\)/,
  );
});
