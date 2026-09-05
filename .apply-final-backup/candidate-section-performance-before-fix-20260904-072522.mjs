import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  "src/app/candidate/applications/[id]/page.tsx",
  "utf8",
);

test("candidate application loads only the active section data", () => {
  assert.match(source, /switch \(section\)/);

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
    assert.match(
      source,
      new RegExp(`case \\"${section}\\"`),
    );
  }

  assert.ok(
    source.indexOf("const requestedSection") <
      source.indexOf("await Promise.all(["),
  );

  assert.match(
    source,
    /case "addresses"[\s\S]*?\.from\("application_addresses"\)/,
  );

  assert.match(
    source,
    /includeDocuments: section === "documents"/,
  );

  assert.match(
    source,
    /includePayments: section === "payment"/,
  );

  assert.doesNotMatch(
    source,
    /const \[[\s\S]{0,1200}addressRows[\s\S]{0,1200}dependantRows[\s\S]{0,1200}educationRows[\s\S]{0,1200}\] = await Promise\.all/,
  );
});