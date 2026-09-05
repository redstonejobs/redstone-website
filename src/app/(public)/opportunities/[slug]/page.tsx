import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredData } from "@/components/public/structured-data";
import { dateText } from "@/lib/admin/format";
import { formatSalary, getJobBySlug, type PublicJob } from "@/lib/public/jobs";
import {
  externalJobApplyUrl,
  foreignWorkerLabel,
  isExternalJob,
  sourceLabel,
} from "@/lib/public/job-source";
import { canonical, SITE_NAME } from "@/lib/public/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job || !isExternalJob(job)) {
    return { title: "Opportunity Not Found", robots: { index: false, follow: false } };
  }

  const location = [job.city, job.country].filter(Boolean).join(", ");
  const title = `${job.title}${location ? ` in ${location}` : ""} | ${SITE_NAME}`;
  const description = metaDescription(
    job.short_description || `${job.title} opportunity from ${sourceLabel(job)}. Review the source listing before applying.`
  );
  const url = canonical(`/opportunities/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    category: "jobs",
    robots: { index: true, follow: true },
    openGraph: { type: "website", url, siteName: SITE_NAME, title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function ExternalOpportunityPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job || !isExternalJob(job)) notFound();

  const applyUrl = externalJobApplyUrl(job);
  if (!applyUrl) notFound();

  const employer = job.source_employer_name || job.employer?.company_name || "Source employer";
  const salary = formatSalary(job);
  const source = sourceLabel(job);
  const closed = isClosed(job);

  return (
    <>
      {!closed ? <StructuredData data={jobPostingData(job, slug, employer)} /> : null}
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
            { "@type": "ListItem", position: 2, name: "Jobs", item: canonical("/jobs") },
            { "@type": "ListItem", position: 3, name: job.title, item: canonical(`/opportunities/${slug}`) },
          ],
        }}
      />

      <main className="bg-[#F3F4F6]">
        <section className="bg-[#071A3D] text-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <nav className="text-sm font-bold text-slate-300" aria-label="Breadcrumb">
              <Link href="/jobs" className="hover:text-[#F2D675]">Jobs</Link>
              <span className="mx-2">/</span>
              <span>{source}</span>
            </nav>
            <div className="mt-7 flex flex-wrap gap-2">
              <Badge>{source}</Badge>
              <Badge>{foreignWorkerLabel(job.foreign_worker_status)}</Badge>
              {job.country ? <Badge>{job.country}</Badge> : null}
            </div>
            <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight sm:text-5xl">{job.title}</h1>
            <p className="mt-4 text-lg text-slate-200">{[employer, job.city, job.country].filter(Boolean).join(" • ")}</p>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200">{job.short_description || job.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {closed ? (
                <span className="rounded-md bg-slate-600 px-6 py-3.5 text-sm font-black text-slate-200">Applications Closed</span>
              ) : (
                <a href={applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="rounded-md bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                  Apply at Source
                </a>
              )}
              <Link href="/jobs" className="rounded-md border border-white/25 px-6 py-3.5 text-sm font-black text-white hover:border-[#D4AF37]">Browse all jobs</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-7 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="space-y-7">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Vacancy facts</p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Opportunity snapshot</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Fact label="Employer" value={employer} />
                <Fact label="Location" value={[job.city, job.country].filter(Boolean).join(", ")} />
                <Fact label="Salary" value={salary || "Not stated by source"} />
                <Fact label="Job type" value={label(job.job_type)} />
                <Fact label="Vacancies" value={job.vacancies ? String(job.vacancies) : "Not stated"} />
                <Fact label="Deadline" value={dateText(job.application_deadline) || "Not stated"} />
                <Fact label="Source posted" value={dateText(job.source_posted_at) || "Not stated"} />
                <Fact label="Last checked" value={dateText(job.source_last_seen_at) || "Recently"} />
                <Fact label="International eligibility" value={foreignWorkerLabel(job.foreign_worker_status)} />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Source-normalized information</p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">About this vacancy</h2>
              <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">{job.description || job.short_description}</p>
              {job.immigration_evidence ? (
                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <strong>Work authorization evidence:</strong> {job.immigration_evidence}
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-[#071A3D]">Important source notice</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>This is a syndicated discovery listing from {source}. Red Stone is not presented as the hiring employer and does not claim a recruitment mandate for this external vacancy.</p>
                <p>Eligibility, sponsorship, LMIA/work-permit status, salary, deadline and availability can change. Verify the complete current posting at the original source before applying or making any decision.</p>
                <p>For this external listing, the Apply button sends you to the source. Red Stone does not collect a candidate application for this vacancy.</p>
              </div>
            </section>
          </article>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Original listing</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">Apply through {source}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Open the source to confirm the latest employer requirements and submit your application there.</p>
              {!closed ? (
                <a href={applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-5 block rounded-md bg-[#D4AF37] px-5 py-4 text-center text-sm font-black text-[#071A3D]">Apply at Source</a>
              ) : (
                <span className="mt-5 block rounded-md bg-slate-200 px-5 py-4 text-center text-sm font-black text-slate-500">Applications Closed</span>
              )}
              <a href={job.source_url || applyUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 block text-center text-sm font-black text-[#071A3D] underline">View original listing</a>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}

function jobPostingData(job: PublicJob, slug: string, employer: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.short_description || "External job opportunity.",
    identifier: {
      "@type": "PropertyValue",
      name: employer,
      value: job.source_external_id || job.id,
    },
    datePosted: job.source_posted_at || job.published_at,
    hiringOrganization: { "@type": "Organization", name: employer },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city ? { addressLocality: job.city } : {}),
        ...(job.country ? { addressCountry: job.country } : {}),
      },
    },
    url: canonical(`/opportunities/${slug}`),
    mainEntityOfPage: canonical(`/opportunities/${slug}`),
    directApply: false,
  };

  if (job.application_deadline) data.validThrough = `${job.application_deadline}T23:59:59`;
  const employmentType = employmentTypeFor(job.job_type);
  if (employmentType) data.employmentType = employmentType;

  if (job.salary_confirmed && job.currency && (job.salary_min !== null || job.salary_max !== null)) {
    data.salaryCurrency = job.currency;
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min !== null ? { minValue: job.salary_min } : {}),
        ...(job.salary_max !== null ? { maxValue: job.salary_max } : {}),
        unitText: salaryUnit(job.salary_period),
      },
    };
  }
  return data;
}

function employmentTypeFor(value: string | null) {
  if (value === "full_time") return "FULL_TIME";
  if (value === "part_time") return "PART_TIME";
  if (value === "seasonal" || value === "contract") return "TEMPORARY";
  return null;
}

function salaryUnit(value: string | null) {
  const units: Record<string, string> = { hour: "HOUR", day: "DAY", week: "WEEK", month: "MONTH", year: "YEAR" };
  return units[value ?? ""] || "YEAR";
}

function isClosed(job: PublicJob) {
  const today = new Date().toISOString().slice(0, 10);
  return job.source_status === "closed" || Boolean(
    (job.application_deadline && job.application_deadline < today) ||
    (typeof job.vacancies === "number" && job.vacancies <= 0)
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-100">{children}</span>;
}

function Fact({ label: factLabel, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">{factLabel}</p><p className="mt-1.5 font-semibold text-slate-800">{value || "Not stated"}</p></div>;
}

function label(value: string | null) {
  return value ? value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase()) : "Not stated";
}

function metaDescription(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= 158 ? clean : `${clean.slice(0, 155).trimEnd()}...`;
}
