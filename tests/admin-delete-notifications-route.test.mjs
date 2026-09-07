import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const notificationRoute = readFileSync(
  "src/app/admin/notifications/page.tsx",
  "utf8",
);
const staffDeleteAction = readFileSync(
  "src/lib/admin/staff-account-actions.ts",
  "utf8",
);
const grants = readFileSync(
  "supabase/migrations/20260907100629_staff_delete_service_role_permissions.sql",
  "utf8",
);

test("legacy admin notifications navigation resolves to an authenticated real route", () => {
  assert.match(notificationRoute, /await requireAdmin\(\)/);
  assert.match(notificationRoute, /redirect\("\/admin\/audit"\)/);
});

test("permanent staff deletion safety checks have the service-role permissions they require", () => {
  assert.match(staffDeleteAction, /countOwnedRows\(admin, "application_documents", "candidate_id", targetUserId\)/);
  assert.match(staffDeleteAction, /countOwnedRows\(admin, "candidate_notes", "candidate_id", targetUserId\)/);
  assert.match(staffDeleteAction, /\.from\("application_payment_waivers"\)[\s\S]*?\.update\(\{ waived_by: context\.user\.id \}\)/);

  assert.match(grants, /grant select on table public\.application_documents to service_role;/i);
  assert.match(grants, /grant select on table public\.candidate_notes to service_role;/i);
  assert.match(grants, /grant update on table public\.application_payment_waivers to service_role;/i);
});
