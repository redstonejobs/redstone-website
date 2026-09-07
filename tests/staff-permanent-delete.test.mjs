import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const actions = readFileSync("src/lib/admin/staff-account-actions.ts", "utf8");
const layout = readFileSync("src/app/admin/staff/[id]/layout.tsx", "utf8");

test("permanent staff deletion requires explicit administrator confirmation", () => {
  assert.match(actions, /requireAdmin\(\)/);
  assert.match(actions, /canManageStaff\(context\)/);
  assert.match(actions, /context\.user\.id === targetUserId/);
  assert.match(actions, /delete_confirmation/);
  assert.match(actions, /!== "DELETE"/);
  assert.match(layout, /Type DELETE to confirm/);
  assert.match(layout, /pattern="DELETE"/);
});

test("administrator and super-admin deletion is protected", () => {
  assert.match(actions, /role\.role === "admin" \|\| role\.role === "super_admin"/);
  assert.match(actions, /await requireSuperAdmin\(\)/);
  assert.match(actions, /Cannot permanently delete the final active Super Administrator/);
});

test("candidate-owned records are never cascade-deleted by staff removal", () => {
  assert.match(actions, /countOwnedRows\(admin, "applications", "candidate_id", targetUserId\)/);
  assert.match(actions, /countOwnedRows\(admin, "application_payments", "candidate_id", targetUserId\)/);
  assert.match(actions, /countOwnedRows\(admin, "application_documents", "candidate_id", targetUserId\)/);
  assert.match(actions, /countOwnedRows\(admin, "candidate_notes", "candidate_id", targetUserId\)/);
  assert.match(actions, /Transfer or resolve those candidate records before permanent deletion/);
});

test("business history is preserved before auth deletion", () => {
  assert.match(actions, /\.from\("staff_clients"\)/);
  assert.match(actions, /staff_user_id: context\.user\.id/);
  assert.match(actions, /\.from\("application_payment_waivers"\)/);
  assert.match(actions, /waived_by: context\.user\.id/);
  assert.match(actions, /auth\.admin\.deleteUser\(targetUserId\)/);
  assert.match(actions, /staff_account_permanently_deleted/);
});

test("staff record pages expose a clearly labelled danger zone", () => {
  assert.match(layout, /Permanent Staff Deletion/);
  assert.match(layout, /Permanently Delete Staff/);
  assert.match(layout, /profile && !isOwnAccount/);
  assert.match(layout, /cannot be undone/i);
});
