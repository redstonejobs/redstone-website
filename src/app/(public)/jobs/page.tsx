import type { Metadata } from "next";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { JobSearch } from "@/components/public/job-search";
import { Band, Hero } from "@/components/public/sections";
import { JOB_OCCUPATIONS } from "@/lib/jobs/catalogue";
import { getPublishedJobs } from "@/lib/public/jobs";
import { getConfiguredCountries } from "@/lib/public/countries";
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
  const [result, countries] = await Promise.all([getPublishedJobs(params), getConfiguredCountries()]);
  const totalPages = Math.max(Math.ceil(result.count / result.pageSize), 1);
  const queryWithoutPage = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => entry[0] !== "page" && typeof entry[1] === "string" && entry[1] !== "")
  );
  const occupationGroups = catalogueGroups();

  return (
    <>
      <Hero eyebrow="Published vacancies" title="Browse Genuine Published Jobs" body="Search active opportunities that have been published in the Red Stone recruitment system. No fabricated vacancies are shown." primary={{ label: "Start Application", href: "/apply" }} />
      <Band tone="grey">
        <JobSearch defaults={params} countries={countries} />
        <div className="mt-8">
          {result.jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm font-bold text-slate-700">
          <span>Page {result.page} of {totalPages}</span>
          {result.page > 1 ? <a className="rounded-md border px-4 py-2" href={`/jobs?${pageQuery(queryWithoutPage, result.page - 1)}`}>Previous</a> : null}
          {result.page < totalPages ? <a className="rounded-md border px-4 py-2" href={`/jobs?${pageQuery(queryWithoutPage, result.page + 1)}`}>Next</a> : null}
        </div>
      </Band>
      <Band>
        <div>
          <p className="text-sm font-black uppercase text-[#B8860B]">Catalogue</p>
          <h2 className="mt-2 text-3xl font-black text-[#071A3D]">Job Categories / Occupations We Recruit For</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            These are recruitment categories and occupation types, not current vacancies. Apply buttons appear only on published job vacancies above.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {occupationGroups.map((group) => (
            <section key={group.category} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-black text-[#071A3D]">{group.category}</h3>
              <p className="mt-1 text-xs font-bold uppercase text-slate-500">{group.skillLabel}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{group.occupations.slice(0, 6).join(", ")}{group.occupations.length > 6 ? ` and ${group.occupations.length - 6} more` : ""}</p>
            </section>
          ))}
        </div>
      </Band>
    </>
  );
}

function pageQuery(params: URLSearchParams, page: number) {
  const next = new URLSearchParams(params);
  next.set("page", String(page));
  return next.toString();
}

function catalogueGroups() {
  const labels: Record<string, string> = {
    unskilled: "Entry Level",
    semi_skilled: "Semi-Skilled",
    skilled: "Skilled",
    professional: "Professional",
  };
  const groups = new Map<string, { category: string; skillLabel: string; occupations: string[] }>();

  for (const occupation of JOB_OCCUPATIONS) {
    const group = groups.get(occupation.category) ?? {
      category: occupation.category,
      skillLabel: labels[occupation.skill_level] ?? occupation.skill_level,
      occupations: [],
    };
    group.occupations.push(occupation.name);
    groups.set(occupation.category, group);
  }

  return [...groups.values()];
}
