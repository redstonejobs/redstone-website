import type { Row } from "@/lib/admin/types";
import { textValue } from "@/lib/admin/format";

export function EmployerProfileForm({ employer, action, submitLabel }: { employer: Row; action: (formData: FormData) => void | Promise<void>; submitLabel: string }) {
  return (
    <form action={action} className="grid gap-5 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="company_name" label="Company Name" defaultValue={textValue(employer, ["company_name"], "")} required />
        <Field name="registration_number" label="Registration Number" defaultValue={textValue(employer, ["registration_number"], "")} />
        <Field name="industry" label="Industry" defaultValue={textValue(employer, ["industry"], "")} />
        <Field name="company_type" label="Company Type" defaultValue={textValue(employer, ["company_type"], "")} />
        <Field name="email" label="Company Email" type="email" defaultValue={textValue(employer, ["email"], "")} required />
        <Field name="phone" label="Phone" defaultValue={textValue(employer, ["phone"], "")} required />
        <Field name="country" label="Country" defaultValue={textValue(employer, ["country"], "")} required />
        <Field name="city" label="City" defaultValue={textValue(employer, ["city"], "")} required />
        <Field name="website" label="Website" defaultValue={textValue(employer, ["website"], "")} />
        <Field name="company_size" label="Approximate Workforce Size" defaultValue={textValue(employer, ["company_size"], "")} />
        <Field name="primary_contact_name" label="Primary Contact Name" defaultValue={textValue(employer, ["primary_contact_name"], "")} />
        <Field name="primary_contact_position" label="Primary Contact Position" defaultValue={textValue(employer, ["primary_contact_position"], "")} />
      </div>
      <Textarea name="address" label="Address" defaultValue={textValue(employer, ["address"], "")} rows={3} />
      <Textarea name="description" label="Company Description" defaultValue={textValue(employer, ["description"], "")} />
      <Textarea name="recruitment_needs" label="Recruitment Needs" defaultValue={textValue(employer, ["recruitment_needs"], "")} />
      <Textarea name="preferred_job_categories" label="Preferred Job Categories" defaultValue={Array.isArray(employer.preferred_job_categories) ? employer.preferred_job_categories.join("\n") : ""} rows={4} />
      <button className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">{submitLabel}</button>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text", required = false }: { name: string; label: string; defaultValue: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}<input name={name} type={type} defaultValue={defaultValue} required={required} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></label>;
}

function Textarea({ name, label, defaultValue, rows = 5 }: { name: string; label: string; defaultValue: string; rows?: number }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}<textarea name={name} rows={rows} defaultValue={defaultValue} className="rounded-md border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" /></label>;
}
