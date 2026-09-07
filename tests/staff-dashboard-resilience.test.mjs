import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("src/app/staff/page.tsx", "utf8");
const clients = fs.readFileSync("src/app/staff/clients/page.tsx", "utf8");

test("staff dashboard stays lightweight and authenticated", () => {
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /await requireStaff\(\)/);
  assert.doesNotMatch(page, /createAdminClient/);
  assert.doesNotMatch(page, /staff_compensation/);
  assert.doesNotMatch(page, /countOwnStaffClients/);
  assert.doesNotMatch(page, /ReferralLinkCard/);
});

test("staff dashboard retains core recruitment action buttons", () => {
  assert.match(page, /Staff Action Centre/);
  assert.match(page, /href="\/staff\/clients"/);
  assert.match(page, /href="\/staff\/applications"/);
  assert.match(page, /\/staff\/clients#add-client/);
  assert.match(page, /status=contacted/);
  assert.match(page, /status=processing/);
  assert.match(page, /status=placed/);
  assert.match(page, /Positive Clients/);
});

test("detailed referral and medical operations remain in staff CRM", () => {
  assert.match(clients, /ReferralLinkCard/);
  assert.match(clients, /medical_status/);
  assert.match(clients, /Medical Completed/);
  assert.match(clients, /My Client Pipeline/);
});
