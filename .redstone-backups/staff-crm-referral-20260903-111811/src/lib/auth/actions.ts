"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "./redirect";
import { validateRegistration, validateResetEmail } from "@/lib/candidate/validation";

const AUTH_CALLBACK_URL = "https://redstone.co.ke/auth/callback";
const PASSWORD_RESET_URL = "https://redstone.co.ke/reset-password";

type AuthErrorLike = {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
};

export async function registerCandidate(formData: FormData) {
  const input = Object.fromEntries(formData.entries());
  const validation = validateRegistration(input);
  if (!validation.ok) {
    redirect(`/register?error=${encodeURIComponent(validation.error)}`);
  }

  const next = safeNextPath(String(formData.get("next") ?? ""), "/candidate");
  const callbackUrl = new URL(AUTH_CALLBACK_URL);
  callbackUrl.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.value.email,
    password: validation.value.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
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

  if (error || !data.user) {
    reportAuthError("candidate_signup_failed", error, {
      has_created_user: Boolean(data.user),
    });

    redirect(
      `/register?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        candidateAuthErrorMessage(error)
      )}`
    );
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
  const { error } = await supabase.auth.resetPasswordForEmail(validation.value, {
    redirectTo: PASSWORD_RESET_URL,
  });

  if (error) {
    reportAuthError("password_reset_email_failed", error);
    redirect(
      `/forgot-password?error=${encodeURIComponent(
        "We could not start password recovery. Please try again or contact support@redstone.co.ke."
      )}`
    );
  }

  redirect("/forgot-password?sent=1");
}

export async function routeAuthenticatedUser(next?: string | null) {
  const safeNext = safeNextPath(next, "/candidate");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?next=${encodeURIComponent(safeNext)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_type, is_active, must_change_password")
    .eq("id", data.user.id)
    .maybeSingle<{
      profile_type: string | null;
      is_active: boolean | null;
      must_change_password: boolean | null;
    }>();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  if (profile.is_active !== true) {
    redirect("/login?error=account_not_active");
  }

  const isStaff = ["staff", "admin", "super_admin"].includes(
    profile.profile_type ?? ""
  );

  if (isStaff && profile.must_change_password === true) {
    redirect("/reset-password?first_login=1");
  }

  if (profile.profile_type === "candidate") {
    redirect(safeNext);
  }

  if (profile.profile_type === "employer") {
    redirect(safeNextPath(next, "/employer"));
  }

  if (safeNext.startsWith("/apply/")) {
    redirect(safeNext);
  }

  if (
    profile.profile_type === "admin" ||
    profile.profile_type === "super_admin"
  ) {
    redirect("/admin");
  }

  if (profile.profile_type === "staff") {
    redirect("/staff");
  }

  redirect("/login?error=account_not_active");
}

function candidateAuthErrorMessage(error: unknown) {
  const message = authErrorText(error).toLowerCase();

  if (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  ) {
    return "An account with this email may already exist. Please sign in or reset your password.";
  }

  if (message.includes("password")) {
    return "We could not accept that password. Please choose a stronger password and try again.";
  }

  if (message.includes("email")) {
    return "We could not accept that email address. Please check it and try again.";
  }

  return "We could not create that account. Please try again or contact support@redstone.co.ke.";
}

function reportAuthError(
  event: string,
  error: unknown,
  metadata: Record<string, boolean | number | string | null> = {}
) {
  const authError = authErrorLike(error);

  console.error(`[auth] ${event}`, {
    ...metadata,
    code: authError?.code ?? null,
    name: authError?.name ?? null,
    status: authError?.status ?? null,
    message: authError?.message ?? "Supabase Auth did not return a created user.",
  });
}

function authErrorText(error: unknown) {
  return authErrorLike(error)?.message ?? "";
}

function authErrorLike(error: unknown): AuthErrorLike | null {
  return error && typeof error === "object" ? (error as AuthErrorLike) : null;
}
