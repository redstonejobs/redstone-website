import type { Metadata } from "next";
import Link from "next/link";

import { SponsorshipCountdown } from "@/components/public/sponsorship-countdown";
import { Band, ContactCTA, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import {
  SPONSORSHIP_APPLICATION_FEE,
  SPONSORSHIP_BENEFITS,
  SPONSORSHIP_INTAKE_DEADLINE,
  SPONSORSHIP_JOBS,
  SPONSORSHIP_MEDICALS,
  sponsorshipCountries,
} from "@/lib/public/sponsorship-jobs";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Visa Sponsorship Jobs 2026 | USA, Canada, Australia, New Zealand & Gulf",
  description:
    "Explore Red Stone sponsorship recruitment pathways for nanny, caregiver, security, housekeeping, cleaning, warehouse, farm, hospitality and driver roles in the USA, Canada, Australia, New Zealand and Gulf countries.",
  alternates: { canonical: canonical("/sponsorship-jobs") },
  openGraph: {
    title: "International Sponsorship Jobs | Red Stone Employment Agency",
    description:
      "Sponsorship recruitment pathways, candidate-paid medical requirements, KES 2,000 CV and document verification fee, realistic salary guidance and application steps.",
    url: canonical("/sponsorship-jobs"),
    type: "website",
  },
};

const applicationSteps = [
  "Choose a Suitable Sponsorship Role",
  "Create Candidate Application",
  "Complete Personal & Passport Details",
  "Upload Genuine Documents",
  "Application & Document Review",
  "KES 2,000 CV / Document Verification Payment Stage",
  "Employer Matching & Selection",
  "Red Stone Medical Booking When Required",
  "Work Permit / Visa / Compliance Process",
  "Pre-Departure & Deployment",
];

const faq = [
  {
    question: "What is included in the sponsorship package?",
    answer:
      "For qualifying placements, the written employer package may cover visa or work-authorization processing costs, economy air ticket, accommodation or housing support, food or meal allowance, basic insurance and employer onboarding. The exact package must be confirmed in the individual written job offer.",
  },
  {
    question: "What does the candidate pay?",
    answer:
      "The Red Stone application workflow includes a KES 2,000 CV and document verification fee at the payment stage. Where a medical is required, the applicable programme medical is KES 12,500 for Gulf cases, KES 31,060 for qualifying non-Gulf cases, or KES 41,000 for the IOM medical route where appropriate or required. These costs are not payment for a job or guaranteed visa approval.",
  },
  {
    question: "Can I do the medical before applying?",
    answer:
      "For this Red Stone sponsorship programme, candidates should not arrange the programme medical independently. The medical booking is initiated or authorized by Red Stone through the application process once the case reaches the correct stage, while any government-mandated panel physician or approved-provider rule still takes priority.",
  },
  {
    question: "Does applying guarantee sponsorship or a job?",
    answer:
      "No. Candidates must complete every applicable stage truthfully and remain subject to vacancy availability, employer selection, document checks and government work-authorization or visa decisions.",
  },
  {
    question: "Why are the salaries shown as ranges?",
    answer:
      "Salary depends on the employer, location, working hours, experience, licence requirements and applicable employment law. The ranges shown are conservative guidance, while the signed employer contract controls the actual salary and benefits.",
  },
];

