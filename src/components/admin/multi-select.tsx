"use client";

import { useEffect, useId, useMemo, useState } from "react";

export type MultiSelectOption = {
  value: string;
  label: string;
  group?: string;
  description?: string;
};

type MultiSelectProps = {
  name: string;
  label: string;
  options: MultiSelectOption[];
  defaultValues?: string[];
  placeholder?: string;
  grouped?: boolean;
  onSelectionChange?: (values: string[]) => void;
};

export function MultiSelect({
  name,
  label,
  options,
  defaultValues = [],
  placeholder = "Search",
  grouped = false,
  onSelectionChange,
}: MultiSelectProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set(defaultValues));
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      options.filter((option) =>
        [option.label, option.group, option.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      ),
    [normalizedQuery, options]
  );
  const selectedOptions = options.filter((option) => selected.has(option.value));
  const groupedOptions = grouped
    ? filtered.reduce((groups, option) => {
        const group = option.group ?? "Other";
        groups.set(group, [...(groups.get(group) ?? []), option]);
        return groups;
      }, new Map<string, MultiSelectOption[]>())
    : new Map([["Options", filtered]]);

  useEffect(() => {
    onSelectionChange?.([...selected]);
  }, [onSelectionChange, selected]);

  function toggle(value: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function selectAllVisible() {
    setSelected((current) => new Set([...current, ...filtered.map((option) => option.value)]));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function toggleGroup(groupOptions: MultiSelectOption[]) {
    setSelected((current) => {
      const next = new Set(current);
      const everySelected = groupOptions.every((option) => next.has(option.value));

      for (const option of groupOptions) {
        if (everySelected) {
          next.delete(option.value);
        } else {
          next.add(option.value);
        }
      }

      return next;
    });
  }

  return (
    <fieldset className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <legend className="text-sm font-black text-[#071A3D]">{label}</legend>
      {selectedOptions.map((option) => (
        <input key={option.value} type="hidden" name={name} value={option.value} />
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-xs font-semibold text-slate-600">
          {selected.size} selected
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={selectAllVisible} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-[#071A3D]">
            Select all visible
          </button>
          <button type="button" onClick={clearAll} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-red-700">
            Clear all
          </button>
        </div>
      </div>
      <label htmlFor={id} className="sr-only">
        Search {label}
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      />
      {selectedOptions.length ? (
        <div className="flex max-h-28 flex-wrap gap-2 overflow-auto" aria-label={`Selected ${label}`}>
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className="rounded-full border border-[#D4AF37]/60 bg-[#FFF8DF] px-3 py-1 text-xs font-bold text-[#071A3D]"
              aria-label={`Remove ${option.label}`}
            >
              {option.label} x
            </button>
          ))}
        </div>
      ) : null}
      <div className="max-h-80 overflow-auto rounded-md border border-slate-200" role="listbox" aria-multiselectable="true">
        {[...groupedOptions.entries()].map(([group, groupOptions]) => (
          <div key={group} className="border-b border-slate-100 last:border-b-0">
            {grouped ? (
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-slate-50 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-wide text-slate-600">{group}</p>
                <button type="button" onClick={() => toggleGroup(groupOptions)} className="text-xs font-bold text-[#B8860B]">
                  {groupOptions.every((option) => selected.has(option.value)) ? "Deselect category" : "Select category"}
                </button>
              </div>
            ) : null}
            {groupOptions.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-start gap-3 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selected.has(option.value)}
                  onChange={() => toggle(option.value)}
                  className="mt-1 h-4 w-4 accent-[#D4AF37]"
                />
                <span>
                  <span className="block font-semibold text-[#071A3D]">{option.label}</span>
                  {option.description ? <span className="block text-xs text-slate-500">{option.description}</span> : null}
                </span>
              </label>
            ))}
            {groupOptions.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">No matches.</p> : null}
          </div>
        ))}
      </div>
    </fieldset>
  );
}
