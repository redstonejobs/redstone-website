import { createClient } from "@/utils/supabase/server";
import type { Row } from "@/lib/admin/types";
import {
  calculateDocumentCosts,
  rowToFee,
  rowToRequirement,
} from "@/lib/jobs/costs";
import { occupationSearchTerms } from "@/lib/jobs/catalogue";
import {
  findCountry,
  getConfiguredCountries,
  slugify,
} from "./countries";
import { isExternalJob } from "./job-source";

export type PublicJob = {
  id: string;
  title: string | null;
  slug: string | null;
  employer_id: string | null;
  country: string | null;
  city: string | null;
  category: string | null;
  job_type: string | null;
  skill_level: string | null;
  description: string | null;
  short_description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  experience_requirements: string | null;
  education_requirements: string | null;
  language_requirements: string | null;
  physical_requirements: string | null;
  additional_requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period: string | null;
  salary_confirmed: boolean | null;
  salary_note: string | null;
  contract_type: string | null;
  contract_duration_value: number | null;
  contract_duration_unit: string | null;
  contract_note: string | null;
  working_hours_per_week: number | null;
  work_schedule: string | null;
  overtime_note: string | null;
  vacancies: number | null;
  application_deadline: string | null;
  visa_sponsorship: boolean | null;
  accommodation: boolean | null;
  transport: boolean | null;
  meals: boolean | null;
  sponsorship_status: string | null;
  accommodation_status: string | null;
  meals_status: string | null;
  transport_status: string | null;
  medical_insurance_status: string | null;
  air_ticket_status: string | null;
  training_status: string | null;
  annual_leave_note: string | null;
  other_benefits: string | null;
  country_fee_override: number | null;
  country_fee_override_currency: string | null;
  country_fee_override_note: string | null;
  fee_relationship: string | null;
  processing_time_min: number | null;
  processing_time_max: number | null;
  processing_time_unit: string | null;
  processing_time_note: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  source_provider: string | null;
  source_external_id: string | null;
  source_url: string | null;
  source_apply_url: string | null;
  source_employer_name: string | null;
  source_posted_at: string | null;
  source_last_seen_at: string | null;
  source_attribution: string | null;
  source_status: string | null;
  auto_imported: boolean | null;
  application_mode: string | null;
  foreign_worker_status: string | null;
  immigration_evidence: string | null;
  import_quality_score: number | null;
  employer?: {
    company_name: string | null;
    verification_status: string | null;
    is_active: boolean | null;
  } | null;
};

export type JobSearchParams = {
  q?: string;
  country?: string;
  category?: string;
  skill?: string;
  sponsorship?: string;
  accommodation?: string;
  salary_min?: string;
  salary_max?: string;
  contract_type?: string;
  job_type?: string;
  source?: string;
  foreign_worker?: string;
  sort?: string;
  page?: string;
  includeClosed?: boolean;
};

export type PublishedJobSitemapEntry = {
  route: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  application_deadline: string | null;
};

const PUBLIC_JOB_SELECT = `
  id,
  title,
  slug,
  employer_id,
  country,
  city,
  category,
  job_type,
  skill_level,
  description,
  short_description,
  responsibilities,
  requirements,
  experience_requirements,
  education_requirements,
  language_requirements,
  physical_requirements,
  additional_requirements,
  salary_min,
  salary_max,
  currency,
  salary_period,
  salary_confirmed,
  salary_note,
  contract_type,
  contract_duration_value,
  contract_duration_unit,
  contract_note,
  working_hours_per_week,
  work_schedule,
  overtime_note,
  vacancies,
  application_deadline,
  visa_sponsorship,
  accommodation:accommodation_provided,
  transport:transport_provided,
  meals:meals_provided,
  sponsorship_status,
  accommodation_status,
  meals_status,
  transport_status,
  medical_insurance_status,
  air_ticket_status,
  training_status,
  annual_leave_note,
  other_benefits,
  country_fee_override,
  country_fee_override_currency,
  country_fee_override_note,
  fee_relationship,
  processing_time_min,
  processing_time_max,
  processing_time_unit,
  processing_time_note,
  published_at,
  created_at,
  updated_at,
  source_provider,
  source_external_id,
  source_url,
  source_apply_url,
  source_employer_name,
  source_posted_at,
  source_last_seen_at,
  source_attribution,
  source_status,
  auto_imported,
  application_mode,
  foreign_worker_status,
  immigration_evidence,
  import_quality_score,
  employer:employers(company_name, verification_status, is_active)
`;

