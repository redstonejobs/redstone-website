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
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period: string | null;
  vacancies: number | null;
  application_deadline: string | null;
  visa_sponsorship: boolean | null;
  accommodation: boolean | null;
  transport: boolean | null;
  meals: boolean | null;
  published_at: string | null;
  created_at: string | null;
  employer?: { company_name: string | null } | null;
};

export type JobSearchParams = {
  q?: string;
  country?: string;
  category?: string;
  skill?: string;
  sponsorship?: string;
  job_type?: string;
  sort?: string;
  page?: string;
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
  salary_min,
  salary_max,
  currency,
  salary_period,
  vacancies,
  application_deadline,
  visa_sponsorship,
  accommodation,
  transport,
  meals,
  published_at,
  created_at,
  employer:employers(company_name)
`;

export const PAGE_SIZE = 9;

export async function getPublishedJobs(params: JobSearchParams = {}) {
  const supabase = await createClient();
  const page = normalizePage(params.page);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase.from("jobs").select(PUBLIC_JOB_SELECT, { count: "exact" }).eq("status", "published");

  if (params.q) {
    const safe = params.q.replaceAll("%", "").replaceAll(",", " ").trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,country.ilike.%${safe}%,category.ilike.%${safe}%`);
  }
  if (params.country) query = query.eq("country", params.country);
  if (params.category) query = query.eq("category", params.category);
  if (params.skill) query = query.eq("skill_level", params.skill);
  if (params.job_type) query = query.eq("job_type", params.job_type);
  if (params.sponsorship === "true") query = query.eq("visa_sponsorship", true);

  const sort = params.sort ?? "newest";
  if (sort === "deadline") {
    query = query.order("application_deadline", { ascending: true, nullsFirst: false });
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

export async function getJobsForCountry(country: string, limit = 6) {
  return getPublishedJobs({ country, page: "1", sort: "newest" }).then((result) => ({
    ...result,
    jobs: result.jobs.slice(0, limit),
  }));
}

export function jobHref(job: PublicJob) {
  return `/jobs/${job.slug || slugify(job.title || String(job.id))}`;
}

export function formatSalary(job: PublicJob) {
  if (!job.salary_min && !job.salary_max) return null;
  const currency = job.currency ? `${job.currency} ` : "";
  const period = job.salary_period ? ` / ${job.salary_period}` : "";
  if (job.salary_min && job.salary_max) return `${currency}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}${period}`;
  return `${currency}${(job.salary_min ?? job.salary_max)?.toLocaleString()}${period}`;
}

export function normalizePage(page?: string) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

