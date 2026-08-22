import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { CandidateContext, CandidateProfile } from "./types";

export async function requireCandidate(): Promise<CandidateContext> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?next=/candidate");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, nationality, date_of_birth, city, country, avatar_url, profile_type, is_active")
    .eq("id", data.user.id)
    .maybeSingle<CandidateProfile & { profile_type: string | null; is_active: boolean | null }>();

  if (profileError || !profile) {
    redirect("/login?error=profile_missing");
  }

  if (profile.profile_type !== "candidate" || profile.is_active !== true) {
    redirect(profile.profile_type === "admin" || profile.profile_type === "super_admin" || profile.profile_type === "staff" ? "/admin" : "/");
  }

  return {
    user: { id: data.user.id, email: data.user.email ?? undefined },
    profile: {
      full_name: profile.full_name,
      phone: profile.phone,
      nationality: profile.nationality,
      date_of_birth: profile.date_of_birth,
      city: profile.city,
      country: profile.country,
      avatar_url: profile.avatar_url,
    },
  };
}

export async function getCandidateContext() {
  try {
    return await requireCandidate();
  } catch {
    return null;
  }
}
