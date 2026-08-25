"use client";

import { useState } from "react";
import { MultiSelect, type MultiSelectOption } from "./multi-select";

type BulkCreateControlsProps = {
  countries: MultiSelectOption[];
  employers: MultiSelectOption[];
  occupations: MultiSelectOption[];
  defaultCountries: string[];
  defaultEmployers: string[];
  defaultOccupations: string[];
  limit: number;
  defaults: Record<string, string>;
};

export function BulkCreateControls({
  countries,
  employers,
  occupations,
  defaultCountries,
  defaultEmployers,
  defaultOccupations,
  limit,
  defaults,
}: BulkCreateControlsProps) {
  const [selectedCountries, setSelectedCountries] = useState(defaultCountries);
  const [selectedEmployers, setSelectedEmployers] = useState(defaultEmployers);
  const [selectedOccupations, setSelectedOccupations] = useState(defaultOccupations);
  const combinationCount = selectedCountries.length * selectedEmployers.length * selectedOccupations.length;
  const hasMinimumSelections = selectedCountries.length > 0 && selectedEmployers.length > 0 && selectedOccupations.length > 0;
  const exceedsLimit = combinationCount > limit;

  return (
    <form method="get" className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <MultiSelect
          name="country"
          label="Countries"
          options={countries}
          defaultValues={defaultCountries}
          placeholder="Search countries"
          onSelectionChange={setSelectedCountries}
        />
        <MultiSelect
          name="employer_id"
          label="Employers"
          options={employers}
          defaultValues={defaultEmployers}
          placeholder="Search employers"
          onSelectionChange={setSelectedEmployers}
        />
        <MultiSelect
          name="occupation"
          label="Occupations"
          options={occupations}
          defaultValues={defaultOccupations}
          placeholder="Search title or category"
          grouped
          onSelectionChange={setSelectedOccupations}
        />
      </div>

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-sm font-black text-[#071A3D]">Bulk common values</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            These defaults prefill generated draft vacancies. Each generated row remains editable before creation.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input name="default_city" label="City / Location" defaultValue={defaults.default_city} />
          <Input name="default_vacancies" label="Vacancies" type="number" min="1" defaultValue={defaults.default_vacancies || "1"} />
          <Input name="default_application_deadline" label="Application Deadline" type="date" defaultValue={defaults.default_application_deadline} />
          <Input name="default_currency" label="Salary Currency" defaultValue={defaults.default_currency} />
          <Select name="default_salary_period" label="Salary Period" defaultValue={defaults.default_salary_period} options={["", "hour", "day", "week", "month", "year"]} />
          <Input name="default_contract_type" label="Contract Type" defaultValue={defaults.default_contract_type} />
          <Input name="default_contract_duration_value" label="Contract Duration" type="number" min="0" defaultValue={defaults.default_contract_duration_value} />
          <Select name="default_contract_duration_unit" label="Duration Unit" defaultValue={defaults.default_contract_duration_unit} options={["", "months", "years"]} />
          <Input name="default_working_hours_per_week" label="Working Hours / Week" type="number" min="0" defaultValue={defaults.default_working_hours_per_week} />
          <Input name="default_processing_time_min" label="Processing Min" type="number" min="0" defaultValue={defaults.default_processing_time_min} />
          <Input name="default_processing_time_max" label="Processing Max" type="number" min="0" defaultValue={defaults.default_processing_time_max} />
          <Select name="default_processing_time_unit" label="Processing Unit" defaultValue={defaults.default_processing_time_unit} options={["", "days", "weeks", "months"]} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["default_sponsorship_status", "Sponsorship"],
            ["default_accommodation_status", "Accommodation"],
            ["default_meals_status", "Meals"],
            ["default_transport_status", "Transport"],
            ["default_medical_insurance_status", "Insurance"],
            ["default_air_ticket_status", "Flight"],
          ].map(([name, label]) => (
            <Select
              key={name}
              name={name}
              label={label}
              defaultValue={defaults[name] || "not_confirmed"}
              options={["not_confirmed", "included", "not_included", "allowance", "employer_specific"]}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input name="default_salary_tbd" type="checkbox" defaultChecked={defaults.default_salary_tbd !== "off"} className="h-4 w-4 accent-[#D4AF37]" />
          Salary TBD: To be confirmed by employer.
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Required Documents
          <textarea
            name="default_document_requirements"
            defaultValue={defaults.default_document_requirements}
            rows={4}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
          />
        </label>
      </section>

      <section className={`rounded-lg border p-4 text-sm font-semibold ${exceedsLimit ? "border-red-200 bg-red-50 text-red-800" : "border-[#D4AF37]/40 bg-[#FFF8DF] text-[#071A3D]"}`} aria-live="polite">
        <p>{combinationCount} draft vacancies will be prepared.</p>
        <p className="mt-1 text-xs">
          Create all combinations is the default: every selected country is paired with every selected employer and every selected occupation.
        </p>
        {exceedsLimit ? <p className="mt-2">Reduce selections to {limit} or fewer generated draft rows. The workflow will not truncate automatically.</p> : null}
        {!hasMinimumSelections ? <p className="mt-2">Select at least one country, one employer and one occupation.</p> : null}
      </section>

      <button
        type="submit"
        disabled={!hasMinimumSelections || exceedsLimit}
        className="w-full rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-fit"
      >
        Prepare Draft Vacancies
      </button>
    </form>
  );
}

function Input({ name, label, type = "text", min, defaultValue = "" }: { name: string; label: string; type?: string; min?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input name={name} type={type} min={min} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30" />
    </label>
  );
}

function Select({ name, label, defaultValue = "", options }: { name: string; label: string; defaultValue?: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30">
        {options.map((option) => (
          <option key={`${name}-${option || "empty"}`} value={option}>
            {option ? option.replaceAll("_", " ") : "Not set"}
          </option>
        ))}
      </select>
    </label>
  );
}
