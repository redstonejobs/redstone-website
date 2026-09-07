import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicRoute = readFileSync("src/app/api/ai/chat/route.ts", "utf8");
const internalRoute = readFileSync("src/app/api/internal/ai/chat/route.ts", "utf8");
const service = readFileSync("src/lib/ai/service.ts", "utf8");
const applicationContext = readFileSync("src/lib/ai/application-context.ts", "utf8");
const types = readFileSync("src/lib/ai/types.ts", "utf8");

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("public website derives candidate identity from Supabase Auth, never request JSON", () => {
  assert.match(publicRoute, /const candidateUserId = await resolveVerifiedCandidateUserId\(\)/);
  assert.match(publicRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(publicRoute, /\.from\("profiles"\)/);
  assert.match(publicRoute, /\.select\("profile_type, is_active"\)/);
  assert.match(publicRoute, /profile\.profile_type !== "candidate" \|\| profile\.is_active !== true/);
  assert.match(publicRoute, /candidateUserId,/);

  const validator = between(publicRoute, "function validateInput", "function parseContact");
  assert.doesNotMatch(validator, /candidateUserId|candidate_user_id/);
  assert.doesNotMatch(internalRoute, /candidateUserId|candidate_user_id/);
});

test("AI type marks candidate identity as trusted server-derived data", () => {
  assert.match(types, /candidateUserId\?: string/);
  assert.match(types, /Trusted server-derived identity only/);
  assert.match(types, /Never accept this from a public request body/);
});

test("candidate-bound conversations cannot be reused by anonymous or different candidate sessions", () => {
  assert.match(service, /\.select\("id, status, candidate_user_id"\)/);
  assert.match(service, /if \(conversation\.candidate_user_id\)/);
  assert.match(service, /!candidateUserId \|\| conversation\.candidate_user_id !== candidateUserId/);
  assert.match(service, /conversation_access_denied/);
  assert.match(service, /status = 403|403,/);
  assert.match(service, /candidate_user_id: input\.candidateUserId \?\? null/);
  assert.match(service, /\.is\("candidate_user_id", null\)/);
  assert.match(service, /conversation_bind_failed/);
});

test("private application lookup is ownership-scoped and uses safe fields only", () => {
  assert.match(applicationContext, /\.from\("applications"\)/);
  assert.match(applicationContext, /\.eq\("candidate_id", input\.candidateUserId\)/);
  assert.match(applicationContext, /APPLICATION_CONTEXT_LIMIT = 5/);

  const fields = between(applicationContext, "const APPLICATION_FIELDS", "type AdminClient");
  for (const safeField of ["id", "status", "submitted_at", "created_at", "updated_at", "job:jobs(title, slug, country, city)"]) {
    assert.match(fields, new RegExp(safeField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(fields, /internal_notes|application_notes|assigned_staff|cover_letter|candidate_message|document|payment|callback|phone|email/);
});

test("unsigned status requests never fall back to contact-detail lookup", () => {
  assert.match(applicationContext, /if \(!input\.candidateUserId\)/);
  assert.match(applicationContext, /status: "sign_in_required"/);
  assert.match(applicationContext, /Do not look up or infer application status from a name, phone number, email address/);
  assert.doesNotMatch(applicationContext, /\.eq\("phone"|\.eq\("email"|\.ilike\("phone"|\.ilike\("email"/);
});

test("status context uses candidate-facing labels and forbids inference beyond the live state", () => {
  assert.match(applicationContext, /candidateStatusLabel\(application\.status\)/);
  assert.match(applicationContext, /VERIFIED PRIVATE CANDIDATE APPLICATION DATA/);
  assert.match(applicationContext, /Do not infer employer decisions, visa outcomes, document verification, payment state/);
  assert.match(applicationContext, /candidate_route=\/candidate\/applications\/\$\{application\.id\}/);
  assert.match(applicationContext, /The signed-in candidate account has no application records/);
  assert.match(applicationContext, /Do not invent an application or status/);
});

test("private status context is loaded before OpenAI and only audit metadata is persisted", () => {
  assert.match(service, /loadAiApplicationContext\(admin/);
  assert.match(service, /candidateUserId: conversation\.candidate_user_id \?\? undefined/);
  assert.match(service, /const verifiedContext = \[jobContext\.text, applicationContext\.text\]/);
  assert.match(service, /generateAiResponse\([\s\S]*verifiedContext \|\| undefined/);
  assert.ok(
    service.indexOf("loadAiApplicationContext(admin") < service.indexOf("generateAiResponse("),
    "private live status must be resolved before the model call",
  );
  assert.match(service, /application_grounding:/);
  assert.match(service, /match_count: applicationContext\.matchCount/);
  assert.doesNotMatch(service, /metadata:[\s\S]{0,600}applicationContext\.text/);
});
