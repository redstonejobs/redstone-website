"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { BULK_JOB_LIMIT, bulkJobCheckboxValue, bulkJobFieldValue } from "@/lib/admin/bulk-jobs";
import { JOB_OCCUPATIONS } from "@/lib/jobs/catalogue";
import { slugify } from "@/lib/public/countries";
import { logAuditEvent } from "./audit";
import {
  hasCapability,
  canChangeApplicationStatus,
  canManageEmployer,
  canManageStaff,
  canReviewDocuments,
  requireAdmin,
  requireStaff,
  requireSuperAdmin,
} from "./auth";
import { adminWarn } from "./logger";
import { sendStaffWelcomeNotification } from "@/lib/admin/staff-notifications";
import {
  assertValid,
  validateEmployerPayload,
  validateEmployerTransition,
  validateJobForPublication,
  validateJobPayload,
  validateStaffRole,
} from "./validation";
import {
  cancelGlobalJobMatrixRun,
  createGlobalJobMatrixRun,
  processGlobalJobMatrixBatch,
} from "./global-job-matrix";
import { canOverrideApplicationTransition, canTransitionApplicationStatus, isApplicationStatus } from "./workflow";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function optionalNumber(formData: FormData, key: string) {
  const raw = value(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} must be zero or greater.`);
  }

  return parsed;
}

function optionalInteger(formData: FormData, key: string) {
  const raw = value(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${key} must be a whole number zero or greater.`);
  }

  return parsed;
}

function requiredPositiveInteger(formData: FormData, key: string) {
  const parsed = Number(value(formData, key));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be greater than zero.`);
  }

  return parsed;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function selected(formData: FormData, key: string, fallback = "") {
  return value(formData, key) || fallback || null;
}

function requireConfirmation(formData: FormData) {
  if (formData.get("confirm") !== "yes") {
    throw new Error("Confirmation is required.");
  }
}

function requireSelectedJobIds(formData: FormData) {
  const ids = formData
    .getAll("job_id")
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  if (ids.length === 0) {
    throw new Error("Select at least one job.");
  }

  return ids;
}

function uuidValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw || null;
}

function jobPayload(formData: FormData, creatorId?: string) {
  const title = value(formData, "title");
  const slug = value(formData, "slug");
  const applicationDeadline = value(formData, "application_deadline");
  const status = value(formData, "status") || "draft";

  const payload: Record<string, unknown> = {
    title,
    slug,
    employer_id: value(formData, "employer_id") || null,
    country: value(formData, "country") || null,
    city: value(formData, "city") || null,
    category: value(formData, "category") || null,
    job_type: value(formData, "job_type") || null,
    skill_level: value(formData, "skill_level") || null,
    short_description: value(formData, "short_description") || null,
    description: value(formData, "description") || null,
    responsibilities: value(formData, "responsibilities") || null,
    requirements: value(formData, "requirements") || null,
    experience_requirements: value(formData, "experience_requirements") || null,
    education_requirements: value(formData, "education_requirements") || null,
    language_requirements: value(formData, "language_requirements") || null,
    physical_requirements: value(formData, "physical_requirements") || null,
    additional_requirements: value(formData, "additional_requirements") || null,
    salary_min: optionalNumber(formData, "salary_min"),
    salary_max: optionalNumber(formData, "salary_max"),
    currency: value(formData, "currency") || null,
    salary_period: selected(formData, "salary_period"),
    salary_confirmed: checkbox(formData, "salary_confirmed"),
    salary_note: value(formData, "salary_note") || null,
    contract_type: selected(formData, "contract_type"),
    contract_duration_value: optionalInteger(formData, "contract_duration_value"),
    contract_duration_unit: selected(formData, "contract_duration_unit"),
    contract_note: value(formData, "contract_note") || null,
    working_hours_per_week: optionalNumber(formData, "working_hours_per_week"),
    work_schedule: value(formData, "work_schedule") || null,
    overtime_note: value(formData, "overtime_note") || null,
    vacancies: requiredPositiveInteger(formData, "vacancies"),
    application_deadline: applicationDeadline || null,
    visa_sponsorship: checkbox(formData, "visa_sponsorship"),
    accommodation: checkbox(formData, "accommodation"),
    transport: checkbox(formData, "transport"),
    meals: checkbox(formData, "meals"),
    sponsorship_status: selected(formData, "sponsorship_status", "not_confirmed"),
    accommodation_status: selected(formData, "accommodation_status", "not_confirmed"),
    meals_status: selected(formData, "meals_status", "not_confirmed"),
    transport_status: selected(formData, "transport_status", "not_confirmed"),
    medical_insurance_status: selected(formData, "medical_insurance_status", "not_confirmed"),
    air_ticket_status: selected(formData, "air_ticket_status", "not_confirmed"),
    training_status: selected(formData, "training_status", "not_confirmed"),
    annual_leave_note: value(formData, "annual_leave_note") || null,
    other_benefits: value(formData, "other_benefits") || null,
    country_fee_override: optionalNumber(formData, "country_fee_override"),
    country_fee_override_currency: value(formData, "country_fee_override_currency") || null,
    country_fee_override_note: value(formData, "country_fee_override_note") || null,
    fee_relationship: selected(formData, "fee_relationship", "not_confirmed"),
    processing_time_min: optionalInteger(formData, "processing_time_min"),
    processing_time_max: optionalInteger(formData, "processing_time_max"),
    processing_time_unit: selected(formData, "processing_time_unit"),
    processing_time_note: value(formData, "processing_time_note") || null,
    status,
  };

  if (creatorId) {
    payload.created_by = creatorId;
  }

  if (status === "published") {
    assertValid(validateJobForPublication(payload));
    payload.published_at = new Date().toISOString();
  }

  return assertValid(validateJobPayload(payload));
}

function documentRequirementsPayload(formData: FormData, jobId: string) {
  const raw = value(formData, "document_requirements");
  return documentRequirementsRowsFromText(raw, jobId);
}

function documentRequirementsRowsFromText(raw: string, jobId: string) {
  return raw
    .split(/\r?\n/)
    .map((line, index) => {
      const [documentType, required = "required", fee = "fee", responsibility = "candidate", ...notes] = line
        .split("|")
        .map((part) => part.trim());

      if (!documentType) return null;

      return {
        job_id: jobId,
        document_type: documentType,
        required: required !== "optional",
        fee_applicable: fee !== "no_fee",
        candidate_can_provide_existing: true,
        cost_responsibility: responsibility || "candidate",
        notes: notes.join(" | ") || null,
        sort_order: (index + 1) * 10,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function replaceJobDocumentRequirements(jobId: string, formData: FormData) {
  const supabase = await createClient();
  const rows = documentRequirementsPayload(formData, jobId);
  const { error: deleteError } = await supabase.from("job_document_requirements").delete().eq("job_id", jobId);

  if (deleteError) {
    throw new Error("Unable to update job document requirements.");
  }

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("job_document_requirements").insert(rows);

  if (error) {
    throw new Error("Unable to save job document requirements.");
  }
}

async function insertJobDocumentRequirementRows(rows: ReturnType<typeof documentRequirementsRowsFromText>) {
  if (rows.length === 0) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("job_document_requirements").insert(rows);

  if (error) {
    throw new Error("Unable to save job document requirements.");
  }
}

function optionalBulkNumber(formData: FormData, draftKey: string, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const raw = bulkJobFieldValue(formData, draftKey, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${occupation.name}: ${key} must be zero or greater.`);
  }

  return parsed;
}

