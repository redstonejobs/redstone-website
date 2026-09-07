import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidateApplicationPage = readFileSync(
  "src/app/candidate/applications/[id]/SimpleCandidateApplicationPage.tsx",
  "utf8",
);

test("Apply preserves the selected vacancy through the created application", () => {
  assert.match(candidateActions, /candidate_start_application/);
  assert.match(candidateActions, /p_job_slug: slug/);
  assert.match(candidateActions, /redirect\(`\/candidate\/applications\/\$\{data\}`\)/);
  assert.match(candidateData, /\.select\("id, job_id, status,/);
});

test("owned candidate applications recover their saved job context when public lookup is empty", () => {
  assert.match(candidateData, /const missingJobIds = jobIds\.filter/);
  assert.match(candidateData, /createAdminClient\(\)/);
  assert.match(candidateData, /\.select\(CANDIDATE_JOB_FIELDS\)/);
  assert.match(candidateData, /\.in\("id", missingJobIds\)/);
  assert.match(candidateData, /jobMap\.get\(String\(application\.job_id/);
  assert.match(candidateData, /server-only fallback retrieves only a small display-safe/);
});

test("candidate application page renders the selected job identity", () => {
  assert.match(candidateApplicationPage, /const job = application\.job/);
  assert.match(candidateApplicationPage, /job\?\.title/);
  assert.match(candidateApplicationPage, /job\?\.city, job\?\.country/);
});
