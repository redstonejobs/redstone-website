import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync("src/app/staff/page.tsx", "utf8");

test("staff dashboard optional data failures cannot crash the render", () => {
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.match(page, /createAdminClient/);
  assert.match(page, /dashboard profile load threw/);
  assert.match(page, /dashboard role load threw/);
  assert.match(page, /dashboard compensation load threw/);
  assert.match(page, /dashboard client count threw/);
  assert.match(page, /return 0/);
  assert.match(page, /StaffDashboardUnavailable/);
});

test("staff dashboard retains recruitment and positive-client operations", () => {
  assert.match(page, /ReferralLinkCard/);
  assert.match(page, /countOwnStaffClients/);
  assert.match(page, /medicalStatus/);
  assert.match(page, /"completed"/);
  assert.match(page, /Positive Clients/);
  assert.match(page, /\/staff\/applications/);
  assert.match(page, /\/staff\/clients#add-client/);
});