function optionalBulkInteger(formData: FormData, draftKey: string, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const raw = bulkJobFieldValue(formData, draftKey, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${occupation.name}: ${key} must be a whole number zero or greater.`);
  }

  return parsed;
}

function requiredBulkPositiveInteger(formData: FormData, draftKey: string, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const parsed = Number(bulkJobFieldValue(formData, draftKey, key));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${occupation.name}: ${key} must be greater than zero.`);
  }

  return parsed;
}

function bulkJobPayload({
  formData,
  draftKey,
  occupation,
  creatorId,
  sequence,
  nonce,
}: {
  formData: FormData;
  draftKey: string;
  occupation: (typeof JOB_OCCUPATIONS)[number];
  creatorId: string;
  sequence: number;
  nonce: number;
}) {
  const country = bulkJobFieldValue(formData, draftKey, "country");
  const employerId = bulkJobFieldValue(formData, draftKey, "employer_id");
  const title = bulkJobFieldValue(formData, draftKey, "title") || occupation.name;
  const city = bulkJobFieldValue(formData, draftKey, "city");
  const deadline = bulkJobFieldValue(formData, draftKey, "application_deadline");
  const salaryTbd = bulkJobCheckboxValue(formData, draftKey, "salary_tbd");
  const salaryMin = optionalBulkNumber(formData, draftKey, occupation, "salary_min");
  const salaryMax = optionalBulkNumber(formData, draftKey, occupation, "salary_max");
  const currency = bulkJobFieldValue(formData, draftKey, "currency");
  const salaryConfirmed = !salaryTbd && bulkJobCheckboxValue(formData, draftKey, "salary_confirmed");

  if (!country) {
    throw new Error(`${occupation.name}: country is required.`);
  }

  if (!employerId) {
    throw new Error(`${occupation.name}: employer is required.`);
  }

  if (!deadline) {
    throw new Error(`${occupation.name}: application deadline is required.`);
  }

  if (!salaryTbd && (!salaryConfirmed || (salaryMin === null && salaryMax === null))) {
    throw new Error(`${occupation.name}: enter confirmed salary details or mark salary as TBD.`);
  }

  if (!salaryTbd && !currency) {
    throw new Error(`${occupation.name}: salary currency is required when salary is confirmed.`);
  }

  const payload: Record<string, unknown> = {
    title,
    slug: [
      slugify(title),
      slugify(country),
      deadline.replaceAll("-", ""),
      nonce.toString(36),
      String(sequence + 1),
    ].filter(Boolean).join("-"),
    employer_id: employerId,
    country,
    city: city || null,
    category: bulkJobFieldValue(formData, draftKey, "category") || occupation.category,
    job_type: bulkJobFieldValue(formData, draftKey, "job_type") || null,
    skill_level: bulkJobFieldValue(formData, draftKey, "skill_level") || occupation.skill_level,
    short_description: bulkJobFieldValue(formData, draftKey, "short_description") || null,
    description: bulkJobFieldValue(formData, draftKey, "description") || null,
    responsibilities: bulkJobFieldValue(formData, draftKey, "responsibilities") || null,
    requirements: bulkJobFieldValue(formData, draftKey, "requirements") || null,
    experience_requirements: bulkJobFieldValue(formData, draftKey, "experience_requirements") || null,
    education_requirements: bulkJobFieldValue(formData, draftKey, "education_requirements") || null,
    language_requirements: bulkJobFieldValue(formData, draftKey, "language_requirements") || null,
    physical_requirements: bulkJobFieldValue(formData, draftKey, "physical_requirements") || null,
    additional_requirements: bulkJobFieldValue(formData, draftKey, "additional_requirements") || null,
    salary_min: salaryTbd ? null : salaryMin,
    salary_max: salaryTbd ? null : salaryMax,
    currency: salaryTbd ? currency || null : currency,
    salary_period: bulkJobFieldValue(formData, draftKey, "salary_period") || null,
    salary_confirmed: salaryConfirmed,
    salary_note: salaryTbd
      ? bulkJobFieldValue(formData, draftKey, "salary_note") || "To be confirmed by employer."
      : bulkJobFieldValue(formData, draftKey, "salary_note") || null,
    contract_type: bulkJobFieldValue(formData, draftKey, "contract_type") || null,
    contract_duration_value: optionalBulkInteger(formData, draftKey, occupation, "contract_duration_value"),
    contract_duration_unit: bulkJobFieldValue(formData, draftKey, "contract_duration_unit") || null,
    contract_note: bulkJobFieldValue(formData, draftKey, "contract_note") || null,
    working_hours_per_week: optionalBulkNumber(formData, draftKey, occupation, "working_hours_per_week"),
    work_schedule: bulkJobFieldValue(formData, draftKey, "work_schedule") || null,
    overtime_note: bulkJobFieldValue(formData, draftKey, "overtime_note") || null,
    vacancies: requiredBulkPositiveInteger(formData, draftKey, occupation, "vacancies"),
    application_deadline: deadline,
    visa_sponsorship: bulkJobCheckboxValue(formData, draftKey, "visa_sponsorship"),
    accommodation: bulkJobCheckboxValue(formData, draftKey, "accommodation"),
    transport: bulkJobCheckboxValue(formData, draftKey, "transport"),
    meals: bulkJobCheckboxValue(formData, draftKey, "meals"),
    sponsorship_status: bulkJobFieldValue(formData, draftKey, "sponsorship_status") || "not_confirmed",
    accommodation_status: bulkJobFieldValue(formData, draftKey, "accommodation_status") || "not_confirmed",
    meals_status: bulkJobFieldValue(formData, draftKey, "meals_status") || "not_confirmed",
    transport_status: bulkJobFieldValue(formData, draftKey, "transport_status") || "not_confirmed",
    medical_insurance_status: bulkJobFieldValue(formData, draftKey, "medical_insurance_status") || "not_confirmed",
    air_ticket_status: bulkJobFieldValue(formData, draftKey, "air_ticket_status") || "not_confirmed",
    training_status: bulkJobFieldValue(formData, draftKey, "training_status") || "not_confirmed",
    annual_leave_note: bulkJobFieldValue(formData, draftKey, "annual_leave_note") || null,
    other_benefits: bulkJobFieldValue(formData, draftKey, "other_benefits") || null,
    country_fee_override: optionalBulkNumber(formData, draftKey, occupation, "country_fee_override"),
    country_fee_override_currency: bulkJobFieldValue(formData, draftKey, "country_fee_override_currency") || null,
    country_fee_override_note: bulkJobFieldValue(formData, draftKey, "country_fee_override_note") || null,
    fee_relationship: bulkJobFieldValue(formData, draftKey, "fee_relationship") || "not_confirmed",
    processing_time_min: optionalBulkInteger(formData, draftKey, occupation, "processing_time_min"),
    processing_time_max: optionalBulkInteger(formData, draftKey, occupation, "processing_time_max"),
    processing_time_unit: bulkJobFieldValue(formData, draftKey, "processing_time_unit") || null,
    processing_time_note: bulkJobFieldValue(formData, draftKey, "processing_time_note") || null,
    status: "draft",
    created_by: creatorId,
    published_at: null,
  };

  return assertValid(validateJobPayload(payload));
}

