import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const openNext = readFileSync("open-next.config.ts", "utf8");
const proxy = readFileSync("proxy.ts", "utf8");
const headers = readFileSync("public/_headers", "utf8");
const home = readFileSync("src/app/page.tsx", "utf8");
const jobs = readFileSync("src/app/(public)/jobs/page.tsx", "utf8");

test("OpenNext intercepts prerendered pages through Cloudflare Static Assets", () => {
  assert.match(openNext, /static-assets-incremental-cache/);
  assert.match(openNext, /incrementalCache:\s*staticAssetsIncrementalCache/);
  assert.match(openNext, /enableCacheInterception:\s*true/);
});

test("immutable Next build assets receive long-lived browser caching", () => {
  assert.match(headers, /\/_next\/static\/\*/);
  assert.match(headers, /max-age=31536000/);
  assert.match(headers, /immutable/);
});

test("public traffic stays out of the Supabase auth proxy", () => {
  assert.match(proxy, /"\/admin\/:path\*"/);
  assert.match(proxy, /"\/staff\/:path\*"/);
  assert.match(proxy, /"\/candidate\/:path\*"/);
  assert.match(proxy, /"\/employer\/:path\*"/);
  assert.doesNotMatch(proxy, /"\/jobs/);
  assert.doesNotMatch(proxy, /"\/sponsorship-jobs/);
});

test("live-data routes remain dynamic until a persistent ISR backend exists", () => {
  assert.match(home, /export const dynamic = "force-dynamic"/);
  assert.match(jobs, /export const dynamic = "force-dynamic"/);
  assert.doesNotMatch(openNext, /r2-incremental-cache|do-queue|NEXT_INC_CACHE_R2_BUCKET/);
});
