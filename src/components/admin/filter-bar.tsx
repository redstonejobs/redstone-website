type FilterOption = {
  name: string;
  label: string;
  options: string[];
};

type FilterBarProps = {
  searchPlaceholder?: string;
  filters?: FilterOption[];
};

export function FilterBar({
  searchPlaceholder = "Search",
  filters = [],
}: FilterBarProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_repeat(3,180px)_auto]">
      <label className="sr-only" htmlFor="q">
        Search
      </label>
      <input
        id="q"
        name="q"
        type="search"
        placeholder={searchPlaceholder}
        className="min-h-11 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      />
      {filters.map((filter) => (
        <label key={filter.name} className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          {filter.label}
          <select
            name={filter.name}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
            defaultValue=""
          >
            <option value="">All</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="submit"
        className="min-h-11 rounded-md bg-[#071A3D] px-5 text-sm font-semibold text-white transition hover:bg-[#0B2558]"
      >
        Apply
      </button>
    </form>
  );
}

