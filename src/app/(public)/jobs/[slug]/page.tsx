import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/public/job-card";
import { Band } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { dateText } from "@/lib/admin/format";
import {
  benefitStatusLabel,
  feeRelationshipLabel,
  occupationContentAsText,
  resolveOccupationJobContent,
  skillLevelLabel,
} from "@/lib/jobs/catalogue";
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
import {
  formatSalary,
  getJobBySlug,
  getJobCatalogueContext,
  getPublishedJobs,
} from "@/lib/public/jobs";
import {
  canonical,
  RECRUITMENT_DISCLAIMER,
  SITE_NAME,
} from "@/lib/public/site";
import { createClient } from "@/utils/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

type JobContentText = ReturnType<typeof occupationContentAsText>;

type StructuredJob = {
  id: string;
  title: string | null;
  description: string | null;
  short_description: string | null;
  country: string | null;
  city: string | null;
  category?: string | null;
  skill_level?: string | null;
  job_type?: string | null;
  employer?: { company_name: string | null } | null;
  published_at: string | null;
  application_deadline: string | null;
  salary_confirmed: boolean | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  salary_period: string | null;
  vacancies?: number | null;
  working_hours_per_week?: number | null;
  work_schedule?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  experience_requirements?: string | null;
  education_requirements?: string | null;
  language_requirements?: string | null;
  physical_requirements?: string | null;
  sponsorship_status?: string | null;
  accommodation_status?: string | null;
  meals_status?: string | null;
  transport_status?: string | null;
  medical_insurance_status?: string | null;
  air_ticket_status?: string | null;
  contract_type?: string | null;
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

  const content = occupationContentAsText(resolveOccupationJobContent(job));
  const location = [job.city, job.country].filter(Boolean).join(", ");
  const title = location
    ? `${job.title} in ${location} | ${SITE_NAME}`
    : `${job.title} | ${SITE_NAME}`;
  const description = metaDescription(
    `${job.title} opportunity${job.country ? ` in ${job.country}` : ""}. ${content.short_description}`
  );
  const url = canonical(`/jobs/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    category: "jobs",
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);

  if (!job) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: applications } = auth.user
    ? await supabase
        .from("applications")
        .select("id, status")
        .eq("candidate_id", auth.user.id)
        .eq("job_id", job.id)
        .limit(1)
    : { data: [] };

  const existingApplication = applications?.[0] as
    | { id?: string; status?: string }
    | undefined;

  const [related, context] = await Promise.all([
    getPublishedJobs({ country: job.country ?? undefined, page: "1" }),
    getJobCatalogueContext(job),
  ]);

  const jobContent = occupationContentAsText(resolveOccupationJobContent(job));
  const salary = formatSalary(job);
  const jobRecord = job as unknown as Record<string, unknown>;
  const countryRecord = (context.country ?? {}) as unknown as Record<string, unknown>;
  const countryCode =
    stringFrom(countryRecord, "country_code") || job.country || undefined;
  const programmeFee = resolveProgrammeFee(jobRecord, context.country);
  const closed = isClosed(job.application_deadline, job.vacancies);
  const apply = applyState({
    slug,
    closed,
    existingApplication,
    signedIn: Boolean(auth.user),
  });

  const schemaEligible =
    !closed &&
    Boolean(job.title && job.country && job.published_at);

  const structuredJob = jobPostingData(
    job as unknown as StructuredJob,
    jobContent,
    slug,
    countryCode
  );

  const statusLabel = closed ? "Applications closed" : "Applications open";
  const employerName = job.employer?.company_name || "Confidential employer";

  return (
    <>
      {schemaEligible ? <StructuredData data={structuredJob} /> : null}

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: canonical("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Jobs",
              item: canonical("/jobs"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: job.title,
              item: canonical(`/jobs/${slug}`),
            },
          ],
        }}
      />

      <section className="border-b border-white/10 bg-[#071A3D] text-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300"
          >
            <Link href="/" className="transition hover:text-[#F2D675]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/jobs" className="transition hover:text-[#F2D675]">
              Jobs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#F2D675]">{job.title}</span>
          </nav>
        </div>
      </section>

      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-7">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={closed ? "closed" : "open"}>
                  {statusLabel}
                </StatusBadge>
                {job.country ? <StatusBadge>{job.country}</StatusBadge> : null}
                {job.skill_level ? (
                  <StatusBadge>{skillLevelLabel(job.skill_level)}</StatusBadge>
                ) : null}
                {job.category ? <StatusBadge>{job.category}</StatusBadge> : null}
              </div>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
                Published recruitment opportunity
              </p>

              <h1 className="mt-3 max-w-5xl text-4xl font-black leading-tight sm:text-5xl">
                {job.title}
              </h1>

              <p className="mt-4 text-lg font-semibold text-slate-200">
                {[employerName, job.city, job.country].filter(Boolean).join(" • ")}
              </p>

              <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200">
                {jobContent.short_description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={apply.href}
                  aria-disabled={apply.disabled}
                  className={`rounded-md px-6 py-3.5 text-sm font-black transition ${
                    apply.disabled
                      ? "pointer-events-none bg-slate-600 text-slate-200"
                      : "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
                  }`}
                >
                  {apply.label}
                </Link>

                <Link
                  href="/jobs"
                  className="rounded-md border border-white/25 px-6 py-3.5 text-sm font-black text-white transition hover:border-[#D4AF37] hover:text-[#F2D675]"
                >
                  Browse all jobs
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
                Vacancy snapshot
              </p>

              <div className="mt-5 grid gap-4">
                <HeroFact label="Salary" value={salary ?? "To be confirmed"} />
                <HeroFact
                  label="Vacancies"
                  value={job.vacancies?.toString() ?? "To be confirmed"}
                />
                <HeroFact
                  label="Deadline"
                  value={dateText(job.application_deadline) || "To be confirmed"}
                />
                <HeroFact
                  label="Contract"
                  value={formatContract(jobRecord) || "To be confirmed"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Band>
        {closed ? (
          <div className="mb-7 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <strong>This vacancy is no longer accepting applications.</strong>{" "}
            You can still review the information below and browse other currently
            published opportunities.
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <article className="min-w-0">
            <section
              aria-labelledby="job-facts-heading"
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
                    Vacancy information
                  </p>
                  <h2
                    id="job-facts-heading"
                    className="mt-2 text-2xl font-black text-[#071A3D]"
                  >
                    Job facts
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  Ref: {shortReference(job.id)}
                </span>
              </div>

              <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                <Detail label="Employer" value={employerName} />
                <Detail label="Country" value={job.country} />
                <Detail label="City / Location" value={job.city} />
                <Detail label="Category" value={job.category} />
                <Detail
                  label="Skill Level"
                  value={skillLevelLabel(job.skill_level)}
                />
                <Detail label="Salary" value={salary ?? "To be confirmed"} />
                <Detail
                  label="Contract"
                  value={formatContract(jobRecord)}
                />
                <Detail
                  label="Vacancies"
                  value={job.vacancies?.toString()}
                />
                <Detail
                  label="Processing Time"
                  value={formatProcessingTime(jobRecord, context.country)}
                />
                <Detail
                  label={programmeFee.label}
                  value={formatMoney(programmeFee.amount, programmeFee.currency)}
                />
                <Detail
                  label="Application Deadline"
                  value={dateText(job.application_deadline)}
                />
                <Detail
                  label="Publication Status"
                  value={closed ? "Closed" : "Published / Open"}
                />
              </div>
            </section>

            <nav
              aria-label="Job page sections"
              className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {[
                ["overview", "Overview"],
                ["responsibilities", "Responsibilities"],
                ["requirements", "Requirements"],
                ["terms", "Employment terms"],
                ["benefits", "Benefits"],
                ["documents", "Documents"],
                ["process", "Recruitment process"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={`#${href}`}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#071A3D] transition hover:border-[#D4AF37]"
                >
                  {label}
                </a>
              ))}
            </nav>

            <ContentSection
              id="overview"
              eyebrow="Role summary"
              title="Job Overview"
              body={jobContent.description}
            />

            <ListSection
              id="responsibilities"
              eyebrow="What you may do"
              title="Responsibilities"
              body={jobContent.responsibilities}
            />

            <ListSection
              id="requirements"
              eyebrow="Candidate profile"
              title="Requirements"
              body={jobContent.requirements}
            />

            <section
              id="qualifications"
              className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <SectionHeading
                eyebrow="Eligibility guidance"
                title="Experience, Education & Language"
              />

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <InfoPanel
                  title="Experience"
                  text={jobContent.experience_requirements}
                />
                <InfoPanel
                  title="Education"
                  text={jobContent.education_requirements}
                />
                <InfoPanel
                  title="Language"
                  text={jobContent.language_requirements}
                />
                <InfoPanel
                  title="Physical / Occupational"
                  text={jobContent.physical_requirements}
                />
              </div>
            </section>

            <section
              id="terms"
              className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <SectionHeading
                eyebrow="Confirmed vacancy information"
                title="Salary & Employment Terms"
              />

              <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
                <Detail label="Salary" value={salary ?? "To be confirmed by employer"} />
                <Detail
                  label="Salary Confirmation"
                  value={job.salary_confirmed ? "Confirmed" : "To be confirmed"}
                />
                <Detail
                  label="Working Hours"
                  value={
                    job.working_hours_per_week
                      ? `${job.working_hours_per_week} hours/week`
                      : null
                  }
                />
                <Detail label="Schedule" value={job.work_schedule} />
                <Detail label="Contract" value={formatContract(jobRecord)} />
                <Detail label="Overtime" value={job.overtime_note} />
              </div>

              <Notice>{SALARY_DISCLAIMER}</Notice>
            </section>

            <section
              id="benefits"
              className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <SectionHeading
                eyebrow="Employer-supported items"
                title="Benefits & Support"
              />

              <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
                <Detail
                  label="Sponsorship"
                  value={benefitStatusLabel(job.sponsorship_status)}
                />
                <Detail
                  label="Accommodation"
                  value={benefitStatusLabel(job.accommodation_status)}
                />
                <Detail
                  label="Meals / Food"
                  value={benefitStatusLabel(job.meals_status)}
                />
                <Detail
                  label="Local Transport"
                  value={benefitStatusLabel(job.transport_status)}
                />
                <Detail
                  label="Medical / Insurance"
                  value={benefitStatusLabel(job.medical_insurance_status)}
                />
                <Detail
                  label="Air Ticket / Flight"
                  value={benefitStatusLabel(job.air_ticket_status)}
                />
                <Detail label="Annual Leave" value={job.annual_leave_note} />
                <Detail
                  label="Training / Other Benefits"
                  value={[
                    benefitStatusLabel(job.training_status),
                    job.other_benefits,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                />
              </div>
            </section>

            <div id="documents" className="scroll-mt-28">
              <CostSections
                job={jobRecord}
                context={context}
              />
            </div>

            <section
              id="process"
              className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <SectionHeading
                eyebrow="What happens after you apply"
                title="Recruitment Process"
              />

              <ol className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["Application", "Submit your application through the official Red Stone portal."],
                  ["Candidate Review", "Recruitment staff review profile information against the vacancy."],
                  ["Document Review", "Required documents are checked for completeness and relevance."],
                  ["Employer Consideration", "Suitable candidates may be presented to the employer."],
                  ["Interview", "The employer may invite shortlisted candidates to an interview or assessment."],
                  ["Offer / Contract", "Selected candidates receive confirmed employment terms from the appropriate party."],
                  ["Permit / Visa Process", "Where applicable, immigration and work authorization steps follow confirmed instructions."],
                  ["Pre-Departure", "Approved candidates receive final preparation and deployment guidance."],
                ].map(([title, text], index) => (
                  <li
                    key={title}
                    className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-black text-[#071A3D]">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-8 rounded-xl border border-slate-200 bg-[#F8FAFC] p-6">
              <SectionHeading
                eyebrow="Candidate safety"
                title="Important Recruitment Notice"
              />
              <p className="mt-4 text-sm leading-7 text-slate-600">
                No employment, visa, work permit, interview, or immigration outcome
                is guaranteed. {RECRUITMENT_DISCLAIMER}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Always use official Red Stone communication channels and verify
                vacancy-specific instructions before submitting sensitive documents
                or making any payment connected with a separate service or
                government process.
              </p>
            </section>
          </article>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-200 bg-[#071A3D] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
                  Candidate action
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {closed ? "Vacancy closed" : "Apply for this job"}
                </h2>
              </div>

              <div className="p-6">
                <div className="grid gap-4">
                  <Detail label="Employer" value={employerName} />
                  <Detail label="Country" value={job.country} />
                  <Detail label="Salary" value={salary ?? "To be confirmed"} />
                  <Detail
                    label="Vacancies"
                    value={job.vacancies?.toString()}
                  />
                  <Detail
                    label="Deadline"
                    value={dateText(job.application_deadline)}
                  />
                </div>

                <Link
                  href={apply.href}
                  aria-disabled={apply.disabled}
                  className={`mt-6 block rounded-md px-5 py-4 text-center text-sm font-black transition ${
                    apply.disabled
                      ? "pointer-events-none bg-slate-200 text-slate-500"
                      : "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
                  }`}
                >
                  {apply.label}
                </Link>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Apply only through the official portal. Keep your account details
                  accurate and do not share your password with recruiters or third
                  parties.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-black text-[#071A3D]">Need another opportunity?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Browse other published vacancies and filter by destination or job
                category.
              </p>
              <Link
                href="/jobs"
                className="mt-4 inline-flex text-sm font-black text-[#B8860B] hover:text-[#071A3D]"
              >
                View all jobs →
              </Link>
            </div>
          </aside>
        </div>
      </Band>

      <Band tone="grey">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              More opportunities
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">
              Related Jobs
            </h2>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-black text-[#071A3D] hover:text-[#B8860B]"
          >
            Browse all jobs →
          </Link>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {related.jobs
            .filter((item) => item.id !== job.id)
            .slice(0, 3)
            .map((item) => (
              <JobCard key={item.id} job={item} />
            ))}
        </div>
      </Band>
    </>
  );
}

function CostSections({
  job,
  context,
}: {
  job: Record<string, unknown>;
  context: Awaited<ReturnType<typeof getJobCatalogueContext>>;
}) {
  const programmeFee = resolveProgrammeFee(job, context.country);
  const documentCosts = calculateDocumentCosts({
    requirements: context.requirements,
    feeCatalog: context.fees,
    country: context.country,
  });

  return (
    <>
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          eyebrow="Programme information"
          title="Country / Programme Cost"
        />

        <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
          <Detail
            label={programmeFee.label}
            value={formatMoney(programmeFee.amount, programmeFee.currency)}
          />
          <Detail
            label="Fee Relationship"
            value={feeRelationshipLabel(job.fee_relationship)}
          />
        </div>

        {programmeFee.note ? (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {programmeFee.note}
          </p>
        ) : null}

        <Notice>{PROGRAMME_FEE_DISCLAIMER}</Notice>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {PROCESSING_TIME_DISCLAIMER}
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          eyebrow="Application preparation"
          title="Required Documents"
        />

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cost Responsibility</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentCosts.lines.length ? (
                documentCosts.lines.map((line) => (
                  <tr key={line.documentType}>
                    <td className="px-4 py-3 font-semibold text-[#071A3D]">
                      {line.label}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {line.required ? "Required" : "Optional"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {line.costResponsibility.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {line.note ?? "Not specified"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-5 text-slate-600"
                    colSpan={4}
                  >
                    Document requirements will be confirmed during the
                    recruitment process.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading
          eyebrow="Planning information"
          title="Estimated Document Preparation Costs"
        />

        <div className="mt-6 grid gap-3">
          {documentCosts.lines
            .filter((line) => line.amount !== null)
            .map((line) => (
              <div
                key={line.documentType}
                className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm"
              >
                <span className="text-slate-700">{line.label}</span>
                <strong className="text-[#071A3D]">
                  {formatMoney(line.amount, line.currency)}
                </strong>
              </div>
            ))}
        </div>

        <p className="mt-5 text-lg font-black text-[#071A3D]">
          Estimated Document Total:{" "}
          {formatMoney(documentCosts.total, documentCosts.currency)}
        </p>

        <Notice>{COST_DISCLAIMER}</Notice>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {INDEPENDENT_DOCUMENT_DISCLAIMER}
        </p>
      </section>
    </>
  );
}

function ContentSection({
  id,
  eyebrow,
  title,
  body,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body?: string | null;
}) {
  if (!body) return null;

  return (
    <section
      id={id}
      className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <SectionHeading eyebrow={eyebrow} title={title} />
      <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-700">
        {body}
      </p>
    </section>
  );
}

function ListSection({
  id,
  eyebrow,
  title,
  body,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body?: string | null;
}) {
  const items = listItems(body);
  if (!items.length) return null;

  return (
    <section
      id={id}
      className="mt-8 scroll-mt-28 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <SectionHeading eyebrow={eyebrow} title={title} />
      <ul className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700"
          >
            <span
              aria-hidden="true"
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-black text-[#071A3D]"
            >
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black text-[#071A3D] sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function InfoPanel({
  title,
  text,
}: {
  title: string;
  text?: string | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
      <h3 className="font-black text-[#071A3D]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        {text || "To be confirmed for this vacancy."}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 font-semibold text-slate-800">
        {value || "To be confirmed"}
      </p>
    </div>
  );
}

function HeroFact({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-300">{label}</span>
      <strong className="max-w-[58%] text-right text-sm text-white">
        {value || "To be confirmed"}
      </strong>
    </div>
  );
}

function StatusBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "open" | "closed";
}) {
  const classes =
    tone === "open"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
      : tone === "closed"
        ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
        : "border-white/15 bg-white/5 text-slate-100";

  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${classes}`}
    >
      {children}
    </span>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      {children}
    </p>
  );
}

function isClosed(deadline: string | null, vacancies: number | null) {
  const today = new Date().toISOString().slice(0, 10);
  return Boolean(
    (deadline && deadline < today) ||
      (typeof vacancies === "number" && vacancies <= 0)
  );
}

function applyState({
  slug,
  closed,
  existingApplication,
  signedIn,
}: {
  slug: string;
  closed: boolean;
  existingApplication?: { id?: string; status?: string };
  signedIn: boolean;
}) {
  if (closed) {
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

  if (!signedIn) {
    return {
      label: "Login or Register to Apply",
      href: `/login?next=/apply/${slug}`,
      disabled: false,
    };
  }

  return {
    label: "Apply for This Job",
    href: `/apply/${slug}`,
    disabled: false,
  };
}

function jobPostingData(
  job: StructuredJob,
  content: JobContentText,
  slug: string,
  countryCode?: string
) {
  const hiringOrganizationName =
    job.employer?.company_name?.trim() || "confidential";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: structuredDescriptionHtml(job, content),
    identifier: {
      "@type": "PropertyValue",
      name: hiringOrganizationName,
      value: job.id,
    },
    datePosted: job.published_at,
    hiringOrganization: {
      "@type": "Organization",
      name: hiringOrganizationName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city ? { addressLocality: job.city } : {}),
        addressCountry: countryCode || job.country,
      },
    },
    url: canonical(`/jobs/${slug}`),
    mainEntityOfPage: canonical(`/jobs/${slug}`),
    directApply: false,
  };

  if (job.application_deadline) {
    data.validThrough = deadlineIso(job.application_deadline);
  }

  const employmentType = employmentTypeFor(job);
  if (employmentType) {
    data.employmentType = employmentType;
  }

  if (job.category) {
    data.industry = job.category;
    data.occupationalCategory = job.category;
  }

  if (content.responsibilities) {
    data.responsibilities = plainList(content.responsibilities).join("; ");
  }

  if (content.requirements) {
    data.qualifications = plainList(content.requirements).join("; ");
  }

  if (content.experience_requirements) {
    data.experienceRequirements = content.experience_requirements;
  }

  if (content.education_requirements) {
    data.educationRequirements = content.education_requirements;
  }

  if (content.physical_requirements) {
    data.physicalRequirement = content.physical_requirements;
  }

  if (job.working_hours_per_week) {
    data.workHours = `${job.working_hours_per_week} hours per week`;
  }

  const benefits = confirmedBenefits(job);
  if (benefits.length) {
    data.jobBenefits = benefits.join("; ");
  }

  if (
    job.salary_confirmed &&
    (job.salary_min !== null || job.salary_max !== null) &&
    job.currency
  ) {
    const minValue = job.salary_min ?? job.salary_max;
    const maxValue = job.salary_max ?? job.salary_min;

    data.salaryCurrency = job.currency;
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency,
      value: {
        "@type": "QuantitativeValue",
        ...(minValue !== null ? { minValue } : {}),
        ...(maxValue !== null ? { maxValue } : {}),
        unitText: salaryUnit(job.salary_period),
      },
    };
  }

  return data;
}

function structuredDescriptionHtml(
  job: StructuredJob,
  content: JobContentText
) {
  const responsibilities = plainList(content.responsibilities);
  const requirements = plainList(content.requirements);

  const parts = [
    `<p>${escapeHtml(content.description || content.short_description || "Published vacancy.")}</p>`,
    responsibilities.length
      ? `<p>Responsibilities:</p><ul>${responsibilities
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul>`
      : "",
    requirements.length
      ? `<p>Requirements:</p><ul>${requirements
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul>`
      : "",
    content.experience_requirements
      ? `<p>Experience: ${escapeHtml(content.experience_requirements)}</p>`
      : "",
    content.education_requirements
      ? `<p>Education: ${escapeHtml(content.education_requirements)}</p>`
      : "",
    content.language_requirements
      ? `<p>Language: ${escapeHtml(content.language_requirements)}</p>`
      : "",
    job.working_hours_per_week
      ? `<p>Working hours: ${escapeHtml(String(job.working_hours_per_week))} hours per week.</p>`
      : "",
  ];

  return parts.filter(Boolean).join("");
}

function confirmedBenefits(job: StructuredJob) {
  const values: string[] = [];
  if (job.sponsorship_status === "included") values.push("Visa sponsorship");
  if (job.accommodation_status === "included") values.push("Accommodation");
  if (job.meals_status === "included") values.push("Meals");
  if (job.transport_status === "included") values.push("Local transport");
  if (job.medical_insurance_status === "included") values.push("Medical / insurance");
  if (job.air_ticket_status === "included") values.push("Air ticket / flight");
  return values;
}

function employmentTypeFor(job: StructuredJob) {
  const value = `${job.job_type ?? ""} ${job.contract_type ?? ""}`.toLowerCase();

  if (value.includes("full")) return "FULL_TIME";
  if (value.includes("part")) return "PART_TIME";
  if (value.includes("intern")) return "INTERN";
  if (value.includes("temporary")) return "TEMPORARY";
  if (value.includes("seasonal")) return "TEMPORARY";
  if (value.includes("contract") || value.includes("fixed")) return "CONTRACTOR";

  return undefined;
}

function salaryUnit(period: string | null) {
  switch ((period || "").toLowerCase()) {
    case "hour":
      return "HOUR";
    case "day":
      return "DAY";
    case "week":
      return "WEEK";
    case "year":
      return "YEAR";
    default:
      return "MONTH";
  }
}

function deadlineIso(deadline: string) {
  if (deadline.includes("T")) return deadline;
  return `${deadline}T23:59:59Z`;
}

function listItems(value?: string | null) {
  return plainList(value);
}

function plainList(value?: string | null) {
  if (!value) return [];

  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stringFrom(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function shortReference(id: string) {
  return id.replaceAll("-", "").slice(0, 10).toUpperCase();
}

function metaDescription(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= 158) return clean;
  return `${clean.slice(0, 155).trimEnd()}...`;
}