async function findDuplicateBulkJob(payload: Record<string, unknown>) {
  const supabase = await createClient();
  let request = supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", String(payload.employer_id))
    .eq("country", String(payload.country))
    .eq("title", String(payload.title))
    .eq("vacancies", Number(payload.vacancies))
    .eq("application_deadline", String(payload.application_deadline))
    .neq("status", "archived")
    .limit(1);

  request = payload.city ? request.eq("city", String(payload.city)) : request.is("city", null);
  const { data, error } = await request.maybeSingle<{ id: string }>();

  if (error) {
    throw new Error("Unable to check for duplicate vacancies.");
  }

  return data?.id ?? null;
}

export async function createJob(formData: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert(jobPayload(formData, context.user.id))
    .select("id")
    .single();

  if (error) {
    throw new Error("Unable to create job. Check required fields and your permissions.");
  }

  await replaceJobDocumentRequirements(data.id, formData);

  await logAuditEvent(context, {
    action: "job_created",
    entityType: "job",
    entityId: data.id,
    description: "Job created",
  });

  redirect(`/admin/jobs/${data.id}`);
}

export async function bulkCreateJobs(formData: FormData) {
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to create jobs.");
  }

  const draftKeys = formData
    .getAll("draft_key")
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  if (draftKeys.length === 0) {
    throw new Error("Select at least one country, employer and occupation.");
  }

  if (draftKeys.length > BULK_JOB_LIMIT) {
    throw new Error(`Create ${BULK_JOB_LIMIT} or fewer vacancies at a time.`);
  }

  const supabase = await createClient();
  const countries = new Set(
    formData
      .getAll("draft_key")
      .map((entry) => (typeof entry === "string" ? bulkJobFieldValue(formData, entry, "country") : ""))
      .filter(Boolean)
  );
  const employerIds = [
    ...new Set(
      draftKeys
        .map((draftKey) => bulkJobFieldValue(formData, draftKey, "employer_id"))
        .filter(Boolean)
    ),
  ];
  const [{ data: countryRows, error: countryError }, { data: employerRows, error: employerError }] = await Promise.all([
    countries.size
      ? supabase
          .from("country_recruitment_settings")
          .select("country_name, is_active")
          .in("country_name", [...countries])
          .returns<{ country_name: string; is_active: boolean | null }[]>()
      : Promise.resolve({ data: [], error: null }),
    employerIds.length
      ? supabase
          .from("employers")
          .select("id, company_name, is_active, verification_status")
          .in("id", employerIds)
          .returns<{ id: string; company_name: string | null; is_active: boolean | null; verification_status: string | null }[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (countryError) {
    throw new Error("Unable to validate selected countries.");
  }

  if (employerError) {
    throw new Error("Unable to validate selected employers.");
  }

  const activeCountries = new Set((countryRows ?? []).filter((country) => country.is_active !== false).map((country) => country.country_name));
  const validEmployers = new Map(
    (employerRows ?? [])
      .filter((employer) => employer.is_active === true && employer.verification_status === "verified")
      .map((employer) => [employer.id, employer])
  );

  for (const country of countries) {
    if (!activeCountries.has(country)) {
      throw new Error(`${country} is not an active country configuration.`);
    }
  }

  for (const employerId of employerIds) {
    if (!validEmployers.has(employerId)) {
      throw new Error("Selected employers must be active and verified before creating vacancies.");
    }
  }

  const selectedDrafts = draftKeys.map((draftKey) => {
    const slug = bulkJobFieldValue(formData, draftKey, "occupation_slug");
    const occupation = JOB_OCCUPATIONS.find((item) => item.slug === slug);

    if (!occupation) {
      throw new Error("A selected occupation is not in the approved catalogue.");
    }

    return { draftKey, occupation };
  });

  const nonce = Date.now();
  const createdIds: string[] = [];
  const createdTitles: string[] = [];
  const skippedDuplicates: { title: unknown; duplicate_id: string | null; country: unknown; employer_id: unknown }[] = [];

  for (const [index, { draftKey, occupation }] of selectedDrafts.entries()) {
    const payload = bulkJobPayload({
      formData,
      draftKey,
      occupation,
      creatorId: context.user.id,
      sequence: index,
      nonce,
    });
    const duplicateId = await findDuplicateBulkJob(payload);

    if (duplicateId) {
      skippedDuplicates.push({
        title: payload.title,
        duplicate_id: duplicateId,
        country: payload.country,
        employer_id: payload.employer_id,
      });
      continue;
    }

    const { data, error } = await supabase.from("jobs").insert(payload).select("id, title").single();

    if (error || !data) {
      throw new Error(`Unable to create draft vacancy for ${occupation.name}.`);
    }

    const documentRows = documentRequirementsRowsFromText(
      bulkJobFieldValue(formData, draftKey, "document_requirements"),
      data.id
    );
    await insertJobDocumentRequirementRows(documentRows);

    createdIds.push(data.id);
    createdTitles.push(String(data.title ?? occupation.name));

    await logAuditEvent(context, {
      action: "job_created",
      entityType: "job",
      entityId: data.id,
      description: "Draft job created through bulk workflow",
      metadata: {
        occupation_slug: occupation.slug,
        country: payload.country,
        employer_id: payload.employer_id,
        bulk_create: true,
      },
    });
  }

  await logAuditEvent(context, {
    action: "bulk_job_creation",
    entityType: "job",
    description: `Bulk draft job creation: ${createdIds.length} created, ${skippedDuplicates.length} skipped`,
    metadata: {
      job_ids: createdIds,
      titles: createdTitles,
      selected_combinations: draftKeys.length,
      skipped_duplicates: skippedDuplicates,
      employer_ids: employerIds,
      countries: [...countries],
    },
  });

  redirect(`/admin/jobs/bulk-create/review?ids=${encodeURIComponent(createdIds.join(","))}&selected=${draftKeys.length}&created=${createdIds.length}&skipped=${skippedDuplicates.length}`);
}

export async function bulkUpdateJobCommonValues(formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to update jobs.");
  }

  const ids = requireSelectedJobIds(formData);
  const payload: Record<string, unknown> = {};
  const city = value(formData, "city");
  const deadline = value(formData, "application_deadline");
  const currency = value(formData, "currency");
  const salaryPeriod = value(formData, "salary_period");
  const contractType = value(formData, "contract_type");
  const workingHours = optionalNumber(formData, "working_hours_per_week");
  const vacanciesRaw = value(formData, "vacancies");

  if (city) payload.city = city;
  if (deadline) payload.application_deadline = deadline;
  if (currency) payload.currency = currency;
  if (salaryPeriod) payload.salary_period = salaryPeriod;
  if (contractType) payload.contract_type = contractType;
  if (workingHours !== null) payload.working_hours_per_week = workingHours;
  if (vacanciesRaw) payload.vacancies = requiredPositiveInteger(formData, "vacancies");
  if (checkbox(formData, "salary_tbd")) {
    payload.salary_confirmed = false;
    payload.salary_min = null;
    payload.salary_max = null;
    payload.salary_note = "To be confirmed by employer.";
  }

  for (const key of [
    "sponsorship_status",
    "accommodation_status",
    "meals_status",
    "transport_status",
    "medical_insurance_status",
    "air_ticket_status",
    "processing_time_unit",
  ]) {
    const current = value(formData, key);
    if (current) payload[key] = current;
  }

  const processingMin = optionalInteger(formData, "processing_time_min");
  const processingMax = optionalInteger(formData, "processing_time_max");
  if (processingMin !== null) payload.processing_time_min = processingMin;
  if (processingMax !== null) payload.processing_time_max = processingMax;

  if (Object.keys(payload).length === 0) {
    throw new Error("Enter at least one common value to update.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("jobs").update(payload).in("id", ids);

  if (error) {
    throw new Error("Unable to update generated jobs.");
  }

  await logAuditEvent(context, {
    action: "bulk_job_common_values_updated",
    entityType: "job",
    description: `Bulk common values updated for ${ids.length} vacancies`,
    metadata: {
      job_ids: ids,
      fields: Object.keys(payload),
    },
  });

  redirect(`/admin/jobs/bulk-create/review?ids=${encodeURIComponent(ids.join(","))}&updated=1`);
}

export async function createGlobalJobPublicationRun(formData: FormData) {
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to create jobs.");
  }

  const runId = await createGlobalJobMatrixRun(context, formData);
  redirect(`/admin/jobs/bulk-create?global_run=${runId}`);
}

export async function processGlobalJobPublicationBatch(formData: FormData) {
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to create jobs.");
  }

  const runId = value(formData, "run_id");
  if (!runId) {
    throw new Error("Publication run is required.");
  }

  await processGlobalJobMatrixBatch(context, runId);
  redirect(`/admin/jobs/bulk-create?global_run=${runId}`);
}

export async function cancelGlobalJobPublicationRun(formData: FormData) {
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to create jobs.");
  }

  const runId = value(formData, "run_id");
  if (!runId) {
    throw new Error("Publication run is required.");
  }

  await cancelGlobalJobMatrixRun(context, runId);
  redirect(`/admin/jobs/bulk-create?global_run=${runId}`);
}

