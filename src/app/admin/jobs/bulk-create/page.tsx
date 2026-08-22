import Link from "next/link";
import { bulkCreateJobs } from "@/lib/admin/actions";
import { BULK_JOB_LIMIT, BULK_JOB_WARNING, bulkJobFieldName } from "@/lib/admin/bulk-jobs";
import { requireAdmin } from "@/lib/admin/auth";
import { fetchCountrySettings } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";
import { createClient } from "@/utils/supabase/server";
import { formatMoney } from "@/lib/jobs/costs";
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

export default async function BulkCreateJobsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const country = param(params, "country");
  const employerId = param(params, "employer_id");
  const selectedSlugs = params.occupation
    ? (Array.isArray(params.occupation) ? params.occupation : [params.occupation]).slice(0, BULK_JOB_LIMIT)
    : [];
  const selectedOccupations = selectedSlugs
    .map((slug) => JOB_OCCUPATIONS.find((occupation) => occupation.slug === slug))
    .filter((occupation): occupation is JobOccupation => Boolean(occupation));
  const [{ rows: countries }, employers] = await Promise.all([fetchCountrySettings(), fetchActiveEmployers()]);
  const selectedCountry = countries.find((item) => textValue(item, ["country_name"], "") === country);
  const selectedEmployer = employers.find((employer) => textValue(employer, ["id"], "") === employerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">Bulk Create Draft Vacancies</h1>
          <p className="mt-1 text-sm text-slate-600">
            Convert selected catalogue occupations into real draft vacancies for review.
          </p>
        </div>
        <Link href="/admin/jobs" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#071A3D]">
          Back to Jobs
        </Link>
      </div>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
        {BULK_JOB_WARNING}
      </section>

      <form method="get" className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <Select
            name="country"
            label="Country"
            defaultValue={country}
            required
            options={countries
              .filter((item) => item.is_active !== false)
              .map((item) => ({
                value: textValue(item, ["country_name"], ""),
                label: textValue(item, ["country_name"], ""),
              }))}
          />
          <Select
            name="employer_id"
            label="Employer"
            defaultValue={employerId}
            required
            options={employers.map((employer) => ({
              value: textValue(employer, ["id"], ""),
              label: `${textValue(employer, ["company_name"], "Employer")} (${textValue(employer, ["country"], "country not set")})`,
            }))}
          />
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Occupations
            <select
              name="occupation"
              multiple
              required
              defaultValue={selectedSlugs}
              size={12}
              className="min-h-44 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
            >
              {JOB_OCCUPATIONS.map((occupation) => (
                <option key={occupation.slug} value={occupation.slug}>
                  {occupation.name} / {occupation.category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-semibold text-white">
          Prepare Selected Occupations
        </button>
      </form>

      {selectedOccupations.length ? (
        <form action={bulkCreateJobs} className="space-y-6">
          <input type="hidden" name="country" value={country} />
          <input type="hidden" name="employer_id" value={employerId} />
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#071A3D]">Selected Vacancy Context</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Detail label="Country" value={country || "Select a country"} />
              <Detail label="Employer" value={selectedEmployer ? textValue(selectedEmployer, ["company_name"]) : "Select an employer"} />
              <Detail label="Default Programme Cost" value={selectedCountry ? countryFeeText(selectedCountry) : "Use configured country fee"} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Fee amounts shown here come from the existing country fee configuration. Job-level fee override fields below are optional and should only be used when the vacancy has a confirmed programme-specific cost.
            </p>
          </section>

          {selectedOccupations.map((occupation) => (
            <VacancyDraftPanel key={occupation.slug} occupation={occupation} country={country} />
          ))}

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
            Every generated vacancy will be saved as a draft. Review each draft before publishing.
          </section>
          <button type="submit" className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
            Create Draft Vacancies
          </button>
        </form>
      ) : null}
    </div>
  );
}

function VacancyDraftPanel({ occupation, country }: { occupation: JobOccupation; country: string }) {
  return (
    <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="occupation_slug" value={occupation.slug} />
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Catalogue suggestion</p>
        <h2 className="mt-1 text-xl font-bold text-[#071A3D]">{occupation.name}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {occupation.category} / {occupation.skill_level.replaceAll("_", " ")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field name={field(occupation, "title")} label="Title" defaultValue={occupation.name} required />
        <Field name={field(occupation, "city")} label="City / Location" />
        <Select name={field(occupation, "category")} label="Category" defaultValue={occupation.category} options={JOB_CATEGORIES.map((category) => ({ value: category, label: category }))} required />
        <Select name={field(occupation, "skill_level")} label="Skill Level" defaultValue={occupation.skill_level} options={SKILL_LEVELS} required />
        <Field name={field(occupation, "vacancies")} label="Vacancies" type="number" min="1" defaultValue="1" required />
        <Field name={field(occupation, "application_deadline")} label="Application Deadline" type="date" required />
        <Field name={field(occupation, "job_type")} label="Job Type" />
        <Field name={field(occupation, "currency")} label="Salary Currency" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Checkbox name={field(occupation, "salary_tbd")} label="Salary TBD: To be confirmed by employer" checked />
        <Checkbox name={field(occupation, "salary_confirmed")} label="Salary Confirmed" />
        <Select name={field(occupation, "salary_period")} label="Salary Period" options={SALARY_PERIODS} />
        <Field name={field(occupation, "salary_min")} label="Minimum Salary" type="number" min="0" />
        <Field name={field(occupation, "salary_max")} label="Maximum Salary" type="number" min="0" />
        <Field name={field(occupation, "salary_note")} label="Salary Note" defaultValue="To be confirmed by employer." />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(occupation, "contract_type")} label="Contract Type" options={CONTRACT_TYPES.map((type) => ({ value: type, label: type }))} />
        <Field name={field(occupation, "contract_duration_value")} label="Contract Duration" type="number" min="0" />
        <Select name={field(occupation, "contract_duration_unit")} label="Duration Unit" options={durationUnits} includeEmpty={false} />
        <Field name={field(occupation, "working_hours_per_week")} label="Working Hours / Week" type="number" min="0" />
        <Field name={field(occupation, "work_schedule")} label="Work Schedule" />
        <Field name={field(occupation, "contract_note")} label="Contract Note" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(occupation, "sponsorship_status")} label="Sponsorship" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(occupation, "accommodation_status")} label="Accommodation" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(occupation, "meals_status")} label="Meals" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(occupation, "transport_status")} label="Transport" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(occupation, "medical_insurance_status")} label="Medical / Insurance" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Select name={field(occupation, "air_ticket_status")} label="Air Ticket / Flight" defaultValue="not_confirmed" options={BENEFIT_STATUSES} includeEmpty={false} />
        <Checkbox name={field(occupation, "visa_sponsorship")} label="Legacy Visa Sponsorship Flag" />
        <Checkbox name={field(occupation, "accommodation")} label="Legacy Accommodation Flag" />
        <Checkbox name={field(occupation, "meals")} label="Legacy Meals Flag" />
        <Checkbox name={field(occupation, "transport")} label="Legacy Transport Flag" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select name={field(occupation, "fee_relationship")} label="Fee Relationship" defaultValue="not_confirmed" options={FEE_RELATIONSHIPS} includeEmpty={false} />
        <Field name={field(occupation, "country_fee_override")} label="Programme Cost Override" type="number" min="0" />
        <Field name={field(occupation, "country_fee_override_currency")} label="Override Currency" />
        <Field name={field(occupation, "processing_time_min")} label="Processing Min" type="number" min="0" />
        <Field name={field(occupation, "processing_time_max")} label="Processing Max" type="number" min="0" />
        <Select name={field(occupation, "processing_time_unit")} label="Processing Unit" options={processingUnits} includeEmpty={false} />
      </div>
      <Textarea name={field(occupation, "country_fee_override_note")} label="Programme Cost Note" rows={3} />
      <Textarea name={field(occupation, "processing_time_note")} label="Processing Estimate Note" rows={3} />
      <Textarea name={field(occupation, "document_requirements")} label="Required Documents" rows={5} help={`One per line: document_type|required|fee|responsibility|notes. Types: ${DOCUMENT_TYPES.map((type) => type.value).join(", ")}. Responsibilities: ${COST_RESPONSIBILITIES.map((item) => item.value).join(", ")}.`} />

      <div className="grid gap-4 md:grid-cols-2">
        <Textarea name={field(occupation, "short_description")} label="Short Description" rows={3} />
        <Textarea name={field(occupation, "description")} label={`Description for ${country || "selected country"}`} rows={7} />
        <Textarea name={field(occupation, "responsibilities")} label="Responsibilities" rows={5} />
        <Textarea name={field(occupation, "requirements")} label="Requirements" rows={5} />
        <Textarea name={field(occupation, "experience_requirements")} label="Experience Requirements" rows={4} />
        <Textarea name={field(occupation, "education_requirements")} label="Education Requirements" rows={4} />
        <Textarea name={field(occupation, "language_requirements")} label="Language Requirements" rows={4} />
        <Textarea name={field(occupation, "physical_requirements")} label="Physical Requirements" rows={4} />
      </div>
      <Textarea name={field(occupation, "additional_requirements")} label="Additional Requirements" rows={4} />
    </section>
  );
}

async function fetchActiveEmployers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employers")
    .select("id, company_name, country, verification_status, is_active")
    .eq("is_active", true)
    .order("company_name", { ascending: true })
    .returns<Row[]>();

  return data ?? [];
}

function field(occupation: JobOccupation, key: string) {
  return bulkJobFieldName(occupation.slug, key);
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

function Textarea({ name, label, rows = 4, help }: { name: string; label: string; rows?: number; help?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea name={name} rows={rows} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function Select({ name, label, defaultValue = "", options, required = false, includeEmpty = true }: { name: string; label: string; defaultValue?: string; options: readonly CatalogueOption[]; required?: boolean; includeEmpty?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} required={required} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
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
