import { createClient } from "@/utils/supabase/server";
import { JOB_OCCUPATIONS, occupationContentAsText, type JobOccupation } from "@/lib/jobs/catalogue";
import { slugify } from "@/lib/public/countries";
import { assertValid, validateJobForPublication, validateJobPayload } from "./validation";
import type { AdminContext } from "./types";
import { logAuditEvent } from "./audit";

export const GLOBAL_JOB_MATRIX_BATCH_SIZE = 200;
export const GLOBAL_JOB_MATRIX_MODE = "global_active_job_matrix";
export const GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES = 26;
export const GLOBAL_JOB_MATRIX_EXPECTED_TOTAL = JOB_OCCUPATIONS.length * GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES;
export const GLOBAL_JOB_MATRIX_CONFIRMATION =
  "Publishing this campaign can create up to 5,226 live job records on redstone.co.ke. Confirm that every occupation-country combination represents a genuine, currently open vacancy and that Red Stone is authorized by the verified employer to recruit for it.";

type CountryRow = {
  country_name: string;
  processing_time_min: number | null;
  processing_time_max: number | null;
  processing_time_unit: string | null;
  processing_time_note: string | null;
};

type EmployerRow = {
  id: string;
  company_name: string | null;
  verification_status: string | null;
  is_active: boolean | null;
};

type RunConfig = {
  employer_id: string;
  default_vacancies: number;
  application_deadline: string;
  publish_mode: "draft" | "publish";
  salary_tbd: true;
  salary_currency: string | null;
  salary_period: string | null;
  contract_type: string | null;
  contract_duration_value: number | null;
  contract_duration_unit: string | null;
  working_hours_per_week: number | null;
  sponsorship_status: string;
  accommodation_status: string;
  meals_status: string;
  transport_status: string;
  medical_insurance_status: string;
  air_ticket_status: string;
  document_requirements: string;
  countries: string[];
  occupation_slugs: string[];
};

type RunRow = {
  id: string;
  employer_id: string;
  current_offset: number;
  batch_size: number;
  total_combinations: number;
  processed_count: number;
  created_count: number;
  published_count: number;
  skipped_count: number;
  failed_count: number;
  status: string;
  publish_mode: "draft" | "publish";
  config: RunConfig;
};

export function globalMatrixTotal(countryCount = GLOBAL_JOB_MATRIX_EXPECTED_COUNTRIES) {
  return JOB_OCCUPATIONS.length * countryCount;
}

export async function fetchGlobalJobMatrixDashboard() {
  const supabase = await createClient();
  const [{ data: countries }, { data: employers }, { data: runs }] = await Promise.all([
    supabase
      .from("country_recruitment_settings")
      .select("country_name, processing_time_min, processing_time_max, processing_time_unit, processing_time_note")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .returns<CountryRow[]>(),
    supabase
      .from("employers")
      .select("id, company_name, verification_status, is_active")
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .order("company_name", { ascending: true })
      .returns<EmployerRow[]>(),
    supabase
      .from("bulk_job_publication_runs")
      .select("id, status, total_combinations, processed_count, created_count, published_count, skipped_count, failed_count, current_offset, batch_size, publish_mode, created_at, completed_at, config")
      .eq("mode", GLOBAL_JOB_MATRIX_MODE)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<Record<string, unknown>[]>(),
  ]);

  return {
    countryCount: countries?.length ?? 0,
    occupationCount: JOB_OCCUPATIONS.length,
    totalCombinations: globalMatrixTotal(countries?.length ?? 0),
    countries: countries ?? [],
    employers: employers ?? [],
    runs: runs ?? [],
  };
}

