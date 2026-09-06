import type { Metadata } from "next";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { JobSearch } from "@/components/public/job-search";
import { getPublishedJobs, type PublicJob } from "@/lib/public/jobs";
import { getConfiguredCountries } from "@/lib/public/countries";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Available Jobs",
  description: "Browse published international job opportunities from Red Stone Employment Agency.",
  alternates: { canonical: canonical("/jobs") },
};

export const dynamic = "force-dynamic";

type JobsProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

const SORT_FILTER_KEYS = [
  "q",
  "country",
  "category",
  "skill",
  "sponsorship",
  "job_type",
  "contract_type",
  "salary_min",
  "accommodation",
  "foreign_worker",
] as const;

export default async function JobsPage({ searchParams }: JobsProps) {
  const raw = (await searchParams) ?? {};
  const params = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  ) as Record<string, string | undefined>;

  // Source and maximum-salary filters were removed from the public search UI.
  // Ignore stale links carrying them so candidates never have invisible filters applied.
  delete params.source;
  delete params.salary_max;

  const selectedSort = params.sort ?? "mixed";
  const [result, countries] = await Promise.all([getPublishedJobs(params), getConfiguredCountries()]);
  const displayJobs = selectedSort === "mixed" ? mixJobs(result.jobs, result.page) : result.jobs;
  const totalPages = Math.max(Math.ceil(result.count / result.pageSize), 1);
  const queryWithoutPage = new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => entry[0] !== "page" && typeof entry[1] === "string" && entry[1] !== ""
    )
  );

  return (
    <>
      <section className="bg-[#071A3D] px-4 pb-24 pt-14 text-white sm:pb-28 sm:pt-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">Available Opportunities</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Find Your Next Job</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Browse current published vacancies and apply directly through Red Stone Employment Agency.
          </p>
        </div>
      </section>

      <section className="bg-[#F3F4F6] px-4 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative -mt-14 sm:-mt-16">
            <JobSearch defaults={params} countries={countries} />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Current Vacancies</p>
              <h2 className="mt-1 text-2xl font-black text-[#071A3D]">Available Jobs</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {result.count.toLocaleString()} {result.count === 1 ? "opportunity" : "opportunities"}
              </p>
            </div>

            <form className="flex flex-wrap items-end gap-2" aria-label="Sort jobs">
              {SORT_FILTER_KEYS.map((key) =>
                params[key] ? <input key={key} type="hidden" name={key} value={params[key]} /> : null
              )}
              <label className="grid gap-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Sort
                <select
                  name="sort"
                  defaultValue={selectedSort}
                  className="min-h-10 min-w-48 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-700 outline-none transition focus:border-[#B8860B] focus:ring-2 focus:ring-[#D4AF37]/20"
                >
                  <option value="mixed">Mixed Jobs</option>
                  <option value="newest">Newest on Red Stone</option>
                  <option value="source_newest">Newest at source</option>
                  <option value="salary_asc">Salary Low to High</option>
                  <option value="salary_desc">Salary High to Low</option>
                  <option value="deadline">Closing Soon</option>
                </select>
              </label>
              <button className="min-h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-[#071A3D] transition hover:border-[#D4AF37] hover:bg-[#fffaf0]">
                Apply
              </button>
            </form>
          </div>

          <div className="mt-7">
            {displayJobs.length ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyJobsState />
            )}
          </div>

          {totalPages > 1 ? (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-700" aria-label="Jobs pagination">
              {result.page > 1 ? (
                <a
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 transition hover:border-[#D4AF37] hover:text-[#071A3D]"
                  href={`/jobs?${pageQuery(queryWithoutPage, result.page - 1)}`}
                >
                  Previous
                </a>
              ) : null}

              <span className="px-3 py-3 text-slate-500">
                Page {result.page} of {totalPages}
              </span>

              {result.page < totalPages ? (
                <a
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 transition hover:border-[#D4AF37] hover:text-[#071A3D]"
                  href={`/jobs?${pageQuery(queryWithoutPage, result.page + 1)}`}
                >
                  Next
                </a>
              ) : null}
            </nav>
          ) : null}
        </div>
      </section>
    </>
  );
}

function mixJobs(jobs: PublicJob[], page: number) {
  return [...jobs].sort((a, b) => {
    const aScore = stableMixScore(`${page}:${a.id}`);
    const bScore = stableMixScore(`${page}:${b.id}`);
    return aScore - bScore;
  });
}

function stableMixScore(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pageQuery(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return next.toString();
}
