import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { dateText } from "@/lib/admin/format";
import {
  detailStatus,
  formatJobContract,
  formatJobMoney,
  formatJobProcessingTime,
  getJobDetailContext,
} from "@/lib/public/job-detail-context";
import {
  formatSalary,
  getJobBySlug,
  isPublicJobClosed,
  publicJobApplyHref,
} from "@/lib/public/jobs";
import {
  canonical,
  RECRUITMENT_DISCLAIMER,
  SITE_NAME,
} from "@/lib/public/site";
import { StructuredData } from "@/components/public/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);

  if (!job) {
    return {
      title: "Job Not Found",
      robots: { index: false, follow: false },
    };
  }

  const location = [job.city, job.country].filter(Boolean).join(", ");
  const title = location
    ? `${job.title} in ${location} | ${SITE_NAME}`
    : `${job.title} | ${SITE_NAME}`;
  const description = metaDescription(
    job.short_description ||
      job.description ||
      `${job.title}${job.country ? ` opportunity in ${job.country}` : " opportunity"}.`
  );

  return {
    title,
    description,
    alternates: { canonical: canonical(`/jobs/${slug}`) },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical(`/jobs/${slug}`),
      siteName: SITE_NAME,
    },
  };
}

/**
 * Lean public vacancy page.
 *
 * This route intentionally avoids candidate auth checks, related-job catalogue
 * scans and occupation-catalogue expansion. The Apply route itself atomically
 * creates or resumes the candidate's application, so this page only renders
 * one verified job plus the small set of vacancy-specific document/cost data.
 */
