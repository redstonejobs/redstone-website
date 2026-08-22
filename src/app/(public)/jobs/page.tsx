import type { Metadata } from "next";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { JobSearch } from "@/components/public/job-search";
import { Band, Hero } from "@/components/public/sections";
import { getPublishedJobs } from "@/lib/public/jobs";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Available Jobs",
  description: "Browse published international job opportunities from Red Stone Employment Agency.",
  alternates: { canonical: canonical("/jobs") },
};

type JobsProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function JobsPage({ searchParams }: JobsProps) {
  const raw = (await searchParams) ?? {};
  const params = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])) as Record<string, string | undefined>;
  const result = await getPublishedJobs(params);
  const totalPages = Math.max(Math.ceil(result.count / result.pageSize), 1);

  return (
    <>
      <Hero eyebrow="Published vacancies" title="Browse Genuine Published Jobs" body="Search active opportunities that have been published in the Red Stone recruitment system. No fabricated vacancies are shown." primary={{ label: "Start Application", href: "/apply" }} />
      <Band tone="grey">
        <JobSearch defaults={params} />
        <div className="mt-8">
          {result.jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-700">
          <span>Page {result.page} of {totalPages}</span>
          {result.page > 1 ? <a className="rounded-md border px-4 py-2" href={`/jobs?page=${result.page - 1}`}>Previous</a> : null}
          {result.page < totalPages ? <a className="rounded-md border px-4 py-2" href={`/jobs?page=${result.page + 1}`}>Next</a> : null}
        </div>
      </Band>
    </>
  );
}
