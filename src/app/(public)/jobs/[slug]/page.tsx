import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/public/job-card";
import { Band } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { dateText } from "@/lib/admin/format";
import { benefitStatusLabel, feeRelationshipLabel, skillLevelLabel } from "@/lib/jobs/catalogue";
import {
  COST_DISCLAIMER,
  INDEPENDENT_DOCUMENT_DISCLAIMER,
  PROGRAMME_FEE_DISCLAIMER,
  PROCESSING_TIME_DISCLAIMER,
  SALARY_DISCLAIMER,
  calculateDocumentCosts,
  formatContract,
  formatMoney,
  formatProcessingTime,
  resolveProgrammeFee,
} from "@/lib/jobs/costs";
import { formatSalary, getJobBySlug, getJobCatalogueContext, getPublishedJobs } from "@/lib/public/jobs";
import { canonical, RECRUITMENT_DISCLAIMER, SITE_NAME } from "@/lib/public/site";
import { createClient } from "@/utils/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  const title = `${job.title} Jobs in ${job.country ?? "International Markets"}`;
  return {
    title,
    description: `${job.short_description || `View ${job.title} vacancy details and apply through ${SITE_NAME}.`}`,
    alternates: { canonical: canonical(`/jobs/${slug}`) },
    openGraph: { title, description: `Published job opportunity from ${SITE_NAME}.` },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: applications } = auth.user
    ? await supabase.from("applications").select("id, status").eq("candidate_id", auth.user.id).eq("job_id", job.id).limit(1)
    : { data: [] };
  const existingApplication = applications?.[0] as { id?: string; status?: string } | undefined;
  const related = await getPublishedJobs({ country: job.country ?? undefined, page: "1" });
  const context = await getJobCatalogueContext(job);
  const salary = formatSalary(job);
  const programmeFee = resolveProgrammeFee(job as unknown as Record<string, unknown>, context.country);
  const closed = isClosed(job.application_deadline, job.vacancies);
  const apply = applyState({ slug, closed, existingApplication, signedIn: Boolean(auth.user) });

  return (
    <>
      <StructuredData data={jobPostingData(job, salary, slug)} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Jobs", item: canonical("/jobs") },
        { "@type": "ListItem", position: 2, name: job.title, item: canonical(`/jobs/${slug}`) },
      ] }} />
      <Band>
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <article>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">Published job</p>
            <h1 className="mt-3 text-4xl font-black text-[#071A3D]">{job.title}</h1>
            <p className="mt-3 text-lg text-slate-600">{[job.country, job.city].filter(Boolean).join(" / ")}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{job.short_description || "Detailed vacancy information is provided below for candidate planning and application review."}</p>

            <div className="mt-8 grid gap-4 rounded-md border border-slate-200 bg-white p-6 md:grid-cols-2">
              <Detail label="Country" value={job.country} />
              <Detail label="City / Location" value={job.city} />
              <Detail label="Category" value={job.category} />
              <Detail label="Skill Level" value={skillLevelLabel(job.skill_level)} />
              <Detail label="Salary" value={salary ?? "To be confirmed by employer"} />
              <Detail label="Contract" value={formatContract(job as unknown as Record<string, unknown>)} />
              <Detail label="Vacancies" value={job.vacancies?.toString()} />
              <Detail label="Estimated Processing Time" value={formatProcessingTime(job as unknown as Record<string, unknown>, context.country)} />
              <Detail label={programmeFee.label} value={formatMoney(programmeFee.amount, programmeFee.currency)} />
              <Detail label="Application Deadline" value={dateText(job.application_deadline)} />
            </div>

            <ContentSection title="Job Overview" body={job.short_description} />
            <ContentSection title="Full Job Description" body={job.description} fallback="Detailed job description will be shared through the official recruitment process." />
            <ContentSection title="Responsibilities" body={job.responsibilities} />
            <ContentSection title="Requirements" body={job.requirements} />
            <ContentSection title="Experience Requirements" body={job.experience_requirements} />
            <ContentSection title="Education Requirements" body={job.education_requirements} />
            <ContentSection title="Language Requirements" body={job.language_requirements} />
            <ContentSection title="Physical / Occupational Requirements" body={job.physical_requirements} />

            <section className="mt-8">
              <h2 className="text-2xl font-black text-[#071A3D]">Salary & Employment Terms</h2>
              <div className="mt-4 grid gap-4 rounded-md border border-slate-200 bg-white p-5 md:grid-cols-2">
                <Detail label="Salary" value={salary ?? "To be confirmed by employer"} />
                <Detail label="Salary Confirmation" value={job.salary_confirmed ? "Confirmed" : "To be confirmed"} />
                <Detail label="Working Hours" value={job.working_hours_per_week ? `${job.working_hours_per_week} hours/week` : null} />
                <Detail label="Schedule" value={job.work_schedule} />
                <Detail label="Contract" value={formatContract(job as unknown as Record<string, unknown>)} />
                <Detail label="Overtime" value={job.overtime_note} />
              </div>
              <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">{SALARY_DISCLAIMER}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-black text-[#071A3D]">Benefits</h2>
              <div className="mt-4 grid gap-4 rounded-md border border-slate-200 bg-white p-5 md:grid-cols-2">
                <Detail label="Sponsorship" value={benefitStatusLabel(job.sponsorship_status)} />
                <Detail label="Accommodation" value={benefitStatusLabel(job.accommodation_status)} />
                <Detail label="Meals / Food" value={benefitStatusLabel(job.meals_status)} />
                <Detail label="Local Transport" value={benefitStatusLabel(job.transport_status)} />
                <Detail label="Medical / Insurance" value={benefitStatusLabel(job.medical_insurance_status)} />
                <Detail label="Air Ticket / Flight" value={benefitStatusLabel(job.air_ticket_status)} />
                <Detail label="Annual Leave" value={job.annual_leave_note} />
                <Detail label="Training / Other Benefits" value={[benefitStatusLabel(job.training_status), job.other_benefits].filter(Boolean).join(" / ")} />
              </div>
            </section>

            <CostSections job={job as unknown as Record<string, unknown>} context={context} />

            <section className="mt-8">
              <h2 className="text-2xl font-black text-[#071A3D]">Recruitment Process</h2>
              <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
                {["Application", "Candidate Review", "Document Review", "Employer Consideration", "Interview if applicable", "Offer / Contract if selected", "Work Permit / Visa Process", "Pre-Departure", "Deployment"].map((step, index) => (
                  <li key={step} className="rounded-md border border-slate-200 bg-white p-4"><strong>{index + 1}.</strong> {step}</li>
                ))}
              </ol>
            </section>

            <p className="mt-8 rounded-md bg-[#F3F4F6] p-4 text-sm leading-6 text-slate-600">No employment or immigration outcome is guaranteed. {RECRUITMENT_DISCLAIMER}</p>
          </article>
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-[#071A3D]">Apply for this job</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <Detail label="Salary" value={salary ?? "To be confirmed by employer"} />
              <Detail label="Programme Fee" value={formatMoney(programmeFee.amount, programmeFee.currency)} />
              <Detail label="Deadline" value={dateText(job.application_deadline)} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Use the official Red Stone application path only. Do not send documents to unofficial contacts.</p>
            <Link href={apply.href} className={`mt-5 block rounded-md px-5 py-4 text-center text-sm font-black ${apply.disabled ? "pointer-events-none bg-slate-200 text-slate-500" : "bg-[#D4AF37] text-[#071A3D]"}`}>{apply.label}</Link>
          </aside>
        </div>
      </Band>
      <Band tone="grey">
        <h2 className="text-2xl font-black text-[#071A3D]">Related Jobs</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.jobs.filter((item) => item.id !== job.id).slice(0, 3).map((item) => <JobCard key={item.id} job={item} />)}
        </div>
      </Band>
    </>
  );
}

