"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export type NewsletterState = {
  ok: boolean;
  message: string;
};

const initialFailure: NewsletterState = {
  ok: false,
  message: "Please enter a valid email address.",
};

export async function subscribeNewsletter(
  _state: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = value(formData, "email").toLowerCase();
  const fullName = value(formData, "full_name");
  const sourcePath = value(formData, "source_path") || "/";
  const consent = value(formData, "consent");
  const honeypot = value(formData, "company_website");

  if (honeypot) {
    return { ok: true, message: "Thanks for subscribing." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return initialFailure;
  }

  if (fullName.length > 120) {
    return { ok: false, message: "Name must be 120 characters or fewer." };
  }

  if (consent !== "yes") {
    return {
      ok: false,
      message: "Please confirm that you want to receive Red Stone updates.",
    };
  }

  const now = new Date().toISOString();
  const supabase = createAdminClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email,
      full_name: fullName || null,
      status: "active",
      source_path: sourcePath.slice(0, 500),
      consent_text:
        "I agree to receive Red Stone recruitment, jobs, blog and candidate guidance updates by email.",
      subscribed_at: now,
      last_subscribed_at: now,
      unsubscribed_at: null,
      updated_at: now,
    },
    { onConflict: "email" },
  );

  if (error) {
    console.warn("[newsletter] subscription failed", { message: error.message });
    return {
      ok: false,
      message:
        "We could not save your subscription right now. Please try again later.",
    };
  }

  return {
    ok: true,
    message:
      "You are subscribed. We will send useful Red Stone recruitment, jobs and guidance updates.",
  };
}
