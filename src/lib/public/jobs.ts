import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { slugify } from "./countries";

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

  /*
   * These three public-facing names are intentionally kept for compatibility
   * with existing components. In PUBLIC_JOB_SELECT they are aliases of the
   * real database columns:
   *   accommodation_provided
   *   transport_provided
   *   meals_provided
   */
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
  employer:employers!inner(company_name, verification_status, is_active)
`;

const PUBLIC_JOB_CARD_SELECT = `
  id,
  title,
  slug,
  employer_id,
  country,
  city,
  category,
  job_type,
  skill_level,
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
  processing_time_min,
  processing_time_max,
  processing_time_unit,
  processing_time_note,
  published_at,
  employer:employers!inner(company_name, verification_status, is_active)
`;

export const SITEMAP_SHARD_SIZE = 1000;

export const PAGE_SIZE = 9;

export async function getPublishedJobs(params: JobSearchParams = {}) {
  const supabase = await createClient();
  const page = normalizePage(params.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("jobs")
    .select(PUBLIC_JOB_CARD_SELECT, { count: "exact" })
    .eq("status", "published")
    .not("slug", "is", null)
    .eq("employer.verification_status", "verified")
    .eq("employer.is_active", true);

  if (!params.includeClosed) {
    query = query.or(
      `application_deadline.is.null,application_deadline.gte.${todayDate()}`
    ).or("vacancies.is.null,vacancies.gt.0");
  }

  if (params.q) {
    const safe = params.q
      .replaceAll("%", "")
      .replaceAll(",", " ")
      .trim();

    if (safe) {
      // Load the large occupation catalogue only when a visitor actually
      // submits a free-text search. Exact job/detail requests stay lightweight
      // on Cloudflare Workers.
      const { occupationSearchTerms } = await import("@/lib/jobs/catalogue");
      const searchTerms = [
        ...new Set(
          [safe, ...occupationSearchTerms(safe)]
            .map(safeSearchTerm)
            .filter(Boolean)
        ),
      ];

      query = query.or(
        searchTerms
          .flatMap((term) => [
            `title.ilike.%${term}%`,
            `country.ilike.%${term}%`,
            `category.ilike.%${term}%`,
            `job_type.ilike.%${term}%`,
          ])
          .join(",")
      );
    }
  }

  if (params.country) {
    query = query.eq("country", params.country);
  }

  if (params.category) {
    query = query.eq("category", params.category);
  }

  if (params.skill) {
    query = query.eq("skill_level", params.skill);
  }

  if (params.job_type) {
    query = query.eq("job_type", params.job_type);
  }

  if (params.sponsorship === "true") {
    query = query.or(
      "visa_sponsorship.eq.true,sponsorship_status.eq.included"
    );
  }

  if (params.accommodation === "true") {
    query = query.or(
      "accommodation_provided.eq.true,accommodation_status.eq.included"
    );
  }

  if (params.contract_type) {
    query = query.eq("contract_type", params.contract_type);
  }

  if (params.salary_min) {
    const min = Number(params.salary_min);

    if (Number.isFinite(min) && min >= 0) {
      query = query.gte("salary_max", min);
    }
  }

  if (params.salary_max) {
    const max = Number(params.salary_max);

    if (Number.isFinite(max) && max >= 0) {
      query = query.lte("salary_min", max);
    }
  }

  const sort = params.sort ?? "newest";

  if (sort === "deadline") {
    query = query.order("application_deadline", {
      ascending: true,
      nullsFirst: false,
    });
  } else if (sort === "salary_asc") {
    query = query.order("salary_min", {
      ascending: true,
      nullsFirst: false,
    });
  } else if (sort === "salary_desc") {
    query = query.order("salary_max", {
      ascending: false,
      nullsFirst: false,
    });
  } else {
    query = query.order("published_at", {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, count, error } = await query
    .range(from, to)
    .returns<PublicJob[]>();

  return {
    jobs: data ?? [],
    count: error ? 0 : count ?? 0,
    error,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getFeaturedJobs(limit = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_CARD_SELECT)
    .eq("status", "published")
    .not("slug", "is", null)
    .eq("employer.verification_status", "verified")
    .eq("employer.is_active", true)
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit)
    .returns<PublicJob[]>();

  return {
    jobs: data ?? [],
    error,
  };
}

export const getJobBySlug = cache(async function getJobBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(PUBLIC_JOB_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("employer.verification_status", "verified")
    .eq("employer.is_active", true)
    .maybeSingle<PublicJob>();

  return {
    job: data,
    error,
  };
});

/**
 * Fetch one bounded published-job sitemap page using a minimal select.
 *
 * Sitemap generation uses a separate head count plus fixed-size shards so a
 * single Worker request never has to materialize the full job catalogue.
 */
export async function getPublishedJobSitemapCount() {
  const supabase = createPublicSitemapClient();
  const { count, error } = await supabase
    .from("jobs")
    .select("id, employer:employers!inner(id)", { count: "exact", head: true })
    .eq("status", "published")
    .not("slug", "is", null)
    .eq("employer.verification_status", "verified")
    .eq("employer.is_active", true)
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0");

  if (error) {
    throw new Error(
      `Unable to count published jobs for sitemap: ${error.message}`
    );
  }

  return count ?? 0;
}

export function getPublishedJobSitemapShardCount(count: number) {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
  return Math.ceil(safeCount / SITEMAP_SHARD_SIZE);
}

export async function getPublishedJobSitemapEntries(shardId = 0) {
  const supabase = createPublicSitemapClient();
  const entries: PublishedJobSitemapEntry[] = [];
  const safeShardId = Math.max(0, Math.floor(shardId));
  const from = safeShardId * SITEMAP_SHARD_SIZE;
  const to = from + SITEMAP_SHARD_SIZE - 1;

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "slug, published_at, created_at, updated_at, application_deadline, employer:employers!inner(id)"
    )
    .eq("status", "published")
    .not("slug", "is", null)
    .eq("employer.verification_status", "verified")
    .eq("employer.is_active", true)
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0")
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .range(from, to)
    .returns<
      {
        slug: string | null;
        published_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        application_deadline: string | null;
      }[]
    >();

  if (error) {
    throw new Error(
      `Unable to load published jobs for sitemap: ${error.message}`
    );
  }

  for (const row of data ?? []) {
    if (!row.slug) continue;

    entries.push({
      route: row.slug,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      application_deadline: row.application_deadline,
    });
  }

  return entries;
}

export async function getJobsForCountry(country: string, limit = 6) {
  return getPublishedJobs({
    country,
    page: "1",
    sort: "newest",
  }).then((result) => ({
    ...result,
    jobs: result.jobs.slice(0, limit),
  }));
}

export function jobHref(job: PublicJob) {
  return `/jobs/${job.slug || slugify(job.title || String(job.id))}`;
}

export function publicJobApplyHref(job: Pick<PublicJob, "slug">) {
  return job.slug ? `/apply/${job.slug}` : "#";
}

export function isPublicJobClosed(
  job: Pick<PublicJob, "application_deadline" | "vacancies">
) {
  const today = todayDate();

  return Boolean(
    (job.application_deadline && job.application_deadline < today) ||
      (typeof job.vacancies === "number" && job.vacancies <= 0)
  );
}

export function publicJobApplyState({
  job,
  existingApplication,
  signedIn,
}: {
  job: Pick<PublicJob, "id" | "title" | "slug" | "application_deadline" | "vacancies">;
  existingApplication?: { id?: string; status?: string };
  signedIn?: boolean;
}) {
  if (isPublicJobClosed(job)) {
    return {
      label: "Applications Closed",
      href: "#",
      disabled: true,
    };
  }

  if (existingApplication?.id) {
    return {
      label: "View My Application",
      href: `/candidate/applications/${existingApplication.id}`,
      disabled: false,
    };
  }

  const href = publicJobApplyHref(job);

  if (href === "#") {
    return {
      label: "Applications Closed",
      href,
      disabled: true,
    };
  }

  if (signedIn === false) {
    return {
      label: "Apply Now",
      href: `/login?next=${encodeURIComponent(href)}`,
      disabled: false,
    };
  }

  return {
    label: "Apply Now",
    href,
    disabled: false,
  };
}

export function formatSalary(job: PublicJob) {
  if (
    job.salary_confirmed === false &&
    !job.salary_min &&
    !job.salary_max
  ) {
    return null;
  }

  if (!job.salary_min && !job.salary_max) {
    return null;
  }

  const currency = job.currency
    ? `${job.currency} `
    : "";

  const period = job.salary_period
    ? `/${job.salary_period}`
    : "";

  if (job.salary_min && job.salary_max) {
    return `${currency}${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}${period}`;
  }

  return `${currency}${(
    job.salary_min ?? job.salary_max
  )?.toLocaleString()}${period}`;
}

export function normalizePage(page?: string) {
  const parsed = Number(page);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : 1;
}

function safeSearchTerm(value: string) {
  return value
    .replaceAll("%", "")
    .replaceAll(",", " ")
    .trim();
}

function createPublicSitemapClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable."
    );
  }

  return createSupabaseClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}
