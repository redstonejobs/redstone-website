"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireCandidate } from "./auth";
import { normalizeFileName, validateApplicationDraft, validateDocumentUpload, validateProfile } from "./validation";
import {
  createOrReuseApplicationPayment,
  markApplicationReadyForPayment,
} from "@/lib/payments/application-payments";
import { normalizeMpesaPhone } from "@/lib/payments/mpesa/phone";
import { attributeCandidateFromCurrentReferral } from "@/lib/referrals/attribution";


function failCandidateSection(
  applicationId: string,
  section: string,
  message: string,
): never {
  redirect(
    `/candidate/applications/${applicationId}?section=${encodeURIComponent(section)}&error=${encodeURIComponent(message)}`,
  );
}

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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("candidate_start_application", { p_job_slug: slug });

  if (error || !data) {
    const reason = applicationStartErrorReason(error, data);

    console.warn("[candidate]", "application start failed", {
      slug,
      reason,
      code: authRpcError(error)?.code ?? null,
      message: authRpcError(error)?.message ?? "No application id returned.",
    });

    redirect(`/apply/${slug}?error=${reason}`);
  }

  const { data: userData } = await supabase.auth.getUser();

  if (userData.user) {
    try {
      await attributeCandidateFromCurrentReferral(userData.user.id, {
        status: "applied",
        applicationId: String(data),
        jobSlug: slug,
      });
    } catch (referralError) {
      console.warn("[referral] application attribution failed", {
        application_id: String(data),
        candidate_id: userData.user.id,
        slug,
        message:
          referralError instanceof Error ? referralError.message : "unknown_error",
      });
    }
  }

  redirect(`/candidate/applications/${data}`);
}

function applicationStartErrorReason(error: unknown, data: unknown) {
  const message = authRpcError(error)?.message?.toLowerCase() ?? "";

  if (message.includes("candidate_required")) return "candidate_required";
  if (message.includes("job_not_available")) return "job_not_available";
  if (!data) return "application_not_started";

  return "application_start_failed";
}