const SITEMAP_BATCH_SIZE = 1000;
export const PAGE_SIZE = 9;

export async function getPublishedJobs(params: JobSearchParams = {}) {
  const supabase = await createClient();
  const page = normalizePage(params.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("jobs")
    .select(PUBLIC_JOB_SELECT, { count: "exact" })
    .eq("status", "published")
    .not("slug", "is", null);

  if (!params.includeClosed) {
    query = query
      .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
      .or("vacancies.is.null,vacancies.gt.0")
      .or("source_status.is.null,source_status.eq.active");
  }

  if (params.q) {
    const safe = params.q.replaceAll("%", "").replaceAll(",", " ").trim();
    if (safe) {
      const searchTerms = [
        ...new Set([safe, ...occupationSearchTerms(safe)].map(safeSearchTerm).filter(Boolean)),
      ];
      query = query.or(
        searchTerms
          .flatMap((term) => [
            `title.ilike.%${term}%`,
            `country.ilike.%${term}%`,
            `city.ilike.%${term}%`,
            `category.ilike.%${term}%`,
            `job_type.ilike.%${term}%`,
            `source_employer_name.ilike.%${term}%`,
          ])
          .join(",")
      );
    }
  }

  if (params.country) query = query.eq("country", params.country);
  if (params.category) query = query.eq("category", params.category);
  if (params.skill) query = query.eq("skill_level", params.skill);
  if (params.job_type) query = query.eq("job_type", params.job_type);
  if (params.source) query = query.eq("source_provider", params.source);

  if (params.foreign_worker === "accepted") {
    query = query.in("foreign_worker_status", [
      "verified_foreign_recruitment",
      "international_applicants_accepted",
      "lmia_requested",
      "lmia_approved",
      "sponsorship_confirmed",
    ]);
  } else if (params.foreign_worker === "sponsorship") {
    query = query.in("foreign_worker_status", [
      "verified_foreign_recruitment",
      "lmia_approved",
      "sponsorship_confirmed",
    ]);
  } else if (params.foreign_worker === "unconfirmed") {
    query = query.in("foreign_worker_status", ["unknown", "sponsorship_unconfirmed"]);
  }

  if (params.sponsorship === "true") {
    query = query.or("visa_sponsorship.eq.true,sponsorship_status.eq.included");
  }
  if (params.accommodation === "true") {
    query = query.or("accommodation_provided.eq.true,accommodation_status.eq.included");
  }
  if (params.contract_type) query = query.eq("contract_type", params.contract_type);

  if (params.salary_min) {
    const min = Number(params.salary_min);
    if (Number.isFinite(min) && min >= 0) query = query.gte("salary_max", min);
  }
  if (params.salary_max) {
    const max = Number(params.salary_max);
    if (Number.isFinite(max) && max >= 0) query = query.lte("salary_min", max);
  }

  const sort = params.sort ?? "newest";
  if (sort === "deadline") {
    query = query.order("application_deadline", { ascending: true, nullsFirst: false });
  } else if (sort === "salary_asc") {
    query = query.order("salary_min", { ascending: true, nullsFirst: false });
  } else if (sort === "salary_desc") {
    query = query.order("salary_max", { ascending: false, nullsFirst: false });
  } else if (sort === "source_newest") {
    query = query.order("source_posted_at", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("published_at", { ascending: false, nullsFirst: false });
  }

  const { data, count, error } = await query.range(from, to).returns<PublicJob[]>();
  return { jobs: data ?? [], count: error ? 0 : count ?? 0, error, page, pageSize: PAGE_SIZE };
}

export async function getFeaturedJobs(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_SELECT)
    .eq("status", "published")
    .not("slug", "is", null)
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0")
    .or("source_status.is.null,source_status.eq.active")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<PublicJob[]>();
  return { jobs: data ?? [], error };
}

export async function getJobBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<PublicJob>();
  return { job: data, error };
}

