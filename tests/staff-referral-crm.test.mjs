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
const staffClientsMigration = readFileSync(
  "supabase/migrations/20260904120000_staff_clients_intake_tracking.sql",
  "utf8",
);
const adminData = readFileSync("src/lib/admin/data.ts", "utf8");
const adminClients = readFileSync("src/app/admin/clients/page.tsx", "utf8");
const adminApplications = readFileSync("src/app/admin/applications/page.tsx", "utf8");
const adminApplication = readFileSync(
  "src/app/admin/applications/[id]/page.tsx",
  "utf8",
);
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
});

test("staff home is lightweight while CRM keeps referral and client tools", () => {
  assert.match(staffPage, /await requireStaff\(\)/);
  assert.match(staffPage, /Staff Action Centre/);
  assert.match(staffPage, /href="\/staff\/clients"/);
  assert.match(staffPage, /href="\/staff\/applications"/);
  assert.doesNotMatch(staffPage, /createAdminClient|staff_compensation|countOwnStaffClients/);
  assert.match(staffClients, /ReferralLinkCard/);
  assert.match(staffClients, /referral_code/);
  assert.match(staffClients, /My Client Pipeline/);
  assert.match(staffActions, /createOwnStaffClient/);
});

test("staff client intake records real CRM fields without fake auth users", () => {
  for (const field of ["passport_status", "medical_status", "follow_up_date"]) {
    assert.match(staffClientsMigration, new RegExp(field));
    assert.match(staffClients, new RegExp(`name=\\"${field}\\"`));
  }
  assert.match(staffClients, /Job of Interest/);
  assert.match(staffClients, /Country of Interest/);
  assert.doesNotMatch(staffActions, /auth\.admin\.createUser|signUp\(/);
});

test("medical status supports the positive-client completed state", () => {
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
});

test("duplicate detection warns instead of merging uncertain clients", () => {
  assert.match(staffActions, /countPotentialDuplicateStaffClients/);
  assert.match(staffActions, /normalizeEmailContact\(email\)/);
  assert.match(staffActions, /normalizePhoneContact\(phone\)/);
  assert.match(contactNormalization, /replace\(\/\\D\/g, ""\)/);
  assert.match(staffActions, /duplicate_warning/);
  assert.doesNotMatch(staffActions, /upsert\(/);
});

test("staff CRM reads are scoped and paginated", () => {
  assert.match(staffClients, /await requireStaff\(\)/);
  assert.match(staffClients, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffClients, /PAGE_SIZE = 25/);
  assert.match(staffClients, /\.range\(from, to\)/);
  assert.match(staffClients, /count: "exact", head: true/);
});

test("staff client mutations cannot reassign other staff records", () => {
  assert.match(staffActions, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffActions, /Client record was not found\./);
  assert.doesNotMatch(
    staffActions,
    /staff_user_id: nullableText|formData\.get\("staff_user_id"\)/,
  );
});

test("admins can inspect staff client portfolios", () => {
  assert.match(adminClients, /await requireAdmin\(\)/);
  assert.match(adminClients, /\.from\("staff_clients"\)/);
  assert.match(adminStaffDetail, /Staff Client Portfolio/);
  assert.match(adminStaffDetail, /\/admin\/clients\?staff=/);
});

test("admins can see referral staff on application records", () => {
  assert.match(adminData, /referred_by_staff_id/);
  assert.match(adminData, /referral_staff/);
  assert.match(adminApplications, /Referral Staff/);
  assert.match(adminApplication, /label="Referral Staff"/);
  assert.match(adminApplication, /label="Referral Code"/);
});
