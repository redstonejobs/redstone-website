import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ code: string }>;
  }
) {
  const { code } = await params;

  const referralCode = decodeURIComponent(code)
    .trim()
    .toUpperCase();

  const admin = createAdminClient();

  const { data: staff } = await admin
    .from("profiles")
    .select(
      "id, referral_code, is_active, profile_type"
    )
    .eq("referral_code", referralCode)
    .eq("is_active", true)
    .in("profile_type", [
      "staff",
      "admin",
      "super_admin",
    ])
    .maybeSingle();

  const destination = new URL(
    staff ? "/jobs" : "/",
    request.url
  );

  if (!staff) {
    destination.searchParams.set(
      "referral",
      "invalid"
    );

    return NextResponse.redirect(destination);
  }

  destination.searchParams.set(
    "ref",
    referralCode
  );

  const response =
    NextResponse.redirect(destination);

  response.cookies.set({
    name: "redstone_referral_code",
    value: referralCode,
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}