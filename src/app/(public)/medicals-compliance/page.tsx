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
  title: "Medicals & Compliance for International Recruitment",
  description:
    "Guidance on recruitment medical examinations, biometrics, police clearance, document verification and compliance requirements for international employment candidates through Red Stone Employment Agency.",
  alternates: { canonical: canonical("/medicals-compliance") },
  openGraph: {
    title: "Medicals & Compliance | Red Stone Employment Agency",
    description:
      "Professional guidance for recruitment medicals, biometrics, police clearance, document verification and post-selection compliance requirements.",
    url: canonical("/medicals-compliance"),
    type: "website",
  },
};

const process = [
  "Confirm Employer / Case Stage",
  "Review Destination Requirements",
  "Receive Official Medical or Compliance Instructions",
  "Book the Required Appointment",
  "Complete Medical / Biometrics / Clearance",
  "Keep Official Receipts & Results",
  "Submit Required Records",
  "Continue to Work Permit / Visa Stage",
];

const services = [
  {
    title: "Recruitment Medical Guidance",
    body: "We help candidates understand when an employment-related medical examination is required, what appointment information to prepare and how the medical stage fits into the wider recruitment process.",
  },
  {
    title: "Police Clearance & Good Conduct",
    body: "Guidance on preparing police-clearance or certificate-of-good-conduct records where an employer, destination or official authority requires them.",
  },
  {
    title: "Biometrics Preparation",
    body: "Candidates receive practical guidance on appointment readiness, identity documents and record keeping when biometrics are required by the relevant immigration or government authority.",
  },
  {
    title: "Document Verification",
    body: "We help candidates check that identity, qualification, employment and supporting records are complete, consistent and suitable for the stage they have reached.",
  },
  {
    title: "Destination Compliance Checks",
    body: "Requirements differ by country, occupation and programme. We help candidates identify the instructions that apply to their specific employment pathway and destination.",
  },
  {
    title: "Compliance Record Coordination",
    body: "We help candidates keep appointment confirmations, receipts, reference numbers and required results organized so the recruitment case can move forward clearly and professionally.",
  },
];

const preparation = [
  "Valid passport or identity document",
  "Appointment confirmation or referral where applicable",
  "Recent passport photographs if requested",
  "Employer or case reference information",
  "Previous medical records only when officially requested",
  "Prescription or treatment information when the medical provider asks for it",
  "Police-clearance application records where required",
  "Biometric appointment notice where applicable",
  "Official payment receipt or proof of appointment",
  "Any additional document listed by the approved provider or relevant authority",
];

const standards = [
  {
    title: "Use authorized providers",
    body: "Where a destination or authority requires an approved medical provider, panel physician, biometric centre or designated facility, candidates should use the provider specified in the official instructions.",
  },
  {
    title: "Do not falsify results",
    body: "Medical, police-clearance and biometric records must be genuine. Altered or false records can affect recruitment, employer trust and immigration processing.",
  },
  {
    title: "Protect sensitive information",
    body: "Medical and identity information should be shared only through appropriate channels and only when it is necessary for the relevant recruitment or immigration stage.",
  },
  {
    title: "Follow current official requirements",
    body: "Medical tests, validity periods, appointment processes and compliance requirements can change. Candidates should follow the latest instructions from the relevant authority and approved provider.",
  },
];

const faq = [
  {
    question: "Do I need to complete a medical before I can look for jobs?",
    answer:
      "Usually not. Recruitment medicals are normally connected to a specific employer, destination, occupation or post-selection stage. Candidates should not complete unnecessary tests without clear instructions for their case.",
  },
  {
    question: "Does passing a medical guarantee a visa or job?",
    answer:
      "No. A medical examination may be one requirement in a wider recruitment or immigration process. Employer selection and government immigration decisions are separate processes and are not guaranteed by a medical result.",
  },
  {
    question: "Can I choose any clinic for an immigration medical?",
    answer:
      "Not always. Some countries or programmes require candidates to use an approved panel physician, designated medical centre or other authorized provider. Always follow the instructions for your destination and case.",
  },
  {
    question: "What if a requirement changes after I have prepared my documents?",
    answer:
      "Use the most recent official instructions. Red Stone can help candidates review the updated requirement and organize the next step, but the relevant authority determines the final requirement.",
  },
  {
    question: "Who decides whether I am medically eligible?",
    answer:
      "Medical providers conduct examinations and the relevant employer or government authority applies the rules for the programme involved. Red Stone does not make medical diagnoses or immigration medical decisions.",
  },
];

export default function MedicalsCompliancePage() {
  const pageUrl = `${SITE_URL}/medicals-compliance`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Medicals & Compliance for International Recruitment",
            serviceType:
              "International recruitment medical and compliance preparation guidance",
            provider: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            areaServed: "International",
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
                name: "Medicals & Compliance",
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
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&fm=jpg&q=82&w=1800)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A3D] via-[#071A3D]/95 to-[#071A3D]/75" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Candidate compliance support
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Medicals & Compliance for International Recruitment
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Clear guidance for candidates who reach medical, police-clearance, biometric, document-verification and other compliance stages connected to international employment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/candidate-support"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Candidate Support
            </Link>
            <Link
              href="/immigration-services"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Immigration Guidance
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="What we help with"
          title="Medical and compliance preparation at the right stage"
          body="Red Stone helps candidates understand the requirement, prepare the correct records and follow the appropriate official process without presenting medical or immigration outcomes as guaranteed."
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
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Appointment readiness
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">
              What candidates may need to prepare
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Always use the checklist issued for your own case. The items below are common examples and are not a universal medical or immigration checklist.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {preparation.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-black text-[#B8860B]">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Important
            </p>
            <h2 className="mt-3 text-3xl font-black">Medical guidance is not medical diagnosis</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Red Stone provides recruitment and process guidance. We do not diagnose medical conditions, interpret medical results as a clinician, issue medical certificates or decide immigration medical eligibility.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Candidates should discuss health questions directly with a qualified medical professional and follow the instructions of the relevant approved medical provider or government authority.
            </p>
            <Link
              href="/official-channels"
              className="mt-6 inline-flex text-sm font-black text-[#F2D675] hover:underline"
            >
              Review Official Channels →
            </Link>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Typical process"
          title="From case confirmation to compliance completion"
          body="The exact sequence varies, but candidates should understand why a requirement applies before paying for or completing it."
        />
        <div className="mt-10">
          <ProcessSteps steps={process} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Compliance standards"
          title="Four principles candidates should follow"
          body="A careful compliance process protects the candidate, the employer and the integrity of the recruitment case."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {standards.map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">
                {index + 1}
              </span>
              <h2 className="mt-5 text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Medical and compliance questions"
          body="General answers to common recruitment medical and compliance questions. Case-specific instructions should always come from the relevant official authority or approved provider."
        />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#071A3D]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Need help with your next stage?
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Keep your recruitment and compliance records organized
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Follow the instructions for your actual vacancy and destination, use official providers where required and keep copies of every appointment and receipt.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/candidate-support"
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
            >
              Candidate Support
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white"
            >
              Contact Red Stone
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
