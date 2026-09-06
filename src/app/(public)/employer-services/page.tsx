import type { Metadata } from "next";
import Link from "next/link";

import {
  Band,
  ContactCTA,
  ProcessSteps,
  SectionHeading,
} from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Employer Recruitment Services | International Hiring Support",
  description:
    "International employer recruitment services from Red Stone Employment Agency, including workforce sourcing, candidate screening, interview coordination, documentation support and deployment preparation.",
  alternates: { canonical: canonical("/employer-services") },
  openGraph: {
    title: "Employer Recruitment Services | Red Stone Employment Agency",
    description:
      "Professional international recruitment support for employers seeking screened candidates, structured hiring coordination and responsible workforce mobilization.",
    url: canonical("/employer-services"),
    type: "website",
  },
};

const recruitmentProcess = [
  "Employer Workforce Requirement",
  "Vacancy & Role Brief",
  "Candidate Sourcing",
  "Screening & Shortlisting",
  "Employer Interviews",
  "Candidate Selection",
  "Documentation & Compliance",
  "Mobilization & Deployment",
  "Post-Placement Coordination",
];

const services = [
  {
    title: "Workforce Sourcing",
    body: "We help employers identify suitable candidates for skilled, technical, entry-level and general workforce requirements based on the role, destination and employer criteria.",
  },
  {
    title: "Candidate Screening & Shortlisting",
    body: "Candidate profiles are reviewed against the stated job requirements before suitable applicants are presented for employer consideration.",
  },
  {
    title: "Interview Coordination",
    body: "We support interview scheduling, candidate communication and recruitment administration so employers can evaluate shortlisted candidates efficiently.",
  },
  {
    title: "Document Readiness Support",
    body: "We coordinate candidate document readiness for the recruitment stage and help identify records that may be required after employer selection.",
  },
  {
    title: "Compliance Coordination",
    body: "Where applicable, we help organize post-selection medical, police-clearance, biometric, work-permit or other compliance requirements according to the relevant official process.",
  },
  {
    title: "Mobilization & Deployment Support",
    body: "Once the required employer and government approvals are complete, we help coordinate candidate communication, pre-departure preparation and reporting instructions.",
  },
];

const sectors = [
  "Healthcare & Care Services",
  "Construction & Engineering",
  "Hospitality & Food Service",
  "Logistics & Warehousing",
  "Manufacturing & Factory Operations",
  "Agriculture & Farm Work",
  "Cleaning & Facilities Support",
  "Driving & Transport",
  "Technical & Maintenance Roles",
  "General Workforce Requirements",
];

const employerChecklist = [
  "Clear job title and role description",
  "Number of workers required",
  "Work location and destination country",
  "Required experience, skills or licences",
  "Salary, working hours and employment conditions",
  "Accommodation, transport or other benefits where applicable",
  "Interview and selection process",
  "Expected deployment timeline",
  "Employer or sponsor documentation required for the destination",
  "Authorized contact person for recruitment coordination",
];

const standards = [
  {
    title: "Clear job information",
    body: "Vacancy information should accurately describe the role, location, salary or compensation structure, working conditions and any candidate requirements.",
  },
  {
    title: "Responsible candidate selection",
    body: "Shortlisting should be based on legitimate job requirements and the employer's stated selection criteria, not misleading promises or discriminatory practices that are unlawful in the relevant jurisdiction.",
  },
  {
    title: "Transparent recruitment communication",
    body: "Candidates should understand the recruitment stage, employer requirements and what has or has not yet been approved.",
  },
  {
    title: "Official immigration and work authorization",
    body: "Work permits, visas and immigration approvals are issued by the relevant government authorities. Red Stone does not issue or guarantee them.",
  },
];

