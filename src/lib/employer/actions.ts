"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { requireEmployer, requireVerifiedEmployer } from "./auth";
import {
  validateEmployerDecision,
  validateEmployerProfile,
  validateEmployerRegistration,
  validateInterviewRequest,
  validateVacancyRequest,
} from "./validation";

function objectFrom(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function registerEmployer(formData: FormData) {
  const validation = validateEmployerRegistration(objectFrom(formData));
  if (!validation.ok) redirect(`/employer/register?error=${encodeURIComponent(validation.error)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.value.email,
    password: validation.value.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://redstone.co.ke"}/auth/callback?next=/employer/onboarding`,
      data: {
        profile_type: "employer",
        company_name: validation.value.company_name,
        contact_name: validation.value.contact_name,
        phone: validation.value.phone,
        country: validation.value.country,
        city: validation.value.city,
        website: validation.value.website,
        registration_number: validation.value.registration_number,
        company_type: validation.value.company_type,
        industry: validation.value.industry,
        company_size: validation.value.company_size,
      },
    },
  });

  if (error) redirect(`/employer/register?error=${encodeURIComponent("We could not create that employer account. Please check your details or sign in.")}`);
  redirect("/employer/verify-email");
}

export async function updateEmployerProfile(formData: FormData) {
  const context = await requireEmployer();
  const validation = validateEmployerProfile(objectFrom(formData));
  if (!validation.ok) redirect(`/employer/profile?error=${encodeURIComponent(validation.error)}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("employers")
    .update({
      company_name: validation.value.company_name,
      registration_number: validation.value.registration_number || null,
      website: validation.value.website || null,
      email: validation.value.email,
      phone: validation.value.phone,
      country: validation.value.country,
      city: validation.value.city,
      address: validation.value.address || null,
      description: validation.value.description || null,
      company_type: validation.value.company_type || null,
      industry: validation.value.industry || null,
      company_size: validation.value.company_size || null,
      primary_contact_name: validation.value.primary_contact_name || null,
      primary_contact_position: validation.value.primary_contact_position || null,
      recruitment_needs: validation.value.recruitment_needs || null,
      preferred_job_categories: validation.value.preferred_job_categories.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean),
    })
    .eq("id", String(context.employer.id))
    .eq("owner_user_id", context.user.id);

  if (error) redirect("/employer/profile?error=profile_update_failed");
  await logEmployerActivity(context, "employer_profile_updated", "employer", String(context.employer.id), "Employer profile updated");
  redirect("/employer/profile?saved=1");
}

export async function submitCompanyVerification() {
  const context = await requireEmployer();
  const supabase = await createClient();
  const { error } = await supabase
    .from("employers")
    .update({ verification_status: "under_review", verification_submitted_at: new Date().toISOString() })
    .eq("id", String(context.employer.id))
    .eq("owner_user_id", context.user.id)
    .in("verification_status", ["pending", "rejected"]);

  if (error) redirect("/employer/onboarding?error=verification_submit_failed");
  await logEmployerActivity(context, "employer_verification_submitted", "employer", String(context.employer.id), "Employer submitted verification");
  redirect("/employer?verification=submitted");
}

export async function createEmployerJobRequest(formData: FormData) {
  const context = await requireEmployer();
  if (!context.active) redirect("/employer?status=suspended");
  const submit = formData.get("intent") === "submit";
  if (submit && !context.verified) redirect("/employer/jobs/new?error=verification_required");
  const validation = validateVacancyRequest(objectFrom(formData), submit);
  if (!validation.ok) redirect(`/employer/jobs/new?error=${encodeURIComponent(validation.error)}`);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employer_job_requests")
    .insert({
      ...validation.value,
      employer_id: String(context.employer.id),
      created_by: context.user.id,
      status: submit ? "submitted_for_review" : "employer_draft",
      submitted_at: submit ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) redirect("/employer/jobs/new?error=request_create_failed");
  await logEmployerActivity(context, submit ? "employer_job_request_submitted" : "employer_job_request_created", "employer_job_request", data.id, submit ? "Vacancy request submitted" : "Vacancy draft created");
  redirect(`/employer/jobs/${data.id}`);
}

export async function updateEmployerJobRequest(id: string, formData: FormData) {
  const context = await requireEmployer();
  const submit = formData.get("intent") === "submit";
  if (submit && !context.verified) redirect(`/employer/jobs/${id}/edit?error=verification_required`);
  const validation = validateVacancyRequest(objectFrom(formData), submit);
  if (!validation.ok) redirect(`/employer/jobs/${id}/edit?error=${encodeURIComponent(validation.error)}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("employer_job_requests")
    .update({
      ...validation.value,
      status: submit ? "submitted_for_review" : "employer_draft",
      submitted_at: submit ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("employer_id", String(context.employer.id))
    .in("status", ["employer_draft", "changes_requested"]);

  if (error) redirect(`/employer/jobs/${id}/edit?error=request_update_failed`);
  await logEmployerActivity(context, submit ? "employer_job_request_submitted" : "employer_job_request_created", "employer_job_request", id, submit ? "Vacancy request submitted" : "Vacancy draft updated");
  redirect(`/employer/jobs/${id}`);
}

export async function recordEmployerDecision(applicationId: string, formData: FormData) {
  const context = await requireVerifiedEmployer();
  if (formData.get("confirm") !== "yes") redirect(`/employer/applicants/${applicationId}?error=confirmation_required`);
  const validation = validateEmployerDecision(objectFrom(formData));
  if (!validation.ok) redirect(`/employer/applicants/${applicationId}?error=${encodeURIComponent(validation.error)}`);
  const supabase = await createClient();
  const allowed = await applicationBelongsToEmployer(applicationId, String(context.employer.id));
  if (!allowed) redirect("/employer/applicants?error=access_denied");

  const { error } = await supabase.from("employer_application_decisions").upsert({
    application_id: applicationId,
    employer_id: String(context.employer.id),
    decision: validation.value.decision,
    note: validation.value.note || null,
    decided_by_user_id: context.user.id,
  }, { onConflict: "application_id,employer_id" });

  if (error) redirect(`/employer/applicants/${applicationId}?error=decision_failed`);
  await logEmployerActivity(context, `employer_candidate_${validation.value.decision}`, "application", applicationId, "Employer candidate decision recorded");
  redirect(`/employer/applicants/${applicationId}`);
}

export async function requestEmployerInterview(applicationId: string, formData: FormData) {
  const context = await requireVerifiedEmployer();
  if (formData.get("confirm") !== "yes") redirect(`/employer/applicants/${applicationId}?error=confirmation_required`);
  const validation = validateInterviewRequest(objectFrom(formData));
  if (!validation.ok) redirect(`/employer/applicants/${applicationId}?error=${encodeURIComponent(validation.error)}`);
  const allowed = await applicationBelongsToEmployer(applicationId, String(context.employer.id));
  if (!allowed) redirect("/employer/applicants?error=access_denied");

  const supabase = await createClient();
  const { error } = await supabase.from("employer_interview_requests").insert({
    application_id: applicationId,
    employer_id: String(context.employer.id),
    requested_by_user_id: context.user.id,
    ...validation.value,
  });

  if (error) redirect(`/employer/applicants/${applicationId}?error=interview_failed`);
  await logEmployerActivity(context, "employer_interview_requested", "application", applicationId, "Employer requested interview");
  redirect(`/employer/applicants/${applicationId}`);
}

export async function employerRedirect(next?: string | null) {
  redirect(safeNextPath(next, "/employer"));
}

async function applicationBelongsToEmployer(applicationId: string, employerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("id, job:jobs(employer_id)")
    .eq("id", applicationId)
    .maybeSingle<{ id: string; job: { employer_id: string | null } | null }>();

  return data?.job?.employer_id === employerId;
}

async function logEmployerActivity(context: { user: { id: string }; employer: { id?: unknown } }, action: string, entityType: string, entityId: string, description: string) {
  const supabase = await createClient();
  await supabase.from("employer_activity_logs").insert({
    employer_id: String(context.employer.id),
    actor_user_id: context.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
  });
}
