import Link from "next/link";
import { BulkCreateControls } from "@/components/admin/bulk-create-controls";
import { ConfirmAction } from "@/components/admin/confirm-action";
import {
  bulkCreateJobs,
  cancelGlobalJobPublicationRun,
  createGlobalJobPublicationRun,
  processGlobalJobPublicationBatch,
} from "@/lib/admin/actions";
import { BULK_JOB_LIMIT, BULK_JOB_WARNING, bulkJobFieldName } from "@/lib/admin/bulk-jobs";
import { requireAdmin } from "@/lib/admin/auth";
import { fetchCountrySettings } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";
import { createClient } from "@/utils/supabase/server";
import { formatMoney } from "@/lib/jobs/costs";
import {
  GLOBAL_JOB_MATRIX_BATCH_SIZE,
  GLOBAL_JOB_MATRIX_CONFIRMATION,
  GLOBAL_JOB_MATRIX_EXPECTED_TOTAL,
  fetchGlobalJobMatrixDashboard,
} from "@/lib/admin/global-job-matrix";
import {
  BENEFIT_STATUSES,
  CONTRACT_TYPES,
  COST_RESPONSIBILITIES,
  DOCUMENT_TYPES,
  FEE_RELATIONSHIPS,
  JOB_CATEGORIES,
  JOB_OCCUPATIONS,
  SALARY_PERIODS,
  SKILL_LEVELS,
  type CatalogueOption,
  type JobOccupation,
} from "@/lib/jobs/catalogue";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DraftCombination = {
  key: string;
  country: string;
  employer: Row;
  occupation: JobOccupation;
};

