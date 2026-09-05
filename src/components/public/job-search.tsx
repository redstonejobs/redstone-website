import { JOB_CATEGORIES } from "@/lib/jobs/catalogue";
import type { Country } from "@/lib/public/countries";

export function JobSearch({
  defaults = {},
  countries = [],
}: {
  defaults?: Record<string, string | undefined>;
  countries?: Country[];
}) {
  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(7,26,61,0.08)] md:p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8860B]">Job Search</p>
        <h2 className="mt-1 text-xl font-black text-[#071A3D] md:text-2xl">Find the right opportunity</h2>
        <p className="mt-1 text-sm text-slate-500">Search current published vacancies by title, country or category.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Search
          <input
            name="q"
            defaultValue={defaults.q}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#B8860B] focus:ring-2 focus:ring-[#D4AF37]/20"
            placeholder="Job title or keyword"
          />
        </label>

        <Select
          name="country"
          label="Country"
          defaultValue={defaults.country}
          options={["", ...countries.map((country) => country.name)]}
          labels={{ "": "All countries" }}
        />

        <Select
          name="category"
          label="Category"
          defaultValue={defaults.category}
          options={["", ...JOB_CATEGORIES]}
          labels={{ "": "All categories" }}
        />

        <button className="min-h-12 rounded-xl bg-[#D4AF37] px-6 text-sm font-black text-[#071A3D] shadow-sm transition hover:bg-[#c7a22f] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2">
          Search Jobs
        </button>
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
  labels = {},
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none transition focus:border-[#B8860B] focus:ring-2 focus:ring-[#D4AF37]/20"
      >
        {options.map((option) => (
          <option key={option || "any"} value={option}>
            {labels[option] ?? (option || "Any")}
          </option>
        ))}
      </select>
    </label>
  );
}
