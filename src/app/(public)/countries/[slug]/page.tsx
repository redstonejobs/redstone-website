import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { Band, ContactCTA, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { DEFAULT_PROCESSING_TEXT, formatMoney, PROGRAMME_FEE_DISCLAIMER, PROCESSING_TIME_DISCLAIMER } from "@/lib/jobs/costs";
import { getCountryJobRoles } from "@/lib/public/country-job-roles";
import { getCountryRecruitmentGuide } from "@/lib/public/country-recruitment-guides";
import { getConfiguredCountry, getCountry } from "@/lib/public/countries";
import { getJobsForCountry } from "@/lib/public/jobs";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";
import { VISA_GUIDES } from "@/lib/public/visa-guides";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const sponsorshipSlugs = new Set([
  "united-states",
  "canada",
  "australia",
  "new-zealand",
  "uae",
  "qatar",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  const recruitment = getCountryRecruitmentGuide(slug);

  if (!country || !recruitment) return { title: "Country Not Found" };

  const url = canonical(`/countries/${country.slug}`);

  return {
    title: recruitment.seoTitle,
    description: recruitment.seoDescription,
    keywords: [
      `${country.name} jobs`,
      `${country.name} jobs for Kenyans`,
      `${country.name} work visa`,
      `${country.name} work permit`,
      `${country.name} recruitment agency`,
      `${country.name} sponsored jobs`,
      `work in ${country.name}`,
      `Red Stone ${country.name}`,
      "international recruitment Kenya",
      "overseas jobs",
    ],
    alternates: { canonical: url },
    openGraph: {
      title: recruitment.seoTitle,
      description: recruitment.seoDescription,
      url,
      type: "website",
      siteName: SITE_NAME,
    },
  };
}

export default async function CountryDetailPage({ params }: Props) {
  const { slug } = await params;
  const country = await getConfiguredCountry(slug);
  if (!country) notFound();

  const recruitment = getCountryRecruitmentGuide(country.slug);
  const visaGuide = VISA_GUIDES.find((item) => item.slug === country.slug);
  if (!recruitment || !visaGuide) notFound();

  const roles = getCountryJobRoles(recruitment.jobKeys);
  const { jobs } = await getJobsForCountry(country.name);
  const faqs = buildCountryFaqs(country.name, recruitment.workRoute, visaGuide.authority);
  const pageUrl = canonical(`/countries/${country.slug}`);
  const jobSearchUrl = `/jobs?country=${encodeURIComponent(country.name)}`;
  const visaUrl = `/visa-process/${country.slug}`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${country.name} Jobs, Recruitment & Work Visa Guide`,
            description: recruitment.seoDescription,
            url: pageUrl,
            about: [
              { "@type": "Country", name: country.name },
              { "@type": "Thing", name: "International recruitment" },
              { "@type": "Thing", name: "Work visa and work permit preparation" },
            ],
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Countries", item: canonical("/countries") },
              { "@type": "ListItem", position: 3, name: country.name, item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `${country.name} International Recruitment Support`,
            serviceType: "International recruitment and candidate preparation",
            provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            areaServed: { "@type": "Country", name: country.name },
            description: recruitment.recruitmentFocus,
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Common ${country.name} recruitment job pathways`,
            numberOfItems: roles.length,
            itemListElement: roles.map((role, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: role.title,
              description: role.summary,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0D2B59] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
              {country.region} · Country Recruitment Guide 2026
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {country.name} Jobs, Recruitment & Work Visa Guide
            </h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              {recruitment.overview}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={jobSearchUrl} className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                View {country.name} Jobs
              </Link>
              <Link href="/apply" className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-slate-100">
                Apply Now
              </Link>
              <Link href={visaUrl} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Full Visa Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {[
            ["Live Jobs", "#live-jobs"],
            ["Job Pathways", "#job-pathways"],
            ["Recruitment Process", "#recruitment-process"],
            ["Visa Process", "#visa-process"],
            ["Requirements & FAQs", "#requirements"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black text-[#071A3D] transition hover:border-[#D4AF37] hover:bg-[#FFF9E8]">
              {label}
            </a>
          ))}
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow={`${country.name} recruitment market`}
          title="How international recruitment works for this destination"
          body={recruitment.recruitmentFocus}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          <InfoCard title="Recruitment focus" body={recruitment.recruitmentFocus} />
          <InfoCard title="Work authorization route" body={recruitment.workRoute} />
          <InfoCard title="Language & licensing" body={recruitment.languageLicensing} />
        </div>
      </Band>

      <Band tone="grey" id="live-jobs">
        <SectionHeading
          eyebrow="Current vacancies"
          title={`Published jobs in ${country.name}`}
          body={`Only vacancies currently published in the Red Stone system are shown here. General job pathways further down this page explain common occupations but do not represent a live vacancy unless a matching job is published.`}
        />
        <div className="mt-10">
          {jobs.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div>
              <EmptyJobsState />
              <div className="mt-6 text-center">
                <Link href="/jobs" className="inline-flex rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">
                  Browse All Current Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </Band>

      <Band id="job-pathways">
        <SectionHeading
          eyebrow="Career pathways"
          title={`Common jobs considered for ${country.name} recruitment`}
          body="These detailed occupational summaries help candidates understand typical duties and preparation. They are recruitment guidance, not a promise that every role is currently open or eligible for sponsorship."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {roles.map((role) => (
            <article key={role.key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Job pathway</p>
                  <h2 className="mt-2 text-2xl font-black text-[#071A3D]">{role.title}</h2>
                </div>
                <span className="rounded-full bg-[#071A3D] px-3 py-1 text-xs font-black text-[#F2D675]">{country.name}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{role.summary}</p>
              <h3 className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#071A3D]">Typical duties</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                {role.typicalDuties.map((duty) => <li key={duty} className="flex gap-2"><span className="font-black text-[#D4AF37]">✓</span><span>{duty}</span></li>)}
              </ul>
              <h3 className="mt-6 text-sm font-black uppercase tracking-[0.14em] text-[#071A3D]">Candidate profile</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{role.candidateProfile}</p>
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600"><strong className="text-[#071A3D]">Compliance note:</strong> {role.complianceNote}</p>
              <Link href={`${jobSearchUrl}&search=${encodeURIComponent(role.title)}`} className="mt-5 inline-flex text-sm font-black text-[#B8860B] hover:underline">
                Search current {role.title} jobs →
              </Link>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey" id="requirements">
        <SectionHeading
          eyebrow="Candidate readiness"
          title={`Requirements and documents for ${country.name}`}
          body="The exact checklist depends on the employer, occupation and immigration route. Candidates should provide only genuine documents and follow the instructions linked to their actual application."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <ChecklistCard title="Common candidate requirements" items={recruitment.candidateRequirements} />
          <ChecklistCard title="Common document focus" items={recruitment.documentFocus} />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard title="Employment conditions" body={recruitment.employmentNotes} />
          <InfoCard title="Arrival preparation" body={recruitment.arrivalPreparation} />
          <InfoCard title={country.feeLabel} body={`${formatMoney(country.baseRecruitmentFee, country.feeCurrency)}. ${PROGRAMME_FEE_DISCLAIMER}`} />
          <InfoCard title="Processing estimate" body={`${processing(country)}. ${PROCESSING_TIME_DISCLAIMER}`} />
        </div>
      </Band>

      <Band id="recruitment-process">
        <SectionHeading
          eyebrow="From application to deployment"
          title={`${country.name} international recruitment process`}
          body="A real recruitment case can move through several organizations: Red Stone, the employer, medical providers, visa centres and government authorities. Each stage must be completed in the correct order."
        />
        <div className="mt-10">
          <ProcessSteps steps={[
            "Find a Published Vacancy",
            "Create Candidate Application",
            "CV & Document Review",
            "Candidate Screening",
            "Employer Shortlisting / Interview",
            "Written Job Offer or Selection",
            "Employer Work-Authorization Stage",
            "Medical / Biometrics if Instructed",
            "Visa / Residence Application",
            "Official Decision",
            "Pre-Departure Preparation",
            "Travel & Employer Reporting",
          ]} />
        </div>
        <div className="mt-8 rounded-2xl border border-[#D4AF37]/30 bg-[#FFF9E8] p-6 text-sm leading-7 text-slate-700">
          <strong className="text-[#071A3D]">Important:</strong> Medicals, police clearance, biometrics and other compliance steps should be completed when they become applicable to the real case. For Red Stone sponsorship-programme medicals, follow the agency&apos;s application-stage instructions and any overriding requirement from the destination government or authorized medical provider.
        </div>
      </Band>

      <Band tone="grey" id="visa-process">
        <SectionHeading
          eyebrow="Immigration & work authorization"
          title={`${country.name} visa and work-permit process`}
          body={visaGuide.overview}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-[#071A3D]">Employment-route overview</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{recruitment.workRoute}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{visaGuide.entryNote}</p>
          </div>
          <div className="rounded-2xl bg-[#071A3D] p-7 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">Official authority</p>
            <h2 className="mt-3 text-xl font-black">{visaGuide.authority}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">Government requirements can change. Use the official authority as the final source for current forms, fees, eligibility and decisions.</p>
            <a href={visaGuide.officialUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
              Open Official Immigration Source
            </a>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-black text-[#071A3D]">Principal visa, permit and residence categories</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            The categories below summarize the principal routes covered in Red Stone&apos;s {country.name} visa guide. Not every route is an employment route, and eligibility must be checked against the latest official rules.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {visaGuide.visaTypes.map((visaType) => (
              <details key={visaType.name} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#D4AF37]">
                <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#071A3D]">
                  {visaType.name}
                  <span className="float-right text-[#B8860B] group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-[#B8860B]">{visaType.purpose}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{visaType.details}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={visaUrl} className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Read Full {country.name} Visa Guide</Link>
          <Link href="/medicals-compliance" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-[#071A3D]">Medicals & Compliance</Link>
          <Link href="/pre-departure-support" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-[#071A3D]">Pre-Departure Support</Link>
        </div>
      </Band>

      {sponsorshipSlugs.has(country.slug) ? (
        <Band>
          <div className="grid gap-7 rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Sponsorship pathways</p>
              <h2 className="mt-3 text-3xl font-black">Explore sponsorship-related recruitment for {country.name}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
                Where Red Stone has an applicable sponsorship pathway, review the role description, programme medical guidance, employer-supported benefits and application requirements. Sponsorship remains subject to a real employer selection and the lawful immigration route.
              </p>
            </div>
            <Link href="/sponsorship-jobs" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-black text-[#071A3D]">
              Sponsorship Jobs
            </Link>
          </div>
        </Band>
      ) : null}

      <Band>
        <SectionHeading
          eyebrow="Frequently asked questions"
          title={`${country.name} recruitment FAQs`}
          body="These answers explain the normal recruitment framework. A live candidate's actual next step depends on the vacancy, employer, application record and latest government rules."
        />
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#D4AF37]">
              <summary className="cursor-pointer list-none pr-8 text-base font-black text-[#071A3D]">{faq.question}<span className="float-right text-[#B8860B]">＋</span></summary>
              <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Ready to continue?</p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D]">Apply for a genuine {country.name} opportunity</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Start with a published vacancy or submit your candidate application for review. Employment selection is made by employers, while visa and work-authorization decisions are made by the relevant authorities.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href={jobSearchUrl} className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">View Jobs</Link>
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Apply Now</Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-1.5 w-12 rounded-full bg-[#D4AF37]" />
      <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-black text-[#071A3D]">{title}</h2>
      <ul className="mt-5 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-7 text-slate-600">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF4C7] text-xs font-black text-[#B8860B]">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function buildCountryFaqs(countryName: string, workRoute: string, authority: string) {
  return [
    {
      question: `How do I apply for jobs in ${countryName} through Red Stone?`,
      answer: `Start by checking currently published ${countryName} vacancies and their requirements. Create an application with accurate personal, passport and CV information. Red Stone can review the profile and documents, but employer selection is required before a candidate can move into an employer-specific work-authorization or deployment process.`,
    },
    {
      question: `Does Red Stone guarantee a job or visa for ${countryName}?`,
      answer: `No. Red Stone provides recruitment, candidate preparation and case coordination. Employers decide who they hire, and ${authority} or the relevant government authority makes immigration and work-authorization decisions. No application, fee, medical or programme participation guarantees employment or a visa.`,
    },
    {
      question: `What is the normal work visa process for ${countryName}?`,
      answer: workRoute,
    },
    {
      question: `Which documents should I prepare for ${countryName} recruitment?`,
      answer: `A valid passport and accurate CV are the usual starting point. Depending on the job, candidates may also need education or trade certificates, employment references, police clearance, professional registration, medical documents and employer-issued immigration records. Only complete medicals, biometrics or additional clearance when they become applicable to the actual case.`,
    },
    {
      question: `Can I apply for ${countryName} without work experience?`,
      answer: `Some entry-level vacancies may accept candidates with limited formal experience, while skilled, regulated and sponsored occupations often require specific work history, qualifications or licensing. The published job description determines the actual requirement.`,
    },
    {
      question: `Do I need a medical examination for ${countryName}?`,
      answer: `It depends on the immigration route, occupation and official instructions. Candidates should not assume that every application requires the same medical. For a Red Stone programme, follow the medical instruction issued at the relevant application stage, while any designated government or panel-physician requirement takes priority.`,
    },
    {
      question: `How long does ${countryName} recruitment take?`,
      answer: `There is no single guaranteed timeline. Recruitment depends on vacancy availability, screening, employer interviews, document readiness, work authorization, medical or biometric stages and government processing. Published estimates are planning guidance only and can change.`,
    },
    {
      question: `How can I avoid recruitment fraud when applying for ${countryName}?`,
      answer: `Use Red Stone's official website and contact channels, confirm that the vacancy exists, read the written offer carefully and request a receipt for legitimate payments. Do not pay an individual who promises guaranteed employment, visa approval or a faster government decision.`,
    },
  ];
}

function processing(country: { processingTimeMin: number | null; processingTimeMax: number | null; processingTimeUnit: string | null; processingTimeNote: string | null }) {
  if (country.processingTimeMin && country.processingTimeMax && country.processingTimeUnit) {
    return `${country.processingTimeMin}-${country.processingTimeMax} ${country.processingTimeUnit}`;
  }
  if (country.processingTimeNote) return country.processingTimeNote;
  return DEFAULT_PROCESSING_TEXT;
}
