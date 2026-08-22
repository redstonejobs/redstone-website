import type { Row } from "@/lib/admin/types";
import type { Country } from "@/lib/public/countries";
import { documentTypeLabel } from "./catalogue";

export type DocumentRequirement = {
  id?: string;
  job_id?: string;
  document_type: string;
  required: boolean;
  fee_applicable: boolean;
  candidate_can_provide_existing: boolean;
  cost_responsibility: string;
  notes: string | null;
  sort_order: number;
};

export type DocumentFee = {
  document_type: string;
  label: string;
  region: string | null;
  country_id: string | null;
  amount: number;
  currency: string;
  is_active: boolean;
};

export type CandidateDocument = {
  document_type: string | null;
  verification_status?: string | null;
};

export type CostLine = {
  documentType: string;
  label: string;
  amount: number | null;
  currency: string;
  required: boolean;
  alreadyUploaded: boolean;
  feeApplicable: boolean;
  costResponsibility: string;
  note: string | null;
};

export const DEFAULT_PROCESSING_TEXT = "Processing time varies by employer and immigration process.";

export const COST_DISCLAIMER =
  "Estimated costs are provided for planning purposes. Actual costs may vary depending on the destination, job requirements, medical facility, government charges, exchange rates and documents already held by the candidate.";

export const INDEPENDENT_DOCUMENT_DISCLAIMER =
  "Candidates may process eligible documents independently where permitted.";

export const PROGRAMME_FEE_DISCLAIMER =
  "Fees shown are estimates or programme-specific charges and may vary by vacancy, employer, destination requirements and services required. Applicants should rely on the final written cost breakdown issued for their specific application.";

export const SALARY_DISCLAIMER =
  "Salary information is based on the specific vacancy or employer information available to Red Stone. Final salary, deductions, overtime, allowances and employment terms are determined by the employment contract and applicable laws.";

export const PROCESSING_TIME_DISCLAIMER =
  "Processing times are estimates and may vary depending on employer selection, document readiness, government processing, work-permit or visa procedures, and other circumstances outside Red Stone Employment Agency's control.";

export function resolveProgrammeFee(job: Row, country?: Country | null) {
  const override = numberOrNull(job.country_fee_override);
  const overrideCurrency = textOrNull(job.country_fee_override_currency);

  if (override !== null) {
    return {
      amount: override,
      currency: overrideCurrency ?? country?.feeCurrency ?? "KES",
      label: country?.feeLabel ?? "Estimated Programme Cost",
      note: textOrNull(job.country_fee_override_note),
      source: "job_override" as const,
    };
  }

  if (country?.baseRecruitmentFee !== null && country?.baseRecruitmentFee !== undefined) {
    return {
      amount: country.baseRecruitmentFee,
      currency: country.feeCurrency,
      label: country.feeLabel,
      note: null,
      source: "country_default" as const,
    };
  }

  return {
    amount: null,
    currency: country?.feeCurrency ?? "KES",
    label: country?.feeLabel ?? "Estimated Programme Cost",
    note: null,
    source: "unconfigured" as const,
  };
}

export function formatMoney(amount: number | null | undefined, currency = "KES") {
  if (amount === null || amount === undefined) return "To be confirmed";
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatProcessingTime(job: Row, country?: Country | null) {
  const min = numberOrNull(job.processing_time_min) ?? country?.processingTimeMin ?? null;
  const max = numberOrNull(job.processing_time_max) ?? country?.processingTimeMax ?? null;
  const unit = textOrNull(job.processing_time_unit) ?? country?.processingTimeUnit ?? null;
  const note = textOrNull(job.processing_time_note) ?? country?.processingTimeNote ?? null;

  if (min !== null && max !== null && unit) return `${min}-${max} ${unit}${note ? ` (${note})` : ""}`;
  if (min !== null && unit) return `${min} ${unit}${note ? ` (${note})` : ""}`;
  if (note) return note;
  return DEFAULT_PROCESSING_TEXT;
}

export function formatContract(job: Row) {
  const type = textOrNull(job.contract_type);
  const duration = numberOrNull(job.contract_duration_value);
  const unit = textOrNull(job.contract_duration_unit);
  const note = textOrNull(job.contract_note);

  if (type === "Permanent") return note ? `Permanent (${note})` : "Permanent";
  if (duration !== null && unit) return `${duration} ${unit}${type ? `, ${type}` : ""}${note ? ` (${note})` : ""}`;
  if (type) return note ? `${type} (${note})` : type;
  return "To be confirmed";
}

export function calculateDocumentCosts({
  requirements,
  feeCatalog,
  country,
  candidateDocuments = [],
}: {
  requirements: DocumentRequirement[];
  feeCatalog: DocumentFee[];
  country?: Country | null;
  candidateDocuments?: CandidateDocument[];
}) {
  const uploaded = new Set(
    candidateDocuments
      .map((document) => document.document_type)
      .filter((value): value is string => typeof value === "string" && value.length > 0)
  );
  const lines: CostLine[] = requirements
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.document_type.localeCompare(b.document_type))
    .map((requirement) => {
      const fee = findFee(requirement.document_type, feeCatalog, country);
      const alreadyUploaded = requirement.candidate_can_provide_existing && uploaded.has(requirement.document_type);
      const shouldPrice =
        requirement.fee_applicable &&
        !alreadyUploaded &&
        ["candidate", "shared", "not_confirmed"].includes(requirement.cost_responsibility);

      return {
        documentType: requirement.document_type,
        label: fee?.label ?? documentTypeLabel(requirement.document_type),
        amount: shouldPrice ? fee?.amount ?? null : null,
        currency: fee?.currency ?? "KES",
        required: requirement.required,
        alreadyUploaded,
        feeApplicable: requirement.fee_applicable,
        costResponsibility: requirement.cost_responsibility,
        note: requirement.notes,
      };
    });
  const currency = lines.find((line) => line.amount !== null)?.currency ?? "KES";
  const total = lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);

  return { lines, total, currency };
}

export function findFee(documentType: string, fees: DocumentFee[], country?: Country | null) {
  const active = fees.filter((fee) => fee.is_active && fee.document_type === documentType);
  return (
    active.find((fee) => fee.country_id && country?.id && fee.country_id === country.id) ??
    active.find((fee) => fee.region && country?.region && fee.region === country.region) ??
    active.find((fee) => !fee.region && !fee.country_id) ??
    null
  );
}

export function rowToRequirement(row: Row): DocumentRequirement {
  return {
    id: typeof row.id === "string" ? row.id : undefined,
    job_id: typeof row.job_id === "string" ? row.job_id : undefined,
    document_type: String(row.document_type ?? ""),
    required: row.required !== false,
    fee_applicable: row.fee_applicable !== false,
    candidate_can_provide_existing: row.candidate_can_provide_existing !== false,
    cost_responsibility: String(row.cost_responsibility ?? "candidate"),
    notes: textOrNull(row.notes),
    sort_order: numberOrNull(row.sort_order) ?? 100,
  };
}

export function rowToFee(row: Row): DocumentFee {
  return {
    document_type: String(row.document_type ?? ""),
    label: String(row.label ?? documentTypeLabel(row.document_type)),
    region: textOrNull(row.region),
    country_id: textOrNull(row.country_id),
    amount: numberOrNull(row.amount) ?? 0,
    currency: String(row.currency ?? "KES"),
    is_active: row.is_active !== false,
  };
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}