export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const { job, error } = await getJobBySlug(slug);

  if (error) {
    console.error("[public-job] detail lookup failed", {
      slug,
      code: error.code ?? null,
    });
  }

  if (!job) notFound();

  const context = await getJobDetailContext(job);
  const closed = isPublicJobClosed(job);
  const salary = formatSalary(job) ?? "To be confirmed";
  const contract = formatJobContract(job);
  const processing = formatJobProcessingTime(job, context.country);
  const applyHref = closed ? "#" : publicJobApplyHref(job);
  const employerName = relationValue(job.employer, "company_name") || "Verified Employer";
  const location = [job.city, job.country].filter(Boolean).join(", ") || "To be confirmed";

  const description = cleanText(job.description) || cleanText(job.short_description);
  const responsibilities = cleanText(job.responsibilities);
  const requirements = cleanText(job.requirements);
  const additionalRequirements = [
    cleanText(job.experience_requirements),
    cleanText(job.education_requirements),
    cleanText(job.language_requirements),
    cleanText(job.physical_requirements),
    cleanText(job.additional_requirements),
  ].filter(Boolean) as string[];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description:
      description ||
      cleanText(job.short_description) ||
      `${job.title} vacancy published by ${SITE_NAME}.`,
    datePosted: job.published_at,
    validThrough: job.application_deadline || undefined,
    employmentType: job.job_type || undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: employerName,
    },
    jobLocation: job.country
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city || undefined,
            addressCountry: job.country,
          },
        }
      : undefined,
    url: canonical(`/jobs/${slug}`),
  };

  return (
    <>
      {!closed && job.title && job.country && job.published_at ? (
        <StructuredData data={structuredData} />
      ) : null}

      <section className="border-b border-white/10 bg-[#071A3D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#F2D675]">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/jobs" className="hover:text-[#F2D675]">Jobs</Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#F2D675]">{job.title}</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{closed ? "Applications closed" : "Applications open"}</Badge>
                {job.country ? <Badge>{job.country}</Badge> : null}
                {job.category ? <Badge>{job.category}</Badge> : null}
              </div>

              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
                {job.title}
              </h1>
              <p className="mt-4 text-base font-semibold text-slate-200 sm:text-lg">
                {[employerName, job.city, job.country].filter(Boolean).join(" • ")}
              </p>

              {job.short_description ? (
                <p className="mt-5 max-w-4xl text-base leading-7 text-slate-200">
                  {job.short_description}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={applyHref}
                  aria-disabled={closed}
                  className={`rounded-xl px-6 py-3.5 text-sm font-black transition ${
                    closed
                      ? "pointer-events-none bg-slate-600 text-slate-200"
                      : "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
                  }`}
                >
                  {closed ? "Applications Closed" : "Apply Now"}
                </Link>
                <Link href="/jobs" className="rounded-xl border border-white/25 px-6 py-3.5 text-sm font-black text-white hover:border-[#D4AF37] hover:text-[#F2D675]">
                  Browse Jobs
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Vacancy Snapshot</p>
              <div className="mt-5 grid gap-4">
                <HeroFact label="Salary" value={salary} />
                <HeroFact label="Country" value={job.country || "To be confirmed"} />
                <HeroFact label="Vacancies" value={job.vacancies?.toString() || "To be confirmed"} />
                <HeroFact label="Deadline" value={dateText(job.application_deadline) || "To be confirmed"} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-[#F3F4F6] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-7">
            <Panel title="Job Overview">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Location" value={location} />
                <Detail label="Category" value={job.category || "To be confirmed"} />
                <Detail label="Job Type" value={job.job_type || "To be confirmed"} />
                <Detail label="Skill Level" value={job.skill_level || "To be confirmed"} />
                <Detail label="Contract" value={contract} />
                <Detail label="Processing Time" value={processing} />
              </div>
            </Panel>

            <Panel title="Job Description">
              <TextSection value={description} fallback="A detailed vacancy description has not yet been confirmed for this job." />
            </Panel>

            {responsibilities ? (
              <Panel title="Responsibilities">
                <TextSection value={responsibilities} />
              </Panel>
            ) : null}

            <Panel title="Requirements">
              <TextSection value={requirements} fallback="Vacancy-specific requirements will be confirmed during candidate review." />
              {additionalRequirements.length ? (
                <div className="mt-5 grid gap-3">
                  {additionalRequirements.map((item, index) => (
                    <div key={`${index}-${item.slice(0, 20)}`} className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </Panel>

            <Panel title="Salary, Contract & Processing">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Salary" value={salary} />
                <Detail label="Contract" value={contract} />
                <Detail label="Processing Time" value={processing} />
                <Detail label="Application Deadline" value={dateText(job.application_deadline) || "To be confirmed"} />
              </div>
              <Disclaimer>
                Salary, processing times and employment terms remain subject to the final employer contract, document readiness and the relevant immigration or government process.
              </Disclaimer>
            </Panel>

            <Panel title="Benefits & Sponsorship">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Visa Sponsorship" value={job.visa_sponsorship === true ? "Included" : detailStatus(job.sponsorship_status)} />
                <Detail label="Accommodation" value={job.accommodation === true ? "Included" : detailStatus(job.accommodation_status)} />
                <Detail label="Transport" value={job.transport === true ? "Included" : detailStatus(job.transport_status)} />
                <Detail label="Meals" value={job.meals === true ? "Included" : detailStatus(job.meals_status)} />
                <Detail label="Medical Insurance" value={detailStatus(job.medical_insurance_status)} />
                <Detail label="Air Ticket" value={detailStatus(job.air_ticket_status)} />
              </div>
              {job.other_benefits ? (
                <p className="mt-5 text-sm leading-7 text-slate-700">{job.other_benefits}</p>
              ) : null}
            </Panel>

            <Panel title="Required Documents">
              {context.documents.length ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Document</th>
                        <th className="px-4 py-3">Requirement</th>
                        <th className="px-4 py-3">Responsibility</th>
                        <th className="px-4 py-3">Estimated Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {context.documents.map((line) => (
                        <tr key={line.documentType}>
                          <td className="px-4 py-3 font-bold text-[#071A3D]">{line.label}</td>
                          <td className="px-4 py-3 text-slate-600">{line.required ? "Required" : "Optional"}</td>
                          <td className="px-4 py-3 text-slate-600">{detailStatus(line.costResponsibility, "Not confirmed")}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {line.estimatedAmount === null ? "To be confirmed" : formatJobMoney(line.estimatedAmount, line.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm leading-7 text-slate-600">Document requirements will be confirmed for the specific application.</p>
              )}
            </Panel>

            <Panel title="Estimated Cost Breakdown">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  label={context.programmeFee.label}
                  value={formatJobMoney(context.programmeFee.amount, context.programmeFee.currency)}
                />
                <Detail
                  label="Estimated Document Costs"
                  value={context.documents.some((line) => line.estimatedAmount !== null)
                    ? formatJobMoney(context.documentTotal, context.documentCurrency)
                    : "To be confirmed"}
                />
                <Detail
                  label="Estimated Total"
                  value={context.estimatedTotal !== null && context.estimatedTotalCurrency
                    ? formatJobMoney(context.estimatedTotal, context.estimatedTotalCurrency)
                    : "See confirmed written breakdown"}
                />
                <Detail label="Fee Relationship" value={detailStatus(job.fee_relationship)} />
              </div>
              {context.programmeFee.note ? (
                <p className="mt-4 text-sm leading-6 text-slate-600">{context.programmeFee.note}</p>
              ) : null}
              <Disclaimer>
                Cost figures are planning estimates only. The candidate should rely on the final written breakdown for the specific vacancy and should never treat a fee as payment for employment, sponsorship, a visa approval or guaranteed placement.
              </Disclaimer>
            </Panel>

            <Panel title="Recruitment Notice">
              <p className="text-sm leading-7 text-slate-700">
                {RECRUITMENT_DISCLAIMER}
              </p>
            </Panel>
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="bg-[#071A3D] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Candidate Action</p>
                <h2 className="mt-2 text-2xl font-black">{closed ? "Vacancy closed" : "Apply for this job"}</h2>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  <Detail label="Employer" value={employerName} />
                  <Detail label="Country" value={job.country || "To be confirmed"} />
                  <Detail label="Salary" value={salary} />
                  <Detail label="Vacancies" value={job.vacancies?.toString() || "To be confirmed"} />
                </div>
                <Link
                  href={applyHref}
                  aria-disabled={closed}
                  className={`mt-6 block rounded-xl px-5 py-4 text-center text-sm font-black transition ${
                    closed
                      ? "pointer-events-none bg-slate-200 text-slate-500"
                      : "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
                  }`}
                >
                  {closed ? "Applications Closed" : "Apply Now"}
                </Link>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  The Apply button opens the secure candidate workflow and automatically resumes an existing application instead of creating duplicates.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-[#071A3D] sm:text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-[#071A3D]">{value || "To be confirmed"}</p>
    </div>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-100">
      {children}
    </span>
  );
}

function TextSection({ value, fallback }: { value?: string | null; fallback?: string }) {
  const text = cleanText(value);
  return <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{text || fallback || "To be confirmed"}</p>;
}

function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
      {children}
    </p>
  );
}

function relationValue(value: unknown, key: string) {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  const candidate = (row as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}

function cleanText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function metaDescription(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 155 ? `${compact.slice(0, 152).trimEnd()}...` : compact;
}
