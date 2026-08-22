"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
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
import {
  assertValid,
  validateEmployerPayload,
  validateEmployerTransition,
  validateJobForPublication,
  validateJobPayload,
  validateStaffRole,
} from "./validation";
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

function optionalBulkNumber(formData: FormData, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const raw = bulkJobFieldValue(formData, occupation, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${occupation.name}: ${key} must be zero or greater.`);
  }

  return parsed;
}

function optionalBulkInteger(formData: FormData, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const raw = bulkJobFieldValue(formData, occupation, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${occupation.name}: ${key} must be a whole number zero or greater.`);
  }

  return parsed;
}

function requiredBulkPositiveInteger(formData: FormData, occupation: (typeof JOB_OCCUPATIONS)[number], key: string) {
  const parsed = Number(bulkJobFieldValue(formData, occupation, key));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${occupation.name}: ${key} must be greater than zero.`);
  }

  return parsed;
}

function bulkJobPayload({
  formData,
  occupation,
  creatorId,
  country,
  employerId,
  sequence,
  nonce,
}: {
  formData: FormData;
  occupation: (typeof JOB_OCCUPATIONS)[number];
  creatorId: string;
  country: string;
  employerId: string;
  sequence: number;
  nonce: number;
}) {
  const title = bulkJobFieldValue(formData, occupation, "title") || occupation.name;
  const city = bulkJobFieldValue(formData, occupation, "city");
  const deadline = bulkJobFieldValue(formData, occupation, "application_deadline");
  const salaryTbd = bulkJobCheckboxValue(formData, occupation, "salary_tbd");
  const salaryMin = optionalBulkNumber(formData, occupation, "salary_min");
  const salaryMax = optionalBulkNumber(formData, occupation, "salary_max");
  const currency = bulkJobFieldValue(formData, occupation, "currency");
  const salaryConfirmed = !salaryTbd && bulkJobCheckboxValue(formData, occupation, "salary_confirmed");

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
    category: bulkJobFieldValue(formData, occupation, "category") || occupation.category,
    job_type: bulkJobFieldValue(formData, occupation, "job_type") || null,
    skill_level: bulkJobFieldValue(formData, occupation, "skill_level") || occupation.skill_level,
    short_description: bulkJobFieldValue(formData, occupation, "short_description") || null,
    description: bulkJobFieldValue(formData, occupation, "description") || null,
    responsibilities: bulkJobFieldValue(formData, occupation, "responsibilities") || null,
    requirements: bulkJobFieldValue(formData, occupation, "requirements") || null,
    experience_requirements: bulkJobFieldValue(formData, occupation, "experience_requirements") || null,
    education_requirements: bulkJobFieldValue(formData, occupation, "education_requirements") || null,
    language_requirements: bulkJobFieldValue(formData, occupation, "language_requirements") || null,
    physical_requirements: bulkJobFieldValue(formData, occupation, "physical_requirements") || null,
    additional_requirements: bulkJobFieldValue(formData, occupation, "additional_requirements") || null,
    salary_min: salaryTbd ? null : salaryMin,
    salary_max: salaryTbd ? null : salaryMax,
    currency: salaryTbd ? currency || null : currency,
    salary_period: bulkJobFieldValue(formData, occupation, "salary_period") || null,
    salary_confirmed: salaryConfirmed,
    salary_note: salaryTbd
      ? bulkJobFieldValue(formData, occupation, "salary_note") || "To be confirmed by employer."
      : bulkJobFieldValue(formData, occupation, "salary_note") || null,
    contract_type: bulkJobFieldValue(formData, occupation, "contract_type") || null,
    contract_duration_value: optionalBulkInteger(formData, occupation, "contract_duration_value"),
    contract_duration_unit: bulkJobFieldValue(formData, occupation, "contract_duration_unit") || null,
    contract_note: bulkJobFieldValue(formData, occupation, "contract_note") || null,
    working_hours_per_week: optionalBulkNumber(formData, occupation, "working_hours_per_week"),
    work_schedule: bulkJobFieldValue(formData, occupation, "work_schedule") || null,
    overtime_note: bulkJobFieldValue(formData, occupation, "overtime_note") || null,
    vacancies: requiredBulkPositiveInteger(formData, occupation, "vacancies"),
    application_deadline: deadline,
    visa_sponsorship: bulkJobCheckboxValue(formData, occupation, "visa_sponsorship"),
    accommodation: bulkJobCheckboxValue(formData, occupation, "accommodation"),
    transport: bulkJobCheckboxValue(formData, occupation, "transport"),
    meals: bulkJobCheckboxValue(formData, occupation, "meals"),
    sponsorship_status: bulkJobFieldValue(formData, occupation, "sponsorship_status") || "not_confirmed",
    accommodation_status: bulkJobFieldValue(formData, occupation, "accommodation_status") || "not_confirmed",
    meals_status: bulkJobFieldValue(formData, occupation, "meals_status") || "not_confirmed",
    transport_status: bulkJobFieldValue(formData, occupation, "transport_status") || "not_confirmed",
    medical_insurance_status: bulkJobFieldValue(formData, occupation, "medical_insurance_status") || "not_confirmed",
    air_ticket_status: bulkJobFieldValue(formData, occupation, "air_ticket_status") || "not_confirmed",
    training_status: bulkJobFieldValue(formData, occupation, "training_status") || "not_confirmed",
    annual_leave_note: bulkJobFieldValue(formData, occupation, "annual_leave_note") || null,
    other_benefits: bulkJobFieldValue(formData, occupation, "other_benefits") || null,
    country_fee_override: optionalBulkNumber(formData, occupation, "country_fee_override"),
    country_fee_override_currency: bulkJobFieldValue(formData, occupation, "country_fee_override_currency") || null,
    country_fee_override_note: bulkJobFieldValue(formData, occupation, "country_fee_override_note") || null,
    fee_relationship: bulkJobFieldValue(formData, occupation, "fee_relationship") || "not_confirmed",
    processing_time_min: optionalBulkInteger(formData, occupation, "processing_time_min"),
    processing_time_max: optionalBulkInteger(formData, occupation, "processing_time_max"),
    processing_time_unit: bulkJobFieldValue(formData, occupation, "processing_time_unit") || null,
    processing_time_note: bulkJobFieldValue(formData, occupation, "processing_time_note") || null,
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

  const country = value(formData, "country");
  const employerId = value(formData, "employer_id");
  const occupationSlugs = formData
    .getAll("occupation_slug")
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  if (!country) {
    throw new Error("Country is required.");
  }

  if (!employerId) {
    throw new Error("Employer is required.");
  }

  if (occupationSlugs.length === 0) {
    throw new Error("Select at least one occupation.");
  }

  if (occupationSlugs.length > BULK_JOB_LIMIT) {
    throw new Error(`Create ${BULK_JOB_LIMIT} or fewer vacancies at a time.`);
  }

  const selectedOccupations = occupationSlugs.map((slug) => {
    const occupation = JOB_OCCUPATIONS.find((item) => item.slug === slug);
    if (!occupation) {
      throw new Error("A selected occupation is not in the approved catalogue.");
    }
    return occupation;
  });

  const supabase = await createClient();
  const { data: employer, error: employerError } = await supabase
    .from("employers")
    .select("id, company_name, is_active")
    .eq("id", employerId)
    .maybeSingle<{ id: string; company_name: string | null; is_active: boolean | null }>();

  if (employerError || !employer || employer.is_active !== true) {
    throw new Error("Select an active employer before creating vacancies.");
  }

  const nonce = Date.now();
  const createdIds: string[] = [];
  const createdTitles: string[] = [];

  for (const [index, occupation] of selectedOccupations.entries()) {
    const payload = bulkJobPayload({
      formData,
      occupation,
      creatorId: context.user.id,
      country,
      employerId,
      sequence: index,
      nonce,
    });
    const duplicateId = await findDuplicateBulkJob(payload);

    if (duplicateId) {
      throw new Error(`${payload.title} already exists for this employer, country, vacancy count and deadline.`);
    }

    const { data, error } = await supabase.from("jobs").insert(payload).select("id, title").single();

    if (error || !data) {
      throw new Error(`Unable to create draft vacancy for ${occupation.name}.`);
    }

    const documentRows = documentRequirementsRowsFromText(
      bulkJobFieldValue(formData, occupation, "document_requirements"),
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
        bulk_create: true,
      },
    });
  }

  await logAuditEvent(context, {
    action: "bulk_job_creation",
    entityType: "job",
    description: `Bulk draft job creation: ${createdIds.length} vacancies`,
    metadata: {
      job_ids: createdIds,
      titles: createdTitles,
      country,
      employer_id: employerId,
      employer_name: employer.company_name,
    },
  });

  redirect(`/admin/jobs/bulk-create/review?ids=${encodeURIComponent(createdIds.join(","))}`);
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