function authRpcError(error: unknown) {
  return error && typeof error === "object"
    ? (error as { code?: string; message?: string })
    : null;
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

export async function prepareApplicationPayment(applicationId: string) {
  const context = await requireCandidate();

  try {
    await markApplicationReadyForPayment(applicationId, context.user.id);
  } catch (error) {
    console.warn("[candidate] payment readiness check failed", {
      application_id: applicationId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
    redirect(
      `/candidate/applications/${applicationId}?section=review&payment_error=application_not_ready`
    );
  }

  redirect(`/candidate/applications/${applicationId}?section=payment&ready=1`);
}

export async function initiateApplicationPayment(applicationId: string, formData: FormData) {
  const context = await requireCandidate();
  const phone = String(formData.get("mpesa_phone") ?? "");

  if (formData.get("fee_acknowledgement") !== "yes") {
    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=acknowledgement_required`
    );
  }

  try {
    normalizeMpesaPhone(phone);
  } catch {
    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=invalid_phone`
    );
  }

  let result;

  try {
    result = await createOrReuseApplicationPayment({
      applicationId,
      candidateId: context.user.id,
      phoneNumber: phone,
    });
  } catch (error) {
    console.error("[candidate] payment initiation failed", {
      application_id: applicationId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=stk_unavailable`
    );
  }

  const reference = String(result.payment.internal_reference ?? "");
  const params = new URLSearchParams({
    section: "payment",
    payment: result.stkStarted ? "pending" : "configuring",
  });

  if (reference) params.set("reference", reference);

  redirect(`/candidate/applications/${applicationId}?${params.toString()}`);
}

export async function withdrawApplication(applicationId: string, formData: FormData) {
  await requireCandidate();
  if (formData.get("confirm") !== "yes") throw new Error("Please confirm withdrawal.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("candidate_withdraw_application", { p_application_id: applicationId });
  if (error) throw new Error("This application cannot be withdrawn at this stage.");
  redirect(`/candidate/applications/${applicationId}?withdrawn=1`);
}

const MAX_DOCUMENT_BATCH_FILES = 10;
const MAX_DOCUMENT_BATCH_BYTES = 30 * 1024 * 1024;

export async function uploadCandidateDocument(applicationId: string, formData: FormData) {
  const context = await requireCandidate();
  const documentTypeEntries = formData
    .getAll("document_type")
    .map((entry) => String(entry ?? "").trim());

  const multiFileEntries = formData.getAll("files");
  const legacyFile = formData.get("file");
  const files = (multiFileEntries.length ? multiFileEntries : [legacyFile]).filter(
    (entry): entry is File => entry instanceof File && entry.size > 0,
  );

  if (!files.length) {
    return failCandidateSection(
      applicationId,
      "documents",
      "Choose at least one document to upload.",
    );
  }

  if (files.length > MAX_DOCUMENT_BATCH_FILES) {
    return failCandidateSection(
      applicationId,
      "documents",
      `Upload no more than ${MAX_DOCUMENT_BATCH_FILES} files at a time.`,
    );
  }

  if (
    documentTypeEntries.length > 1 &&
    documentTypeEntries.length !== files.length
  ) {
    return failCandidateSection(
      applicationId,
      "documents",
      "Each selected document must have its own document type.",
    );
  }

  const documentTypes =
    documentTypeEntries.length === 1
      ? files.map(() => documentTypeEntries[0])
      : documentTypeEntries;

  const validations = files.map((file, index) =>
    validateDocumentUpload(file, documentTypes[index] ?? ""),
  );
  const invalid = validations.find((validation) => !validation.ok);

  if (invalid && !invalid.ok) {
    return failCandidateSection(applicationId, "documents", invalid.error);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_DOCUMENT_BATCH_BYTES) {
    return failCandidateSection(
      applicationId,
      "documents",
      "The selected files are too large as a group. Upload up to 30 MB per batch.",
    );
  }

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("applications")
    .select("id, candidate_id")
    .eq("id", applicationId)
    .eq("candidate_id", context.user.id)
    .maybeSingle<{ id: string; candidate_id: string }>();

  if (!application) {
    return failCandidateSection(applicationId, "documents", "Application not found.");
  }

  const batchStamp = Date.now();
  const uploadedPaths: string[] = [];
  const metadataRows: Array<Record<string, unknown>> = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const validation = validations[index];
    if (!validation.ok) continue;

    const safeName = `${batchStamp}-${index + 1}-${normalizeFileName(file.name)}`;
    const storagePath = `${context.user.id}/${applicationId}/${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("candidate-documents")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      if (uploadedPaths.length) {
        await supabase.storage.from("candidate-documents").remove(uploadedPaths);
      }

      return failCandidateSection(
        applicationId,
        "documents",
        "We couldn't upload all selected documents. No partial batch was kept; please retry.",
      );
    }

    uploadedPaths.push(storagePath);
    metadataRows.push({
      application_id: applicationId,
      document_type: validation.value.documentType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      candidate_id: context.user.id,
      verification_status: "pending",
    });
  }

  const { error: metadataError } = await supabase
    .from("application_documents")
    .insert(metadataRows);

  if (metadataError) {
    if (uploadedPaths.length) {
      await supabase.storage.from("candidate-documents").remove(uploadedPaths);
    }

    return failCandidateSection(
      applicationId,
      "documents",
      "The files uploaded, but their records could not be saved. The batch was rolled back; please retry.",
    );
  }

  try {
    await saveImmigrationSectionProgress(applicationId, "documents", "in_progress");
  } catch {
    return failCandidateSection(
      applicationId,
      "documents",
      "Your documents were uploaded, but the section status could not be updated. Reload this page before continuing.",
    );
  }

  redirect(
    `/candidate/applications/${applicationId}?section=documents&saved=documents&uploaded=${files.length}`,
  );
}

export async function completeCandidateDocumentsSection(applicationId: string) {
  const { supabase } = await verifyCandidateApplication(applicationId);

  const { data: documents, error } = await supabase
    .from("application_documents")
    .select("id")
    .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "documents",
      "We could not verify your uploaded documents.",
    );
  }

  if (!documents?.length) {
    return failCandidateSection(
      applicationId,
      "documents",
      "Upload at least one supporting document before continuing to review.",
    );
  }

  await saveImmigrationSectionProgress(applicationId, "documents", "complete");
  redirect(`/candidate/applications/${applicationId}?section=review&saved=documents`);
}
function immigrationText(
  formData: FormData,
  key: string,
) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function immigrationBoolean(
  formData: FormData,
  key: string,
) {
  return formData.get(key) === "on";
}

async function verifyCandidateApplication(
  applicationId: string,
) {
  const context = await requireCandidate();
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("applications")
    .select("id, candidate_id, status")
    .eq("id", applicationId)
    .eq("candidate_id", context.user.id)
    .maybeSingle<{
      id: string;
      candidate_id: string;
      status: string;
    }>();

  if (error || !application) {
    throw new Error("Application not found.");
  }

  if (
    [
      "withdrawn",
      "rejected",
      "declined",
      "cancelled",
      "placed",
      "completed",
    ].includes(application.status)
  ) {
    throw new Error(
      "This application can no longer be edited.",
    );
  }

  return {
    context,
    supabase,
    application,
  };
}

async function saveImmigrationSectionProgress(
  applicationId: string,
  sectionKey: string,
  status: "in_progress" | "complete",
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("application_section_progress")
    .upsert(
      {
        application_id: applicationId,
        section_key: sectionKey,
        status,
        completed_at:
          status === "complete"
            ? new Date().toISOString()
            : null,
      },
      {
        onConflict: "application_id,section_key",
      },
    );

  if (error) {
    throw new Error(
      "Your information was saved, but section progress could not be updated.",
    );
  }
}

export async function saveCandidatePersonalInformation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const givenNames = immigrationText(
    formData,
    "given_names",
  );

  const familyName = immigrationText(
    formData,
    "family_name",
  );

  const dateOfBirth = immigrationText(
    formData,
    "date_of_birth",
  );

  const nationality = immigrationText(
    formData,
    "nationality",
  );

  const sex = immigrationText(formData, "sex");

  if (
    !givenNames ||
    !familyName ||
    !dateOfBirth ||
    !nationality ||
    !sex
  ) {
    throw new Error(
      "Please complete all required personal information.",
    );
  }

  const dependantsCountRaw = immigrationText(
    formData,
    "dependants_count",
  );

  const dependantsCount = dependantsCountRaw
    ? Number(dependantsCountRaw)
    : 0;

  if (
    !Number.isInteger(dependantsCount) ||
    dependantsCount < 0
  ) {
    throw new Error(
      "Dependants count must be a valid number.",
    );
  }

  const otherCitizenshipsRaw = immigrationText(
    formData,
    "other_citizenships",
  );

  const otherCitizenships = otherCitizenshipsRaw
    ? otherCitizenshipsRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase
    .from("application_immigration_profiles")
    .upsert(
      {
        application_id: applicationId,

        given_names: givenNames,
        family_name: familyName,

        other_names: immigrationText(
          formData,
          "other_names",
        ),

        previous_names: immigrationText(
          formData,
          "previous_names",
        ),

        sex,
        date_of_birth: dateOfBirth,

        place_of_birth: immigrationText(
          formData,
          "place_of_birth",
        ),

        country_of_birth: immigrationText(
          formData,
          "country_of_birth",
        ),

        nationality: nationality,

        other_citizenships: otherCitizenships,

        marital_status: immigrationText(
          formData,
          "marital_status",
        ),

        national_id_number: immigrationText(
          formData,
          "national_id_number",
        ),

        residence_country: immigrationText(
          formData,
          "residence_country",
        ),

        residence_status: immigrationText(
          formData,
          "residence_status",
        ),

        primary_phone: immigrationText(
          formData,
          "primary_phone",
        ),

        primary_email: immigrationText(
          formData,
          "primary_email",
        ),

        preferred_language: immigrationText(
          formData,
          "preferred_language",
        ),

        has_dependants: immigrationBoolean(
          formData,
          "has_dependants",
        ),

        dependants_count: dependantsCount,
      },
      {
        onConflict: "application_id",
      },
    );

  if (error) {
    throw new Error(
      "We could not save your personal information.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "personal",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=passport&saved=personal`,
  );
}

export async function saveCandidatePassportInformation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const passportNumber = immigrationText(
    formData,
    "passport_number",
  );

  const issueCountry = immigrationText(
    formData,
    "passport_issue_country",
  );

  const issueDate = immigrationText(
    formData,
    "passport_issue_date",
  );

  const expiryDate = immigrationText(
    formData,
    "passport_expiry_date",
  );

  if (
    !passportNumber ||
    !issueCountry ||
    !issueDate ||
    !expiryDate
  ) {
    throw new Error(
      "Please complete all required passport information.",
    );
  }

  const issue = new Date(issueDate);
  const expiry = new Date(expiryDate);

  if (
    Number.isNaN(issue.getTime()) ||
    Number.isNaN(expiry.getTime())
  ) {
    throw new Error(
      "Please provide valid passport dates.",
    );
  }

  if (expiry <= issue) {
    throw new Error(
      "Passport expiry date must be after the issue date.",
    );
  }

  const { error } = await supabase
    .from("application_immigration_profiles")
    .upsert(
      {
        application_id: applicationId,
        passport_number: passportNumber,
        passport_issue_country: issueCountry,
        passport_issue_date: issueDate,
        passport_expiry_date: expiryDate,
      },
      {
        onConflict: "application_id",
      },
    );

  if (error) {
    throw new Error(
      "We could not save your passport information.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "passport",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=addresses&saved=passport`,
  );
}
export async function addCandidateAddress(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const addressLine1 = immigrationText(
    formData,
    "address_line_1",
  );

  const city = immigrationText(formData, "city");
  const country = immigrationText(
    formData,
    "country",
  );

  const fromDate = immigrationText(
    formData,
    "from_date",
  );

  const toDate = immigrationText(
    formData,
    "to_date",
  );

  const isCurrent =
    formData.get("is_current") === "on";

  if (!addressLine1 || !city || !country || !fromDate) {
    throw new Error(
      "Please complete the required address information.",
    );
  }

  if (!isCurrent && !toDate) {
    throw new Error(
      "Previous addresses must include an end date.",
    );
  }

  if (toDate && new Date(toDate) < new Date(fromDate)) {
    throw new Error(
      "Address end date cannot be before the start date.",
    );
  }

  if (isCurrent) {
    const { error: currentAddressError } = await supabase
      .from("application_addresses")
      .update({
        is_current: false,
      })
      .eq("application_id", applicationId)
      .eq("is_current", true);

    if (currentAddressError) {
      throw new Error(
        "We could not update your current address record.",
      );
    }
  }

  const { error } = await supabase
    .from("application_addresses")
    .insert({
      application_id: applicationId,

      address_type:
        immigrationText(
          formData,
          "address_type",
        ) ?? "residential",

      address_line_1: addressLine1,

      address_line_2: immigrationText(
        formData,
        "address_line_2",
      ),

      city,

      state_province: immigrationText(
        formData,
        "state_province",
      ),

      postal_code: immigrationText(
        formData,
        "postal_code",
      ),

      country,

      from_date: fromDate,

      to_date: isCurrent ? null : toDate,

      is_current: isCurrent,
    });

  if (error) {
    throw new Error(
      "We could not save your address.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "addresses",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=addresses&saved=address`,
  );
}

export async function completeCandidateAddressSection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: addresses, error } = await supabase
    .from("application_addresses")
    .select("id, is_current")
    .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "addresses",
      "We could not verify your address history.",
    );
  }

  if (!addresses || addresses.length === 0) {
    return failCandidateSection(
      applicationId,
      "addresses",
      "Add at least one address before completing this section.",
    );
  }

  const hasCurrentAddress = addresses.some(
    (address) => address.is_current === true,
  );

  if (!hasCurrentAddress) {
    return failCandidateSection(
      applicationId,
      "addresses",
      "Please add your current residential address.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "addresses",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=family&saved=addresses`,
  );
}