function CostSections({ job, context }: { job: Record<string, unknown>; context: Awaited<ReturnType<typeof getJobCatalogueContext>> }) {
  const programmeFee = resolveProgrammeFee(job, context.country);
  const documentCosts = calculateDocumentCosts({ requirements: context.requirements, feeCatalog: context.fees, country: context.country });

  return (
    <>
      <section className="mt-8">
        <h2 className="text-2xl font-black text-[#071A3D]">Country / Programme Cost</h2>
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-5">
          <Detail label={programmeFee.label} value={formatMoney(programmeFee.amount, programmeFee.currency)} />
          <Detail label="Fee Relationship" value={feeRelationshipLabel(job.fee_relationship)} />
          {programmeFee.note ? <p className="mt-3 text-sm text-slate-600">{programmeFee.note}</p> : null}
          <p className="mt-4 text-sm leading-6 text-slate-600">{PROGRAMME_FEE_DISCLAIMER}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{PROCESSING_TIME_DISCLAIMER}</p>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-black text-[#071A3D]">Required Documents</h2>
        <div className="mt-4 overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase text-slate-500"><tr><th className="px-4 py-3">Document</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Cost Responsibility</th><th className="px-4 py-3">Notes</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {documentCosts.lines.length ? documentCosts.lines.map((line) => (
                <tr key={line.documentType}>
                  <td className="px-4 py-3 font-semibold text-[#071A3D]">{line.label}</td>
                  <td className="px-4 py-3 text-slate-600">{line.required ? "Required" : "Optional"}</td>
                  <td className="px-4 py-3 text-slate-600">{line.costResponsibility.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-600">{line.note ?? "Not specified"}</td>
                </tr>
              )) : <tr><td className="px-4 py-4 text-slate-600" colSpan={4}>Document requirements will be confirmed during the recruitment process.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl font-black text-[#071A3D]">Estimated Document Preparation Costs</h2>
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-5">
          <div className="grid gap-3">
            {documentCosts.lines.filter((line) => line.amount !== null).map((line) => (
              <div key={line.documentType} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 text-sm">
                <span>{line.label}</span>
                <strong>{formatMoney(line.amount, line.currency)}</strong>
              </div>
            ))}
          </div>
          <p className="mt-4 text-lg font-black text-[#071A3D]">Estimated Document Total: {formatMoney(documentCosts.total, documentCosts.currency)}</p>
          <p className="mt-4 text-sm leading-6 text-slate-600">{COST_DISCLAIMER}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{INDEPENDENT_DOCUMENT_DISCLAIMER}</p>
        </div>
      </section>
    </>
  );
}

function ContentSection({ title, body, fallback }: { title: string; body?: string | null; fallback?: string }) {
  if (!body && !fallback) return null;
  return <section className="mt-8"><h2 className="text-2xl font-black text-[#071A3D]">{title}</h2><p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{body || fallback}</p></section>;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize text-slate-800">{value || "To be confirmed"}</p></div>;
}

function isClosed(deadline: string | null, vacancies: number | null) {
  const today = new Date().toISOString().slice(0, 10);
  return Boolean((deadline && deadline < today) || (typeof vacancies === "number" && vacancies <= 0));
}

function applyState({ slug, closed, existingApplication, signedIn }: { slug: string; closed: boolean; existingApplication?: { id?: string; status?: string }; signedIn: boolean }) {
  if (closed) return { label: "Applications Closed", href: "#", disabled: true };
  if (existingApplication?.id) return { label: "View My Application", href: `/candidate/applications/${existingApplication.id}`, disabled: false };
  if (!signedIn) return { label: "Login or Register to Apply", href: `/login?next=/apply/${slug}`, disabled: false };
  return { label: "Apply for This Job", href: `/apply/${slug}`, disabled: false };
}

function jobPostingData(job: { title: string | null; description: string | null; short_description: string | null; country: string | null; city: string | null; employer?: { company_name: string | null } | null; published_at: string | null; application_deadline: string | null; salary_confirmed: boolean | null; salary_min: number | null; salary_max: number | null; currency: string | null; salary_period: string | null }, salary: string | null, slug: string) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.short_description || "Published Red Stone vacancy.",
    datePosted: job.published_at,
    validThrough: job.application_deadline,
    hiringOrganization: job.employer?.company_name ? { "@type": "Organization", name: job.employer.company_name } : { "@type": "Organization", name: SITE_NAME },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.city ?? "", addressCountry: job.country ?? "" } },
    url: canonical(`/jobs/${slug}`),
  };

  if (job.salary_confirmed && salary && (job.salary_min || job.salary_max)) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency ?? "KES",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min ?? job.salary_max,
        maxValue: job.salary_max ?? job.salary_min,
        unitText: job.salary_period ?? "month",
      },
    };
  }

  return data;
}
