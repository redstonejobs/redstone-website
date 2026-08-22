export type CatalogueOption = {
  value: string;
  label: string;
};

export const ENTRY_LEVEL_JOB_CATEGORIES = [
  "Cleaning & Housekeeping",
  "Hospitality",
  "Warehouse & Logistics",
  "Construction & General Labour",
  "Agriculture & Farm Work",
  "Factory & Manufacturing",
  "Security",
  "Driving & Transport",
  "Domestic & Support Work",
  "Food Production",
  "Retail Support",
  "General Workers",
] as const;

export const SKILLED_JOB_CATEGORIES = [
  "Healthcare",
  "Engineering",
  "Information Technology",
  "Construction Trades",
  "Electrical",
  "Mechanical",
  "Welding & Fabrication",
  "Plumbing",
  "Automotive",
  "Hospitality Management",
  "Finance & Accounting",
  "Administration",
  "Education",
  "Logistics & Supply Chain",
  "Skilled Drivers",
  "Technical Services",
] as const;

export const JOB_CATEGORIES = [...ENTRY_LEVEL_JOB_CATEGORIES, ...SKILLED_JOB_CATEGORIES] as const;

export const SKILL_LEVELS = [
  { value: "unskilled", label: "Entry Level" },
  { value: "semi_skilled", label: "Semi-Skilled" },
  { value: "skilled", label: "Skilled" },
  { value: "professional", label: "Professional" },
] as const satisfies CatalogueOption[];

export const SALARY_PERIODS = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const satisfies CatalogueOption[];

export const CONTRACT_TYPES = ["Fixed Term", "Permanent", "Seasonal", "Temporary", "Employer Specific"] as const;

export const BENEFIT_STATUSES = [
  { value: "included", label: "Included" },
  { value: "not_included", label: "Not Included" },
  { value: "allowance", label: "Allowance" },
  { value: "employer_specific", label: "Employer Specific" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const COST_RESPONSIBILITIES = [
  { value: "candidate", label: "Candidate" },
  { value: "employer", label: "Employer" },
  { value: "red_stone", label: "Red Stone" },
  { value: "shared", label: "Shared" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const FEE_RELATIONSHIPS = [
  { value: "included_in_programme_fee", label: "Included in Programme Fee" },
  { value: "additional", label: "Additional" },
  { value: "candidate_provided", label: "Candidate Provided" },
  { value: "employer_covered", label: "Employer Covered" },
  { value: "shared", label: "Shared" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "cv_cover_letter", label: "CV / Cover Letter" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "police_clearance", label: "Police Clearance" },
  { value: "health_certificate", label: "Health Certificate / Medical" },
  { value: "nea_clearance", label: "NEA Clearance" },
  { value: "consultant_letter", label: "Consultant Letter" },
  { value: "passport_photo", label: "Passport Photo" },
  { value: "national_id", label: "National ID" },
  { value: "academic_certificate", label: "Academic Certificate" },
  { value: "professional_certificate", label: "Professional Certificate" },
  { value: "employment_reference", label: "Employment Reference" },
  { value: "ielts", label: "IELTS / Language Test" },
  { value: "attestation", label: "Attestation" },
  { value: "driving_licence", label: "Driving Licence" },
  { value: "trade_certificate", label: "Trade Certificate" },
  { value: "other", label: "Other" },
] as const satisfies CatalogueOption[];

export function labelFor(options: readonly CatalogueOption[], value: unknown) {
  const text = typeof value === "string" ? value : "";
  return options.find((option) => option.value === text)?.label ?? text.replaceAll("_", " ");
}

export function skillLevelLabel(value: unknown) {
  return labelFor(SKILL_LEVELS, value);
}

export function benefitStatusLabel(value: unknown) {
  return labelFor(BENEFIT_STATUSES, value || "not_confirmed");
}

export function feeRelationshipLabel(value: unknown) {
  return labelFor(FEE_RELATIONSHIPS, value || "not_confirmed");
}

export function documentTypeLabel(value: unknown) {
  return labelFor(DOCUMENT_TYPES, value);
}
