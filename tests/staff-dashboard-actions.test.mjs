import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layout = fs.readFileSync("src/app/staff/layout.tsx", "utf8");
const errorBoundary = fs.readFileSync("src/app/staff/error.tsx", "utf8");

test("staff navigation exposes core recruitment actions", () => {
  for (const expected of [
    'href="/staff"',
    'href="/staff/clients"',
    'href="/staff/applications"',
    'href="/staff/clients/new"',
    'href="/staff/clients?status=processing"',
    'href="/staff/clients?status=placed"',
  ]) {
    assert.match(layout, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("staff error boundary provides recovery actions", () => {
  assert.match(errorBoundary, /"use client"/);
  assert.match(errorBoundary, /Retry Dashboard/);
  assert.match(errorBoundary, /My Clients/);
  assert.match(errorBoundary, /Applications/);
  assert.match(errorBoundary, /error\.digest/);
  assert.match(errorBoundary, /reset/);
});