export async function updateJob(id: string, formData: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("jobs")
    .select("salary_min, salary_max, salary_confirmed, country_fee_override, processing_time_min, processing_time_max, processing_time_unit, sponsorship_status, accommodation_status, meals_status, transport_status, medical_insurance_status, air_ticket_status")
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();
  const { error } = await supabase.from("jobs").update(jobPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Unable to update job. Check required fields and your permissions.");
  }

  await replaceJobDocumentRequirements(id, formData);

  await logAuditEvent(context, {
    action: "job_updated",
    entityType: "job",
    entityId: id,
    description: "Job updated",
  });

  await logJobChangeAudits(context, id, before ?? {}, jobPayload(formData));

  redirect(`/admin/jobs/${id}`);
}

export async function updateCountrySetting(id: string, formData: FormData) {
  const context = await requireAdmin();
  if (!hasCapability(context, "countries.manage") || !hasCapability(context, "fees.manage")) {
    throw new Error("You are not allowed to manage country fees.");
  }

  const supabase = await createClient();
  const payload = {
    country_name: value(formData, "country_name"),
    slug: value(formData, "slug"),
    country_code: value(formData, "country_code"),
    region: value(formData, "region"),
    base_recruitment_fee: optionalNumber(formData, "base_recruitment_fee"),
    fee_currency: value(formData, "fee_currency") || "KES",
    fee_label: value(formData, "fee_label") || "Estimated Programme Cost",
    processing_time_min: optionalInteger(formData, "processing_time_min"),
    processing_time_max: optionalInteger(formData, "processing_time_max"),
    processing_time_unit: selected(formData, "processing_time_unit"),
    processing_time_note: value(formData, "processing_time_note") || null,
    is_active: checkbox(formData, "is_active"),
    is_featured: checkbox(formData, "is_featured"),
    display_order: optionalInteger(formData, "display_order") ?? 100,
  };
  const { data: before } = await supabase.from("country_recruitment_settings").select("*").eq("id", id).maybeSingle<Record<string, unknown>>();
  const { error } = await supabase.from("country_recruitment_settings").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update country settings.");
  }

  await logAuditEvent(context, {
    action: before?.base_recruitment_fee !== payload.base_recruitment_fee ? "country_fee_updated" : "country_updated",
    entityType: "country_recruitment_setting",
    entityId: id,
    description: "Country recruitment settings updated",
    metadata: {
      before: {
        base_recruitment_fee: before?.base_recruitment_fee ?? null,
        processing_time_min: before?.processing_time_min ?? null,
        processing_time_max: before?.processing_time_max ?? null,
        is_active: before?.is_active ?? null,
        is_featured: before?.is_featured ?? null,
      },
      after: {
        base_recruitment_fee: payload.base_recruitment_fee,
        processing_time_min: payload.processing_time_min,
        processing_time_max: payload.processing_time_max,
        is_active: payload.is_active,
        is_featured: payload.is_featured,
      },
    },
  });

  if (before?.processing_time_min !== payload.processing_time_min || before?.processing_time_max !== payload.processing_time_max) {
    await logAuditEvent(context, {
      action: "country_processing_time_updated",
      entityType: "country_recruitment_setting",
      entityId: id,
      description: "Country processing estimate updated",
    });
  }
}

export async function setJobStatus(id: string, status: string) {
  const context = await requireAdmin();
  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to update jobs.");
  }

  if (!["draft", "published", "paused", "closed", "archived"].includes(status)) {
    throw new Error("Invalid job status.");
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = { status };

  if (status === "published") {
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("title, slug, country, category, skill_level, description, vacancies, application_deadline")
      .eq("id", id)
      .maybeSingle<Record<string, unknown>>();

    if (jobError || !job) {
      throw new Error("Unable to validate this job for publication.");
    }

    assertValid(validateJobForPublication(job));
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update job status.");
  }

  await logAuditEvent(context, {
    action: status === "published" ? "job_published" : status === "closed" ? "job_closed" : "job_updated",
    entityType: "job",
    entityId: id,
    description: `Job status changed to ${status}`,
  });
}

export async function bulkSetJobStatus(status: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();

  if (!hasCapability(context, "jobs.write")) {
    throw new Error("You are not allowed to update jobs.");
  }

  if (!["draft", "published", "paused", "closed", "archived"].includes(status)) {
    throw new Error("Invalid job status.");
  }

  const ids = requireSelectedJobIds(formData);
  const supabase = await createClient();
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, title, slug, country, category, skill_level, description, vacancies, application_deadline, status")
    .in("id", ids)
    .returns<Record<string, unknown>[]>();

  if (jobsError || !jobs || jobs.length !== ids.length) {
    throw new Error("Unable to load every selected job for status validation.");
  }

  if (status === "published") {
    for (const job of jobs) {
      assertValid(validateJobForPublication(job));
    }
  }

  const payload: Record<string, unknown> = { status };
  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(payload).in("id", ids);

  if (error) {
    throw new Error("Unable to update selected job statuses.");
  }

  for (const job of jobs) {
    await logAuditEvent(context, {
      action: status === "published" ? "job_published" : status === "closed" ? "job_closed" : "job_updated",
      entityType: "job",
      entityId: String(job.id),
      description: `Bulk job status changed to ${status}`,
      metadata: {
        previous_status: job.status ?? null,
        new_status: status,
        bulk_status_change: true,
      },
    });
  }

  await logAuditEvent(context, {
    action: status === "published" ? "bulk_publication" : "bulk_status_change",
    entityType: "job",
    description: `Bulk job status change to ${status}: ${ids.length} vacancies`,
    metadata: {
      job_ids: ids,
      new_status: status,
      previous_statuses: jobs.map((job) => ({ id: job.id, status: job.status ?? null })),
    },
  });

  redirect(`/admin/jobs/bulk-create/review?ids=${encodeURIComponent(ids.join(","))}`);
}

