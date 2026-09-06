import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/staff/applications/page.tsx", "utf8");
const actions = readFileSync("src/lib/staff/application-actions.ts", "utf8");
const layout = readFileSync("src/app/staff/layout.tsx", "utf8");

test("staff application register is limited to owned or assigned candidates", () => {
  assert.match(page, /await requireStaff\(\)/);
  assert.match(page, /\.eq\("assigned_staff_id", context\.user\.id\)/);
  assert.match(page, /\.eq\("staff_user_id", context\.user\.id\)/);
  assert.match(page, /\.eq\("referred_by_staff_id", context\.user\.id\)/);
});

test("staff deletion re-checks application ownership server-side", () => {
  assert.match(actions, /export async function deleteOwnStaffApplication/);
  assert.match(actions, /await requireStaff\(\)/);
  assert.match(actions, /application\.assigned_staff_id === context\.user\.id/);
  assert.match(actions, /staffOwnsCandidate/);
  assert.match(actions, /\.eq\("staff_user_id", staffUserId\)/);
  assert.match(actions, /\.eq\("referred_by_staff_id", staffUserId\)/);
  assert.match(actions, /blocked application deletion outside portfolio/);
});

test("staff cannot delete applications that have payment records", () => {
  assert.match(actions, /\.from\("application_payments"\)/);
  assert.match(actions, /\.eq\("application_id", application\.id\)/);
  assert.match(actions, /delete_error=payment_record/);
  assert.match(page, /Applications with any payment record cannot be deleted by staff/);
});

test("application deletion is confirmed, audited and does not delete candidate account", () => {
  assert.match(page, /Delete Application/);
  assert.match(page, /name="confirm" value="yes"/);
  assert.match(actions, /\.from\("applications"\)\s*\.delete\(\)/);
  assert.match(actions, /staff_application_deleted/);
  assert.match(actions, /entity_type: "application"/);
  assert.doesNotMatch(actions, /auth\.admin\.deleteUser/);
});

test("staff navigation exposes application management", () => {
  assert.match(layout, /href="\/staff\/applications"/);
  assert.match(layout, />\s*Applications\s*</);
});