export async function createGlobalJobMatrixRun(context: AdminContext, formData: FormData) {
  const employerId = text(formData, "global_employer_id");
  const defaultVacancies = positiveInteger(formData, "global_default_vacancies");
  const applicationDeadline = text(formData, "global_application_deadline");
  const publishMode = text(formData, "global_publish_mode") === "publish" ? "publish" : "draft";
  const confirmation = text(formData, "global_confirmation");

  if (confirmation !== "yes") {
    throw new Error("Global job publication confirmation is required.");
  }

  if (!employerId) {
    throw new Error("Select a verified employer for the global publication run.");
  }

  if (!applicationDeadline) {
    throw new Error("Application deadline is required.");
  }

  if (publishMode === "publish") {
    const deadline = new Date(`${applicationDeadline}T23:59:59.999Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (Number.isNaN(deadline.getTime()) || deadline < today) {
      throw new Error("Published global jobs require a valid future application deadline.");
    }
  }

  const supabase = await createClient();
  const [{ data: countries }, { data: employer, error: employerError }] = await Promise.all([
    supabase
      .from("country_recruitment_settings")
      .select("country_name, processing_time_min, processing_time_max, processing_time_unit, processing_time_note")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .returns<CountryRow[]>(),
    supabase
      .from("employers")
      .select("id, company_name, verification_status, is_active")
      .eq("id", employerId)
      .maybeSingle<EmployerRow>(),
  ]);

  if (employerError || !employer || employer.is_active !== true || employer.verification_status !== "verified") {
    throw new Error("The selected employer must be active and verified.");
  }

  if (!countries?.length) {
    throw new Error("No active country configurations are available.");
  }

  const config: RunConfig = {
    employer_id: employerId,
    default_vacancies: defaultVacancies,
    application_deadline: applicationDeadline,
    publish_mode: publishMode,
    salary_tbd: true,
    salary_currency: nullableText(formData, "global_salary_currency"),
    salary_period: nullableText(formData, "global_salary_period"),
    contract_type: nullableText(formData, "global_contract_type"),
    contract_duration_value: optionalInteger(formData, "global_contract_duration_value"),
    contract_duration_unit: nullableText(formData, "global_contract_duration_unit"),
    working_hours_per_week: optionalNumber(formData, "global_working_hours_per_week"),
    sponsorship_status: text(formData, "global_sponsorship_status") || "not_confirmed",
    accommodation_status: text(formData, "global_accommodation_status") || "not_confirmed",
    meals_status: text(formData, "global_meals_status") || "not_confirmed",
    transport_status: text(formData, "global_transport_status") || "not_confirmed",
    medical_insurance_status: text(formData, "global_medical_insurance_status") || "not_confirmed",
    air_ticket_status: text(formData, "global_air_ticket_status") || "not_confirmed",
    document_requirements: text(formData, "global_document_requirements"),
    countries: countries.map((country) => country.country_name),
    occupation_slugs: JOB_OCCUPATIONS.map((occupation) => occupation.slug),
  };
  const total = config.countries.length * config.occupation_slugs.length;
  const { data: run, error } = await supabase
    .from("bulk_job_publication_runs")
    .insert({
      created_by: context.user.id,
      mode: GLOBAL_JOB_MATRIX_MODE,
      employer_id: employerId,
      total_combinations: total,
      batch_size: GLOBAL_JOB_MATRIX_BATCH_SIZE,
      publish_mode: publishMode,
      config,
      status: "ready",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !run) {
    throw new Error("Unable to create global job publication run.");
  }

  await logAuditEvent(context, {
    action: "global_job_run_created",
    entityType: "bulk_job_publication_run",
    entityId: run.id,
    description: `Global job matrix run created for ${total} combinations`,
    metadata: {
      employer_id: employerId,
      employer_name: employer.company_name,
      total_combinations: total,
      publish_mode: publishMode,
    },
  });

  return run.id;
}

export async function processGlobalJobMatrixBatch(context: AdminContext, runId: string) {
  const supabase = await createClient();
  const { data: run, error: runError } = await supabase
    .from("bulk_job_publication_runs")
    .select("*")
    .eq("id", runId)
    .maybeSingle<RunRow>();

  if (runError || !run) {
    throw new Error("Unable to load global publication run.");
  }

  if (["completed", "cancelled"].includes(run.status)) {
    throw new Error("This publication run is already closed.");
  }

  const countries = await countriesForRun(supabase, run.config.countries);
  const batchStart = run.current_offset;
  const batchEnd = Math.min(batchStart + run.batch_size, run.total_combinations);
  const batchNumber = Math.floor(batchStart / run.batch_size) + 1;
  const stats = { processed: 0, created: 0, published: 0, skipped: 0, failed: 0 };

  await supabase.from("bulk_job_publication_runs").update({ status: "processing" }).eq("id", run.id);

  for (let index = batchStart; index < batchEnd; index += 1) {
    const combination = combinationAt(index, run.config, countries);
    if (!combination) {
      stats.failed += 1;
      stats.processed += 1;
      continue;
    }

    try {
      const jobSlug = stableGlobalSlug(
        combination.occupation,
        combination.country.country_name,
        run.employer_id,
        run.config.application_deadline
      );

      const duplicate = await findGlobalDuplicate(supabase, jobSlug);

      if (duplicate) {
        stats.skipped += 1;
        await recordItem(
          supabase,
          run.id,
          combination,
          run.employer_id,
          batchNumber,
          "duplicate_skipped",
          duplicate,
          null
        );
        await logAuditEvent(context, {
          action: "global_job_duplicate_skipped",
          entityType: "job",
          entityId: duplicate,
          description: "Global job matrix duplicate skipped",
          metadata: itemMetadata(combination, run.employer_id),
        });
        stats.processed += 1;
        continue;
      }

      const basePayload = globalJobPayload(
        run.config,
        run.employer_id,
        context.user.id,
        combination
      );

      let payload: Record<string, unknown> = basePayload;
      let status: "created" | "published" = "created";

      if (run.publish_mode === "publish") {
        const validation = validateJobForPublication(basePayload);

        if (!validation.ok) {
          const validationError = validation.errors.join(" ");
          stats.failed += 1;
          await recordItem(
            supabase,
            run.id,
            combination,
            run.employer_id,
            batchNumber,
            "validation_failed",
            null,
            validationError
          );
          await logAuditEvent(context, {
            action: "global_job_validation_failed",
            entityType: "bulk_job_publication_run",
            entityId: run.id,
            description: "Global job matrix item failed publication validation",
            metadata: {
              ...itemMetadata(combination, run.employer_id),
            },
          });
          stats.processed += 1;
          continue;
        }

        payload = {
          ...basePayload,
          status: "published",
          published_at: new Date().toISOString(),
        };
        status = "published";
      }

      const validatedPayload = assertValid(validateJobPayload(payload));
      const { data: job, error: insertError } = await supabase
        .from("jobs")
        .insert(validatedPayload)
        .select("id")
        .single<{ id: string }>();

      if (insertError || !job) {
        throw new Error(insertError?.message || "Unable to create job.");
      }

      await insertGlobalDocumentRequirements(
        supabase,
        job.id,
        run.config.document_requirements,
        combination.occupation
      );
      await recordItem(
        supabase,
        run.id,
        combination,
        run.employer_id,
        batchNumber,
        status,
        job.id,
        null
      );
      stats.created += 1;
      if (status === "published") stats.published += 1;

      await logAuditEvent(context, {
        action: status === "published" ? "global_job_published" : "global_job_created",
        entityType: "job",
        entityId: job.id,
        description: status === "published" ? "Global job matrix job created and published" : "Global job matrix job created as draft",
        metadata: {
          ...itemMetadata(combination, run.employer_id),
        },
      });
    } catch (error) {
      stats.failed += 1;
      await recordItem(supabase, run.id, combination, run.employer_id, batchNumber, "failed", null, error instanceof Error ? error.message : "Unknown failure");
      await logAuditEvent(context, {
        action: "global_job_validation_failed",
        entityType: "bulk_job_publication_run",
        entityId: run.id,
        description: "Global job matrix item failed",
        metadata: {
          ...itemMetadata(combination, run.employer_id),
          error: error instanceof Error ? error.message : "Unknown failure",
        },
      });
    }

    stats.processed += 1;
  }

  const nextOffset = batchEnd;
  const completed = nextOffset >= run.total_combinations;
  const payload = {
    processed_count: run.processed_count + stats.processed,
    created_count: run.created_count + stats.created,
    published_count: run.published_count + stats.published,
    skipped_count: run.skipped_count + stats.skipped,
    failed_count: run.failed_count + stats.failed,
    current_offset: nextOffset,
    status: completed ? "completed" : "paused",
    completed_at: completed ? new Date().toISOString() : null,
  };

  const { error: updateError } = await supabase.from("bulk_job_publication_runs").update(payload).eq("id", run.id);
  if (updateError) {
    throw new Error("Unable to update global publication run progress.");
  }

  await logAuditEvent(context, {
    action: completed ? "global_job_run_completed" : "global_job_batch_processed",
    entityType: "bulk_job_publication_run",
    entityId: run.id,
    description: completed ? "Global job matrix run completed" : `Global job matrix batch ${batchNumber} processed`,
    metadata: {
      batch_number: batchNumber,
      batch_start: batchStart,
      batch_end: batchEnd,
      ...stats,
    },
  });
}

export async function cancelGlobalJobMatrixRun(context: AdminContext, runId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bulk_job_publication_runs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", runId);

  if (error) {
    throw new Error("Unable to cancel global publication run.");
  }

  await logAuditEvent(context, {
    action: "global_job_run_cancelled",
    entityType: "bulk_job_publication_run",
    entityId: runId,
    description: "Global job matrix run cancelled",
  });
}

function globalJobPayload(
  config: RunConfig,
  employerId: string,
  createdBy: string,
  combination: { country: CountryRow; occupation: JobOccupation }
) {
  const { occupation, country } = combination;
  const content = buildCountryAwareJobContent(occupation, country);
  const sponsorshipConfirmed = config.sponsorship_status === "included";
  const accommodationConfirmed = config.accommodation_status === "included";
  const mealsConfirmed = config.meals_status === "included";
  const transportConfirmed = config.transport_status === "included";

  return {
    title: occupation.name,
    slug: stableGlobalSlug(
      occupation,
      country.country_name,
      employerId,
      config.application_deadline
    ),
    employer_id: employerId,
    created_by: createdBy,
    country: country.country_name,
    city: null,
    category: occupation.category,
    job_type: null,
    skill_level: occupation.skill_level,

    short_description: content.short_description,
    description: content.description,
    responsibilities: content.responsibilities,
    requirements: content.requirements,
    experience_requirements: content.experience_requirements,
    education_requirements: content.education_requirements,
    language_requirements: content.language_requirements,
    physical_requirements: content.physical_requirements,
    additional_requirements: content.additional_requirements,

    salary_min: null,
    salary_max: null,
    currency: config.salary_currency,
    salary_period: config.salary_period,
    salary_confirmed: false,
    salary_note: "Salary and compensation are to be confirmed by the employer for this specific vacancy.",

    contract_type: config.contract_type,
    contract_duration_value: config.contract_duration_value,
    contract_duration_unit: config.contract_duration_unit,
    contract_note: config.contract_type ? null : "Contract terms are to be confirmed by the employer.",
    working_hours_per_week: config.working_hours_per_week,
    work_schedule: null,
    overtime_note: null,

    vacancies: config.default_vacancies,
    application_deadline: config.application_deadline,

    visa_sponsorship: sponsorshipConfirmed,
    accommodation_provided: accommodationConfirmed,
    transport_provided: transportConfirmed,
    meals_provided: mealsConfirmed,

    sponsorship_status: config.sponsorship_status,
    accommodation_status: config.accommodation_status,
    meals_status: config.meals_status,
    transport_status: config.transport_status,
    medical_insurance_status: config.medical_insurance_status,
    air_ticket_status: config.air_ticket_status,
    training_status: "not_confirmed",
    annual_leave_note: null,
    other_benefits: null,

    country_fee_override: null,
    country_fee_override_currency: null,
    country_fee_override_note: null,
    fee_relationship: "not_confirmed",

    processing_time_min: country.processing_time_min,
    processing_time_max: country.processing_time_max,
    processing_time_unit: country.processing_time_unit,
    processing_time_note:
      country.processing_time_note ||
      "Processing time varies by employer, vacancy, immigration process and destination authority.",

    status: "draft",
    published_at: null,
  };
}

function buildCountryAwareJobContent(occupation: JobOccupation, country: CountryRow) {
  const base = occupationContentAsText(occupation);
  const destination = country.country_name;
  const processing = formatProcessingGuidance(country);

  const shortDescription =
    `${occupation.name} vacancy in ${destination}. Review the role, requirements, application deadline and employer-confirmed recruitment terms before applying.`;

  const destinationIntro =
    `${occupation.name} opportunity in ${destination}. ` +
    `This page describes the role, candidate expectations and destination-specific recruitment information for applicants considering this vacancy.`;

  const transparencyNote =
    `Applicants should rely on the confirmed vacancy record and official Red Stone communication for final employment terms. ` +
    `Salary, benefits, sponsorship, work location and immigration requirements must not be assumed unless they are explicitly confirmed for this vacancy.`;

  return {
    short_description: shortDescription,
    description: [destinationIntro, base.description, processing, transparencyNote].filter(Boolean).join("\n\n"),
    responsibilities: base.responsibilities,
    requirements: base.requirements,
    experience_requirements: base.experience_requirements,
    education_requirements: base.education_requirements,
    language_requirements: base.language_requirements,
    physical_requirements: base.physical_requirements,
    additional_requirements:
      `Destination: ${destination}. Candidates must provide accurate identity and application information, meet the employer's confirmed requirements, ` +
      `and comply with any lawful document, medical, licensing, language or immigration requirements that apply to the role.`,
  };
}

function formatProcessingGuidance(country: CountryRow) {
  const { processing_time_min: min, processing_time_max: max, processing_time_unit: unit, processing_time_note: note } = country;

  if (note?.trim()) {
    return `Recruitment and processing guidance for ${country.country_name}: ${note.trim()}`;
  }

  if (min !== null && max !== null && unit) {
    const range = min === max ? `${min}` : `${min}-${max}`;
    return `Recruitment and processing guidance for ${country.country_name}: approximately ${range} ${unit}, subject to employer and authority requirements.`;
  }

  return `Recruitment and processing timelines for ${country.country_name} depend on the employer, vacancy and relevant authorities.`;
}

function stableGlobalSlug(
  occupation: JobOccupation,
  country: string,
  employerId: string,
  applicationDeadline: string
) {
  const deadlineToken = applicationDeadline.replace(/[^0-9]/g, "");
  return [
    occupation.slug,
    slugify(country),
    employerId.slice(0, 8),
    deadlineToken,
  ]
    .filter(Boolean)
    .join("-");
}

function combinationAt(index: number, config: RunConfig, countries: CountryRow[]) {
  const countryIndex = Math.floor(index / config.occupation_slugs.length);
  const occupationIndex = index % config.occupation_slugs.length;
  const country = countries[countryIndex];
  const occupationSlug = config.occupation_slugs[occupationIndex];
  const occupation = JOB_OCCUPATIONS.find((item) => item.slug === occupationSlug);
  return country && occupation ? { country, occupation } : null;
}

async function countriesForRun(supabase: Awaited<ReturnType<typeof createClient>>, countryNames: string[]) {
  const { data } = await supabase
    .from("country_recruitment_settings")
    .select("country_name, processing_time_min, processing_time_max, processing_time_unit, processing_time_note")
    .in("country_name", countryNames)
    .returns<CountryRow[]>();
  const byName = new Map((data ?? []).map((country) => [country.country_name, country]));
  return countryNames.map((country) => byName.get(country)).filter((country): country is CountryRow => Boolean(country));
}

async function findGlobalDuplicate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string
) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id")
    .eq("slug", slug)
    .neq("status", "archived")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error("Unable to check for duplicate global vacancy.");
  }

  return data?.id ?? null;
}