export async function duplicateJob(id: string) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "title, slug, employer_id, country, city, category, job_type, skill_level, short_description, description, responsibilities, requirements, experience_requirements, education_requirements, language_requirements, physical_requirements, additional_requirements, salary_min, salary_max, currency, salary_period, salary_confirmed, salary_note, contract_type, contract_duration_value, contract_duration_unit, contract_note, working_hours_per_week, work_schedule, overtime_note, vacancies, application_deadline, visa_sponsorship, accommodation, transport, meals, sponsorship_status, accommodation_status, meals_status, transport_status, medical_insurance_status, air_ticket_status, training_status, annual_leave_note, other_benefits, country_fee_override, country_fee_override_currency, country_fee_override_note, fee_relationship, processing_time_min, processing_time_max, processing_time_unit, processing_time_note"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !job) {
    throw new Error("Unable to duplicate job.");
  }

  const copy = { ...job } as Record<string, unknown>;
  delete copy.id;
  copy.status = "draft";
  copy.slug = `${String(copy.slug ?? "job")}-copy-${Date.now()}`;
  copy.title = `${String(copy.title ?? "Job")} Copy`;
  copy.created_by = context.user.id;
  copy.published_at = null;

  const { data, error: insertError } = await supabase.from("jobs").insert(copy).select("id").single();

  if (insertError) {
    throw new Error("Unable to duplicate job.");
  }

  redirect(`/admin/jobs/${data.id}/edit`);
}

async function logJobChangeAudits(
  context: Awaited<ReturnType<typeof requireAdmin>>,
  jobId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
) {
  const changes = [
    {
      action: "job_salary_changed",
      keys: ["salary_min", "salary_max", "salary_confirmed"],
      description: "Job salary configuration changed",
    },
    {
      action: "job_fee_override_updated",
      keys: ["country_fee_override", "country_fee_override_currency"],
      description: "Job programme fee override changed",
    },
    {
      action: "job_processing_estimate_changed",
      keys: ["processing_time_min", "processing_time_max", "processing_time_unit"],
      description: "Job processing estimate changed",
    },
    {
      action: "job_benefits_changed",
      keys: ["sponsorship_status", "accommodation_status", "meals_status", "transport_status", "medical_insurance_status", "air_ticket_status"],
      description: "Job benefits changed",
    },
    {
      action: "job_required_documents_changed",
      keys: [],
      description: "Job document requirements were refreshed",
    },
  ];

  for (const change of changes) {
    const changed = change.keys.length === 0 || change.keys.some((key) => before[key] !== after[key]);
    if (!changed) continue;
    await logAuditEvent(context, {
      action: change.action,
      entityType: "job",
      entityId: jobId,
      description: change.description,
      metadata: change.keys.length
        ? {
            before: Object.fromEntries(change.keys.map((key) => [key, before[key] ?? null])),
            after: Object.fromEntries(change.keys.map((key) => [key, after[key] ?? null])),
          }
        : undefined,
    });
  }
}

export async function updateApplicationStatus(id: string, formData: FormData) {
  const context = await requireStaff();
  const status = value(formData, "status");
  const overrideReason = value(formData, "override_reason");

  if (!canChangeApplicationStatus(context) || !isApplicationStatus(status)) {
    throw new Error("You are not allowed to set this application status.");
  }

  const supabase = await createClient();
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", id)
    .maybeSingle<Record<string, unknown>>();

  if (applicationError || !application) {
    throw new Error("Application was not found.");
  }

  const previousStatus = typeof application.status === "string" ? application.status : null;
  const transitionAllowed = canTransitionApplicationStatus(previousStatus, status);
  const overrideAllowed = !transitionAllowed && canOverrideApplicationTransition(context, overrideReason);

  if (!transitionAllowed && !overrideAllowed) {
    adminWarn("application status transition blocked", {
      application_id: id,
      actor_user_id: context.user.id,
      previous_status: previousStatus,
      requested_status: status,
    });
    throw new Error("That application status transition is not allowed. Super admin overrides require a reason.");
  }

  const { error: workflowError } = await supabase.rpc("admin_update_application_status", {
    p_application_id: id,
    p_new_status: status,
    p_changed_by: context.user.id,
    p_reason: overrideReason || null,
    p_metadata: {
      override: overrideAllowed,
      actor_role: context.highestRole,
    },
  });

  if (workflowError) {
    adminWarn("application status workflow failed", {
      application_id: id,
      actor_user_id: context.user.id,
      previous_status: previousStatus,
      requested_status: status,
      error: workflowError.message,
    });
    throw new Error("Unable to update application status.");
  }

  await logAuditEvent(context, {
    action: overrideAllowed ? "application_status_override" : "application_status_changed",
    entityType: "application",
    entityId: id,
    description: `Application status changed to ${status}`,
    metadata: {
      previous_status: previousStatus,
      new_status: status,
      override: overrideAllowed,
      override_reason: overrideAllowed ? overrideReason : null,
    },
  });
}

export async function assignApplication(id: string, formData: FormData) {
  const context = await requireStaff();
  const staffId = uuidValue(formData, "assigned_staff_id");

  if (!canChangeApplicationStatus(context) || !staffId) {
    throw new Error("You are not allowed to assign this application.");
  }

  const supabase = await createClient();
  const { data: role } = await supabase
    .from("staff_roles")
    .select("id")
    .eq("user_id", staffId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!role) {
    throw new Error("Target staff member is not active.");
  }

  const { data: assignmentRows, error: assignmentError } = await supabase.rpc("admin_assign_application", {
    p_application_id: id,
    p_assigned_staff_id: staffId,
    p_changed_by: context.user.id,
    p_reason: value(formData, "assignment_reason") || null,
  });

  if (assignmentError) {
    adminWarn("application assignment workflow failed", {
      application_id: id,
      actor_user_id: context.user.id,
      assigned_staff_id: staffId,
      error: assignmentError.message,
    });
    throw new Error("Unable to assign application.");
  }

  const previousStaffId =
    Array.isArray(assignmentRows) && typeof assignmentRows[0]?.previous_staff_id === "string"
      ? assignmentRows[0].previous_staff_id
      : null;

  await logAuditEvent(context, {
    action: "application_assigned",
    entityType: "application",
    entityId: id,
    description: "Application assigned",
    metadata: { previous_staff_id: previousStaffId, assigned_staff_id: staffId },
  });
}

export async function addApplicationNote(id: string, formData: FormData) {
  const context = await requireStaff();
  const note = value(formData, "note");

  if (!note) {
    throw new Error("Note is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("application_notes").insert({
    application_id: id,
    note,
    created_by: context.user.id,
  });

  if (error) {
    throw new Error("Unable to save application note.");
  }

  await logAuditEvent(context, {
    action: "application_note_created",
    entityType: "application",
    entityId: id,
    description: "Application note created",
  });
}