export async function deleteCandidateAddress(
  applicationId: string,
  addressId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_addresses")
    .delete()
    .eq("id", addressId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that address.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "addresses",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=addresses`,
  );
}
function immigrationOptionalBoolean(
  formData: FormData,
  key: string,
) {
  const value = String(
    formData.get(key) ?? "",
  ).toLowerCase();

  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}

export async function addCandidateDependant(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const fullName = immigrationText(
    formData,
    "full_name",
  );

  const relationship = immigrationText(
    formData,
    "relationship",
  );

  if (!fullName || !relationship) {
    throw new Error(
      "Please provide the dependant's full name and relationship.",
    );
  }

  const dateOfBirth = immigrationText(
    formData,
    "date_of_birth",
  );

  if (
    dateOfBirth &&
    Number.isNaN(new Date(dateOfBirth).getTime())
  ) {
    throw new Error(
      "Please provide a valid dependant date of birth.",
    );
  }

  const { error } = await supabase
    .from("application_dependants")
    .insert({
      application_id: applicationId,

      full_name: fullName,
      relationship: relationship,

      date_of_birth: dateOfBirth,

      nationality: immigrationText(
        formData,
        "nationality",
      ),

      country_of_residence: immigrationText(
        formData,
        "country_of_residence",
      ),

      passport_number: immigrationText(
        formData,
        "passport_number",
      ),

      accompanying_applicant:
        formData.get("accompanying_applicant") ===
        "on",

      visa_required:
        immigrationOptionalBoolean(
          formData,
          "visa_required",
        ),
    });

  if (error) {
    throw new Error(
      "We could not save this dependant.",
    );
  }

  const { count } = await supabase
    .from("application_dependants")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("application_id", applicationId);

  await supabase
    .from("application_immigration_profiles")
    .upsert(
      {
        application_id: applicationId,
        has_dependants: true,
        dependants_count: count ?? 1,
      },
      {
        onConflict: "application_id",
      },
    );

  await saveImmigrationSectionProgress(
    applicationId,
    "family",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=family&saved=dependant`,
  );
}

export async function deleteCandidateDependant(
  applicationId: string,
  dependantId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_dependants")
    .delete()
    .eq("id", dependantId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that dependant.",
    );
  }

  const { count } = await supabase
    .from("application_dependants")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("application_id", applicationId);

  await supabase
    .from("application_immigration_profiles")
    .upsert(
      {
        application_id: applicationId,
        has_dependants: (count ?? 0) > 0,
        dependants_count: count ?? 0,
      },
      {
        onConflict: "application_id",
      },
    );

  await saveImmigrationSectionProgress(
    applicationId,
    "family",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=family`,
  );
}

export async function completeCandidateFamilySection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: immigrationProfile } =
    await supabase
      .from("application_immigration_profiles")
      .select(
        "has_dependants, dependants_count",
      )
      .eq("application_id", applicationId)
      .maybeSingle<{
        has_dependants: boolean | null;
        dependants_count: number | null;
      }>();

  const { count, error } = await supabase
    .from("application_dependants")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "family",
      "We could not verify your dependant records.",
    );
  }

  const recordedDependants = count ?? 0;

  if (
    immigrationProfile?.has_dependants ===
      true &&
    recordedDependants === 0
  ) {
    return failCandidateSection(
      applicationId,
      "family",
      "You indicated that you have dependants. Please add their information before continuing.",
    );
  }

  if (
    immigrationProfile?.dependants_count &&
    recordedDependants <
      immigrationProfile.dependants_count
  ) {
    return failCandidateSection(
      applicationId,
      "family",
      `You indicated ${immigrationProfile.dependants_count} dependant(s), but only ${recordedDependants} have been added.`,
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "family",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=education&saved=family`,
  );
}
export async function addCandidateEducation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const institutionName = immigrationText(
    formData,
    "institution_name",
  );

  if (!institutionName) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please provide the name of the school, college or institution.",
    );
  }

  const startDate = immigrationText(
    formData,
    "start_date",
  );

  const endDate = immigrationText(
    formData,
    "end_date",
  );

  const graduationDate = immigrationText(
    formData,
    "graduation_date",
  );

  if (!startDate) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please provide an education start date.",
    );
  }

  if (Number.isNaN(new Date(startDate).getTime())) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please provide a valid education start date.",
    );
  }

  if (
    endDate &&
    Number.isNaN(new Date(endDate).getTime())
  ) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please provide a valid education end date.",
    );
  }

  if (
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    return failCandidateSection(
      applicationId,
      "education",
      "Education end date cannot be before the start date.",
    );
  }

  if (
    graduationDate &&
    Number.isNaN(
      new Date(graduationDate).getTime(),
    )
  ) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please provide a valid graduation date.",
    );
  }

  const completed =
    formData.get("completed") === "on";

  const certificateAvailable =
    formData.get("certificate_available") ===
    "on";

  const { error } = await supabase
    .from("application_education_history")
    .insert({
      application_id: applicationId,

      institution_name: institutionName,

      country: immigrationText(
        formData,
        "country",
      ),

      qualification: immigrationText(
        formData,
        "qualification",
      ),

      field_of_study: immigrationText(
        formData,
        "field_of_study",
      ),

      start_date: startDate,

      end_date: endDate,

      completed,

      graduation_date:
        completed ? graduationDate : null,

      certificate_available:
        certificateAvailable,
    });

  if (error) {
    console.error("[candidate] education save failed", {
      application_id: applicationId,
      code: error.code ?? null,
      message: error.message ?? "unknown_error",
      details: error.details ?? null,
      hint: error.hint ?? null,
    });

    return failCandidateSection(
      applicationId,
      "education",
      "We could not save this education record. Please check the details and try again.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "education",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=education&saved=education`,
  );
}

