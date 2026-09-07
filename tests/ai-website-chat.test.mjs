import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/ai/chat/route.ts", "utf8");
const widget = readFileSync("src/components/public/faith-chat.tsx", "utf8");
const layout = readFileSync("src/app/(public)/layout.tsx", "utf8");
const env = readFileSync(".env.example", "utf8");

test("website chat is server gated and same-origin", () => {
  assert.match(route, /AI_WEBSITE_CHAT_ENABLED === "true"/);
  assert.match(route, /Boolean\(process\.env\.OPENAI_API_KEY\?\.trim\(\)\)/);
  assert.match(route, /isAllowedOrigin\(request\.headers\.get\("origin"\)\)/);
  assert.match(route, /NEXT_PUBLIC_SITE_URL/);
  assert.match(route, /channel: "website"/);
  assert.match(route, /requiredText\(input\.message, 1500\)/);
  assert.match(route, /Cache-Control/);
  assert.match(route, /noindex, nofollow/);
});

test("Faith widget never receives server secrets", () => {
  assert.match(widget, /^"use client";/);
  assert.match(widget, /fetch\("\/api\/ai\/chat"/);
  assert.match(widget, /Faith Moraa/);
  assert.match(widget, /Do not send passwords, OTPs or bank PINs/);
  assert.doesNotMatch(widget, /OPENAI_API_KEY|AI_INTERNAL_SECRET|SUPABASE_SERVICE_ROLE_KEY/);
});

test("public layout renders Faith only when server feature gate and key are present", () => {
  assert.match(layout, /AI_WEBSITE_CHAT_ENABLED === "true"/);
  assert.match(layout, /OPENAI_API_KEY/);
  assert.match(layout, /faithEnabled \? <FaithChat \/> : null/);
  assert.match(env, /AI_WEBSITE_CHAT_ENABLED=false/);
});
