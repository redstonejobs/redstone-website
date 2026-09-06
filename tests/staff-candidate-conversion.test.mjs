import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const staffActions = readFileSync("src/lib/staff/actions.ts", "utf8");
const staffClientsPage = readFileSync("src/app/staff/clients/page.tsx", "utf8");

test("staff can convert only their own CRM client into an invited candidate", () => {
  assert.match(staffActions, /export async function convertOwnStaffClientToCandidate/);
  assert.match(staffActions, /auth\.admin\.inviteUserByEmail/);
  assert.match(staffActions, /profile_type: "candidate"/);
  assert.match(staffActions, /candidate_user_id: candidateId/);
  assert.match(staffActions, /referred_by_staff_id: context\.user\.id/);
  assert.match(staffActions, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffClientsPage, /Convert to Candidate/);
  assert.match(staffClientsPage, /Candidate Account Linked/);
});

test("candidate conversion requires an email and does not overwrite existing auth accounts", () => {
  assert.match(staffActions, /conversion_error=email_required/);
  assert.match(staffActions, /conversion_error=account_exists/);
  assert.doesNotMatch(staffActions, /auth\.admin\.deleteUser/);
  assert.doesNotMatch(staffActions, /auth\.admin\.createUser/);
});

test("staff can delete only their own CRM record without deleting candidate identity", () => {
  assert.match(staffActions, /export async function deleteOwnStaffClient/);
  assert.match(staffActions, /formData\.get\("confirm"\) !== "yes"/);
  assert.match(staffActions, /\.from\("staff_clients"\)[\s\S]*?\.delete\(\)[\s\S]*?\.eq\("id", existing\.id\)[\s\S]*?\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(staffActions, /candidate authentication account, profile and applications are[\s\S]*?intentionally left untouched/);
  assert.match(staffClientsPage, /Delete Client Record/);
  assert.match(staffClientsPage, /linked candidate login, profile and applications will not be deleted/);
  assert.doesNotMatch(staffActions, /auth\.admin\.deleteUser/);
});
