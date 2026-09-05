import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runJobImports } from "@/lib/job-import/run";
import type { JobImportProvider } from "@/lib/job-import/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.JOB_IMPORT_SECRET?.trim();
  const supplied = bearerToken(request.headers.get("authorization"));

  if (!expected) {
    return NextResponse.json({ error: "JOB_IMPORT_SECRET is not configured." }, { status: 503 });
  }

  if (!supplied || !constantTimeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let provider: JobImportProvider | "all" = "all";
  try {
    const body = await request.json() as { provider?: unknown };
    if (body.provider === "foundrole" || body.provider === "jobbank" || body.provider === "all") {
      provider = body.provider;
    } else if (body.provider !== undefined) {
      return NextResponse.json({ error: "provider must be foundrole, jobbank, or all." }, { status: 400 });
    }
  } catch {
    // An empty body is valid and means run all enabled providers.
  }

  const result = await runJobImports(provider);
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
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
