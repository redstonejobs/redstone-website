import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260822203000_phase5_candidate_portal.sql", "utf8");
const phase3 = readFileSync("supabase/migrations/20260822173000_phase3_backend_hardening.sql", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidateConstants = readFileSync("src/lib/candidate/constants.ts", "utf8");
const candidateData = readFileSync("src/lib/candidate/data.ts", "utf8");
const candidateAuth = readFileSync("src/lib/candidate/auth.ts", "utf8");
const authActions = readFileSync("src/lib/auth/actions.ts", "utf8");
const authCallback = readFileSync("src/app/auth/callback/route.ts", "utf8");
const loginPage = readFileSync("src/app/login/page.tsx", "utf8");
const registerPage = readFileSync("src/app/register/page.tsx", "utf8");
const redirectHelper = readFileSync("src/lib/auth/redirect.ts", "utf8");
const applyPage = readFileSync("src/app/apply/[slug]/page.tsx", "utf8");
const candidatePage = readFileSync("src/app/candidate/applications/[id]/SimpleCandidateApplicationPage.tsx", "utf8");
const logoutRoute = readFileSync("src/app/auth/logout/route.ts", "utf8");
const publicSite = readFileSync("src/lib/public/site.ts", "utf8");

test("job deadline and vacancy schema names are current", () => {
  assert.doesNotMatch(`${migration}\n${phase3}\n${applyPage}`, /number_of_vacancies/);
  assert.doesNotMatch(`${migration}\n${phase3}`, /public\.jobs\s*\(\s*deadline\s*\)|jobs\.deadline/);
  assert.match(`${migration}\n${candidateData}`, /application_deadline/);
  assert.match(`${migration}\n${candidateData}`, /vacancies/);
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

test("public apply flow preserves safe return paths through login and registration", () => {
  assert.match(applyPage, /const applyPath = `\/apply\/\$\{slug\}`/);
  assert.match(candidateAuth, /returnTo\.startsWith\("\/apply\/"\)/);
  assert.match(candidateAuth, /\/login\?next=\$\{encodeURIComponent\(returnTo\)\}&error=candidate_required/);
  assert.match(authActions, /const safeNext = safeNextPath\(next, "\/candidate"\)/);
  assert.match(authActions, /if \(safeNext\.startsWith\("\/apply\/"\)\)/);
  assert.match(authCallback, /const safeNext = safeNextPath\(requestUrl\.searchParams\.get\("next"\), "\/candidate"\)/);
  assert.match(authCallback, /if \(safeNext\.startsWith\("\/apply\/"\)\)/);
  assert.match(loginPage, /\/register\?next=\$\{encodeURIComponent\(next\)\}/);
  assert.match(registerPage, /<input type="hidden" name="next" value=\{next\} \/>/);
  assert.match(authActions, /callbackUrl\.searchParams\.set\("next", next\)/);
  assert.match(logoutRoute, /safeNextPath\(url\.searchParams\.get\("next"\), ""\)/);
  assert.match(logoutRoute, /destination\.searchParams\.set\("next", next\)/);
});

test("published valid apply jobs start or resume applications for candidate accounts", () => {
  assert.match(applyPage, /getPublishedJobBySlug\(slug\)/);
  assert.match(applyPage, /const access = await getApplyCandidateAccess\(applyPath\)/);
  assert.match(applyPage, /status: "candidate"/);
  assert.match(applyPage, /await startApplication\(slug\)/);
  assert.match(candidateActions, /supabase\.rpc\("candidate_start_application", \{ p_job_slug: slug \}\)/);
  assert.match(candidateActions, /redirect\(`\/candidate\/applications\/\$\{data\}`\)/);
  assert.match(applyPage, /idempotent/);
});

test("staff admin and employer accounts see candidate-required apply message instead of 404", () => {
  assert.match(applyPage, /CandidateRequiredNotice/);
  assert.match(applyPage, /A candidate account is required to apply for this job\./);
  assert.match(applyPage, /Staff, administrator and employer/);
  assert.match(applyPage, /\/auth\/logout\?next=\$\{encodeURIComponent\(applyPath\)\}/);
  assert.match(applyPage, /\/register\?next=\$\{encodeURIComponent\(applyPath\)\}/);
  assert.match(applyPage, /Return to job details/);

  const candidateRequiredIndex = applyPage.indexOf('requestedError === "candidate_required"');
  const candidateRequiredRenderIndex = applyPage.indexOf("<CandidateRequiredNotice");
  const notFoundIndex = applyPage.indexOf("if (!job) notFound()");
  assert.notEqual(candidateRequiredIndex, -1);
  assert.notEqual(candidateRequiredRenderIndex, -1);
  assert.notEqual(notFoundIndex, -1);
  assert.ok(candidateRequiredRenderIndex > notFoundIndex);
});

test("missing or unavailable apply jobs still return 404 before account-type handling", () => {
  const jobLookupIndex = applyPage.indexOf("getPublishedJobBySlug(slug)");
  const notFoundIndex = applyPage.indexOf("if (!job) notFound()");
  const accessIndex = applyPage.indexOf("const access = await getApplyCandidateAccess(applyPath)");

  assert.notEqual(jobLookupIndex, -1);
  assert.notEqual(notFoundIndex, -1);
  assert.notEqual(accessIndex, -1);
  assert.ok(jobLookupIndex < notFoundIndex);
  assert.ok(notFoundIndex < accessIndex);
  assert.match(candidateData, /\.eq\("status", "published"\)/);
  assert.match(candidateData, /application_deadline\.is\.null,application_deadline\.gte/);
  assert.match(candidateData, /vacancies\.is\.null,vacancies\.gt\.0/);
  assert.match(candidateData, /isCandidateVisibleJob/);
  assert.match(candidateData, /record\.verification_status === "verified"/);
  assert.match(candidateData, /record\.is_active === true/);
});

test("candidate_required from start application returns to apply page instead of throwing 404", () => {
  assert.doesNotMatch(candidateActions, /await requireCandidate\(\);\s*const supabase = await createClient\(\);\s*const \{ data, error \} = await supabase\.rpc\("candidate_start_application"/);
  assert.match(candidateActions, /message\.includes\("candidate_required"\)/);
  assert.match(candidateActions, /redirect\(`\/apply\/\$\{slug\}\?error=\$\{reason\}`\)/);
  assert.match(applyPage, /requestedError === "candidate_required"/);
});

test("apply page reports missing auth profile as account setup error not 404", () => {
  assert.match(applyPage, /status: "profile_missing"/);
  assert.match(applyPage, /ApplyAccountSetupError/);
  assert.match(applyPage, /Your candidate account setup could not be completed\./);
  assert.match(applyPage, /profile record is missing/);
  assert.match(applyPage, /We have not created or changed any staff, administrator or employer profile\./);
});

test("apply route stays lightweight for Cloudflare Workers", () => {
  assert.match(candidateData, /const APPLY_JOB_FIELDS = "[^"]*source_provider[^"]*employer:employers\(company_name, verification_status, is_active\)"/);
  assert.match(applyPage, /Lightweight application entry point/);
  assert.doesNotMatch(applyPage, /getCandidateApplications|getCandidateDocuments|getJobCatalogueContext|resolveProgrammeFee|submitApplication/);
  assert.match(applyPage, /select\("profile_type, is_active"\)/);
});

test("candidate stepper derives review and payment visual state from application status", () => {
  assert.match(candidatePage, /const coreComplete = progress\.get\(step\.key\) === "complete"/);
  assert.match(candidatePage, /step\.key === "review" && \["ready_for_payment", "payment_pending", "submitted"\]\.includes\(status\)/);
  assert.match(candidatePage, /step\.key === "payment" && \(Boolean\(paidPayment\) \|\| status === "submitted"\)/);
  assert.match(candidatePage, /const complete = coreComplete \|\| reviewComplete \|\| paymentComplete/);
  assert.match(candidatePage, /const current = section === step\.key/);
  assert.match(candidatePage, /const target = step\.key === "payment" && !paymentAllowed \? "review" : step\.key/);
  assert.match(candidatePage, /href=\{`\/candidate\/applications\/\$\{id\}\?section=\$\{target\}`\}/);
  assert.match(candidatePage, /prefetch=\{false\}/);
});

test("candidate signup only succeeds after Supabase creates an auth user", () => {
  assert.match(authActions, /supabase\.auth\.signUp/);
  assert.match(authActions, /const \{ data, error \} = await supabase\.auth\.signUp/);
  assert.match(authActions, /if \(error \|\| !data\.user\)/);
  assert.match(authActions, /candidate_signup_failed/);
  assert.match(authActions, /redirect\("\/verify-email"\)/);
  assert.match(authActions, /const AUTH_CALLBACK_URL = "https:\/\/redstone\.co\.ke\/auth\/callback"/);
});

test("password reset reports Supabase Auth failures before showing sent state", () => {
  assert.match(authActions, /supabase\.auth\.resetPasswordForEmail/);
  assert.match(authActions, /const \{ error \} = await supabase\.auth\.resetPasswordForEmail/);
  assert.match(authActions, /password_reset_email_failed/);
  assert.match(authActions, /const PASSWORD_RESET_URL = "https:\/\/redstone\.co\.ke\/reset-password"/);
  assert.match(authActions, /redirect\("\/forgot-password\?sent=1"\)/);
});

test("public company email references use known Red Stone mailboxes only", () => {
  for (const invented of [
    "recruitment@redstone.co.ke",
    "employers@redstone.co.ke",
    "documents@redstone.co.ke",
    "accounts@redstone.co.ke",
    "complaints@redstone.co.ke",
    "redstoneagency.co.ke",
  ]) {
    assert.doesNotMatch(publicSite, new RegExp(invented.replaceAll(".", "\\.")));
  }

  for (const known of [
    "info@redstone.co.ke",
    "jobs@redstone.co.ke",
    "support@redstone.co.ke",
    "hr@redstone.co.ke",
    "visa@redstone.co.ke",
    "admin@redstone.co.ke",
    "noreply@redstone.co.ke",
  ]) {
    assert.match(publicSite, new RegExp(known.replaceAll(".", "\\.")));
  }
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
