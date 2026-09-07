import Link from "next/link";
import { JOB_CATEGORIES, SKILL_LEVELS } from "@/lib/jobs/catalogue";
import type { Country } from "@/lib/public/countries";

export function JobSearch({
  defaults = {},
  countries = [],
}: {
  defaults?: Record<string, string | undefined>;
  countries?: Country[];
}) {
  const advancedFiltersActive = Boolean(
    defaults.salary_min ||
      defaults.accommodation ||
      defaults.foreign_worker
  );

  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(7,26,61,0.08)] md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8860B]">
            Job Search
          </p>
          <h2 className="mt-1 text-xl font-black text-[#071A3D] md:text-2xl">
            Find the right opportunity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            All current published Red Stone jobs are shown by default. Use filters only when you want to narrow the list.
          </p>
        </div>
        <Link
          href="/jobs?sponsorship=programme"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D4AF37] bg-[#FFF9E8] px-4 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
        >
          Show All Jobs
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2 xl:col-span-2">
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
          name="skill"
          label="Skill Level"
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
          name="sponsorship"
          label="Sponsorship"
          defaultValue={defaults.sponsorship}
          options={["programme", "confirmed", ""]}
          labels={{
            programme: "All Red Stone programme jobs",
            confirmed: "Employer-confirmed visa sponsorship",
            "": "Any published vacancy",
          }}
        />

        <button className="min-h-12 self-end rounded-xl bg-[#D4AF37] px-6 text-sm font-black text-[#071A3D] shadow-sm transition hover:bg-[#c7a22f] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 md:col-span-1">
          Search Jobs
        </button>
      </div>

      <details
        className="mt-5 border-t border-slate-200 pt-4"
        open={advancedFiltersActive}
      >
        <summary className="cursor-pointer select-none text-sm font-black text-[#071A3D] marker:text-[#B8860B]">
          More filters
        </summary>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field
            name="salary_min"
            label="Minimum Salary"
            defaultValue={defaults.salary_min}
            type="number"
          />

          <Select
            name="accommodation"
            label="Accommodation"
            defaultValue={defaults.accommodation}
            options={["", "true"]}
            labels={{ "": "Any", true: "Provided" }}
          />

          <Select
            name="foreign_worker"
            label="International Eligibility"
            defaultValue={defaults.foreign_worker}
            options={["", "accepted", "sponsorship", "unconfirmed"]}
            labels={{
              "": "Any",
              accepted: "International applicants accepted",
              sponsorship: "Sponsorship evidence",
              unconfirmed: "Not confirmed",
            }}
          />
        </div>
      </details>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        <strong>All published jobs stay available by default.</strong>{" "}
        The old Job Type and Contract filters were removed because those fields are not populated consistently in the current published catalogue and could incorrectly hide genuine jobs. Use the remaining filters only when you intentionally want to narrow the list.
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