export async function deleteCandidateEducation(
  applicationId: string,
  educationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_education_history")
    .delete()
    .eq("id", educationId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that education record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "education",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=education`,
  );
}

export async function completeCandidateEducationSection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: educationRecords, error } =
    await supabase
      .from("application_education_history")
      .select(
        `
        id,
        institution_name,
        start_date,
        end_date,
        completed
        `,
      )
      .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "education",
      "We could not verify your education history.",
    );
  }

  if (
    !educationRecords ||
    educationRecords.length === 0
  ) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please add at least one education record before continuing.",
    );
  }

  const invalidRecord =
    educationRecords.find(
      (record) =>
        !record.institution_name ||
        !record.start_date,
    );

  if (invalidRecord) {
    return failCandidateSection(
      applicationId,
      "education",
      "Please make sure each education record includes the institution and start date.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "education",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=employment&saved=education`,
  );
}
export async function addCandidateEmployment(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const employerName = immigrationText(
    formData,
    "employer_name",
  );

  const jobTitle = immigrationText(
    formData,
    "job_title",
  );

  const startDate = immigrationText(
    formData,
    "start_date",
  );

  const endDate = immigrationText(
    formData,
    "end_date",
  );

  const isCurrent =
    formData.get("is_current") === "on";

  if (!employerName || !jobTitle || !startDate) {
    throw new Error(
      "Please provide the employer name, job title and employment start date.",
    );
  }

  if (
    Number.isNaN(new Date(startDate).getTime())
  ) {
    throw new Error(
      "Please provide a valid employment start date.",
    );
  }

  if (
    endDate &&
    Number.isNaN(new Date(endDate).getTime())
  ) {
    throw new Error(
      "Please provide a valid employment end date.",
    );
  }

  if (
    !isCurrent &&
    endDate &&
    new Date(endDate) < new Date(startDate)
  ) {
    throw new Error(
      "Employment end date cannot be before the start date.",
    );
  }

  const { error } = await supabase
    .from("application_employment_history")
    .insert({
      application_id: applicationId,

      employer_name: employerName,
      job_title: jobTitle,

      country: immigrationText(
        formData,
        "country",
      ),

      city: immigrationText(
        formData,
        "city",
      ),

      start_date: startDate,

      end_date: isCurrent
        ? null
        : endDate,

      is_current: isCurrent,

      duties: immigrationText(
        formData,
        "duties",
      ),

      reason_for_leaving: isCurrent
        ? null
        : immigrationText(
            formData,
            "reason_for_leaving",
          ),

      supervisor_name: immigrationText(
        formData,
        "supervisor_name",
      ),

      supervisor_contact: immigrationText(
        formData,
        "supervisor_contact",
      ),

      reference_permission:
        formData.get("reference_permission") ===
        "on",
    });

  if (error) {
    throw new Error(
      "We could not save this employment record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "employment",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=employment&saved=employment`,
  );
}

export async function deleteCandidateEmployment(
  applicationId: string,
  employmentId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_employment_history")
    .delete()
    .eq("id", employmentId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that employment record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "employment",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=employment`,
  );
}

export async function completeCandidateEmploymentSection(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: employmentRecords, error } =
    await supabase
      .from("application_employment_history")
      .select(
        `
        id,
        employer_name,
        job_title,
        start_date,
        end_date,
        is_current
        `,
      )
      .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "employment",
      "We could not verify your employment history.",
    );
  }

  const records = employmentRecords ?? [];

  const noEmploymentHistory =
    formData.get("no_employment_history") ===
    "yes";

  if (
    records.length === 0 &&
    !noEmploymentHistory
  ) {
    return failCandidateSection(
      applicationId,
      "employment",
      "Please add your employment history, or confirm that you have no previous employment history.",
    );
  }

  const invalidRecord = records.find(
    (record) =>
      !record.employer_name ||
      !record.job_title ||
      !record.start_date ||
      (!record.is_current && !record.end_date),
  );

  if (invalidRecord) {
    return failCandidateSection(
      applicationId,
      "employment",
      "Please make sure every employment record contains the required dates and employment information.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "employment",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=languages&saved=employment`,
  );
}
export async function addCandidateLanguage(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const language = immigrationText(
    formData,
    "language",
  );

  if (!language) {
    throw new Error(
      "Please provide the language name.",
    );
  }

  const allowedLevels = [
    "Native",
    "Fluent",
    "Advanced",
    "Intermediate",
    "Basic",
    "None",
  ];

  const speakingLevel = immigrationText(
    formData,
    "speaking_level",
  );

  const readingLevel = immigrationText(
    formData,
    "reading_level",
  );

  const writingLevel = immigrationText(
    formData,
    "writing_level",
  );

  const listeningLevel = immigrationText(
    formData,
    "listening_level",
  );

  for (const level of [
    speakingLevel,
    readingLevel,
    writingLevel,
    listeningLevel,
  ]) {
    if (
      level &&
      !allowedLevels.includes(level)
    ) {
      throw new Error(
        "Please select a valid language proficiency level.",
      );
    }
  }

  const testDate = immigrationText(
    formData,
    "test_date",
  );

  if (
    testDate &&
    Number.isNaN(new Date(testDate).getTime())
  ) {
    throw new Error(
      "Please provide a valid language test date.",
    );
  }

  const { error } = await supabase
    .from("application_languages")
    .insert({
      application_id: applicationId,

      language,

      speaking_level: speakingLevel,
      reading_level: readingLevel,
      writing_level: writingLevel,
      listening_level: listeningLevel,

      test_name: immigrationText(
        formData,
        "test_name",
      ),

      test_score: immigrationText(
        formData,
        "test_score",
      ),

      test_date: testDate,
    });

  if (error) {
    throw new Error(
      "We could not save this language record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "languages",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=languages&saved=language`,
  );
}

export async function deleteCandidateLanguage(
  applicationId: string,
  languageId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_languages")
    .delete()
    .eq("id", languageId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that language record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "languages",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=languages`,
  );
}

export async function completeCandidateLanguagesSection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: languages, error } =
    await supabase
      .from("application_languages")
      .select(
        `
        id,
        language,
        speaking_level,
        reading_level,
        writing_level,
        listening_level
        `,
      )
      .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "languages",
      "We could not verify your language information.",
    );
  }

  if (!languages || languages.length === 0) {
    return failCandidateSection(
      applicationId,
      "languages",
      "Please add at least one language before continuing.",
    );
  }

  const incomplete = languages.find(
    (record) =>
      !record.language ||
      !record.speaking_level ||
      !record.reading_level ||
      !record.writing_level ||
      !record.listening_level,
  );

  if (incomplete) {
    return failCandidateSection(
      applicationId,
      "languages",
      "Please provide speaking, reading, writing and listening levels for each language.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "languages",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=licenses&saved=languages`,
  );
}
export async function addCandidateProfessionalLicense(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const licenseName = immigrationText(
    formData,
    "license_name",
  );

  if (!licenseName) {
    throw new Error(
      "Please provide the licence or certification name.",
    );
  }

  const issueDate = immigrationText(
    formData,
    "issue_date",
  );

  const expiryDate = immigrationText(
    formData,
    "expiry_date",
  );

  if (
    issueDate &&
    Number.isNaN(new Date(issueDate).getTime())
  ) {
    throw new Error(
      "Please provide a valid issue date.",
    );
  }

  if (
    expiryDate &&
    Number.isNaN(new Date(expiryDate).getTime())
  ) {
    throw new Error(
      "Please provide a valid expiry date.",
    );
  }

  if (
    issueDate &&
    expiryDate &&
    new Date(expiryDate) <
      new Date(issueDate)
  ) {
    throw new Error(
      "The expiry date cannot be before the issue date.",
    );
  }

  const { error } = await supabase
    .from("application_professional_licenses")
    .insert({
      application_id: applicationId,

      license_name: licenseName,

      issuing_authority: immigrationText(
        formData,
        "issuing_authority",
      ),

      license_number: immigrationText(
        formData,
        "license_number",
      ),

      country: immigrationText(
        formData,
        "country",
      ),

      issue_date: issueDate,

      expiry_date: expiryDate,
    });

  if (error) {
    throw new Error(
      "We could not save this professional licence or certification.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "licenses",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=licenses&saved=license`,
  );
}

export async function deleteCandidateProfessionalLicense(
  applicationId: string,
  licenseId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_professional_licenses")
    .delete()
    .eq("id", licenseId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that professional licence or certification.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "licenses",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=licenses`,
  );
}

export async function completeCandidateLicensesSection(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: licenses, error } =
    await supabase
      .from("application_professional_licenses")
      .select(
        `
        id,
        license_name,
        issuing_authority,
        license_number,
        country,
        issue_date,
        expiry_date
        `,
      )
      .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "licenses",
      "We could not verify your professional licence information.",
    );
  }

  const records = licenses ?? [];

  const noProfessionalLicenses =
    formData.get("no_professional_licenses") ===
    "yes";

  if (
    records.length === 0 &&
    !noProfessionalLicenses
  ) {
    return failCandidateSection(
      applicationId,
      "licenses",
      "Please add your professional licences or certifications, or confirm that you do not have any to declare.",
    );
  }

  const invalidRecord = records.find(
    (record) => !record.license_name,
  );

  if (invalidRecord) {
    return failCandidateSection(
      applicationId,
      "licenses",
      "Please make sure every professional licence or certification has a name.",
    );
  }

  for (const record of records) {
    if (
      record.issue_date &&
      record.expiry_date &&
      new Date(record.expiry_date) <
        new Date(record.issue_date)
    ) {
      return failCandidateSection(
      applicationId,
      "licenses",
      "One of your professional licence records has an expiry date before its issue date.",
    );
    }
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "licenses",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=travel&saved=licenses`,
  );
}
export async function addCandidateTravelHistory(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const country = immigrationText(
    formData,
    "country",
  );

  const purpose = immigrationText(
    formData,
    "purpose",
  );

  const arrivalDate = immigrationText(
    formData,
    "arrival_date",
  );

  const departureDate = immigrationText(
    formData,
    "departure_date",
  );

  const visaType = immigrationText(
    formData,
    "visa_type",
  );

  if (!country) {
    throw new Error(
      "Please provide the country you visited.",
    );
  }

  if (!arrivalDate) {
    throw new Error(
      "Please provide the date you entered the country.",
    );
  }

  const arrival = new Date(arrivalDate);

  if (Number.isNaN(arrival.getTime())) {
    throw new Error(
      "Please provide a valid arrival date.",
    );
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (arrival > today) {
    throw new Error(
      "Travel history cannot have a future arrival date.",
    );
  }

  if (departureDate) {
    const departure =
      new Date(departureDate);

    if (
      Number.isNaN(
        departure.getTime(),
      )
    ) {
      throw new Error(
        "Please provide a valid departure date.",
      );
    }

    if (departure < arrival) {
      throw new Error(
        "Departure date cannot be before the arrival date.",
      );
    }

    if (departure > today) {
      throw new Error(
        "Travel history cannot have a future departure date.",
      );
    }
  }

  const { error } = await supabase
    .from("application_travel_history")
    .insert({
      application_id: applicationId,

      country,

      purpose,

      arrival_date: arrivalDate,

      departure_date: departureDate,

      visa_type: visaType,
    });

  if (error) {
    throw new Error(
      "We could not save this travel history record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "travel",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=travel&saved=travel`,
  );
}

export async function deleteCandidateTravelHistory(
  applicationId: string,
  travelId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_travel_history")
    .delete()
    .eq("id", travelId)
    .eq(
      "application_id",
      applicationId,
    );

  if (error) {
    throw new Error(
      "We could not remove that travel history record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "travel",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=travel`,
  );
}

export async function completeCandidateTravelSection(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: travelRecords, error } =
    await supabase
      .from(
        "application_travel_history",
      )
      .select(
        `
        id,
        country,
        purpose,
        arrival_date,
        departure_date,
        visa_type
        `,
      )
      .eq(
        "application_id",
        applicationId,
      );

  if (error) {
    return failCandidateSection(
      applicationId,
      "travel",
      "We could not verify your travel history.",
    );
  }

  const records =
    travelRecords ?? [];

  const noTravelHistory =
    formData.get(
      "no_travel_history",
    ) === "yes";

  if (
    records.length === 0 &&
    !noTravelHistory
  ) {
    return failCandidateSection(
      applicationId,
      "travel",
      "Please add your previous international travel, or confirm that you have no international travel history.",
    );
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (const record of records) {
    if (
      !record.country ||
      !record.arrival_date
    ) {
      return failCandidateSection(
      applicationId,
      "travel",
      "Each travel record must include the country and arrival date.",
    );
    }

    const arrival = new Date(
      record.arrival_date,
    );

    if (
      Number.isNaN(
        arrival.getTime(),
      )
    ) {
      return failCandidateSection(
      applicationId,
      "travel",
      "One of your travel records has an invalid arrival date.",
    );
    }

    if (arrival > today) {
      return failCandidateSection(
      applicationId,
      "travel",
      "One of your travel records contains a future arrival date.",
    );
    }

    if (record.departure_date) {
      const departure = new Date(
        record.departure_date,
      );

      if (
        Number.isNaN(
          departure.getTime(),
        )
      ) {
        return failCandidateSection(
      applicationId,
      "travel",
      "One of your travel records has an invalid departure date.",
    );
      }

      if (departure < arrival) {
        return failCandidateSection(
      applicationId,
      "travel",
      "One of your travel records has a departure date before its arrival date.",
    );
      }

      if (departure > today) {
        return failCandidateSection(
      applicationId,
      "travel",
      "One of your travel records contains a future departure date.",
    );
      }
    }
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "travel",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=visas&saved=travel`,
  );
}
export async function addCandidateVisaHistory(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const country = immigrationText(
    formData,
    "country",
  );

  const visaType = immigrationText(
    formData,
    "visa_type",
  );

  const applicationDate = immigrationText(
    formData,
    "application_date",
  );

  const decision = immigrationText(
    formData,
    "decision",
  );

  const decisionDate = immigrationText(
    formData,
    "decision_date",
  );

  const visaNumber = immigrationText(
    formData,
    "visa_number",
  );

  const validFrom = immigrationText(
    formData,
    "valid_from",
  );

  const validUntil = immigrationText(
    formData,
    "valid_until",
  );

  const refusalReason = immigrationText(
    formData,
    "refusal_reason",
  );

  if (!country) {
    throw new Error(
      "Please provide the country for this visa application.",
    );
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (applicationDate) {
    const application =
      new Date(applicationDate);

    if (
      Number.isNaN(
        application.getTime(),
      )
    ) {
      throw new Error(
        "Please provide a valid visa application date.",
      );
    }

    if (application > today) {
      throw new Error(
        "Visa history cannot contain a future application date.",
      );
    }
  }

  if (decisionDate) {
    const decisionDateValue =
      new Date(decisionDate);

    if (
      Number.isNaN(
        decisionDateValue.getTime(),
      )
    ) {
      throw new Error(
        "Please provide a valid visa decision date.",
      );
    }

    if (decisionDateValue > today) {
      throw new Error(
        "Visa history cannot contain a future decision date.",
      );
    }

    if (
      applicationDate &&
      decisionDateValue <
        new Date(applicationDate)
    ) {
      throw new Error(
        "Visa decision date cannot be before the application date.",
      );
    }
  }

  if (validFrom) {
    const from = new Date(validFrom);

    if (
      Number.isNaN(from.getTime())
    ) {
      throw new Error(
        "Please provide a valid visa start date.",
      );
    }
  }

  if (validUntil) {
    const until =
      new Date(validUntil);

    if (
      Number.isNaN(until.getTime())
    ) {
      throw new Error(
        "Please provide a valid visa expiry date.",
      );
    }
  }

  if (
    validFrom &&
    validUntil &&
    new Date(validUntil) <
      new Date(validFrom)
  ) {
    throw new Error(
      "Visa expiry date cannot be before the visa start date.",
    );
  }

  if (
    decision?.toLowerCase() ===
      "refused" &&
    !refusalReason
  ) {
    throw new Error(
      "Please provide the reason for the visa refusal.",
    );
  }

  const { error } = await supabase
    .from("application_visa_history")
    .insert({
      application_id: applicationId,
      country,
      visa_type: visaType,
      application_date: applicationDate,
      decision,
      decision_date: decisionDate,
      visa_number: visaNumber,
      valid_from: validFrom,
      valid_until: validUntil,
      refusal_reason:
        decision?.toLowerCase() ===
        "refused"
          ? refusalReason
          : null,
    });

  if (error) {
    throw new Error(
      "We could not save this visa history record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "visas",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=visas&saved=visa`,
  );
}

export async function deleteCandidateVisaHistory(
  applicationId: string,
  visaId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_visa_history")
    .delete()
    .eq("id", visaId)
    .eq(
      "application_id",
      applicationId,
    );

  if (error) {
    throw new Error(
      "We could not remove that visa history record.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "visas",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=visas`,
  );
}

export async function completeCandidateVisaSection(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: visaRecords, error } =
    await supabase
      .from("application_visa_history")
      .select(
        `
        id,
        country,
        visa_type,
        application_date,
        decision,
        decision_date,
        visa_number,
        valid_from,
        valid_until,
        refusal_reason
        `,
      )
      .eq(
        "application_id",
        applicationId,
      );

  if (error) {
    return failCandidateSection(
      applicationId,
      "visas",
      "We could not verify your visa history.",
    );
  }

  const records =
    visaRecords ?? [];

  const noVisaHistory =
    formData.get(
      "no_visa_history",
    ) === "yes";

  if (
    records.length === 0 &&
    !noVisaHistory
  ) {
    return failCandidateSection(
      applicationId,
      "visas",
      "Please add your previous visa history, or confirm that you have no visa history to declare.",
    );
  }

  for (const record of records) {
    if (!record.country) {
      return failCandidateSection(
      applicationId,
      "visas",
      "Every visa history record must include a country.",
    );
    }

    if (
      record.decision?.toLowerCase() ===
        "refused" &&
      !record.refusal_reason
    ) {
      return failCandidateSection(
      applicationId,
      "visas",
      "A refusal reason is required for every refused visa application.",
    );
    }

    if (
      record.application_date &&
      record.decision_date &&
      new Date(
        record.decision_date,
      ) <
        new Date(
          record.application_date,
        )
    ) {
      return failCandidateSection(
      applicationId,
      "visas",
      "One visa record has a decision date before its application date.",
    );
    }

    if (
      record.valid_from &&
      record.valid_until &&
      new Date(
        record.valid_until,
      ) <
        new Date(
          record.valid_from,
        )
    ) {
      return failCandidateSection(
      applicationId,
      "visas",
      "One visa record has an expiry date before its valid-from date.",
    );
    }
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "visas",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=emergency&saved=visas`,
  );
}

export async function addCandidateEmergencyContact(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const fullName = immigrationText(
    formData,
    "full_name",
  );

  const phone = immigrationText(
    formData,
    "phone",
  );

  const email = immigrationText(
    formData,
    "email",
  );

  if (!fullName) {
    throw new Error(
      "Please provide the emergency contact's full name.",
    );
  }

  if (!phone) {
    throw new Error(
      "Please provide the emergency contact's phone number.",
    );
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error(
      "Please provide a valid emergency contact email address.",
    );
  }

  const { error } = await supabase
    .from("application_emergency_contacts")
    .insert({
      application_id: applicationId,
      full_name: fullName,
      relationship: immigrationText(
        formData,
        "relationship",
      ),
      phone,
      alternate_phone: immigrationText(
        formData,
        "alternate_phone",
      ),
      email,
      city: immigrationText(
        formData,
        "city",
      ),
      country: immigrationText(
        formData,
        "country",
      ),
    });

  if (error) {
    throw new Error(
      "We could not save this emergency contact.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "emergency",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=emergency&saved=emergency-contact`,
  );
}

export async function deleteCandidateEmergencyContact(
  applicationId: string,
  contactId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(
      "We could not remove that emergency contact.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "emergency",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=emergency`,
  );
}

export async function completeCandidateEmergencySection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: contacts, error } =
    await supabase
      .from("application_emergency_contacts")
      .select(
        `
        id,
        full_name,
        phone
        `,
      )
      .eq("application_id", applicationId);

  if (error) {
    return failCandidateSection(
      applicationId,
      "emergency",
      "We could not verify your emergency contact information.",
    );
  }

  if (!contacts || contacts.length === 0) {
    return failCandidateSection(
      applicationId,
      "emergency",
      "Please add at least one emergency contact before continuing.",
    );
  }

  const incompleteContact = contacts.find(
    (contact) =>
      !contact.full_name || !contact.phone,
  );

  if (incompleteContact) {
    return failCandidateSection(
      applicationId,
      "emergency",
      "Every emergency contact must include a full name and phone number.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "emergency",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=references&saved=emergency`,
  );
}

export async function addCandidateReference(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const fullName = immigrationText(
    formData,
    "full_name",
  );

  const email = immigrationText(
    formData,
    "email",
  );

  const phone = immigrationText(
    formData,
    "phone",
  );

  const canContact =
    formData.get("can_contact") === "on";

  if (!fullName) {
    throw new Error(
      "Please provide the reference person's full name.",
    );
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error(
      "Please provide a valid reference email address.",
    );
  }

  if (
    canContact &&
    !phone &&
     !email
  ) {
    throw new Error(
      "Please provide a phone number or email if you allow this reference to be contacted.",
    );
  }

  const { error } = await supabase
    .from("application_references")
    .insert({
      application_id: applicationId,
      full_name: fullName,
      relationship: immigrationText(
        formData,
        "relationship",
      ),
      organisation: immigrationText(
        formData,
        "organisation",
      ),
      job_title: immigrationText(
        formData,
        "job_title",
      ),
      phone,
      email,
      country: immigrationText(
        formData,
        "country",
      ),
      can_contact: canContact,
    });

  if (error) {
    throw new Error(
      "We could not save this reference.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "references",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=references&saved=reference`,
  );
}

export async function deleteCandidateReference(
  applicationId: string,
  referenceId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { error } = await supabase
    .from("application_references")
    .delete()
    .eq("id", referenceId)
    .eq(
      "application_id",
      applicationId,
    );

  if (error) {
    throw new Error(
      "We could not remove that reference.",
   );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "references",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=references`,
  );
}

export async function completeCandidateReferencesSection(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: references, error } =
    await supabase
      .from("application_references")
      .select(
        `
        id,
        full_name,
        phone,
        email,
        can_contact
        `,
      )
      .eq(
        "application_id",
        applicationId,
      );

  if (error) {
    return failCandidateSection(
      applicationId,
      "references",
      "We could not verify your reference information.",
    );
  }

  const records = references ?? [];

  const noReferences =
    formData.get("no_references") === "yes";

  if (
    records.length === 0 &&
    !noReferences
  ) {
    return failCandidateSection(
      applicationId,
      "references",
      "Please add at least one reference, or confirm that you have no references to declare.",
    );
  }

  const incomplete = records.find(
    (reference) =>
      !reference.full_name ||
      (
        reference.can_contact &&
        !reference.phone &&
        !reference.email
      ),
  );

  if (incomplete) {
    return failCandidateSection(
      applicationId,
      "references",
      "Please make sure every reference has a full name and a contact method where contact permission is granted.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "references",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=finances&saved=references`,
  );
}

export async function saveCandidateFinancialInformation(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const fundingSource = immigrationText(
    formData,
    "funding_source",
  );

  const currency =
    immigrationText(formData, "currency") ?? "KES";

  const availableFundsText = immigrationText(
    formData,
    "available_funds",
  );

  const monthlyIncomeText = immigrationText(
    formData,
    "monthly_income",
  );

  const availableFunds =
    availableFundsText === null
      ? null
      : Number(availableFundsText);

  const monthlyIncome =
    monthlyIncomeText === null
      ? null
      : Number(monthlyIncomeText);

  // Matches Postgres numeric(14,2): 12 integer digits and 2 decimal places.
  const maxFinancialAmount = 999_999_999_999.99;

  if (
    availableFunds !== null &&
    (!Number.isFinite(availableFunds) ||
      availableFunds < 0 ||
      availableFunds > maxFinancialAmount)
  ) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Please provide a valid available-funds amount below 1 trillion.",
    );
  }

  if (
    monthlyIncome !== null &&
    (!Number.isFinite(monthlyIncome) ||
      monthlyIncome < 0 ||
      monthlyIncome > maxFinancialAmount)
  ) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Please provide a valid monthly-income amount below 1 trillion.",
    );
  }

  const employerSponsorshipExpected =
    formData.get("employer_sponsorship_expected") ===
    "on";

  const { error } = await supabase
    .from("application_financial_information")
    .upsert(
      {
        application_id: applicationId,
        funding_source: fundingSource,
        sponsor_name: immigrationText(
          formData,
          "sponsor_name",
        ),
        sponsor_relationship: immigrationText(
          formData,
          "sponsor_relationship",
        ),
        currency,
        available_funds: availableFunds,
        monthly_income: monthlyIncome,
        proof_of_funds_available:
          formData.get("proof_of_funds_available") ===
          "on",
        employer_sponsorship_expected:
          employerSponsorshipExpected,
        employer_covers_visa:
          employerSponsorshipExpected &&
          formData.get("employer_covers_visa") === "on",
        employer_covers_flight:
          employerSponsorshipExpected &&
          formData.get("employer_covers_flight") === "on",
        employer_covers_accommodation:
          employerSponsorshipExpected &&
          formData.get("employer_covers_accommodation") ===
            "on",
        employer_covers_medical:
          employerSponsorshipExpected &&
          formData.get("employer_covers_medical") === "on",
        financial_notes: immigrationText(
          formData,
          "financial_notes",
        ),
      },
      {
        onConflict: "application_id",
      },
    );

  if (error) {
    console.error("[candidate] finance save failed", {
      application_id: applicationId,
      code: error.code ?? null,
      message: error.message ?? "unknown_error",
      details: error.details ?? null,
      hint: error.hint ?? null,
    });

    return failCandidateSection(
      applicationId,
      "finances",
      "We could not save your financial information. Check the amounts and try again.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "finances",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=finances&saved=finances`,
  );
}

export async function completeCandidateFinancesSection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: financialInformation, error } =
    await supabase
      .from("application_financial_information")
      .select(
        `
        application_id,
        funding_source,
        currency,
        available_funds,
        monthly_income,
        employer_sponsorship_expected
        `,
      )
      .eq("application_id", applicationId)
      .maybeSingle();

  if (error) {
    return failCandidateSection(
      applicationId,
      "finances",
      "We could not verify your financial information.",
    );
  }

  if (!financialInformation) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Please save your financial information before continuing.",
    );
  }

  if (!financialInformation.funding_source) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Please select or provide your primary funding source before continuing.",
    );
  }

  if (
    financialInformation.available_funds !== null &&
    Number(financialInformation.available_funds) < 0
  ) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Available funds cannot be negative.",
    );
  }

  if (
    financialInformation.monthly_income !== null &&
    Number(financialInformation.monthly_income) < 0
  ) {
    return failCandidateSection(
      applicationId,
      "finances",
      "Monthly income cannot be negative.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "finances",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=declarations&saved=finances`,
  );
}

