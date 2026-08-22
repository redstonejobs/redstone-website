export function JobSearch({ defaults = {} }: { defaults?: Record<string, string | undefined> }) {
  return (
    <form className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">
      <label className="grid gap-1 text-sm font-bold text-slate-700 lg:col-span-2">
        Search
        <input name="q" defaultValue={defaults.q} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" placeholder="Job title, country, category" />
      </label>
      <Field name="country" label="Country" defaultValue={defaults.country} />
      <Field name="category" label="Category" defaultValue={defaults.category} />
      <Select name="skill" label="Skill" defaultValue={defaults.skill} options={["", "skilled", "unskilled"]} />
      <Select name="sponsorship" label="Sponsorship" defaultValue={defaults.sponsorship} options={["", "true"]} labels={{ "": "Any", true: "Visa sponsorship" }} />
      <Select name="job_type" label="Job Type" defaultValue={defaults.job_type} options={["", "full_time", "contract", "seasonal"]} />
      <Select name="sort" label="Sort" defaultValue={defaults.sort} options={["newest", "deadline"]} labels={{ newest: "Newest", deadline: "Deadline" }} />
      <button className="min-h-11 self-end rounded-md bg-[#D4AF37] px-4 text-sm font-black text-[#071A3D]">Filter Jobs</button>
    </form>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <input name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
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
