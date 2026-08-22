import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { Row } from "@/lib/admin/types";
import type { EmployerContext } from "./types";

export async function requireEmployer(): Promise<EmployerContext> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/employer");
  }

  const [{ data: profile }, { data: employer }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone, country, city, profile_type, is_active")
      .eq("id", userData.user.id)
      .maybeSingle<Row>(),
    supabase
      .from("employers")
      .select("id, owner_user_id, company_name, verification_status, is_active, email, phone, country, city, address, description, registration_number, website, company_type, industry, company_size, primary_contact_name, primary_contact_position, recruitment_needs, preferred_job_categories")
      .eq("owner_user_id", userData.user.id)
      .maybeSingle<Row>(),
  ]);

  if (!profile || profile.profile_type !== "employer" || profile.is_active !== true) {
    redirect("/");
  }

  if (!employer) {
    redirect("/employer/onboarding");
  }

  return {
    user: { id: userData.user.id, email: userData.user.email ?? undefined },
    profile,
    employer,
    verified: employer.verification_status === "verified",
    active: employer.is_active !== false,
  };
}

export async function requireVerifiedEmployer() {
  const context = await requireEmployer();

  if (!context.active || context.employer.verification_status === "suspended") {
    redirect("/employer?status=suspended");
  }

  if (!context.verified) {
    redirect("/employer?status=verification_required");
  }

  return context;
}