export async function saveCandidateImmigrationDeclarations(
  applicationId: string,
  formData: FormData,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const previousVisaRefusal =
    formData.get("previous_visa_refusal") === "on";
  const previousOverstay =
    formData.get("previous_overstay") === "on";
  const previousDeportation =
    formData.get("previous_deportation_or_removal") === "on";
  const immigrationViolation =
    formData.get("immigration_violation") === "on";
  const criminalChargeOrConviction =
    formData.get("criminal_charge_or_conviction") === "on";
  const militaryService =
    formData.get("military_service") === "on";
  const governmentService =
    formData.get("government_service") === "on";
  const medicalDisclosureRequired =
    formData.get("medical_disclosure_required") === "on";

  const previousVisaRefusalDetails =
    immigrationText(formData, "previous_visa_refusal_details");
  const previousOverstayDetails =
    immigrationText(formData, "previous_overstay_details");
  const previousDeportationDetails =
    immigrationText(formData, "previous_deportation_details");
  const immigrationViolationDetails =
    immigrationText(formData, "immigration_violation_details");
  const criminalDetails =
    immigrationText(formData, "criminal_details");
  const militaryServiceDetails =
    immigrationText(formData, "military_service_details");
  const governmentServiceDetails =
    immigrationText(formData, "government_service_details");
  const medicalDisclosureDetails =
    immigrationText(formData, "medical_disclosure_details");

  const requiredDetails = [
    [previousVisaRefusal, previousVisaRefusalDetails, "previous visa refusal"],
    [previousOverstay, previousOverstayDetails, "previous overstay"],
    [previousDeportation, previousDeportationDetails, "deportation or removal"],
    [immigrationViolation, immigrationViolationDetails, "immigration violation"],
    [criminalChargeOrConviction, criminalDetails, "criminal charge or conviction"],
    [militaryService, militaryServiceDetails, "military service"],
    [governmentService, governmentServiceDetails, "government service"],
    [medicalDisclosureRequired, medicalDisclosureDetails, "medical disclosure"],
  ] as const;

  const missingDetails = requiredDetails.find(
    ([selected, details]) => selected && !details,
  );

  if (missingDetails) {
    throw new Error(
      `Please provide details for ${missingDetails[2]}.`,
    );
  }

  const { error } = await supabase
    .from("application_immigration_declarations")
    .upsert(
      {
        application_id: applicationId,
        previous_visa_refusal: previousVisaRefusal,
        previous_visa_refusal_details: previousVisaRefusalDetails,
        previous_overstay: previousOverstay,
        previous_overstay_details: previousOverstayDetails,
        previous_deportation_or_removal: previousDeportation,
        previous_deportation_details: previousDeportationDetails,
        immigration_violation: immigrationViolation,
        immigration_violation_details: immigrationViolationDetails,
        criminal_charge_or_conviction: criminalChargeOrConviction,
        criminal_details: criminalDetails,
        military_service: militaryService,
        military_service_details: militaryServiceDetails,
        government_service: governmentService,
        government_service_details: governmentServiceDetails,
        medical_disclosure_required: medicalDisclosureRequired,
        medical_disclosure_details: medicalDisclosureDetails,
        consent_to_data_processing:
          formData.get("consent_to_data_processing") === "on",
        consent_to_employer_sharing:
          formData.get("consent_to_employer_sharing") === "on",
        consent_to_authority_sharing:
          formData.get("consent_to_authority_sharing") === "on",
        certify_true_and_complete:
          formData.get("certify_true_and_complete") === "on",
        declaration_signed_name:
          immigrationText(formData, "declaration_signed_name"),
        declaration_signed_at:
          immigrationText(formData, "declaration_signed_name")
            ? new Date().toISOString()
            : null,
      },
      {
        onConflict: "application_id",
      },
    );

  if (error) {
    throw new Error(
      "We could not save your immigration declarations.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "declarations",
    "in_progress",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=declarations&saved=declarations`,
  );
}

export async function completeCandidateDeclarationsSection(
  applicationId: string,
) {
  const { supabase } =
    await verifyCandidateApplication(applicationId);

  const { data: declaration, error } = await supabase
    .from("application_immigration_declarations")
    .select(`
      application_id,
      consent_to_data_processing,
      certify_true_and_complete,
      declaration_signed_name
    `)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (error) {
    return failCandidateSection(
      applicationId,
      "declarations",
      "We could not verify your immigration declarations.",
    );
  }

  if (!declaration) {
    return failCandidateSection(
      applicationId,
      "declarations",
      "Please save your declarations before continuing.",
    );
  }

  if (!declaration.consent_to_data_processing) {
    return failCandidateSection(
      applicationId,
      "declarations",
      "You must confirm consent to process the information required for this application.",
    );
  }

  if (!declaration.certify_true_and_complete) {
    return failCandidateSection(
      applicationId,
      "declarations",
      "You must certify that the information provided is true and complete.",
    );
  }

  if (!declaration.declaration_signed_name) {
    return failCandidateSection(
      applicationId,
      "declarations",
      "Please enter your full legal name to sign the declaration.",
    );
  }

  await saveImmigrationSectionProgress(
    applicationId,
    "declarations",
    "complete",
  );

  redirect(
    `/candidate/applications/${applicationId}?section=documents&saved=declarations`,
  );
}

