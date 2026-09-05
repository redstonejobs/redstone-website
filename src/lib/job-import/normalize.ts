import { slugify } from "@/lib/public/countries";
import type { ExternalJobCandidate, ImportClassification } from "./types";

export function normalizedJobPayload(candidate: ExternalJobCandidate, classification: ImportClassification) {
  const { category, skillLevel } = inferCategoryAndSkill(candidate);
  const sourceLabel = candidate.provider === "jobbank" ? "Canada Job Bank" : "FoundRole";
  const company = candidate.companyName || "the source employer";
  const location = [candidate.city, candidate.country].filter(Boolean).join(", ");
  const factualNotes = [
    candidate.employmentType ? `The source classifies the role as ${candidate.employmentType}.` : null,
    candidate.workLocationType ? `Work arrangement is listed as ${candidate.workLocationType.replaceAll("_", " ")}.` : null,
    candidate.postedAt ? `The source posting date is ${candidate.postedAt}.` : null,
    candidate.vacancies && candidate.vacancies > 1 ? `${candidate.vacancies} positions are indicated by the source.` : null,
  ].filter(Boolean).join(" ");
  const description = [
    `Current ${candidate.title} opportunity${location ? ` in ${location}` : ""}, listed by ${company} and discovered through ${sourceLabel}.`,
    factualNotes || "Vacancy metadata is based on the source listing available when this page was last checked.",
    `This Red Stone page intentionally summarizes factual vacancy metadata instead of republishing the source description. Review the original ${sourceLabel} listing for complete duties, qualifications, employer terms, availability and application instructions.`,
  ].join(" ");
  const externalIdHash = stableHash(`${candidate.provider}:${candidate.externalId}`);
  const slug = `${slugify(candidate.title)}-${slugify(candidate.city || candidate.country)}-${externalIdHash.slice(0, 8)}`;
  const sourceFingerprint = stableHash([
    candidate.title,
    candidate.companyName,
    candidate.city,
    candidate.country,
  ].map(normalizeFingerprintPart).join("|"));

  return {
    title: candidate.title.trim(),
    slug,
    employer_id: null,
    country: candidate.country,
    city: candidate.city,
    category,
    job_type: normalizeEmploymentType(candidate.employmentType),
    skill_level: skillLevel,
    short_description: description.slice(0, 320),
    description,
    responsibilities: null,
    requirements: "Review the original source listing for all vacancy-specific requirements before applying.",
    experience_requirements: null,
    education_requirements: null,
    language_requirements: null,
    physical_requirements: null,
    additional_requirements: classification.immigrationEvidence
      ? `Immigration / work authorization signal found in source: ${classification.immigrationEvidence}`
      : "Visa or work-permit sponsorship has not been inferred unless the source explicitly states it.",
    salary_min: candidate.salaryMin ?? null,
    salary_max: candidate.salaryMax ?? null,
    currency: candidate.salaryCurrency ?? null,
    salary_period: candidate.salaryPeriod ?? null,
    salary_confirmed: Boolean(candidate.salaryMin || candidate.salaryMax),
    salary_note: candidate.salaryMin || candidate.salaryMax ? "Salary reported by the external source." : null,
    contract_type: normalizeContractType(candidate.employmentType),
    vacancies: Math.max(1, candidate.vacancies ?? 1),
    application_deadline: candidate.deadline ?? null,
    visa_sponsorship: classification.visaSponsorship,
    accommodation_provided: false,
    transport_provided: false,
    meals_provided: false,
    sponsorship_status: classification.sponsorshipStatus,
    accommodation_status: "not_confirmed",
    meals_status: "not_confirmed",
    transport_status: "not_confirmed",
    medical_insurance_status: "not_confirmed",
    air_ticket_status: "not_confirmed",
    training_status: "not_confirmed",
    fee_relationship: "not_confirmed",
    source_provider: candidate.provider,
    source_external_id: candidate.externalId,
    source_url: candidate.sourceUrl,
    source_apply_url: candidate.applyUrl || candidate.sourceUrl,
    source_employer_name: candidate.companyName,
    source_posted_at: toIsoOrNull(candidate.postedAt),
    source_last_seen_at: new Date().toISOString(),
    source_payload_hash: stableHash(JSON.stringify(candidate.raw ?? candidate)),
    source_fingerprint: sourceFingerprint,
    source_attribution: sourceLabel,
    source_status: "active",
    auto_imported: true,
    application_mode: "external",
    foreign_worker_status: classification.foreignWorkerStatus,
    immigration_evidence: classification.immigrationEvidence,
    import_quality_score: classification.qualityScore,
  };
}

export function sourceFingerprint(candidate: ExternalJobCandidate) {
  return stableHash([
    candidate.title,
    candidate.companyName,
    candidate.city,
    candidate.country,
  ].map(normalizeFingerprintPart).join("|"));
}

export function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function inferCategoryAndSkill(candidate: ExternalJobCandidate) {
  const text = `${candidate.title} ${candidate.category ?? ""}`.toLowerCase();
  if (/nurse|physician|doctor|therap|caregiver|personal support|health care aide|healthcare/.test(text)) {
    return { category: "Healthcare & Medical", skillLevel: "skilled" };
  }
  if (/clean|housekeep|janitor|laundry|room attendant/.test(text)) {
    return { category: "Cleaning & Housekeeping", skillLevel: "unskilled" };
  }
  if (/warehouse|picker|packer|forklift|logistics/.test(text)) {
    return { category: "Factory & Warehouse", skillLevel: "semi_skilled" };
  }
  if (/security|guard|watchman/.test(text)) {
    return { category: "Security", skillLevel: "semi_skilled" };
  }
  if (/driver|delivery|truck|transport/.test(text)) {
    return { category: "Driving & Transport", skillLevel: "semi_skilled" };
  }
  if (/construction|labou?r|site worker|helper/.test(text)) {
    return { category: "Construction & Site Support", skillLevel: "unskilled" };
  }
  if (/farm|agricultur|harvest|greenhouse|orchard/.test(text)) {
    return { category: "Agriculture, Farm & Forestry", skillLevel: "unskilled" };
  }
  if (/hotel|hospitality|restaurant|kitchen|server|food/.test(text)) {
    return { category: "Hospitality & Restaurant", skillLevel: "semi_skilled" };
  }
  return { category: "General Workers", skillLevel: "unskilled" };
}

function normalizeEmploymentType(value: string | null | undefined) {
  const text = (value ?? "").toLowerCase();
  if (text.includes("part")) return "part_time";
  if (text.includes("season")) return "seasonal";
  if (text.includes("contract")) return "contract";
  if (text.includes("temporary")) return "contract";
  return "full_time";
}

function normalizeContractType(value: string | null | undefined) {
  const text = (value ?? "").toLowerCase();
  if (text.includes("permanent")) return "permanent";
  if (text.includes("season")) return "seasonal";
  if (text.includes("temporary")) return "temporary";
  if (text.includes("contract")) return "fixed_term";
  return null;
}

function normalizeFingerprintPart(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function toIsoOrNull(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
