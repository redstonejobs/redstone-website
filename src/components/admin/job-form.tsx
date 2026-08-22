import type { Row } from "@/lib/admin/types";
import { booleanText, textValue } from "@/lib/admin/format";
import {
  BENEFIT_STATUSES,
  CONTRACT_TYPES,
  COST_RESPONSIBILITIES,
  DOCUMENT_TYPES,
  FEE_RELATIONSHIPS,
  JOB_CATEGORIES,
  SALARY_PERIODS,
  SKILL_LEVELS,
} from "@/lib/jobs/catalogue";
import { COUNTRIES } from "@/lib/public/countries";

const statuses = ["draft", "published", "paused", "closed", "archived"];
const processingUnits = ["", "days", "weeks", "months"];
const durationUnits = ["", "months", "years"];

type JobFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  job?: Row | null;
  submitLabel: string;
};

export function JobForm({ action, job, submitLabel }: JobFormProps) {
  return (
    <form action={action} className="grid gap-6">
      <Panel title="Core Vacancy">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="title" label="Job Title" defaultValue={textValue(job, ["title"], "")} required />
          <Field name="slug" label="Slug" defaultValue={textValue(job, ["slug"], "")} required />
          <Field name="employer_id" label="Employer ID" defaultValue={textValue(job, ["employer_id"], "")} />
          <Select name="country" label="Country" defaultValue={textValue(job, ["country"], "")} options={COUNTRIES.map((country) => ({ value: country.name, label: country.name }))} />
          <Field name="city" label="City / Location" defaultValue={textValue(job, ["city"], "")} />
          <Select name="category" label="Category" defaultValue={textValue(job, ["category"], "")} options={JOB_CATEGORIES.map((category) => ({ value: category, label: category }))} />
          <Field name="job_type" label="Job Type" defaultValue={textValue(job, ["job_type"], "")} />
          <Select name="skill_level" label="Skill Level" defaultValue={textValue(job, ["skill_level"], "")} options={SKILL_LEVELS} />
          <Field name="vacancies" label="Vacancies" type="number" min="1" defaultValue={textValue(job, ["vacancies"], "1")} required />
          <Field name="application_deadline" label="Application Deadline" type="date" defaultValue={textValue(job, ["application_deadline"], "")} />
        </div>
      </Panel>

      <Panel title="Description and Requirements">
        <Textarea name="short_description" label="Short Description" rows={3} defaultValue={textValue(job, ["short_description"], "")} />
        <Textarea name="description" label="Full Job Description" rows={8} defaultValue={textValue(job, ["description"], "")} />
        <div className="grid gap-4 md:grid-cols-2">
          <Textarea name="responsibilities" label="Duties / Responsibilities" defaultValue={textValue(job, ["responsibilities"], "")} />
          <Textarea name="requirements" label="Candidate Requirements" defaultValue={textValue(job, ["requirements"], "")} />
          <Textarea name="experience_requirements" label="Experience Requirements" defaultValue={textValue(job, ["experience_requirements"], "")} />
          <Textarea name="education_requirements" label="Education Requirements" defaultValue={textValue(job, ["education_requirements"], "")} />
          <Textarea name="language_requirements" label="Language Requirements" defaultValue={textValue(job, ["language_requirements"], "")} />
          <Textarea name="physical_requirements" label="Physical / Occupational Requirements" defaultValue={textValue(job, ["physical_requirements"], "")} />
        </div>
        <Textarea name="additional_requirements" label="Additional Requirements" defaultValue={textValue(job, ["additional_requirements"], "")} />
      </Panel>

      <Panel title="Salary, Contract and Schedule">
        <div className="grid gap-4 md:grid-cols-3">
          <Field name="salary_min" label="Minimum Salary" type="number" min="0" defaultValue={textValue(job, ["salary_min"], "")} />
          <Field name="salary_max" label="Maximum Salary" type="number" min="0" defaultValue={textValue(job, ["salary_max"], "")} />
          <Field name="currency" label="Currency" defaultValue={textValue(job, ["currency"], "")} />
          <Select name="salary_period" label="Salary Period" defaultValue={textValue(job, ["salary_period"], "")} options={SALARY_PERIODS} />
          <Field name="salary_note" label="Salary Note" defaultValue={textValue(job, ["salary_note"], "")} />
          <Checkbox name="salary_confirmed" label="Salary Confirmed" checked={booleanText(job, ["salary_confirmed"]) === "Yes"} />
          <Select name="contract_type" label="Contract Type" defaultValue={textValue(job, ["contract_type"], "")} options={CONTRACT_TYPES.map((type) => ({ value: type, label: type }))} />
          <Field name="contract_duration_value" label="Contract Duration" type="number" min="0" defaultValue={textValue(job, ["contract_duration_value"], "")} />
          <Select name="contract_duration_unit" label="Duration Unit" defaultValue={textValue(job, ["contract_duration_unit"], "")} options={durationUnits.map((unit) => ({ value: unit, label: unit || "Not set" }))} includeEmpty={false} />
          <Field name="working_hours_per_week" label="Working Hours / Week" type="number" min="0" defaultValue={textValue(job, ["working_hours_per_week"], "")} />
          <Field name="work_schedule" label="Work Schedule" defaultValue={textValue(job, ["work_schedule"], "")} />
          <Field name="overtime_note" label="Overtime Note" defaultValue={textValue(job, ["overtime_note"], "")} />
        </div>
        <Textarea name="contract_note" label="Contract Note" rows={3} defaultValue={textValue(job, ["contract_note"], "")} />
      </Panel>

      <Panel title="Benefits and Responsibilities">
        <div className="grid gap-4 md:grid-cols-3">
          <Select name="sponsorship_status" label="Sponsorship" defaultValue={textValue(job, ["sponsorship_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="accommodation_status" label="Accommodation" defaultValue={textValue(job, ["accommodation_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="meals_status" label="Meals / Food" defaultValue={textValue(job, ["meals_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="transport_status" label="Local Transport" defaultValue={textValue(job, ["transport_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="medical_insurance_status" label="Medical / Insurance" defaultValue={textValue(job, ["medical_insurance_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="air_ticket_status" label="Air Ticket / Flight" defaultValue={textValue(job, ["air_ticket_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Select name="training_status" label="Training" defaultValue={textValue(job, ["training_status"], "not_confirmed")} options={BENEFIT_STATUSES} includeEmpty={false} />
          <Checkbox name="visa_sponsorship" label="Legacy Visa Sponsorship Flag" checked={job?.visa_sponsorship === true} />
          <Checkbox name="accommodation" label="Legacy Accommodation Flag" checked={job?.accommodation === true} />
          <Checkbox name="transport" label="Legacy Transport Flag" checked={job?.transport === true} />
          <Checkbox name="meals" label="Legacy Meals Flag" checked={job?.meals === true} />
        </div>
        <Textarea name="annual_leave_note" label="Annual Leave" rows={3} defaultValue={textValue(job, ["annual_leave_note"], "")} />
        <Textarea name="other_benefits" label="Other Benefits" rows={3} defaultValue={textValue(job, ["other_benefits"], "")} />
      </Panel>

      <Panel title="Fees, Processing and Documents">
        <div className="grid gap-4 md:grid-cols-3">
          <Field name="country_fee_override" label="Job Fee Override Amount" type="number" min="0" defaultValue={textValue(job, ["country_fee_override"], "")} />
          <Field name="country_fee_override_currency" label="Override Currency" defaultValue={textValue(job, ["country_fee_override_currency"], "")} />
          <Select name="fee_relationship" label="Document Fee Relationship" defaultValue={textValue(job, ["fee_relationship"], "not_confirmed")} options={FEE_RELATIONSHIPS} includeEmpty={false} />
          <Field name="processing_time_min" label="Processing Min" type="number" min="0" defaultValue={textValue(job, ["processing_time_min"], "")} />
          <Field name="processing_time_max" label="Processing Max" type="number" min="0" defaultValue={textValue(job, ["processing_time_max"], "")} />
          <Select name="processing_time_unit" label="Processing Unit" defaultValue={textValue(job, ["processing_time_unit"], "")} options={processingUnits.map((unit) => ({ value: unit, label: unit || "Use country default" }))} includeEmpty={false} />
        </div>
        <Textarea name="country_fee_override_note" label="Fee Override Note" rows={3} defaultValue={textValue(job, ["country_fee_override_note"], "")} />
        <Textarea name="processing_time_note" label="Processing Note" rows={3} defaultValue={textValue(job, ["processing_time_note"], "")} />
        <Textarea
          name="document_requirements"
          label="Required Documents"
          rows={7}
          defaultValue={textValue(job, ["document_requirements_text"], "")}
          help={`One per line: document_type|required|fee|responsibility|notes. Types: ${DOCUMENT_TYPES.map((type) => type.value).join(", ")}. Responsibilities: ${COST_RESPONSIBILITIES.map((item) => item.value).join(", ")}.`}
        />
      </Panel>

      <Panel title="Publication">
        <div className="grid gap-4 md:grid-cols-2">
          <Select name="status" label="Status" defaultValue={textValue(job, ["status"], "draft")} options={statuses.map((status) => ({ value: status, label: status }))} includeEmpty={false} />
        </div>
        <button type="submit" className="w-fit min-h-11 rounded-md bg-[#071A3D] px-5 text-sm font-semibold text-white transition hover:bg-[#0B2558]">
          {submitLabel}
        </button>
      </Panel>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#071A3D]">{title}</h2>{children}</section>;
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
  min,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} required={required} min={min} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
    </label>
  );
}

function Textarea({ name, label, defaultValue, rows = 5, help }: { name: string; label: string; defaultValue: string; rows?: number; help?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
  includeEmpty = true,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
  includeEmpty?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
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

function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
      <input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-[#D4AF37]" />
      {label}
    </label>
  );
}
