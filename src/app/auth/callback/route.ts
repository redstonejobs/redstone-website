import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", requestUrl.origin)
      );
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_type, is_active")
        .eq("id", userData.user.id)
        .maybeSingle<{ profile_type: string | null; is_active: boolean | null }>();

      if (profile?.profile_type === "candidate" && profile.is_active === true) {
        return NextResponse.redirect(new URL(safeNextPath(requestUrl.searchParams.get("next"), "/candidate"), requestUrl.origin));
      }

      if (["staff", "admin", "super_admin"].includes(profile?.profile_type ?? "")) {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
