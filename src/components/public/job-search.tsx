import { CONTRACT_TYPES, JOB_CATEGORIES, SKILL_LEVELS } from "@/lib/jobs/catalogue";
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
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8860B]">
          Job Search
        </p>
        <h2 className="mt-1 text-xl font-black text-[#071A3D] md:text-2xl">
          Find the right opportunity
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Search current published vacancies by title, employer, country, category or source.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
          Search
          <input
            name="q"
            defaultValue={defaults.q}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#B8860B] focus:ring-2 focus:ring-[#D4AF37]/20"
            placeholder="Job title, employer, city or keyword"
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

        <Select
          name="source"
          label="Source"
          defaultValue={defaults.source}
          options={["", "redstone", "foundrole", "jobbank"]}
          labels={{
            "": "Any source",
            redstone: "Red Stone",
            foundrole: "FoundRole",
            jobbank: "Canada Job Bank",
          }}
        />

        <Select
          name="foreign_worker"
          label="International Eligibility"
          defaultValue={defaults.foreign_worker}
          options={["", "accepted", "sponsorship", "unconfirmed"]}
          labels={{
            "": "Any",
            accepted: "Foreign/international signal",
            sponsorship: "Sponsorship evidence",
            unconfirmed: "Not confirmed",
          }}
        />

        <Select
          name="skill"
          label="Skill"
          defaultValue={defaults.skill}
          options={["", ...SKILL_LEVELS.map((item) => item.value)]}
          labels={{
            "": "Any skill level",
            ...Object.fromEntries(
              SKILL_LEVELS.map((item) => [item.value, item.label])
            ),
          }}
        />

        <Select
          name="contract_type"
          label="Contract"
          defaultValue={defaults.contract_type}
          options={["", ...CONTRACT_TYPES]}
          labels={{ "": "Any contract" }}
        />

        <Field
          name="salary_min"
          label="Salary Min"
          defaultValue={defaults.salary_min}
          type="number"
        />

        <Field
          name="salary_max"
          label="Salary Max"
          defaultValue={defaults.salary_max}
          type="number"
        />

        <Select
          name="sponsorship"
          label="Sponsorship"
          defaultValue={defaults.sponsorship}
          options={["", "true"]}
          labels={{ "": "Any", true: "Visa sponsorship" }}
        />

        <Select
          name="accommodation"
          label="Accommodation"
          defaultValue={defaults.accommodation}
          options={["", "true"]}
          labels={{ "": "Any", true: "Provided" }}
        />

        <Select
          name="job_type"
          label="Job Type"
          defaultValue={defaults.job_type}
          options={["", "full_time", "part_time", "contract", "seasonal"]}
          labels={{
            "": "Any",
            full_time: "Full time",
            part_time: "Part time",
            contract: "Contract",
            seasonal: "Seasonal",
          }}
        />

        <Select
          name="sort"
          label="Sort"
          defaultValue={defaults.sort}
          options={[
            "newest",
            "source_newest",
            "salary_asc",
            "salary_desc",
            "deadline",
          ]}
          labels={{
            newest: "Newest on Red Stone",
            source_newest: "Newest at source",
            salary_asc: "Salary Low to High",
            salary_desc: "Salary High to Low",
            deadline: "Closing Soon",
          }}
        />

        <button className="min-h-12 self-end rounded-xl bg-[#D4AF37] px-6 text-sm font-black text-[#071A3D] shadow-sm transition hover:bg-[#c7a22f] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2">
          Filter Jobs
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal text-slate-900 outline-none transition focus:border-[#B8860B] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
    </label>
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