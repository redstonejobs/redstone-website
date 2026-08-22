import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260822203000_phase5_candidate_portal.sql", "utf8");
const phase3 = readFileSync("supabase/migrations/20260822173000_phase3_backend_hardening.sql", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidateConstants = readFileSync("src/lib/candidate/constants.ts", "utf8");
const redirectHelper = readFileSync("src/lib/auth/redirect.ts", "utf8");
const applyPage = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");

test("job deadline and vacancy schema names are current", () => {
  assert.doesNotMatch(`${migration}\n${phase3}\n${applyPage}`, /number_of_vacancies/);
  assert.doesNotMatch(`${migration}\n${phase3}`, /public\.jobs\s*\(\s*deadline\s*\)|jobs\.deadline/);
  assert.match(`${migration}\n${applyPage}`, /application_deadline/);
  assert.match(`${migration}\n${applyPage}`, /vacancies/);
});

test("candidate RPCs validate auth ownership and status", () => {
  assert.match(migration, /p\.id = auth\.uid\(\)\s+and p\.profile_type = 'candidate'/);
  assert.match(migration, /a\.candidate_id = auth\.uid\(\)/);
  assert.match(migration, /v_current_status <> 'draft'/);
  assert.match(migration, /v_current_status not in \('draft', 'submitted', 'under_review', 'shortlisted', 'interview', 'employer_review', 'offer_pending'\)/);
});

test("document upload is private and constrained", () => {
  assert.match(migration, /bucket_id = 'candidate-documents'/);
  assert.match(migration, /\(storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
  assert.match(candidateActions, /candidate-documents/);
  assert.match(candidateActions, /storagePath = `\$\{context\.user\.id\}\/\$\{applicationId\}\//);
  assert.match(migration, /grant insert \(application_id, document_type, file_name, file_size, mime_type, storage_path, uploaded_by, verification_status\)/);
});

test("candidate-facing code avoids internal staff data exposure", () => {
  const candidateSources = `${candidateActions}\n${applyPage}`;
  assert.doesNotMatch(candidateSources, /internal_notes|application_notes|assigned_staff_id|staff_roles/);
});

test("safe redirects reject external targets", () => {
  assert.match(redirectHelper, /startsWith\("\/\/"\)/);
  assert.match(redirectHelper, /includes\(":\/\/"\)/);
});

test("profile updates are limited to safe candidate columns", () => {
  assert.match(migration, /revoke update on public\.profiles from authenticated/);
  assert.match(migration, /grant update \(full_name, phone, nationality, date_of_birth, city, country, avatar_url, updated_at\)/);
});

test("candidate status labels include sensitive workflow translations", () => {
  assert.match(candidateConstants, /visa_processing: "Work Permit \/ Visa Processing"/);
  assert.match(candidateConstants, /rejected: "Not Selected"/);
  assert.match(candidateConstants, /withdrawn: "Withdrawn"/);
});
