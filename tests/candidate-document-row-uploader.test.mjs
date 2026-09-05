import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const componentPath = path.join(root, "src", "components", "candidate", "DocumentUploadRows.tsx");
const actionPath = path.join(root, "src", "lib", "candidate", "actions.ts");
const pagePath = path.join(root, "src", "app", "candidate", "applications", "[id]", "page.tsx");

test("document uploader supports separate document rows and aligned types", () => {
  const component = fs.readFileSync(componentPath, "utf8");
  const actions = fs.readFileSync(actionPath, "utf8");
  const page = fs.readFileSync(pagePath, "utf8");

  assert.match(component, /\+ Add Another Document/);
  assert.match(component, /Upload All Documents/);
  assert.match(component, /name="document_type"/);
  assert.match(component, /name="files"/);
  assert.match(component, /rows\.length >= 10/);

  assert.match(actions, /formData\s*\.getAll\("document_type"\)/);
  assert.match(actions, /documentTypes\[index\]/);
  assert.match(actions, /validateDocumentUpload\(file,\s*documentTypes\[index\]/);

  assert.match(page, /DocumentUploadRows/);
  assert.doesNotMatch(page, /Upload documents one at a time/);
});

