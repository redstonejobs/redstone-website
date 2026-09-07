import { NextResponse } from "next/server";

import { AiProviderError } from "@/lib/ai/openai";
import { AiServiceError, handleAiChat } from "@/lib/ai/service";
import type { AiContactInput } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!websiteChatEnabled()) {
    return NextResponse.json({ error: "AI chat is unavailable." }, { status: 503 });
  }

  if (!isAllowedOrigin(request.headers.get("origin"))) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = validateInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await handleAiChat({
      channel: "website",
      message: validation.message,
      conversationId: validation.conversationId,
      contact: validation.contact,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
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

    console.error("Website AI chat request failed", error);
    return NextResponse.json({ error: "ai_request_failed" }, { status: 500 });
  }
}

function websiteChatEnabled() {
  return process.env.AI_WEBSITE_CHAT_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY?.trim());
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return process.env.NODE_ENV !== "production";

  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://redstone.co.ke";
  try {
    return new URL(origin).origin === new URL(configured).origin;
  } catch {
    return false;
  }
}

function validateInput(body: unknown):
  | { ok: true; message: string; conversationId?: string; contact?: AiContactInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid request." };
  }

  const input = body as Record<string, unknown>;
  const message = requiredText(input.message, 1500);
  if (!message) {
    return { ok: false, error: "Please enter a message of 1-1500 characters." };
  }

  const conversationId = optionalText(input.conversationId, 100);
  if (conversationId && !isUuid(conversationId)) {
    return { ok: false, error: "Invalid conversation." };
  }

  const contact = parseContact(input.contact);
  if (contact.error) return { ok: false, error: contact.error };

  return {
    ok: true,
    message,
    conversationId,
    contact: contact.value,
  };
}

function parseContact(value: unknown): { value?: AiContactInput; error?: string } {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Invalid contact details." };
  }

  const input = value as Record<string, unknown>;
  const consent = input.consentToContact;
  if (consent !== undefined && typeof consent !== "boolean") {
    return { error: "Invalid contact consent." };
  }

  const contact: AiContactInput = {
    fullName: optionalText(input.fullName, 200),
    phone: optionalText(input.phone, 100),
    email: optionalText(input.email, 320),
    jobInterest: optionalText(input.jobInterest, 300),
    countryInterest: optionalText(input.countryInterest, 200),
    consentToContact: consent as boolean | undefined,
  };

  return { value: contact };
}

function requiredText(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return undefined;
  return normalized;
}

function optionalText(value: unknown, max: number) {
  if (value === undefined || value === null || value === "") return undefined;
  return requiredText(value, max);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