async function insertGlobalDocumentRequirements(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  configuredText: string,
  occupation: JobOccupation
) {
  const rows = documentRequirementRows(jobId, configuredText, occupation);
  if (!rows.length) return;
  const { error } = await supabase.from("job_document_requirements").insert(rows);
  if (error) {
    throw new Error("Unable to save global job document requirements.");
  }
}

function documentRequirementRows(jobId: string, configuredText: string, occupation: JobOccupation) {
  const configured = configuredText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const baseline = configured.length ? configured : baselineDocuments(occupation);

  return baseline.map((line, index) => {
    const [documentType, required = "required", fee = "fee", responsibility = "candidate", ...notes] = line.split("|").map((part) => part.trim());
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
  });
}

function baselineDocuments(occupation: JobOccupation) {
  const docs = ["passport|required|fee|candidate", "cv_cover_letter|required|fee|candidate"];
  if (occupation.skill_level === "skilled") docs.push("trade_certificate|optional|fee|candidate");
  if (occupation.skill_level === "professional") {
    docs.push("academic_certificate|optional|fee|candidate");
    docs.push("professional_certificate|optional|fee|candidate");
  }
  return docs;
}

async function recordItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  runId: string,
  combination: { country: CountryRow; occupation: JobOccupation },
  employerId: string,
  batchNumber: number,
  status: string,
  jobId: string | null,
  errorMessage: string | null
) {
  await supabase.from("bulk_job_publication_items").upsert(
    {
      run_id: runId,
      occupation_slug: combination.occupation.slug,
      occupation_title: combination.occupation.name,
      country: combination.country.country_name,
      employer_id: employerId,
      job_id: jobId,
      status,
      error_message: errorMessage,
      batch_number: batchNumber,
    },
    { onConflict: "run_id,occupation_slug,country,employer_id" }
  );
}

function itemMetadata(combination: { country: CountryRow; occupation: JobOccupation }, employerId: string) {
  return {
    occupation_slug: combination.occupation.slug,
    occupation_title: combination.occupation.name,
    country: combination.country.country_name,
    employer_id: employerId,
    global_active_job_matrix: true,
  };
}

function text(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function positiveInteger(formData: FormData, key: string) {
  const parsed = Number(text(formData, key));
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be greater than zero.`);
  }
  return parsed;
}

function optionalInteger(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${key} must be a whole number zero or greater.`);
  }
  return parsed;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} must be zero or greater.`);
  }
  return parsed;
}
