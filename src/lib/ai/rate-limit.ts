import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";

const DEFAULT_LIMIT = 30;
const DEFAULT_WINDOW_SECONDS = 600;

type RateLimitRow = {
  allowed: boolean;
  remaining: number;
  reset_at: string;
};

export type AiRateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

export class AiRateLimitError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 503) {
    super(code);
    this.name = "AiRateLimitError";
    this.code = code;
    this.status = status;
  }
}

export async function consumeWebsiteAiRateLimit(request: Request): Promise<AiRateLimitDecision> {
  const salt = process.env.AI_RATE_LIMIT_SALT?.trim();
  if (!salt) {
    throw new AiRateLimitError("ai_rate_limit_not_configured");
  }

  const limit = boundedInteger(process.env.AI_WEBSITE_RATE_LIMIT, DEFAULT_LIMIT, 1, 1000);
  const windowSeconds = boundedInteger(
    process.env.AI_WEBSITE_RATE_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS,
    60,
    86400,
  );
  const identity = clientIdentity(request);
  const keyHash = await sha256(`${salt}:${identity}`);
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("consume_ai_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("Website AI rate limiter failed", {
      code: error.code,
      message: error.message,
    });
    throw new AiRateLimitError("ai_rate_limit_failed");
  }

  const row = (Array.isArray(data) ? data[0] : data) as RateLimitRow | null;
  if (!row || typeof row.allowed !== "boolean") {
    throw new AiRateLimitError("ai_rate_limit_invalid_response");
  }

  const resetAt = new Date(row.reset_at);
  if (Number.isNaN(resetAt.getTime())) {
    throw new AiRateLimitError("ai_rate_limit_invalid_response");
  }

  return {
    allowed: row.allowed,
    remaining: Math.max(Number(row.remaining) || 0, 0),
    resetAt,
  };
}

export function websiteAiRateLimitConfigured() {
  return Boolean(process.env.AI_RATE_LIMIT_SALT?.trim());
}

function clientIdentity(request: Request) {
  const cloudflareIp = cleanHeader(request.headers.get("cf-connecting-ip"));
  if (cloudflareIp) return `ip:${cloudflareIp}`;

  const forwarded = cleanHeader(request.headers.get("x-forwarded-for"))?.split(",")[0]?.trim();
  if (forwarded) return `ip:${forwarded}`;

  const realIp = cleanHeader(request.headers.get("x-real-ip"));
  if (realIp) return `ip:${realIp}`;

  const userAgent = cleanHeader(request.headers.get("user-agent"))?.slice(0, 300) || "unknown";
  return `fallback:${userAgent}`;
}

function cleanHeader(value: string | null) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function boundedInteger(raw: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