const faq = [
  {
    question: "What types of workers can Red Stone help employers recruit?",
    answer:
      "Red Stone can support recruitment for skilled, technical, hospitality, logistics, construction, healthcare, driving, maintenance, entry-level and general workforce roles, subject to the employer's requirements and applicable laws.",
  },
  {
    question: "Can an employer submit a large-volume workforce requirement?",
    answer:
      "Yes. Employers can provide the number of workers required, role categories, destination, selection criteria and expected timeline so the recruitment team can assess the sourcing and screening plan.",
  },
  {
    question: "Does Red Stone make the final hiring decision?",
    answer:
      "No. Red Stone supports sourcing, screening and recruitment coordination, while the employer makes the final hiring or selection decision.",
  },
  {
    question: "Can Red Stone guarantee work permits or visas for selected workers?",
    answer:
      "No. Red Stone can support documentation and process coordination, but work permits, visas and other immigration approvals are decided by the relevant government authorities.",
  },
  {
    question: "How does an employer begin the recruitment process?",
    answer:
      "The employer should provide a clear workforce requirement including job titles, number of vacancies, location, qualifications, employment conditions and preferred deployment timeline. Red Stone can then review the requirement and coordinate the next recruitment steps.",
  },
];

export default function EmployerServicesPage() {
  const pageUrl = `${SITE_URL}/employer-services`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Employer Recruitment Services",
            serviceType: "International recruitment and workforce sourcing services",
            provider: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            areaServed: "International",
            audience: {
              "@type": "BusinessAudience",
              audienceType: "Employers and workforce hiring organizations",
            },
            url: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Employer Recruitment Services",
                item: pageUrl,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1758518730327-98070967caab?auto=format&fit=crop&fm=jpg&q=82&w=1800)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A3D] via-[#071A3D]/95 to-[#071A3D]/70" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Employer workforce solutions
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Employer Recruitment Services
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Red Stone Employment Agency supports employers with international workforce sourcing, candidate screening, interview coordination, documentation readiness and responsible deployment preparation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Submit a Recruitment Enquiry
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              View Published Vacancies
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Recruitment support for employers"
          title="A structured workforce recruitment service"
          body="We help employers move from workforce requirement to candidate selection and deployment through a clear, documented recruitment process."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 h-1.5 w-14 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{service.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{service.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Workforce sectors
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#071A3D] sm:text-4xl">
              Recruitment across skilled and general workforce categories
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Employer requirements vary by industry and destination. Red Stone can coordinate recruitment for individual roles or larger workforce requirements where the vacancy and employment conditions are clearly defined.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {sectors.map((sector) => (
                <div
                  key={sector}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 shadow-sm"
                >
                  {sector}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Employer requirement checklist
            </p>
            <h2 className="mt-3 text-3xl font-black">
              Information that helps us recruit accurately
            </h2>
            <div className="mt-6 space-y-3">
              {employerChecklist.map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-black text-[#071A3D]">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Employer recruitment process"
          title="From workforce requirement to deployment"
          body="A transparent sequence helps employers, candidates and the recruitment team understand responsibilities and next actions at every stage."
        />
        <div className="mt-10">
          <ProcessSteps steps={recruitmentProcess} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Responsible recruitment"
          title="Standards that protect employers and candidates"
          body="Professional international recruitment depends on accurate vacancy information, transparent communication and compliance with the applicable employment and immigration requirements."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {standards.map((standard) => (
            <article
              key={standard.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-black text-[#071A3D]">{standard.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{standard.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              For employers
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
              Employer selection remains with the employer
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Red Stone can source, screen and coordinate candidates, but the employer remains responsible for the final hiring decision, employment terms and the accuracy of the vacancy information provided for recruitment.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">
              Work authorization
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
              Government authorities make immigration decisions
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              Work permits, visas, residence permissions and related immigration approvals are issued by the relevant government authorities. Recruitment selection does not guarantee an immigration approval.
            </p>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Employer recruitment questions"
          body="Key answers for organizations considering international recruitment support through Red Stone."
        />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#071A3D]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band>
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Recruiting internationally?
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Tell us the workforce you need
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Share your job categories, number of vacancies, location, candidate requirements and expected timeline so the Red Stone team can review the recruitment requirement.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/contact"
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
            >
              Contact Recruitment Team
            </Link>
            <Link
              href="/ethical-recruitment"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white"
            >
              Ethical Recruitment
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
