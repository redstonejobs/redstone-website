import "server-only";

import { createClient } from "@/utils/supabase/server";
import { findCountry, getConfiguredCountries, type Country } from "./countries";
import type { PublicJob } from "./jobs";

type RequirementRow = {
  id?: string | null;
  job_id?: string | null;
  document_type?: string | null;
  required?: boolean | null;
  fee_applicable?: boolean | null;
  candidate_can_provide_existing?: boolean | null;
  cost_responsibility?: string | null;
  notes?: string | null;
  sort_order?: number | null;
};

type FeeRow = {
  document_type?: string | null;
  label?: string | null;
  region?: string | null;
  country_id?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  is_active?: boolean | null;
};

export type JobDocumentLine = {
  documentType: string;
  label: string;
  required: boolean;
  costResponsibility: string;
  note: string | null;
  estimatedAmount: number | null;
  currency: string;
};

export type JobDetailContext = {
  country: Country | null;
  programmeFee: {
    label: string;
    amount: number | null;
    currency: string;
    note: string | null;
  };
  documents: JobDocumentLine[];
  documentTotal: number;
  documentCurrency: string;
  estimatedTotal: number | null;
  estimatedTotalCurrency: string | null;
};

/**
 * Lightweight vacancy context for /jobs/[slug].
 *
 * The old detail route loaded the complete country configuration, every active
 * document fee, the large occupation catalogue and a paginated related-jobs
 * search for every request. This helper limits the hot path to one country
 * lookup, this job's requirements, and only the fee rows needed by those
 * requirements.
 */
export async function getJobDetailContext(job: PublicJob): Promise<JobDetailContext> {
  const supabase = await createClient();

  const [{ data: requirementRows }, countries] = await Promise.all([
    supabase
      .from("job_document_requirements")
      .select(
        "id, job_id, document_type, required, fee_applicable, candidate_can_provide_existing, cost_responsibility, notes, sort_order"
      )
      .eq("job_id", job.id)
      .order("sort_order", { ascending: true })
      .returns<RequirementRow[]>(),
    getConfiguredCountries(),
  ]);

  const country = findCountry(countries, job.country) ?? null;
  const requirements = requirementRows ?? [];
  const documentTypes = [
    ...new Set(
      requirements
        .map((row) => text(row.document_type))
        .filter((value): value is string => Boolean(value))
    ),
  ];

  let feeRows: FeeRow[] = [];

  if (documentTypes.length) {
    const { data } = await supabase
      .from("document_fee_catalog")
      .select("document_type, label, region, country_id, amount, currency, is_active")
      .eq("is_active", true)
      .in("document_type", documentTypes)
      .returns<FeeRow[]>();

    feeRows = data ?? [];
  }

  const documents = requirements.map((requirement) => {
    const documentType = text(requirement.document_type) ?? "document";
    const fee = findFee(documentType, feeRows, country);
    const feeApplicable = requirement.fee_applicable !== false;
    const responsibility = text(requirement.cost_responsibility) ?? "not_confirmed";
    const candidateCost = feeApplicable && ["candidate", "shared", "not_confirmed"].includes(responsibility);

    return {
      documentType,
      label: text(fee?.label) ?? labelFromKey(documentType),
      required: requirement.required !== false,
      costResponsibility: responsibility,
      note: text(requirement.notes),
      estimatedAmount: candidateCost ? number(fee?.amount) : null,
      currency: text(fee?.currency) ?? "KES",
    } satisfies JobDocumentLine;
  });

  const priced = documents.filter((line) => line.estimatedAmount !== null);
  const documentCurrency = priced[0]?.currency ?? "KES";
  const documentTotal = priced
    .filter((line) => line.currency === documentCurrency)
    .reduce((sum, line) => sum + (line.estimatedAmount ?? 0), 0);

  const programmeFee = resolveProgrammeFee(job, country);
  const canCombine =
    programmeFee.amount !== null &&
    (!priced.length || programmeFee.currency === documentCurrency);

  return {
    country,
    programmeFee,
    documents,
    documentTotal,
    documentCurrency,
    estimatedTotal: canCombine
      ? (programmeFee.amount ?? 0) + documentTotal
      : null,
    estimatedTotalCurrency: canCombine ? programmeFee.currency : null,
  };
}

export function formatJobMoney(amount: number | null | undefined, currency = "KES") {
  if (amount === null || amount === undefined) return "To be confirmed";
  return `${currency} ${amount.toLocaleString("en-KE")}`;
}

export function formatJobContract(job: PublicJob) {
  const type = text(job.contract_type);
  const duration = number(job.contract_duration_value);
  const unit = text(job.contract_duration_unit);
  const note = text(job.contract_note);

  if (type === "Permanent") return note ? `Permanent (${note})` : "Permanent";
  if (duration !== null && unit) {
    return `${duration} ${unit}${type ? `, ${type}` : ""}${note ? ` (${note})` : ""}`;
  }
  if (type) return note ? `${type} (${note})` : type;
  return "To be confirmed";
}

export function formatJobProcessingTime(job: PublicJob, country?: Country | null) {
  const min = number(job.processing_time_min) ?? country?.processingTimeMin ?? null;
  const max = number(job.processing_time_max) ?? country?.processingTimeMax ?? null;
  const unit = text(job.processing_time_unit) ?? country?.processingTimeUnit ?? null;
  const note = text(job.processing_time_note) ?? country?.processingTimeNote ?? null;

  if (min !== null && max !== null && unit) return `${min}-${max} ${unit}${note ? ` (${note})` : ""}`;
  if (min !== null && unit) return `${min} ${unit}${note ? ` (${note})` : ""}`;
  return note ?? "To be confirmed";
}

export function detailStatus(value: string | null | undefined, fallback = "Not confirmed") {
  const normalized = text(value);
  if (!normalized || normalized === "not_confirmed") return fallback;
  return labelFromKey(normalized);
}

function resolveProgrammeFee(job: PublicJob, country: Country | null) {
  const override = number(job.country_fee_override);
  const currency = text(job.country_fee_override_currency) ?? country?.feeCurrency ?? "KES";

  if (override !== null) {
    return {
      label: country?.feeLabel ?? "Estimated Programme Cost",
      amount: override,
      currency,
      note: text(job.country_fee_override_note),
    };
  }

  return {
    label: country?.feeLabel ?? "Estimated Programme Cost",
    amount: country?.baseRecruitmentFee ?? null,
    currency: country?.feeCurrency ?? "KES",
    note: null,
  };
}

function findFee(documentType: string, fees: FeeRow[], country: Country | null) {
  const matches = fees.filter((fee) => text(fee.document_type) === documentType && fee.is_active !== false);

  return (
    matches.find((fee) => text(fee.country_id) && country?.id && text(fee.country_id) === country.id) ??
    matches.find((fee) => text(fee.region) && country?.region && text(fee.region) === country.region) ??
    matches.find((fee) => !text(fee.region) && !text(fee.country_id)) ??
    null
  );
}

function labelFromKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
