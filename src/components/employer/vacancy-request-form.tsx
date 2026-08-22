import type { Row } from "@/lib/admin/types";
import { textValue } from "@/lib/admin/format";
import { BENEFIT_STATUSES, CONTRACT_TYPES, JOB_CATEGORIES, JOB_OCCUPATIONS, SALARY_PERIODS, SKILL_LEVELS } from "@/lib/jobs/catalogue";

export function VacancyRequestForm({ request, action }: { request?: Row | null; action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="grid gap-5 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <datalist id="employer-job-occupation-options">
        {JOB_OCCUPATIONS.map((occupation) => (
          <option key={occupation.slug} value={occupation.name} />
        ))}
      </datalist>
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="title" label="Job Title" defaultValue={textValue(request, ["title"], "")} list="employer-job-occupation-options" required />
        <Select name="category" label="Category" defaultValue={textValue(request, ["category"], "")} options={JOB_CATEGORIES.map((item) => String(item))} />
        <Select name="skill_level" label="Skill Level" defaultValue={textValue(request, ["skill_level"], "")} options={SKILL_LEVELS.map((item) => item.value)} labels={Object.fromEntries(SKILL_LEVELS.map((item) => [item.value, item.label]))} />
        <Field name="country" label="Country" defaultValue={textValue(request, ["country"], "")} />
        <Field name="city" label="City" defaultValue={textValue(request, ["city"], "")} />
        <Field name="job_type" label="Job Type" defaultValue={textValue(request, ["job_type"], "")} />
        <Field name="salary_min" label="Salary Minimum" type="number" min="0" defaultValue={textValue(request, ["salary_min"], "")} />
        <Field name="salary_max" label="Salary Maximum" type="number" min="0" defaultValue={textValue(request, ["salary_max"], "")} />
        <Field name="currency" label="Currency" defaultValue={textValue(request, ["currency"], "")} />
        <Select name="salary_period" label="Salary Period" defaultValue={textValue(request, ["salary_period"], "")} options={SALARY_PERIODS.map((item) => item.value)} labels={Object.fromEntries(SALARY_PERIODS.map((item) => [item.value, item.label]))} />
        <Select name="contract_type" label="Contract Type" defaultValue={textValue(request, ["contract_type"], "")} options={CONTRACT_TYPES.map(String)} />
        <Field name="contract_duration_value" label="Contract Duration" type="number" min="0" defaultValue={textValue(request, ["contract_duration_value"], "")} />
        <Select name="contract_duration_unit" label="Duration Unit" defaultValue={textValue(request, ["contract_duration_unit"], "")} options={["months", "years"]} />
        <Field name="working_hours_per_week" label="Working Hours / Week" type="number" min="0" defaultValue={textValue(request, ["working_hours_per_week"], "")} />
        <Field name="work_schedule" label="Work Schedule" defaultValue={textValue(request, ["work_schedule"], "")} />
        <Field name="vacancies" label="Vacancies" type="number" min="1" defaultValue={textValue(request, ["vacancies"], "")} />
        <Field name="requested_application_deadline" label="Requested Application Deadline" type="date" defaultValue={textValue(request, ["requested_application_deadline"], "")} />
        <Checkbox name="salary_confirmed" label="Salary details are actual offered figures" checked={request?.salary_confirmed === true} />
      </div>
      <Textarea name="short_description" label="Short Description" rows={3} defaultValue={textValue(request, ["short_description"], "")} />
      <Textarea name="description" label="Description" defaultValue={textValue(request, ["description"], "")} />
      <Textarea name="responsibilities" label="Responsibilities" defaultValue={textValue(request, ["responsibilities"], "")} />
      <Textarea name="requirements" label="Requirements" defaultValue={textValue(request, ["requirements"], "")} />
      <div className="grid gap-4 md:grid-cols-3">
        {["sponsorship_status", "accommodation_status", "meals_status", "transport_status", "medical_insurance_status", "air_ticket_status"].map((name) => (
          <Select key={name} name={name} label={name.replaceAll("_", " ")} defaultValue={textValue(request, [name], "not_confirmed")} options={BENEFIT_STATUSES.map((item) => item.value)} labels={Object.fromEntries(BENEFIT_STATUSES.map((item) => [item.value, item.label]))} includeEmpty={false} />
        ))}
      </div>
      <Textarea name="required_documents" label="Required Documents" rows={4} defaultValue={Array.isArray(request?.required_documents) ? request.required_documents.join("\n") : ""} />
      <Textarea name="notes_to_red_stone" label="Notes to Red Stone" rows={4} defaultValue={textValue(request, ["notes_to_red_stone"], "")} />
      <div className="flex flex-wrap gap-3">
        <button name="intent" value="draft" className="rounded-md border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Save Draft</button>
        <button name="intent" value="submit" className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Submit for Red Stone Review</button>
      </div>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text", min, required = false, list }: { name: string; label: string; defaultValue: string; type?: string; min?: string; required?: boolean; list?: string }) {
  return <label className="grid gap-2 text-sm font-semibold capitalize text-slate-700">{label}<input name={name} type={type} min={min} required={required} list={list} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></label>;
}

function Textarea({ name, label, defaultValue, rows = 5 }: { name: string; label: string; defaultValue: string; rows?: number }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}<textarea name={name} rows={rows} defaultValue={defaultValue} className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></label>;
}

function Select({ name, label, defaultValue, options, labels = {}, includeEmpty = true }: { name: string; label: string; defaultValue: string; options: string[]; labels?: Record<string, string>; includeEmpty?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold capitalize text-slate-700">{label}<select name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 font-normal">{includeEmpty ? <option value="">Not set</option> : null}{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>;
}

function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700"><input name={name} type="checkbox" defaultChecked={checked} className="h-4 w-4 accent-[#D4AF37]" />{label}</label>;
}