const durationUnits = [
  { value: "", label: "Not set" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

const processingUnits = [
  { value: "", label: "Use country default" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
];

const defaultKeys = [
  "default_city",
  "default_vacancies",
  "default_application_deadline",
  "default_currency",
  "default_salary_period",
  "default_contract_type",
  "default_contract_duration_value",
  "default_contract_duration_unit",
  "default_working_hours_per_week",
  "default_processing_time_min",
  "default_processing_time_max",
  "default_processing_time_unit",
  "default_sponsorship_status",
  "default_accommodation_status",
  "default_meals_status",
  "default_transport_status",
  "default_medical_insurance_status",
  "default_air_ticket_status",
  "default_salary_tbd",
  "default_document_requirements",
] as const;

export default async function BulkCreateJobsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const selectedCountries = arrayParam(params, "country");
  const selectedEmployerIds = arrayParam(params, "employer_id");
  const selectedSlugs = arrayParam(params, "occupation");
  const [{ rows: countries }, employers, globalMatrix] = await Promise.all([
    fetchCountrySettings(),
    fetchValidEmployers(),
    fetchGlobalJobMatrixDashboard(),
  ]);
  const defaults = defaultValues(params);
  const activeCountries = countries.filter((item) => item.is_active !== false);
  const activeCountryNames = new Set(activeCountries.map((item) => textValue(item, ["country_name"], "")));
  const employerMap = new Map(employers.map((employer) => [textValue(employer, ["id"], ""), employer]));
  const selectedOccupations = selectedSlugs
    .map((slug) => JOB_OCCUPATIONS.find((occupation) => occupation.slug === slug))
    .filter((occupation): occupation is JobOccupation => Boolean(occupation));
  const combinations = selectedCountries
    .filter((country) => activeCountryNames.has(country))
    .flatMap((country) =>
      selectedEmployerIds.flatMap((employerId) => {
        const employer = employerMap.get(employerId);
        if (!employer) return [];

        return selectedOccupations.map((occupation, index) => ({
          key: `${index}-${occupation.slug}-${employerId.slice(0, 8)}-${country.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          country,
          employer,
          occupation,
        }));
      })
    );
  const combinationCount = selectedCountries.length * selectedEmployerIds.length * selectedOccupations.length;
  const exceedsLimit = combinationCount > BULK_JOB_LIMIT;
  const hasMinimumSelections = selectedCountries.length > 0 && selectedEmployerIds.length > 0 && selectedOccupations.length > 0;
  const duplicatePreview = hasMinimumSelections && !exceedsLimit
    ? await fetchDuplicatePreview(combinations, defaults)
    : { existing: 0, newDrafts: combinations.length };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">Bulk Create Draft Vacancies</h1>
          <p className="mt-1 text-sm text-slate-600">
            Select multiple countries, employers and occupations, then prepare real draft vacancies for review.
          </p>
        </div>
        <Link href="/admin/jobs" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#071A3D]">
          Back to Jobs
        </Link>
      </div>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
        {BULK_JOB_WARNING}
      </section>

      <GlobalMatrixPanel employers={employers} matrix={globalMatrix} />

      <BulkCreateControls
        countries={activeCountries.map((item) => ({
          value: textValue(item, ["country_name"], ""),
          label: textValue(item, ["country_name"], ""),
          description: countryFeeText(item),
        }))}
        employers={employers.map((employer) => ({
          value: textValue(employer, ["id"], ""),
          label: textValue(employer, ["company_name"], "Employer"),
          description: `${textValue(employer, ["country"], "country not set")} / verified`,
        }))}
        occupations={JOB_OCCUPATIONS.map((occupation) => ({
          value: occupation.slug,
          label: occupation.name,
          group: occupation.category,
          description: occupation.skill_level.replaceAll("_", " "),
        }))}
        defaultCountries={selectedCountries}
        defaultEmployers={selectedEmployerIds}
        defaultOccupations={selectedSlugs}
        defaults={defaults}
        limit={BULK_JOB_LIMIT}
      />

      {hasMinimumSelections ? (
        <section className={`rounded-lg border p-5 text-sm font-semibold ${exceedsLimit ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-700"}`}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Detail label="Selected combinations" value={String(combinationCount)} />
            <Detail label="Existing / skipped" value={exceedsLimit ? "Blocked" : String(duplicatePreview.existing)} />
            <Detail label="New drafts to create" value={exceedsLimit ? "0" : String(duplicatePreview.newDrafts)} />
          </div>
          {exceedsLimit ? (
            <p className="mt-4">This selection exceeds the safe maximum of {BULK_JOB_LIMIT} generated draft rows. Reduce countries, employers or occupations before preparing drafts.</p>
          ) : null}
        </section>
      ) : null}

      {hasMinimumSelections && !exceedsLimit ? (
        <form action={bulkCreateJobs} className="space-y-6">
          {combinations.map((draft, index) => (
            <VacancyDraftPanel
              key={draft.key}
              draft={draft}
              countries={countries}
              defaults={defaults}
              index={index}
            />
          ))}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
            Every generated vacancy will be saved as a draft. Existing duplicates will be skipped by the server before insert.
          </section>
          <button type="submit" className="w-full rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D] sm:w-fit">
            Create Draft Vacancies
          </button>
        </form>
      ) : null}
    </div>
  );
}

function GlobalMatrixPanel({
  employers,
  matrix,
}: {
  employers: Row[];
  matrix: Awaited<ReturnType<typeof fetchGlobalJobMatrixDashboard>>;
}) {
  const estimatedBatches = Math.ceil(matrix.totalCombinations / GLOBAL_JOB_MATRIX_BATCH_SIZE);

  return (
    <section className="grid gap-5 rounded-lg border border-[#D4AF37]/50 bg-[#FFF8DF] p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#B8860B]">Global Active Job Matrix</p>
          <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Publish the confirmed 201 x 26 campaign in safe batches</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
            This creates country-specific rows in the existing jobs table. The run is durable, resumable and processed in batches of {GLOBAL_JOB_MATRIX_BATCH_SIZE}; it is never run during build, migration, deploy or startup.
          </p>
        </div>
        <div className="grid gap-2 rounded-md bg-white p-4 text-sm font-bold text-[#071A3D] shadow-sm">
          <span>Occupations: {matrix.occupationCount}</span>
          <span>Countries: {matrix.countryCount}</span>
          <span>Total jobs: {matrix.totalCombinations}</span>
          <span>Expected matrix: {GLOBAL_JOB_MATRIX_EXPECTED_TOTAL}</span>
          <span>Estimated batches: {estimatedBatches}</span>
        </div>
      </div>

      <form action={createGlobalJobPublicationRun} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            name="global_employer_id"
            label="Verified Employer / Programme"
            options={employers.map((employer) => ({
              value: textValue(employer, ["id"], ""),
              label: `${textValue(employer, ["company_name"], "Employer")} (${textValue(employer, ["country"], "country not set")})`,
            }))}
            required
          />
          <Field name="global_default_vacancies" label="Default vacancies per job" type="number" min="1" required />
          <Field name="global_application_deadline" label="Application deadline" type="date" required />
          <Select
            name="global_publish_mode"
            label="Run mode"
            options={[
              { value: "draft", label: "Create Drafts Only" },
              { value: "publish", label: "Create & Publish Validated Jobs" },
            ]}
            includeEmpty={false}
          />
          <Field name="global_salary_currency" label="Salary Currency" />
          <Select name="global_salary_period" label="Salary Period" options={SALARY_PERIODS} />
          <Field name="global_contract_type" label="Default Contract Type" />
          <Field name="global_contract_duration_value" label="Default Duration" type="number" min="0" />
          <Select name="global_contract_duration_unit" label="Duration Unit" options={durationUnits} includeEmpty={false} />
          <Field name="global_working_hours_per_week" label="Working Hours / Week" type="number" min="0" />
          <Select name="global_sponsorship_status" label="Sponsorship" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="global_accommodation_status" label="Accommodation" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="global_meals_status" label="Meals" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="global_transport_status" label="Transport" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="global_medical_insurance_status" label="Insurance" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="global_air_ticket_status" label="Flight" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        </div>
        <Textarea
          name="global_document_requirements"
          label="Required-document defaults"
          rows={4}
          help={`Leave blank to use baseline documents by skill level. One per line: document_type|required|fee|responsibility|notes. Types: ${DOCUMENT_TYPES.map((type) => type.value).join(", ")}.`}
        />
        <label className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          <input name="global_confirmation" type="checkbox" value="yes" className="mt-1 h-4 w-4 accent-[#D4AF37]" required />
          <span>{GLOBAL_JOB_MATRIX_CONFIRMATION}</span>
        </label>
        <button type="submit" className="w-full rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white sm:w-fit">
          Review Global Publication
        </button>
      </form>

      <div className="grid gap-3">
        <h3 className="text-lg font-black text-[#071A3D]">Recent Global Runs</h3>
        {matrix.runs.length ? (
          matrix.runs.map((run) => (
            <article key={String(run.id)} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <Detail label="Status" value={String(run.status ?? "ready")} />
                <Detail label="Created" value={String(run.created_count ?? 0)} />
                <Detail label="Published" value={String(run.published_count ?? 0)} />
                <Detail label="Skipped" value={String(run.skipped_count ?? 0)} />
                <Detail label="Failed" value={String(run.failed_count ?? 0)} />
                <Detail label="Remaining" value={String(Number(run.total_combinations ?? 0) - Number(run.processed_count ?? 0))} />
              </div>
              <div className="flex flex-wrap gap-3">
                {!["completed", "cancelled"].includes(String(run.status ?? "")) ? (
                  <ConfirmAction
                    action={processGlobalJobPublicationBatch}
                    label="Process Next Batch"
                    message="Process the next bounded batch for this global job matrix run?"
                    tone="gold"
                  >
                    <input type="hidden" name="run_id" value={String(run.id)} />
                  </ConfirmAction>
                ) : null}
                {!["completed", "cancelled"].includes(String(run.status ?? "")) ? (
                  <ConfirmAction
                    action={cancelGlobalJobPublicationRun}
                    label="Cancel Run"
                    message="Cancel this global job matrix run? Existing created jobs will not be deleted."
                    tone="danger"
                  >
                    <input type="hidden" name="run_id" value={String(run.id)} />
                  </ConfirmAction>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">No global matrix runs have been created yet.</p>
        )}
      </div>
    </section>
  );
}

function VacancyDraftPanel({
  draft,
  countries,
  defaults,
  index,
}: {
  draft: DraftCombination;
  countries: Row[];
  defaults: Record<string, string>;
  index: number;
}) {
  const country = countries.find((item) => textValue(item, ["country_name"], "") === draft.country);
  const processingMin = defaults.default_processing_time_min || textValue(country, ["processing_time_min"], "");
  const processingMax = defaults.default_processing_time_max || textValue(country, ["processing_time_max"], "");
  const processingUnit = defaults.default_processing_time_unit || textValue(country, ["processing_time_unit"], "");

  return (
    <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <input type="hidden" name="draft_key" value={draft.key} />
      <input type="hidden" name={field(draft, "occupation_slug")} value={draft.occupation.slug} />
      <input type="hidden" name={field(draft, "country")} value={draft.country} />
      <input type="hidden" name={field(draft, "employer_id")} value={textValue(draft.employer, ["id"])} />
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Draft combination {index + 1}</p>
        <h2 className="mt-1 text-xl font-bold text-[#071A3D]">
          {draft.country} / {textValue(draft.employer, ["company_name"], "Employer")} / {draft.occupation.name}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {draft.occupation.category} / {draft.occupation.skill_level.replaceAll("_", " ")} / {country ? countryFeeText(country) : "Country fee configuration not found"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field name={field(draft, "title")} label="Title" defaultValue={draft.occupation.name} required />
        <Field name={field(draft, "city")} label="City / Location" defaultValue={defaults.default_city} />
        <Select name={field(draft, "category")} label="Category" defaultValue={draft.occupation.category} options={JOB_CATEGORIES.map((category) => ({ value: category, label: category }))} required />
        <Select name={field(draft, "skill_level")} label="Skill Level" defaultValue={draft.occupation.skill_level} options={SKILL_LEVELS} required />
        <Field name={field(draft, "vacancies")} label="Vacancies" type="number" min="1" defaultValue={defaults.default_vacancies || "1"} required />
        <Field name={field(draft, "application_deadline")} label="Application Deadline" type="date" defaultValue={defaults.default_application_deadline} required />
        <Field name={field(draft, "job_type")} label="Job Type" />
        <Field name={field(draft, "currency")} label="Salary Currency" defaultValue={defaults.default_currency} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Checkbox name={field(draft, "salary_tbd")} label="Salary TBD: To be confirmed by employer" checked={defaults.default_salary_tbd !== "off"} />
        <Checkbox name={field(draft, "salary_confirmed")} label="Salary Confirmed" />
        <Select name={field(draft, "salary_period")} label="Salary Period" defaultValue={defaults.default_salary_period} options={SALARY_PERIODS} />
        <Field name={field(draft, "salary_min")} label="Minimum Salary" type="number" min="0" />
        <Field name={field(draft, "salary_max")} label="Maximum Salary" type="number" min="0" />
        <Field name={field(draft, "salary_note")} label="Salary Note" defaultValue="To be confirmed by employer." />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(draft, "contract_type")} label="Contract Type" defaultValue={defaults.default_contract_type} options={CONTRACT_TYPES.map((type) => ({ value: type, label: type }))} />
        <Field name={field(draft, "contract_duration_value")} label="Contract Duration" type="number" min="0" defaultValue={defaults.default_contract_duration_value} />
        <Select name={field(draft, "contract_duration_unit")} label="Duration Unit" defaultValue={defaults.default_contract_duration_unit} options={durationUnits} includeEmpty={false} />
        <Field name={field(draft, "working_hours_per_week")} label="Working Hours / Week" type="number" min="0" defaultValue={defaults.default_working_hours_per_week} />
        <Field name={field(draft, "work_schedule")} label="Work Schedule" />
        <Field name={field(draft, "contract_note")} label="Contract Note" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(draft, "sponsorship_status")} label="Sponsorship" defaultValue={defaults.default_sponsorship_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(draft, "accommodation_status")} label="Accommodation" defaultValue={defaults.default_accommodation_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(draft, "meals_status")} label="Meals" defaultValue={defaults.default_meals_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(draft, "transport_status")} label="Transport" defaultValue={defaults.default_transport_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(draft, "medical_insurance_status")} label="Medical / Insurance" defaultValue={defaults.default_medical_insurance_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(draft, "air_ticket_status")} label="Air Ticket / Flight" defaultValue={defaults.default_air_ticket_status || "not_confirmed"} options={BENEFIT_STATUSES} includeEmpty={false} />
        <Checkbox name={field(draft, "visa_sponsorship")} label="Legacy Visa Sponsorship Flag" />
        <Checkbox name={field(draft, "accommodation")} label="Legacy Accommodation Flag" />
        <Checkbox name={field(draft, "meals")} label="Legacy Meals Flag" />
        <Checkbox name={field(draft, "transport")} label="Legacy Transport Flag" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(draft, "fee_relationship")} label="Fee Relationship" defaultValue="not_confirmed" options={FEE_RELATIONSHIPS} includeEmpty={false} />
        <Field name={field(draft, "country_fee_override")} label="Programme Cost Override" type="number" min="0" />
        <Field name={field(draft, "country_fee_override_currency")} label="Override Currency" />
        <Field name={field(draft, "processing_time_min")} label="Processing Min" type="number" min="0" defaultValue={processingMin} />
        <Field name={field(draft, "processing_time_max")} label="Processing Max" type="number" min="0" defaultValue={processingMax} />
        <Select name={field(draft, "processing_time_unit")} label="Processing Unit" defaultValue={processingUnit} options={processingUnits} includeEmpty={false} />
      </div>
      <Textarea name={field(draft, "country_fee_override_note")} label="Programme Cost Note" rows={3} />
      <Textarea name={field(draft, "processing_time_note")} label="Processing Estimate Note" rows={3} />
      <Textarea name={field(draft, "document_requirements")} label="Required Documents" rows={5} defaultValue={defaults.default_document_requirements} help={`One per line: document_type|required|fee|responsibility|notes. Types: ${DOCUMENT_TYPES.map((type) => type.value).join(", ")}. Responsibilities: ${COST_RESPONSIBILITIES.map((item) => item.value).join(", ")}.`} />

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea name={field(draft, "short_description")} label="Short Description" rows={3} />
        <Textarea name={field(draft, "description")} label={`Description for ${draft.country}`} rows={7} />
        <Textarea name={field(draft, "responsibilities")} label="Responsibilities" rows={5} />
        <Textarea name={field(draft, "requirements")} label="Requirements" rows={5} />
        <Textarea name={field(draft, "experience_requirements")} label="Experience Requirements" rows={4} />
        <Textarea name={field(draft, "education_requirements")} label="Education Requirements" rows={4} />
        <Textarea name={field(draft, "language_requirements")} label="Language Requirements" rows={4} />
        <Textarea name={field(draft, "physical_requirements")} label="Physical Requirements" rows={4} />
      </div>
      <Textarea name={field(draft, "additional_requirements")} label="Additional Requirements" rows={4} />
    </section>
  );
}

async function fetchValidEmployers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employers")
    .select("id, company_name, country, verification_status, is_active")
    .eq("is_active", true)
    .eq("verification_status", "verified")
    .order("company_name", { ascending: true })
    .returns<Row[]>();

  return data ?? [];
}

async function fetchDuplicatePreview(drafts: DraftCombination[], defaults: Record<string, string>) {
  if (!defaults.default_application_deadline) {
    return { existing: 0, newDrafts: drafts.length };
  }

  const supabase = await createClient();
  let existing = 0;

  for (const draft of drafts) {
    let request = supabase
      .from("jobs")
      .select("id")
      .eq("employer_id", textValue(draft.employer, ["id"]))
      .eq("country", draft.country)
      .eq("title", draft.occupation.name)
      .eq("vacancies", Number(defaults.default_vacancies || "1"))
      .eq("application_deadline", defaults.default_application_deadline)
      .neq("status", "archived")
      .limit(1);

    request = defaults.default_city ? request.eq("city", defaults.default_city) : request.is("city", null);
    const { data } = await request.maybeSingle<{ id: string }>();
    if (data?.id) existing += 1;
  }

  return { existing, newDrafts: Math.max(drafts.length - existing, 0) };
}

function field(draft: DraftCombination, key: string) {
  return bulkJobFieldName(draft.key, key);
}

function arrayParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return (Array.isArray(value) ? value : value ? [value] : [])
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultValues(params: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(defaultKeys.map((key) => [key, param(params, key)]));
}

function param(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function countryFeeText(country: Row) {
  return formatMoney(numberOrNull(country.base_recruitment_fee), textValue(country, ["fee_currency"], "KES"));
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#071A3D]">{value}</p>
    </div>
  );
}

function Field({ name, label, type = "text", defaultValue = "", required = false, min }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean; min?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} required={required} min={min} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
    </label>
  );
}

function Textarea({ name, label, rows = 4, help, defaultValue = "" }: { name: string; label: string; rows?: number; help?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function Select({ name, label, defaultValue = "", options, required = false, includeEmpty = true }: { name: string; label: string; defaultValue?: string; options: readonly CatalogueOption[]; required?: boolean; includeEmpty?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} required={required} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal capitalize outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
        {includeEmpty ? <option value="">Not set</option> : null}
        {options.map((option) => (
          <option key={`${name}-${option.value || "empty"}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ name, label, checked = false }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
      <input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-[#D4AF37]" />
      {label}
    </label>
  );
}
