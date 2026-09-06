import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const referral = readFileSync("src/lib/referrals/attribution.ts", "utf8");
const contactNormalization = readFileSync("src/lib/referrals/contact-normalization.ts", "utf8");
const route = readFileSync("src/app/r/[code]/route.ts", "utf8");
const auth = readFileSync("src/lib/auth/actions.ts", "utf8");
const callback = readFileSync("src/app/auth/callback/route.ts", "utf8");
const candidate = readFileSync("src/lib/candidate/actions.ts", "utf8");
const staffPage = readFileSync("src/app/staff/page.tsx", "utf8");
const staffClients = readFileSync("src/app/staff/clients/page.tsx", "utf8");
const staffActions = readFileSync("src/lib/staff/actions.ts", "utf8");
const staffClientsMigration = readFileSync("supabase/migrations/20260904120000_staff_clients_intake_tracking.sql", "utf8");
const adminData = readFileSync("src/lib/admin/data.ts", "utf8");
const adminClients = readFileSync("src/app/admin/clients/page.tsx", "utf8");
const adminApplications = readFileSync("src/app/admin/applications/page.tsx", "utf8");
const adminApplication = readFileSync("src/app/admin/applications/[id]/page.tsx", "utf8");
const adminStaffDetail = readFileSync("src/app/admin/staff/[id]/page.tsx", "utf8");

test("staff referral route stores a secure referral cookie", () => {
  assert.match(route, /redstone_referral_code/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "lax"/);
  assert.match(route, /maxAge: 60 \* 60 \* 24 \* 30/);
});

test("candidate registration and application consume staff referral attribution", () => {
  assert.match(auth, /attributeCandidateFromCurrentReferral/);
  assert.match(callback, /attributeCandidateFromCurrentReferral/);
  assert.match(candidate, /status: "applied"/);
  assert.match(candidate, /applicationId: String\(data\)/);
  assert.match(candidate, /jobSlug: slug/);
  assert.match(referral, /referred_by_staff_id/);
  assert.match(referral, /First-touch attribution is permanent/);
  assert.match(referral, /source: "referral_link"/);
  assert.match(referral, /staff_referral_application_attributed/);
});

test("staff dashboard exposes personal referral link and own client portfolio", () => {
  assert.match(staffPage, /ReferralLinkCard/);
  assert.match(staffPage, /referral_code/);
  assert.match(staffPage, /countOwnStaffClients/);
  assert.match(staffPage, /\.eq\("staff_user_id", staffUserId\)/);
  assert.match(staffClients, /My Client Pipeline/);
  assert.match(staffClients, /ReferralLinkCard/);
  assert.match(staffActions, /createOwnStaffClient/);
  assert.match(staffActions, /\/staff\/clients\?created=1/);
});

test("staff client intake records real CRM fields without fake auth users", () => {
  assert.match(staffClientsMigration, /passport_status/);
  assert.match(staffClientsMigration, /medical_status/);
  assert.match(staffClientsMigration, /follow_up_date/);
  assert.match(staffClients, /name="passport_status"/);
  assert.match(staffClients, /name="medical_status"/);
  assert.match(staffClients, /name="follow_up_date"/);
  assert.match(staffClients, /Job of Interest/);
  assert.match(staffClients, /Country of Interest/);
  assert.match(staffActions, /passport_status: option/);
  assert.match(staffActions, /medical_status: option/);
  assert.match(staffActions, /follow_up_date: nullableDate/);
  assert.doesNotMatch(staffActions, /auth\.admin\.createUser|signUp\(/);
});

test("staff client medical status supports positive-client completed state and rejects invalid values", () => {
  for (const value of [
    "unknown",
    "not_started",
    "pending",
    "booked",
    "completed",
    "failed",
    "waived",
    "expired",
  ]) {
    assert.match(staffClientsMigration, new RegExp(`'${value}'`));
    assert.match(staffActions, new RegExp(`"${value}"`));
  }

  assert.match(staffClientsMigration, /staff_clients_medical_status_check/);
  assert.match(staffActions, /option\(\s*formData,\s*"medical_status",\s*MEDICAL_STATUSES,\s*"unknown"\s*\)/);
  assert.doesNotMatch(staffClientsMigration, /positive_client|is_positive/);
});

test("staff duplicate detection warns instead of merging uncertain clients", () => {
  assert.match(staffActions, /countPotentialDuplicateStaffClients/);
  assert.match(staffActions, /normalizeEmailContact\(email\)/);
  assert.match(staffActions, /normalizePhoneContact\(phone\)/);
  assert.match(contactNormalization, /replace\(\/\\D\/g, ""\)/);
  assert.match(contactNormalization, /254\$\{digits\.slice\(1\)\}/);
  assert.match(contactNormalization, /\.trim\(\)\.toLowerCase\(\)/);
  assert.match(staffActions, /duplicate_warning/);
  assert.match(staffActions, /\/staff\/clients\?created=1&duplicate=1/);
  assert.match(staffClients, /possible duplicate/);
  assert.doesNotMatch(staffActions, /upsert\(/);
});

test("referral duplicate detection still uses candidate id and shared normalization", () => {
  assert.match(referral, /\.eq\("candidate_user_id", candidateId\)/);
  assert.match(referral, /normalizeEmailContact\(email\)/);
  assert.match(referral, /normalizePhoneContact\(attributedCandidate\.phone\)/);
  assert.match(referral, /normalizePhoneContact\(row\.phone\) === candidatePhone/);
  assert.match(referral, /First-touch attribution is permanent/);
});

test("staff CRM reads are scoped, paginated and counted in the database", () => {
  assert.match(staffClients, /await requireStaff\(\)/);
  assert.match(staffClients, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffClients, /PAGE_SIZE = 25/);
  assert.match(staffClients, /\.range\(from, to\)/);
  assert.match(staffClients, /count: "exact", head: true/);
  assert.doesNotMatch(staffClients, /\.filter\(\(client\)/);
});

test("staff client mutations cannot reassign other staff records", () => {
  assert.match(staffActions, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffActions, /Client record was not found\./);
  assert.doesNotMatch(staffActions, /staff_user_id: nullableText|formData\.get\("staff_user_id"\)/);
});

test("admin can inspect all staff clients and per-staff client portfolios", () => {
  assert.match(adminClients, /await requireAdmin\(\)/);
  assert.match(adminClients, /\.from\("staff_clients"\)/);
  assert.match(adminClients, /PAGE_SIZE = 30/);
  assert.match(adminClients, /\.range\(from, to\)/);
  assert.match(adminClients, /Staff Client Registry/);
  assert.match(adminStaffDetail, /Staff Client Portfolio/);
  assert.match(adminStaffDetail, /\/admin\/clients\?staff=/);
  assert.match(adminStaffDetail, /filters: \{ staff_user_id: id \}/);
});

test("admins can see referral staff on application records", () => {
  assert.match(adminData, /referred_by_staff_id/);
  assert.match(adminData, /referral_staff/);
  assert.match(adminApplications, /Referral Staff/);
  assert.match(adminApplications, /No staff referral/);
  assert.match(adminApplication, /label="Referral Staff"/);
  assert.match(adminApplication, /label="Referral Code"/);
});