export async function getPublishedJobSitemapEntries() {
  const supabase = await createClient();
  const entries: PublishedJobSitemapEntry[] = [];

  for (let from = 0; ; from += SITEMAP_BATCH_SIZE) {
    const to = from + SITEMAP_BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from("jobs")
      .select("slug, published_at, created_at, updated_at, application_deadline, source_provider, application_mode")
      .eq("status", "published")
      .not("slug", "is", null)
      .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
      .or("vacancies.is.null,vacancies.gt.0")
      .or("source_status.is.null,source_status.eq.active")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(from, to)
      .returns<{
        slug: string | null;
        published_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        application_deadline: string | null;
        source_provider: string | null;
        application_mode: string | null;
      }[]>();

    if (error) throw new Error(`Unable to load published jobs for sitemap: ${error.message}`);
    const rows = data ?? [];
    for (const row of rows) {
      if (!row.slug) continue;
      entries.push({
        route: isExternalJob(row) ? `/opportunities/${row.slug}` : `/jobs/${row.slug}`,
        published_at: row.published_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        application_deadline: row.application_deadline,
      });
    }
    if (rows.length < SITEMAP_BATCH_SIZE) break;
  }
  return entries;
}

export async function getJobsForCountry(country: string, limit = 6) {
  return getPublishedJobs({ country, page: "1", sort: "newest" }).then((result) => ({
    ...result,
    jobs: result.jobs.slice(0, limit),
  }));
}

export async function getJobCatalogueContext(job: PublicJob, candidateDocuments: Row[] = []) {
  const supabase = await createClient();
  const countries = await getConfiguredCountries();
  const country = findCountry(countries, job.country);
  const [{ data: requirements }, { data: fees }] = await Promise.all([
    supabase
      .from("job_document_requirements")
      .select("id, job_id, document_type, required, fee_applicable, candidate_can_provide_existing, cost_responsibility, notes, sort_order")
      .eq("job_id", job.id)
      .order("sort_order", { ascending: true })
      .returns<Row[]>(),
    supabase
      .from("document_fee_catalog")
      .select("document_type, label, region, country_id, amount, currency, is_active")
      .eq("is_active", true)
      .returns<Row[]>(),
  ]);
  const requirementRows = requirements?.map(rowToRequirement) ?? [];
  const feeRows = fees?.map(rowToFee) ?? [];
  return {
    country,
    requirements: requirementRows,
    fees: feeRows,
    documentCosts: calculateDocumentCosts({
      requirements: requirementRows,
      feeCatalog: feeRows,
      country,
      candidateDocuments: candidateDocuments.map((document) => ({
        document_type: typeof document.document_type === "string" ? document.document_type : null,
        verification_status: typeof document.verification_status === "string" ? document.verification_status : null,
      })),
    }),
  };
}

export function jobHref(job: PublicJob) {
  const slug = job.slug || slugify(job.title || String(job.id));
  return isExternalJob(job) ? `/opportunities/${slug}` : `/jobs/${slug}`;
}

export function formatSalary(job: PublicJob) {
  if (job.salary_confirmed === false && !job.salary_min && !job.salary_max) return null;
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.currency ? `${job.currency} ` : "";
  const period = job.salary_period ? `/${job.salary_period}` : "";
  if (job.salary_min && job.salary_max) {
    return `${currency}${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}${period}`;
  }
  return `${currency}${(job.salary_min ?? job.salary_max)?.toLocaleString()}${period}`;
}

export function normalizePage(page?: string) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function safeSearchTerm(value: string) {
  return value.replaceAll("%", "").replaceAll(",", " ").trim();
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}
