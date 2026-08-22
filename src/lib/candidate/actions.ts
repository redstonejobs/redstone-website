"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireCandidate } from "./auth";
import { normalizeFileName, validateApplicationDraft, validateDocumentUpload, validateProfile } from "./validation";

export async function updateCandidateProfile(formData: FormData) {
  const context = await requireCandidate();
  const validation = validateProfile(formData);
  if (!validation.ok) throw new Error(validation.error);

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(validation.value).eq("id", context.user.id);
  if (error) throw new Error("We could not update your profile.");
  redirect("/candidate/profile?saved=1");
}

export async function startApplication(slug: string) {
  await requireCandidate();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("candidate_start_application", { p_job_slug: slug });
  if (error || !data) throw new Error("That job is no longer accepting applications.");
  redirect(`/apply/${slug}?application=${data}`);
}

export async function submitApplication(applicationId: string, formData: FormData) {
  await requireCandidate();
  const validation = validateApplicationDraft(formData);
  if (!validation.ok) throw new Error(validation.error);

  if (formData.get("confirm") !== "yes") throw new Error("Please confirm before submitting.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("candidate_submit_application", {
    p_application_id: applicationId,
    p_cover_letter: validation.value.cover_letter,
    p_relevant_experience: validation.value.relevant_experience,
    p_availability: validation.value.availability,
    p_candidate_message: validation.value.candidate_message,
  });

  if (error) throw new Error("We could not submit this application.");
  redirect(`/candidate/applications/${applicationId}?submitted=1`);
}

export async function withdrawApplication(applicationId: string, formData: FormData) {
  await requireCandidate();
  if (formData.get("confirm") !== "yes") throw new Error("Please confirm withdrawal.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("candidate_withdraw_application", { p_application_id: applicationId });
  if (error) throw new Error("This application cannot be withdrawn at this stage.");
  redirect(`/candidate/applications/${applicationId}?withdrawn=1`);
}

export async function uploadCandidateDocument(applicationId: string, formData: FormData) {
  const context = await requireCandidate();
  const file = formData.get("file");
  const documentType = String(formData.get("document_type") ?? "");
  const validation = validateDocumentUpload(file instanceof File ? file : null, documentType);
  if (!validation.ok) throw new Error(validation.error);

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("id, candidate_id")
    .eq("id", applicationId)
    .eq("candidate_id", context.user.id)
    .maybeSingle<{ id: string; candidate_id: string }>();

  if (!application) throw new Error("Application not found.");

  const safeName = `${Date.now()}-${normalizeFileName(validation.value.file.name)}`;
  const storagePath = `${context.user.id}/${applicationId}/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("candidate-documents")
    .upload(storagePath, validation.value.file, {
      contentType: validation.value.file.type,
      upsert: false,
    });

  if (uploadError) throw new Error("We couldn't upload that document.");

  const { error: metadataError } = await supabase.from("application_documents").insert({
    application_id: applicationId,
    document_type: validation.value.documentType,
    file_name: validation.value.file.name,
    file_size: validation.value.file.size,
    mime_type: validation.value.file.type,
    storage_path: storagePath,
    uploaded_by: context.user.id,
    verification_status: "pending",
  });

  if (metadataError) throw new Error("The file uploaded, but document metadata could not be saved.");
  redirect(`/candidate/applications/${applicationId}?document=uploaded`);
}

