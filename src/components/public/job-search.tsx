import { CONTRACT_TYPES, JOB_CATEGORIES, SKILL_LEVELS } from "@/lib/jobs/catalogue";
import type { Country } from "@/lib/public/countries";

export function JobSearch({ defaults = {}, countries = [] }: { defaults?: Record<string, string | undefined>; countries?: Country[] }) {
  return (
    <form className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">
      <label className="grid gap-1 text-sm font-bold text-slate-700 lg:col-span-2">
        Search
        <input name="q" defaultValue={defaults.q} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" placeholder="Job title, country, category" />
      </label>
      <Select name="country" label="Country" defaultValue={defaults.country} options={["", ...countries.map((country) => country.name)]} labels={{ "": "Any" }} />
      <Select name="category" label="Category" defaultValue={defaults.category} options={["", ...JOB_CATEGORIES]} labels={{ "": "Any" }} />
      <Select name="skill" label="Skill" defaultValue={defaults.skill} options={["", ...SKILL_LEVELS.map((item) => item.value)]} labels={Object.fromEntries(SKILL_LEVELS.map((item) => [item.value, item.label]))} />
      <Field name="salary_min" label="Salary Min" defaultValue={defaults.salary_min} type="number" />
      <Field name="salary_max" label="Salary Max" defaultValue={defaults.salary_max} type="number" />
      <Select name="contract_type" label="Contract" defaultValue={defaults.contract_type} options={["", ...CONTRACT_TYPES]} labels={{ "": "Any" }} />
      <Select name="sponsorship" label="Sponsorship" defaultValue={defaults.sponsorship} options={["", "true"]} labels={{ "": "Any", true: "Visa sponsorship" }} />
      <Select name="accommodation" label="Accommodation" defaultValue={defaults.accommodation} options={["", "true"]} labels={{ "": "Any", true: "Provided" }} />
      <Select name="job_type" label="Job Type" defaultValue={defaults.job_type} options={["", "full_time", "contract", "seasonal"]} />
      <Select name="sort" label="Sort" defaultValue={defaults.sort} options={["newest", "salary_asc", "salary_desc", "deadline"]} labels={{ newest: "Newest", salary_asc: "Salary Low to High", salary_desc: "Salary High to Low", deadline: "Closing Soon" }} />
      <button className="min-h-11 self-end rounded-md bg-[#D4AF37] px-4 text-sm font-black text-[#071A3D]">Filter Jobs</button>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
    </label>
  );
}

function Select({ name, label, defaultValue, options, labels = {} }: { name: string; label: string; defaultValue?: string; options: string[]; labels?: Record<string, string> }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 font-normal">
        {options.map((option) => <option key={option || "any"} value={option}>{labels[option] ?? (option || "Any")}</option>)}
      </select>
    </label>
  );
}
