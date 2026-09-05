import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const actions = fs.readFileSync(path.join(root, "src/lib/candidate/actions.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "src/app/candidate/applications/[id]/page.tsx"), "utf8");
const paymentService = fs.readFileSync(path.join(root, "src/lib/payments/application-payments.ts"), "utf8");
const nextConfig = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");

test("candidate documents support controlled multi-file batches", () => {
  assert.match(actions, /formData\.getAll\("files"\)/);
  assert.match(actions, /MAX_DOCUMENT_BATCH_FILES = 10/);
  assert.match(actions, /MAX_DOCUMENT_BATCH_BYTES = 30 \* 1024 \* 1024/);
  assert.match(actions, /application_documents"\)\s*\.insert\(metadataRows\)/s);
  assert.match(actions, /candidate_id: context\.user\.id/);
  assert.doesNotMatch(actions, /uploaded_by: context\.user\.id/);
  assert.match(actions, /remove\(uploadedPaths\)/);
  assert.match(page, /name="files"/);
  assert.match(page, /multiple/);
  assert.match(page, /Upload Selected Documents/);
  assert.match(nextConfig, /bodySizeLimit: "32mb"/);
  assert.match(nextConfig, /proxyClientMaxBodySize: "32mb"/);
});

test("documents can be submitted and moved to final review", () => {
  assert.match(actions, /export async function completeCandidateDocumentsSection/);
  assert.match(actions, /saveImmigrationSectionProgress\(applicationId, "documents", "complete"\)/);
  assert.match(actions, /section=review&saved=documents/);
  assert.match(page, /Submit Documents & Continue to Review/);
});

test("review continues to payment only after document step is complete", () => {
  assert.match(page, /Continue to Payment/);
  assert.match(page, /prepareApplicationPayment\.bind\(null, id\)/);
  assert.match(paymentService, /\["personal", "passport", "declarations", "documents"\]/);
});
