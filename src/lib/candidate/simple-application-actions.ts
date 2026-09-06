"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireCandidate } from "./auth";

function text(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function fail(applicationId: string, section: string, message: string): never {
  redirect(
    `/candidate/applications/${applicationId}?section=${encodeURIComponent(section)}&error=${encodeURIComponent(message)}`,
  );
}

async function requireEditableApplication(applicationId: string) {
  const context = await requireCandidate();
  const supabase = await createClient();
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", applicationId)
    .eq("candidate_id", context.user.id)
    .maybeSingle<{ id: string; status: string | null }>();

  if (error || !application) {
    fail(applicationId, "personal", "Application not found.");
  }

  if (String(application.status ?? "draft") !== "draft") {
    fail(
      applicationId,
      "review",
      "This application has already moved beyond editing. Review the current application status instead.",
    );
  }

  return { context, supabase };
}

async function markComplete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  applicationId: string,
  sectionKey: "personal" | "passport" | "declarations",
) {
  const { error } = await supabase
    .from("application_section_progress")
    .upsert(
      {
        application_id: applicationId,
        section_key: sectionKey,
        status: "complete",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "application_id,section_key" },
    );

  if (error) {
    throw new Error("Your information was saved, but progress could not be updated.");
  }
}

async function saveProfileFields(
  supabase: Awaited<ReturnType<typeof createClient>>,
  applicationId: string,
  fields: Record<string, unknown>,
) {
  const { data: existing, error: lookupError } = await supabase
    .from("application_immigration_profiles")
    .select("application_id")
    .eq("application_id", applicationId)
    .maybeSingle<{ application_id: string }>();

  if (lookupError) {
    throw new Error("We could not open your application profile.");
  }

  const result = existing
    ? await supabase
        .from("application_immigration_profiles")
        .update(fields)
        .eq("application_id", applicationId)
    : await supabase
        .from("application_immigration_profiles")
        .insert({ application_id: applicationId, ...fields });

  if (result.error) {
    throw new Error("We could not save your application information.");
  }
}

export async function saveSimplePersonalInformation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } = await requireEditableApplication(applicationId);

  const givenNames = text(formData, "given_names");
  const familyName = text(formData, "family_name");
  const dateOfBirth = text(formData, "date_of_birth");
  const nationality = text(formData, "nationality");
  const sex = text(formData, "sex");
  const phone = text(formData, "primary_phone");
  const email = text(formData, "primary_email");
  const residenceCountry = text(formData, "residence_country");

  if (
    !givenNames ||
    !familyName ||
    !dateOfBirth ||
    !nationality ||
    !sex ||
    !phone ||
    !email ||
    !residenceCountry
  ) {
    fail(applicationId, "personal", "Complete all required personal and contact details.");
  }

  if (Number.isNaN(new Date(dateOfBirth).getTime())) {
    fail(applicationId, "personal", "Enter a valid date of birth.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(applicationId, "personal", "Enter a valid email address.");
  }

  await saveProfileFields(supabase, applicationId, {
    given_names: givenNames,
    family_name: familyName,
    date_of_birth: dateOfBirth,
    nationality,
    sex,
    primary_phone: phone,
    primary_email: email,
    residence_country: residenceCountry,
  });

  await markComplete(supabase, applicationId, "personal");

  redirect(`/candidate/applications/${applicationId}?section=passport&saved=personal`);
}

export async function saveSimplePassportInformation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } = await requireEditableApplication(applicationId);

  const passportNumber = text(formData, "passport_number");
  const issueCountry = text(formData, "passport_issue_country");
  const issueDate = text(formData, "passport_issue_date");
  const expiryDate = text(formData, "passport_expiry_date");

  if (!passportNumber || !issueCountry || !issueDate || !expiryDate) {
    fail(applicationId, "passport", "Complete all required passport details.");
  }

  const issued = new Date(issueDate);
  const expires = new Date(expiryDate);
  if (Number.isNaN(issued.getTime()) || Number.isNaN(expires.getTime())) {
    fail(applicationId, "passport", "Enter valid passport dates.");
  }

  if (expires <= issued) {
    fail(applicationId, "passport", "Passport expiry date must be after the issue date.");
  }

  await saveProfileFields(supabase, applicationId, {
    passport_number: passportNumber,
    passport_issue_country: issueCountry,
    passport_issue_date: issueDate,
    passport_expiry_date: expiryDate,
  });

  await markComplete(supabase, applicationId, "passport");

  redirect(`/candidate/applications/${applicationId}?section=declarations&saved=passport`);
}

export async function saveSimpleDeclaration(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } = await requireEditableApplication(applicationId);

  const consentToData = formData.get("consent_to_data_processing") === "on";
  const consentToEmployer = formData.get("consent_to_employer_sharing") === "on";
  const consentToAuthority = formData.get("consent_to_authority_sharing") === "on";
  const certify = formData.get("certify_true_and_complete") === "on";
  const signedName = text(formData, "declaration_signed_name");

  if (!consentToData) {
    fail(applicationId, "declarations", "Consent to process your application information is required.");
  }

  if (!consentToEmployer) {
    fail(applicationId, "declarations", "Consent to share relevant information with the recruiting employer is required.");
  }

  if (!certify || !signedName) {
    fail(applicationId, "declarations", "Confirm the declaration and enter your full legal name.");
  }

  const payload = {
    consent_to_data_processing: consentToData,
    consent_to_employer_sharing: consentToEmployer,
    consent_to_authority_sharing: consentToAuthority,
    certify_true_and_complete: certify,
    declaration_signed_name: signedName,
    declaration_signed_at: new Date().toISOString(),
  };

  const { data: existing, error: lookupError } = await supabase
    .from("application_immigration_declarations")
    .select("application_id")
    .eq("application_id", applicationId)
    .maybeSingle<{ application_id: string }>();

  if (lookupError) {
    throw new Error("We could not open your declaration record.");
  }

  const result = existing
    ? await supabase
        .from("application_immigration_declarations")
        .update(payload)
        .eq("application_id", applicationId)
    : await supabase
        .from("application_immigration_declarations")
        .insert({ application_id: applicationId, ...payload });

  if (result.error) {
    throw new Error("We could not save your declaration.");
  }

  await markComplete(supabase, applicationId, "declarations");

  redirect(`/candidate/applications/${applicationId}?section=documents&saved=declarations`);
}