export default function SponsorshipJobsPage() {
  const countries = sponsorshipCountries();
  const pageUrl = `${SITE_URL}/sponsorship-jobs`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "International Sponsorship Recruitment Programme",
            serviceType: "International recruitment and sponsorship candidate intake",
            provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            areaServed: countries.map((country) => country.name),
            url: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Sponsorship Jobs", item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Sponsorship job role pathways",
            itemListElement: SPONSORSHIP_JOBS.map((job, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/sponsorship-jobs/${job.countrySlug}/${job.roleSlug}`,
              name: `${job.role} - ${job.country}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1771945029451-da143c6ea0e8?auto=format&fit=crop&fm=jpg&q=82&w=1800)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A3D] via-[#071A3D]/95 to-[#071A3D]/70" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
              2026 sponsorship candidate intake
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              International Sponsorship Jobs & Recruitment Pathways
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              Explore structured sponsorship recruitment pathways for the USA, Canada, New Zealand, Australia and Gulf countries. Every candidate must complete the Red Stone application, document, employer-selection and compliance stages that apply to the case.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/apply"
                className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
              >
                Start Sponsorship Application
              </Link>
              <Link
                href="#sponsorship-roles"
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
              >
                View 24 Roles
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Current intake countdown</p>
            <h2 className="mt-2 text-2xl font-black">Applications close 6 October 2026</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              The countdown applies to this published intake window. Vacancy availability and employer selection remain separate.
            </p>
            <div className="mt-6">
              <SponsorshipCountdown deadline={SPONSORSHIP_INTAKE_DEADLINE} />
            </div>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Clear sponsorship package"
          title="What a qualifying sponsored placement can include"
          body="Sponsorship benefits must be confirmed in the candidate's written employer offer. Red Stone does not treat a sponsorship application as a guarantee of employment or immigration approval."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SPONSORSHIP_BENEFITS.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">✓</div>
              <p className="font-bold leading-7 text-[#071A3D]">{benefit}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl bg-[#071A3D] p-7 text-white sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Candidate-paid application cost</p>
            <h2 className="mt-2 text-3xl font-black">{SPONSORSHIP_APPLICATION_FEE.amount}</h2>
            <p className="mt-1 font-black text-white">{SPONSORSHIP_APPLICATION_FEE.label}</p>
            <p className="mt-4 text-sm leading-7 text-slate-200">{SPONSORSHIP_APPLICATION_FEE.note}</p>
            <Link href="/apply" className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
              Begin Application
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Medical requirements</p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">Medical is booked through the Red Stone process</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              To remain within this sponsorship workflow, do not arrange the programme medical independently. Red Stone initiates or authorizes the booking when your application reaches the appropriate stage. If an immigration authority requires a specific panel physician or approved provider, that official requirement takes priority.
            </p>
            <div className="mt-6 space-y-3">
              {SPONSORSHIP_MEDICALS.map((medical) => (
                <div key={medical.label} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-black text-[#071A3D]">{medical.label}</h3>
                    <span className="font-black text-[#B8860B]">{medical.amount}</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-600">{medical.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Qualification rule"
          title="Every required stage must be completed"
          body="A candidate is considered ready for the next stage only after completing the applicable Red Stone application steps and providing genuine, accurate information. Skipping a required stage can leave the application incomplete."
        />
        <div className="mt-10">
          <ProcessSteps steps={applicationSteps} />
        </div>
        <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Important:</strong> completing the process does not guarantee employer selection, a work permit or a visa. Employers make hiring decisions and government authorities make immigration decisions.
        </p>
      </Band>

      <Band tone="grey">
        <div id="sponsorship-roles" className="scroll-mt-24">
          <SectionHeading
            eyebrow="24 sponsorship role pathways"
            title="USA, Canada, New Zealand, Australia & Gulf roles"
            body="Each role has its own detailed SEO page with duties, requirements, realistic salary guidance, sponsorship information and a direct application path."
          />

          <div className="mt-10 space-y-12">
            {countries.map((country) => {
              const jobs = SPONSORSHIP_JOBS.filter((job) => job.countrySlug === country.slug);
              return (
                <section key={country.slug}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">{country.region}</p>
                      <h2 className="mt-1 text-3xl font-black text-[#071A3D]">{country.name}</h2>
                    </div>
                    <span className="rounded-full bg-[#071A3D] px-4 py-2 text-xs font-black text-white">{jobs.length} roles</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                      <article key={`${job.countrySlug}-${job.roleSlug}`} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Sponsorship pathway</p>
                        <h3 className="mt-2 text-xl font-black text-[#071A3D]">{job.role}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{job.summary}</p>
                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">Indicative salary</p>
                          <p className="mt-1 text-sm font-black leading-6 text-[#071A3D]">{job.salary}</p>
                        </div>
                        <div className="mt-auto pt-5">
                          <Link
                            href={`/sponsorship-jobs/${job.countrySlug}/${job.roleSlug}`}
                            className="inline-flex rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white"
                          >
                            View Role & Apply
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading eyebrow="Common questions" title="Sponsorship recruitment FAQs" />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black text-[#071A3D]">{item.question}</summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Ready to apply?</p>
            <h2 className="mt-2 text-3xl font-black">Start the Red Stone sponsorship application process</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Select a suitable role, provide truthful information and complete each required stage. The KES 2,000 fee is for CV and document verification at the payment stage, not for buying employment.
            </p>
          </div>
          <Link href="/apply" className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] lg:mt-0 lg:shrink-0">
            Apply Now
          </Link>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
