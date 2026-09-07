import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { AiProviderError } from "@/lib/ai/openai";
import { AiServiceError, handleAiChat } from "@/lib/ai/service";
import type { AiChannel, AiChatInput, AiContactInput } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const channels = new Set<AiChannel>(["website", "whatsapp", "admin", "api"]);

export async function POST(request: Request) {
  const expected = process.env.AI_INTERNAL_SECRET?.trim();
  const supplied = bearerToken(request.headers.get("authorization"));

  if (!expected) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

  if (!supplied || !constantTimeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await handleAiChat(validation.value);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }
    if (error instanceof AiProviderError) {
      const status = error.code === "openai_not_configured"
        ? 503
        : error.code === "openai_timeout"
          ? 504
          : 502;
      return NextResponse.json({ error: error.code }, { status });
    }

    console.error("AI chat request failed", error);
    return NextResponse.json({ error: "ai_request_failed" }, { status: 500 });
  }
}

function validateInput(body: unknown): { ok: true; value: AiChatInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Request body must be an object." };
  }

  const input = body as Record<string, unknown>;
  const message = text(input.message, 4000);
  if (!message) {
    return { ok: false, error: "message is required and must be 1-4000 characters." };
  }

  let channel: AiChannel = "api";
  if (input.channel !== undefined) {
    if (typeof input.channel !== "string" || !channels.has(input.channel as AiChannel)) {
      return { ok: false, error: "channel must be website, whatsapp, admin, or api." };
    }
    channel = input.channel as AiChannel;
  }

  const conversationId = optionalText(input.conversationId, 100);
  if (conversationId && !isUuid(conversationId)) {
    return { ok: false, error: "conversationId must be a UUID." };
  }

  const externalThreadId = optionalText(input.externalThreadId, 250);
  const contact = parseContact(input.contact);
  if (contact.error) return { ok: false, error: contact.error };

  return {
    ok: true,
    value: {
      message,
      channel,
      conversationId,
      externalThreadId,
      contact: contact.value,
    },
  };
}

function parseContact(value: unknown): { value?: AiContactInput; error?: string } {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "contact must be an object." };
  }

  const contact = value as Record<string, unknown>;
  const consent = contact.consentToContact;
  if (consent !== undefined && typeof consent !== "boolean") {
    return { error: "contact.consentToContact must be boolean." };
  }

  return {
    value: {
      fullName: optionalText(contact.fullName, 200),
      phone: optionalText(contact.phone, 100),
      email: optionalText(contact.email, 320),
      jobInterest: optionalText(contact.jobInterest, 300),
      countryInterest: optionalText(contact.countryInterest, 200),
      consentToContact: consent as boolean | undefined,
    },
  };
}

function text(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return undefined;
  return normalized;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined || value === null || value === "") return undefined;
  return text(value, max);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function bearerToken(value: string | null) {
  if (!value) return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function constantTimeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
