import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

export async function POST(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"), "");

  await supabase.auth.signOut();

  const destination = new URL("/login", request.url);
  if (next) destination.searchParams.set("next", next);

  return NextResponse.redirect(destination, {
    status: 303,
  });
}