export async function addCandidateNote(candidateId: string, formData: FormData) {
  const context = await requireStaff();
  const note = value(formData, "note");

  if (!note) {
    throw new Error("Note is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("candidate_notes").insert({
    candidate_id: candidateId,
    note,
    created_by: context.user.id,
  });

  if (error) {
    throw new Error("Unable to save candidate note.");
  }

  await logAuditEvent(context, {
    action: "candidate_note_created",
    entityType: "candidate",
    entityId: candidateId,
    description: "Candidate note created",
  });
}

function employerPayload(formData: FormData) {
  const email = value(formData, "email");
  const website = value(formData, "website");

  return assertValid(validateEmployerPayload({
    company_name: value(formData, "company_name"),
    registration_number: value(formData, "registration_number") || null,
    website: website || null,
    email: email || null,
    phone: value(formData, "phone") || null,
    country: value(formData, "country") || null,
    city: value(formData, "city") || null,
    address: value(formData, "address") || null,
    description: value(formData, "description") || null,
    verification_status: value(formData, "verification_status") || "pending",
    is_active: checkbox(formData, "is_active"),
    owner_user_id: uuidValue(formData, "owner_user_id"),
  }));
}

export async function createEmployer(formData: FormData) {
  const context = await requireAdmin();

  if (!canManageEmployer(context)) {
    throw new Error("You are not allowed to create employers.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("employers").insert(employerPayload(formData)).select("id").single();

  if (error) {
    throw new Error("Unable to create employer.");
  }

  await logAuditEvent(context, {
    action: "employer_created",
    entityType: "employer",
    entityId: data.id,
    description: "Employer created",
  });

  redirect(`/admin/employers/${data.id}`);
}

export async function updateEmployer(id: string, formData: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("employers").update(employerPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Unable to update employer.");
  }

  await logAuditEvent(context, {
    action: "employer_updated",
    entityType: "employer",
    entityId: id,
    description: "Employer updated",
  });

  redirect(`/admin/employers/${id}`);
}

export async function setEmployerState(id: string, state: "verified" | "rejected" | "suspended" | "reactivated", formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();
  const supabase = await createClient();
  const current = await supabase.from("employers").select("id, verification_status, is_active").eq("id", id).maybeSingle();

  if (!current.data) {
    throw new Error("Employer was not found.");
  }

  if (state === "verified" || state === "rejected") {
    assertValid(validateEmployerTransition(String(current.data.verification_status ?? "pending"), state));
  }

  const payload =
    state === "suspended"
      ? { is_active: false }
      : state === "reactivated"
        ? { is_active: true }
        : { verification_status: state };
  const { error } = await supabase.from("employers").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update employer status.");
  }

  await logAuditEvent(context, {
    action: `employer_${state}`,
    entityType: "employer",
    entityId: id,
    description: `Employer ${state}`,
  });
}

export async function setEmployerJobRequestState(
  id: string,
  state: "under_review" | "changes_requested" | "approved" | "rejected",
  formData: FormData
) {
  requireConfirmation(formData);
  const context = await requireAdmin();
  if (!hasCapability(context, "employers.write")) {
    throw new Error("You are not allowed to review employer job requests.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("employer_job_requests")
    .update({
      status: state,
      reviewed_at: new Date().toISOString(),
      reviewed_by: context.user.id,
      admin_notes: value(formData, "admin_notes") || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to update employer job request.");
  }

  await logAuditEvent(context, {
    action: `employer_job_request_${state}`,
    entityType: "employer_job_request",
    entityId: id,
    description: `Employer job request marked ${state}`,
  });
}

export async function verifyDocument(id: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireStaff();

  if (!canReviewDocuments(context)) {
    throw new Error("You are not allowed to verify documents.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_documents")
    .update({
      verification_status: "verified",
      verified_by: context.user.id,
      verified_at: new Date().toISOString(),
      verification_note: value(formData, "verification_note") || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to verify document.");
  }

  await logAuditEvent(context, {
    action: "document_verified",
    entityType: "application_document",
    entityId: id,
    description: "Document verified",
  });
}

export async function rejectDocument(id: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireStaff();

  if (!canReviewDocuments(context)) {
    throw new Error("You are not allowed to reject documents.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_documents")
    .update({
      verification_status: "rejected",
      verified_by: context.user.id,
      verified_at: new Date().toISOString(),
      verification_note: value(formData, "verification_note") || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to reject document.");
  }

  await logAuditEvent(context, {
    action: "document_rejected",
    entityType: "application_document",
    entityId: id,
    description: "Document rejected",
  });
}

export async function assignStaffRole(targetUserId: string, formData: FormData) {
  const context = await requireAdmin();
  const role = value(formData, "role");

  if (!canManageStaff(context) || context.user.id === targetUserId) {
    throw new Error("You are not allowed to assign this role.");
  }

  const validRole = assertValid(validateStaffRole(role));

  if (validRole === "super_admin") {
    await requireSuperAdmin();
  }

  const supabase = await createClient();
  const { error } = await supabase.from("staff_roles").insert({
    user_id: targetUserId,
    role: validRole,
    active: true,
  });

  if (error) {
    throw new Error("Unable to assign staff role.");
  }

  await logAuditEvent(context, {
    action: "staff_role_assigned",
    entityType: "staff_role",
    description: `Assigned ${validRole}`,
    metadata: { target_user_id: targetUserId, role: validRole },
  });
}

export async function revokeStaffRole(roleId: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data: targetRole } = await supabase.from("staff_roles").select("id, user_id, role, active").eq("id", roleId).maybeSingle();

  if (!targetRole) {
    throw new Error("Role not found.");
  }

  if (targetRole.user_id === context.user.id) {
    throw new Error("You cannot revoke your own role.");
  }

  if (targetRole.role === "super_admin") {
    await requireSuperAdmin();
    const { count } = await supabase
      .from("staff_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("active", true);

    if ((count ?? 0) <= 1) {
      throw new Error("Cannot revoke the final active super admin.");
    }
  }

  const { error } = await supabase.from("staff_roles").update({ active: false }).eq("id", roleId);

  if (error) {
    throw new Error("Unable to revoke role.");
  }

  await logAuditEvent(context, {
    action: "staff_role_revoked",
    entityType: "staff_role",
    entityId: roleId,
    description: `Revoked ${targetRole.role}`,
  });
}

export async function createStaffAccount(formData: FormData) {
  const context = await requireAdmin();

  /* ==========================================================
     1. AUTHORIZATION
  ========================================================== */

  if (!canManageStaff(context)) {
    throw new Error(
      "You are not allowed to create staff accounts."
    );
  }

  if (
    formData.get("authorization_confirmed") !== "true"
  ) {
    throw new Error(
      "Administrative authorization confirmation is required."
    );
  }

  /* ==========================================================
     2. IDENTITY & CONTACT INFORMATION
  ========================================================== */

  const fullName = value(
    formData,
    "full_name"
  );

  const email = value(
    formData,
    "email"
  ).toLowerCase();

  const phone = value(
    formData,
    "phone"
  );

  const identityNumber = value(
    formData,
    "identity_number"
  );

  const dateOfBirth = value(
    formData,
    "date_of_birth"
  );

  const gender = value(
    formData,
    "gender"
  );

  /* ==========================================================
     3. EMPLOYMENT INFORMATION
  ========================================================== */

  const requestedRole = value(
    formData,
    "role"
  );

  const jobTitle = value(
    formData,
    "job_title"
  );

  const department = value(
    formData,
    "department"
  );

  const employmentType = value(
    formData,
    "employment_type"
  );

  const dutyStation = value(
    formData,
    "duty_station"
  );

  const appointmentDate = value(
    formData,
    "appointment_date"
  );

  const employmentStartDate = value(
    formData,
    "employment_start_date"
  );

  const reportingOfficer = value(
    formData,
    "reporting_officer"
  );

  /* ==========================================================
     4. COMPENSATION & WORKING CONDITIONS
  ========================================================== */

  const salaryAmount =
    optionalNumber(
      formData,
      "salary_amount"
    );

  const salaryCurrency = value(
    formData,
    "salary_currency"
  ).toUpperCase();

  const salaryPeriod = value(
    formData,
    "salary_period"
  );

  const workingDaysPerWeek =
    optionalInteger(
      formData,
      "working_days_per_week"
    );

  const workingHoursPerDay =
    optionalNumber(
      formData,
      "working_hours_per_day"
    );

  const workingHoursPerWeek =
    optionalNumber(
      formData,
      "working_hours_per_week"
    );

  const workSchedule = value(
    formData,
    "work_schedule"
  );

  const probationPeriodMonths =
    optionalInteger(
      formData,
      "probation_period_months"
    );

  /* ==========================================================
     5. REQUIRED FIELD VALIDATION
  ========================================================== */

  if (!fullName) {
    throw new Error(
      "Full legal name is required."
    );
  }

  if (
    !email ||
    !email.includes("@")
  ) {
    throw new Error(
      "A valid official email address is required."
    );
  }

  if (!phone) {
    throw new Error(
      "Staff mobile number is required."
    );
  }

  if (!requestedRole) {
    throw new Error(
      "A staff role is required."
    );
  }

  if (!jobTitle) {
    throw new Error(
      "Job title is required."
    );
  }

  if (!department) {
    throw new Error(
      "Department is required."
    );
  }

  if (!dutyStation) {
    throw new Error(
      "Duty station is required."
    );
  }

  if (!employmentType) {
    throw new Error(
      "Employment type is required."
    );
  }

  if (!employmentStartDate) {
    throw new Error(
      "Employment start date is required."
    );
  }

  /* ==========================================================
     6. ROLE & ENUM VALIDATION
  ========================================================== */

  const validRole = assertValid(
    validateStaffRole(requestedRole)
  );

  if (validRole === "super_admin") {
    await requireSuperAdmin();
  }

  const allowedEmploymentTypes =
    new Set([
      "full_time",
      "part_time",
      "contract",
      "temporary",
      "intern",
    ]);

  if (
    !allowedEmploymentTypes.has(
      employmentType
    )
  ) {
    throw new Error(
      "Invalid employment type."
    );
  }

  const allowedGenders =
    new Set([
      "female",
      "male",
      "other",
      "prefer_not_to_say",
    ]);

  if (
    gender &&
    !allowedGenders.has(gender)
  ) {
    throw new Error(
      "Invalid gender selection."
    );
  }

  const allowedSalaryPeriods =
    new Set([
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "annual",
    ]);

  if (
    salaryPeriod &&
    !allowedSalaryPeriods.has(
      salaryPeriod
    )
  ) {
    throw new Error(
      "Invalid salary period."
    );
  }

  const allowedWorkSchedules =
    new Set([
      "monday_friday",
      "monday_saturday",
      "shift",
      "rotational",
      "flexible",
      "remote",
      "hybrid",
    ]);

  if (
    workSchedule &&
    !allowedWorkSchedules.has(
      workSchedule
    )
  ) {
    throw new Error(
      "Invalid work schedule."
    );
  }

  if (
    salaryAmount !== null &&
    !salaryCurrency
  ) {
    throw new Error(
      "Salary currency is required when salary is entered."
    );
  }

  if (
    salaryAmount !== null &&
    !salaryPeriod
  ) {
    throw new Error(
      "Salary period is required when salary is entered."
    );
  }

  if (
    workingDaysPerWeek !== null &&
    (
      workingDaysPerWeek < 1 ||
      workingDaysPerWeek > 7
    )
  ) {
    throw new Error(
      "Working days per week must be between 1 and 7."
    );
  }

  if (
    workingHoursPerDay !== null &&
    (
      workingHoursPerDay <= 0 ||
      workingHoursPerDay > 24
    )
  ) {
    throw new Error(
      "Working hours per day must be greater than 0 and no more than 24."
    );
  }

  if (
    workingHoursPerWeek !== null &&
    (
      workingHoursPerWeek <= 0 ||
      workingHoursPerWeek > 168
    )
  ) {
    throw new Error(
      "Working hours per week must be greater than 0 and no more than 168."
    );
  }

  if (
    probationPeriodMonths !== null &&
    (
      probationPeriodMonths < 0 ||
      probationPeriodMonths > 24
    )
  ) {
    throw new Error(
      "Probation period must be between 0 and 24 months."
    );
  }

  /* ==========================================================
     7. PRIVILEGED SUPABASE CLIENT
  ========================================================== */

  const adminClient =
    createAdminClient();

  const siteUrl =
    process.env
      .NEXT_PUBLIC_SITE_URL
      ?.replace(/\/+$/, "") ||
    "http://localhost:3000";

  /* ==========================================================
     8. CREATE SECURE STAFF AUTH ACCOUNT

     Supabase creates the authentication user and produces
     the secure invite/activation URL.

     Supabase does NOT send the invitation email here.
     Red Stone sends the activation URL through Resend later.
  ========================================================== */

  const {
    data: invitation,
    error: invitationError,
  } =
    await adminClient
      .auth
      .admin
      .generateLink({
        type: "invite",
        email,

        options: {
          redirectTo:
            `${siteUrl}/auth/callback?next=/login`,

          data: {
            full_name: fullName,
            phone: phone || null,
            profile_type: "staff",
          },
        },
      });

  if (
    invitationError ||
    !invitation.user ||
    !invitation.properties
      ?.action_link
  ) {
    const message =
      invitationError?.message ||
      "Unable to create the staff login account or secure activation link.";

    const normalizedMessage =
      message.toLowerCase();

    if (
      normalizedMessage.includes(
        "already"
      ) ||
      normalizedMessage.includes(
        "registered"
      ) ||
      normalizedMessage.includes(
        "exists"
      )
    ) {
      throw new Error(
        "An account with this email address already exists."
      );
    }

    throw new Error(message);
  }

  const userId =
    invitation.user.id;

  const activationUrl =
    invitation.properties
      .action_link;

  let provisioningSucceeded =
    false;

  try {
    /* ========================================================
       9. CREATE OFFICIAL PERSONNEL PROFILE
    ======================================================== */

    const {
      error: profileError,
    } =
      await adminClient
        .from("profiles")
        .upsert(
          {
            id: userId,

            full_name:
              fullName,

            phone:
              phone || null,

            identity_number:
              identityNumber ||
              null,

            date_of_birth:
              dateOfBirth || null,

            gender:
              gender || null,

            profile_type:
              "staff",

            is_active:
              true,

            job_title:
              jobTitle,

            department,

            employment_type:
              employmentType,

            duty_station:
              dutyStation,

            appointment_date:
              appointmentDate ||
              null,

            employment_start_date:
              employmentStartDate,

            reporting_officer:
              reportingOfficer ||
              null,

            salary_amount:
              salaryAmount,

            salary_currency:
              salaryAmount !== null
                ? salaryCurrency ||
                  null
                : null,

            salary_period:
              salaryAmount !== null
                ? salaryPeriod ||
                  null
                : null,

            working_days_per_week:
              workingDaysPerWeek,

            working_hours_per_day:
              workingHoursPerDay,

            working_hours_per_week:
              workingHoursPerWeek,

            work_schedule:
              workSchedule || null,

            probation_period_months:
              probationPeriodMonths,

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict: "id",
          }
        );

    if (profileError) {
      throw new Error(
        `Unable to create staff personnel profile: ${profileError.message}`
      );
    }

    /* ========================================================
       10. CREATE STAFF AUTHORIZATION ROLE
    ======================================================== */

    const {
      data: existingRole,
      error: roleLookupError,
    } =
      await adminClient
        .from("staff_roles")
        .select("id")
        .eq(
          "user_id",
          userId
        )
        .eq(
          "role",
          validRole
        )
        .eq(
          "active",
          true
        )
        .maybeSingle();

    if (roleLookupError) {
      throw new Error(
        `Unable to verify staff authorization: ${roleLookupError.message}`
      );
    }

    if (!existingRole) {
      const {
        error: roleError,
      } =
        await adminClient
          .from(
            "staff_roles"
          )
          .insert({
            user_id:
              userId,

            role:
              validRole,

            active:
              true,
          });

      if (roleError) {
        throw new Error(
          `Unable to assign staff role: ${roleError.message}`
        );
      }
    }

    /* ========================================================
       11. AUDIT ACCOUNT CREATION
    ======================================================== */

    await logAuditEvent(
      context,
      {
        action:
          "staff_account_created",

        entityType:
          "staff",

        entityId:
          userId,

        description:
          `Created staff personnel account for ${fullName}`,

        metadata: {
          target_user_id:
            userId,

          email,

          role:
            validRole,

          job_title:
            jobTitle,

          department,

          employment_type:
            employmentType,

          duty_station:
            dutyStation,

          appointment_date:
            appointmentDate ||
            null,

          employment_start_date:
            employmentStartDate,

          gender:
            gender || null,

          salary_currency:
            salaryAmount !==
            null
              ? salaryCurrency
              : null,

          salary_period:
            salaryAmount !==
            null
              ? salaryPeriod
              : null,

          working_days_per_week:
            workingDaysPerWeek,

          working_hours_per_day:
            workingHoursPerDay,

          working_hours_per_week:
            workingHoursPerWeek,

          work_schedule:
            workSchedule ||
            null,

          probation_period_months:
            probationPeriodMonths,

          activation_delivery:
            "resend",
        },
      }
    );

    provisioningSucceeded =
      true;
  } finally {
    /* ========================================================
       12. ROLLBACK INCOMPLETE PROVISIONING

       If personnel provisioning fails, remove any partially
       created Red Stone records and authentication account.
    ======================================================== */

    if (
      !provisioningSucceeded
    ) {
      try {
        await adminClient
          .from("staff_roles")
          .delete()
          .eq(
            "user_id",
            userId
          );
      } catch {
        // Best-effort cleanup.
      }

      try {
        await adminClient
          .from("profiles")
          .delete()
          .eq(
            "id",
            userId
          );
      } catch {
        // Best-effort cleanup.
      }

      try {
        await adminClient
          .auth
          .admin
          .deleteUser(
            userId
          );
      } catch {
        // Best-effort cleanup.
      }
    }
  }

  /* ==========================================================
     13. LOAD DATABASE-GENERATED PERSONNEL IDENTIFIERS

     staff_id, personnel_record_no and referral_code are
     generated by the personnel database workflow.
  ========================================================== */

  let generatedStaffId:
    string | null = null;

  let generatedPersonnelRecordNo:
    string | null = null;

  let generatedReferralCode:
    string | null = null;

  try {
    const {
      data:
        createdStaffRecord,
      error:
        identifierError,
    } =
      await adminClient
        .from("profiles")
        .select(
          `
          staff_id,
          personnel_record_no,
          referral_code
          `
        )
        .eq(
          "id",
          userId
        )
        .maybeSingle<{
          staff_id:
            string | null;

          personnel_record_no:
            string | null;

          referral_code:
            string | null;
        }>();

    if (identifierError) {
      adminWarn(
        "staff_personnel_identifier_lookup_failed",
        {
          user_id:
            userId,

          email,

          error:
            identifierError
              .message,
        }
      );
    } else {
      generatedStaffId =
        createdStaffRecord
          ?.staff_id ??
        null;

      generatedPersonnelRecordNo =
        createdStaffRecord
          ?.personnel_record_no ??
        null;

      generatedReferralCode =
        createdStaffRecord
          ?.referral_code ??
        null;
    }
  } catch (error) {
    adminWarn(
      "staff_personnel_identifier_lookup_exception",
      {
        user_id:
          userId,

        email,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      }
    );
  }

  /* ==========================================================
     14. SEND ONE BRANDED RED STONE ACTIVATION EMAIL

     The secure Supabase activation URL is included in the
     Red Stone onboarding email sent through Resend.

     Email failure is intentionally non-fatal because the
     personnel account has already been successfully created.
     The failure is logged for administrative follow-up.
  ========================================================== */

  try {
    const notificationResult =
      await sendStaffWelcomeNotification(
        {
          to:
            email,

          fullName,

          activationUrl,

          staffId:
            generatedStaffId,

          personnelRecordNo:
            generatedPersonnelRecordNo,

          referralCode:
            generatedReferralCode,

          jobTitle,

          department,

          dutyStation,

          employmentType,

          employmentStartDate,

          appointmentDate:
            appointmentDate ||
            null,

          reportingOfficer:
            reportingOfficer ||
            null,

          role:
            validRole,

          workingDaysPerWeek,

          workingHoursPerDay,

          workingHoursPerWeek,

          workSchedule:
            workSchedule ||
            null,

          probationPeriodMonths,
        }
      );

    if (
      !notificationResult.sent
    ) {
      adminWarn(
        "staff_activation_notification_failed",
        {
          user_id:
            userId,

          email,

          reason:
            notificationResult
              .reason,
        }
      );
    } else {
      await logAuditEvent(
        context,
        {
          action:
            "staff_welcome_notification_sent",

          entityType:
            "staff",

          entityId:
            userId,

          description:
            `Sent secure staff onboarding and activation email to ${fullName}`,

          metadata: {
            target_user_id:
              userId,

            email,

            delivery_provider:
              "resend",

            sender:
              process.env
                .RESEND_FROM_EMAIL ||
              "noreply@redstone.co.ke",

            message_id:
              notificationResult
                .messageId ??
              null,
          },
        }
      );
    }
  } catch (error) {
    adminWarn(
      "staff_activation_notification_exception",
      {
        user_id:
          userId,

        email,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      }
    );
  }

  /* ==========================================================
     15. OPEN OFFICIAL PERSONNEL RECORD
  ========================================================== */

  redirect(
    `/admin/staff/${userId}/record`
  );
}