import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await read("src/app/api/internal/ai/chat/route.ts");
const provider = await read("src/lib/ai/openai.ts");
const service = await read("src/lib/ai/service.ts");
const workers = await read("src/lib/ai/workers.ts");
const migration = await read("supabase/migrations/20260906224233_redstone_ai_foundation.sql");

test("AI internal gateway is secret protected and validates caller input", () => {
  assert.match(route, /AI_INTERNAL_SECRET/);
  assert.match(route, /timingSafeEqual/);
  assert.match(route, /Authorization|authorization/);
  assert.match(route, /message is required and must be 1-4000 characters/);
  assert.match(route, /conversationId must be a UUID/);
});

test("OpenAI provider uses server-only Responses API configuration", () => {
  assert.match(provider, /OPENAI_API_KEY/);
  assert.match(provider, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(provider, /store:\s*false/);
  assert.doesNotMatch(provider, /NEXT_PUBLIC_OPENAI/);
  assert.match(provider, /AbortController/);
});

test("worker router includes initial specialists and core safety rules", () => {
  for (const worker of [
    "faith_reception",
    "job_matching",
    "application_support",
    "document_verification",
    "canada",
    "australia",
    "new_zealand",
    "gulf",
    "medical_compliance",
    "application_status",
    "human_handoff",
  ]) {
    assert.match(workers, new RegExp(worker));
  }

  assert.match(workers, /Never guarantee a job, visa, sponsorship/);
  assert.match(workers, /Never ask for passwords, OTPs, PINs/);
  assert.match(workers, /full name, phone number, email, job of interest, and country of interest/);
});

test("AI service persists transcripts, lead qualification, telemetry and handoff", () => {
  assert.match(service, /ai_conversations/);
  assert.match(service, /ai_messages/);
  assert.match(service, /ai_leads/);
  assert.match(service, /ai_handoffs/);
  assert.match(service, /ai_worker_runs/);
  assert.match(service, /score === 100/);
  assert.match(service, /human_handoff/);
});

test("AI tables are RLS protected and direct client roles are revoked", () => {
  for (const table of [
    "ai_conversations",
    "ai_messages",
    "ai_leads",
    "ai_handoffs",
    "ai_worker_runs",
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }

  assert.match(migration, /revoke all[\s\S]*from anon, authenticated/i);
  assert.match(migration, /grant all[\s\S]*to service_role/i);
});

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}
