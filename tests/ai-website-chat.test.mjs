import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/ai/chat/route.ts", "utf8");
const rateLimit = readFileSync("src/lib/ai/rate-limit.ts", "utf8");
const widget = readFileSync("src/components/public/faith-chat.tsx", "utf8");
const layout = readFileSync("src/app/(public)/layout.tsx", "utf8");
const env = readFileSync(".env.example", "utf8");
const limiterMigration = readFileSync(
  "supabase/migrations/20260907042000_ai_website_rate_limit.sql",
  "utf8",
);
const aclMigration = readFileSync(
  "supabase/migrations/20260907041500_harden_legacy_security_definer_acl.sql",
  "utf8",
);

test("website chat is server gated, same-origin and rate limited before OpenAI", () => {
  assert.match(route, /AI_WEBSITE_CHAT_ENABLED === "true"/);
  assert.match(route, /Boolean\(process\.env\.OPENAI_API_KEY\?\.trim\(\)\)/);
  assert.match(route, /websiteAiRateLimitConfigured\(\)/);
  assert.match(route, /isAllowedOrigin\(request\.headers\.get\("origin"\)\)/);
  assert.match(route, /NEXT_PUBLIC_SITE_URL/);
  assert.match(route, /consumeWebsiteAiRateLimit\(request\)/);
  assert.match(route, /status: 429/);
  assert.match(route, /Retry-After/);
  assert.match(route, /X-RateLimit-Remaining/);
  assert.ok(
    route.indexOf("consumeWebsiteAiRateLimit(request)") < route.indexOf("handleAiChat({"),
    "rate limiting must happen before the OpenAI-backed service call",
  );
  assert.match(route, /channel: "website"/);
  assert.match(route, /requiredText\(input\.message, 1500\)/);
  assert.match(route, /Cache-Control/);
  assert.match(route, /noindex, nofollow/);
});

test("rate limiter hashes client identity and uses service-role-only Supabase RPC", () => {
  assert.match(rateLimit, /import "server-only"/);
  assert.match(rateLimit, /createAdminClient/);
  assert.match(rateLimit, /cf-connecting-ip/);
  assert.match(rateLimit, /x-forwarded-for/);
  assert.match(rateLimit, /AI_RATE_LIMIT_SALT/);
  assert.match(rateLimit, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(rateLimit, /admin\.rpc\("consume_ai_rate_limit"/);
  assert.doesNotMatch(rateLimit, /console\.(log|error)\([^\n]*(cloudflareIp|forwarded|realIp|identity|keyHash)/);
});

test("database limiter is private and only service role can execute its public RPC", () => {
  assert.match(limiterMigration, /create schema if not exists private/);
  assert.match(limiterMigration, /create table if not exists private\.ai_rate_limits/);
  assert.match(limiterMigration, /language plpgsql\s+security invoker/);
  assert.match(limiterMigration, /set search_path = ''/);
  assert.match(limiterMigration, /on conflict \(key_hash\) do update/);
  assert.match(limiterMigration, /revoke execute on function public\.consume_ai_rate_limit\(text, integer, integer\) from public, anon, authenticated/);
  assert.match(limiterMigration, /grant execute on function public\.consume_ai_rate_limit\(text, integer, integer\) to service_role/);
  assert.doesNotMatch(limiterMigration, /security definer/);
});

test("legacy privileged RPCs no longer inherit anonymous execution", () => {
  for (const functionPattern of [
    "admin_assign_application\\(uuid, uuid, uuid, text\\)",
    "admin_update_application_status\\(uuid, text, uuid, text, jsonb\\)",
    "is_admin\\(\\)",
    "is_staff\\(\\)",
  ]) {
    assert.match(
      aclMigration,
      new RegExp(`revoke execute on function public\\.${functionPattern} from public, anon`),
    );
  }
  assert.match(aclMigration, /set search_path = ''/);
});

test("Faith widget never receives server secrets", () => {
  assert.match(widget, /^"use client";/);
  assert.match(widget, /fetch\("\/api\/ai\/chat"/);
  assert.match(widget, /Faith Moraa/);
  assert.match(widget, /Do not send passwords, OTPs or bank PINs/);
  assert.doesNotMatch(widget, /OPENAI_API_KEY|AI_INTERNAL_SECRET|AI_RATE_LIMIT_SALT|SUPABASE_SERVICE_ROLE_KEY/);
});

test("public layout renders Faith only when all server protections are present", () => {
  assert.match(layout, /AI_WEBSITE_CHAT_ENABLED === "true"/);
  assert.match(layout, /OPENAI_API_KEY/);
  assert.match(layout, /AI_RATE_LIMIT_SALT/);
  assert.match(layout, /faithEnabled \? <FaithChat \/> : null/);
  assert.match(env, /AI_WEBSITE_CHAT_ENABLED=false/);
  assert.match(env, /AI_RATE_LIMIT_SALT=/);
  assert.match(env, /AI_WEBSITE_RATE_LIMIT=30/);
  assert.match(env, /AI_WEBSITE_RATE_WINDOW_SECONDS=600/);
});
