"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "./redirect";
import { validateRegistration, validateResetEmail } from "@/lib/candidate/validation";

export async function registerCandidate(formData: FormData) {
  const input = Object.fromEntries(formData.entries());
  const validation = validateRegistration(input);
  if (!validation.ok) {
    redirect(`/register?error=${encodeURIComponent(validation.error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.value.email,
    password: validation.value.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://redstone.co.ke"}/auth/callback`,
      data: {
        profile_type: "candidate",
        full_name: validation.value.full_name,
        phone: validation.value.phone,
        nationality: validation.value.nationality,
        date_of_birth: validation.value.date_of_birth,
        city: validation.value.city,
        country: validation.value.country,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent("We could not create that account. Please check your details or try signing in.")}`);
  }

  redirect("/verify-email");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const validation = validateResetEmail(email);
  if (!validation.ok) {
    redirect(`/forgot-password?error=${encodeURIComponent(validation.error)}`);
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(validation.value, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://redstone.co.ke"}/reset-password`,
  });

  redirect("/forgot-password?sent=1");
}

export async function routeAuthenticatedUser(next?: string | null) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(safeNextPath(next, "/candidate"))}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type, is_active")
    .eq("id", data.user.id)
    .maybeSingle<{ profile_type: string | null; is_active: boolean | null }>();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  if (profile.profile_type === "candidate" && profile.is_active === true) {
    redirect(safeNextPath(next, "/candidate"));
  }

  if (["staff", "admin", "super_admin"].includes(profile.profile_type ?? "")) {
    redirect("/admin");
  }

  redirect("/login?error=account_not_active");
}

