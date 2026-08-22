import { textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

const regions = ["North America", "Gulf", "Europe", "Oceania", "Asia", "South America"];
const units = ["", "days", "weeks", "months"];

export function CountryForm({ country, action }: { country: Row; action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <Field name="country_name" label="Country Name" defaultValue={textValue(country, ["country_name"], "")} required />
        <Field name="slug" label="Slug" defaultValue={textValue(country, ["slug"], "")} required />
        <Field name="country_code" label="Country Code" defaultValue={textValue(country, ["country_code"], "")} required />
        <Select name="region" label="Region" defaultValue={textValue(country, ["region"], "")} options={regions} />
        <Field name="base_recruitment_fee" label="Default Programme Fee" type="number" min="0" defaultValue={textValue(country, ["base_recruitment_fee"], "")} />
        <Field name="fee_currency" label="Fee Currency" defaultValue={textValue(country, ["fee_currency"], "KES")} />
        <Field name="fee_label" label="Public Fee Label" defaultValue={textValue(country, ["fee_label"], "Estimated Programme Cost")} />
        <Field name="processing_time_min" label="Processing Min" type="number" min="0" defaultValue={textValue(country, ["processing_time_min"], "")} />
        <Field name="processing_time_max" label="Processing Max" type="number" min="0" defaultValue={textValue(country, ["processing_time_max"], "")} />
        <Select name="processing_time_unit" label="Processing Unit" defaultValue={textValue(country, ["processing_time_unit"], "")} options={units} />
        <Field name="display_order" label="Display Order" type="number" min="0" defaultValue={textValue(country, ["display_order"], "100")} />
        <Checkbox name="is_active" label="Active" checked={country.is_active !== false} />
        <Checkbox name="is_featured" label="Featured" checked={country.is_featured === true} />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Processing Note
        <textarea name="processing_time_note" rows={4} defaultValue={textValue(country, ["processing_time_note"], "")} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
      </label>
      <button className="w-fit min-h-11 rounded-md bg-[#071A3D] px-5 text-sm font-semibold text-white">Save Country Settings</button>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text", required, min }: { name: string; label: string; defaultValue: string; type?: string; required?: boolean; min?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} required={required} min={min} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
    </label>
  );
}

function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
        {options.map((option) => <option key={option || "empty"} value={option}>{option || "Not set"}</option>)}
      </select>
    </label>
  );
}

function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
      <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-[#D4AF37]" />
      {label}
    </label>
  );
}
