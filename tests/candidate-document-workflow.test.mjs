import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const pagePath = path.join(root, "src", "app", "candidate", "applications", "[id]", "page.tsx");
const actionsPath = path.join(root, "src", "lib", "candidate", "actions.ts");

const page = fs.readFileSync(pagePath, "utf8");
const actions = fs.readFileSync(actionsPath, "utf8");

test("documents allow repeated upload and explicit completion to review", () => {
  assert.match(actions, /section=documents&saved=documents&uploaded=/);
  assert.match(actions, /export async function completeCandidateDocumentsSection/);
  assert.match(actions, /saveImmigrationSectionProgress\(applicationId,\s*"documents",\s*"complete"\)/);
  assert.match(actions, /section=review&saved=documents/);
  assert.match(page, /completeCandidateDocumentsSection/);
  assert.match(page, /Complete Documents & Continue to Review/);
  assert.match(page, /disabled=\{!editable\}/);
});



