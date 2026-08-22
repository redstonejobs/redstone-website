import type { Row } from "@/lib/admin/types";
import { textValue } from "@/lib/admin/format";

const statuses = ["draft", "published", "paused", "closed", "archived"];

type JobFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  job?: Row | null;
  submitLabel: string;
};

export function JobForm({ action, job, submitLabel }: JobFormProps) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Job Title" defaultValue={textValue(job, ["title"], "")} required />
        <Field name="slug" label="Slug" defaultValue={textValue(job, ["slug"], "")} required />
        <Field name="employer_id" label="Employer ID" defaultValue={textValue(job, ["employer_id"], "")} />
        <Field name="country" label="Country" defaultValue={textValue(job, ["country"], "")} />
        <Field name="city" label="City" defaultValue={textValue(job, ["city"], "")} />
        <Field name="category" label="Category" defaultValue={textValue(job, ["category"], "")} />
        <Field name="job_type" label="Job Type" defaultValue={textValue(job, ["job_type"], "")} />
        <Field name="skill_level" label="Skill Level" defaultValue={textValue(job, ["skill_level"], "")} />
        <Field name="salary_min" label="Minimum Salary" type="number" min="0" defaultValue={textValue(job, ["salary_min"], "")} />
        <Field name="salary_max" label="Maximum Salary" type="number" min="0" defaultValue={textValue(job, ["salary_max"], "")} />
        <Field name="currency" label="Currency" defaultValue={textValue(job, ["currency"], "KES")} />
        <Field name="salary_period" label="Salary Period" defaultValue={textValue(job, ["salary_period"], "")} />
        <Field
          name="vacancies"
          label="Number of Vacancies"
          type="number"
          min="1"
          defaultValue={textValue(job, ["vacancies"], "1")}
          required
        />
        <Field name="application_deadline" label="Application Deadline" type="date" defaultValue={textValue(job, ["application_deadline"], "")} />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Description
        <textarea
          name="description"
          rows={8}
          defaultValue={textValue(job, ["description"], "")}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-5">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Status
          <select
            name="status"
            defaultValue={textValue(job, ["status"], "draft")}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <Checkbox name="visa_sponsorship" label="Visa Sponsorship" checked={job?.visa_sponsorship === true} />
        <Checkbox name="accommodation" label="Accommodation Provided" checked={job?.accommodation === true} />
        <Checkbox name="transport" label="Transport Provided" checked={job?.transport === true} />
        <Checkbox name="meals" label="Meals Provided" checked={job?.meals === true} />
      </div>

      <div>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#071A3D] px-5 text-sm font-semibold text-white transition hover:bg-[#0B2558]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
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
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      />
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
