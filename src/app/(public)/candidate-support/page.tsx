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
  title: "Candidate Support & Documentation",
  description:
    "Candidate support for international recruitment, including CV preparation, document readiness, application guidance and post-selection documentation support from Red Stone Employment Agency.",
  alternates: { canonical: canonical("/candidate-support") },
  openGraph: {
    title: "Candidate Support & Documentation | Red Stone Employment Agency",
    description:
      "Professional candidate support for CVs, recruitment documents, application readiness and international employment preparation.",
    url: canonical("/candidate-support"),
    type: "website",
  },
};

const steps = [
  "Create Candidate Profile",
  "Review CV & Experience",
  "Check Core Documents",
  "Match to Suitable Vacancies",
  "Prepare Application",
  "Employer Selection",
  "Complete Post-Selection Documents",
  "Move to Visa / Work Permit Preparation",
];

const services = [
  {
    title: "CV & Profile Preparation",
    body: "We help candidates present their experience, skills and employment history clearly for suitable international vacancies without exaggerating qualifications or inventing experience.",
  },
  {
    title: "Document Readiness Checks",
    body: "We help candidates identify missing, expired or incomplete documents before they reach important recruitment and post-selection stages.",
  },
  {
    title: "Application Guidance",
    body: "Candidates receive practical guidance on completing applications accurately, understanding vacancy requirements and preparing for employer review.",
  },
  {
    title: "Interview Preparation",
    body: "We help candidates understand the role, prepare truthful examples from their experience and approach employer interviews professionally.",
  },
  {
    title: "Post-Selection Documentation",
    body: "After employer selection, we help organize the employment and personal documents needed before work-permit, visa, medical or travel stages begin.",
  },
  {
    title: "Case Communication",
    body: "Candidates can follow a structured process and receive clear updates about recruitment requirements and next steps through official Red Stone channels.",
  },
];

const documents = [
  "Valid passport",
  "Up-to-date CV or résumé",
  "National identification document where required",
  "Academic or professional certificates where relevant",
  "Employment references or experience records where required",
  "Police clearance / certificate of good conduct where required",
  "Passport photographs",
  "Medical records only when requested for the relevant stage",
  "Employer or recruitment forms for the specific vacancy",
  "Additional destination-specific documents where applicable",
];

const faq = [
  {
    question: "Do I need every document before I can search for jobs?",
    answer:
      "Not always. Basic identity, contact and employment information may be enough to begin a recruitment profile, but specific vacancies and later stages can require additional documents.",
  },
  {
    question: "Can Red Stone create or change information on my documents?",
    answer:
      "No. Candidate documents must be genuine and accurate. Red Stone can help organize, review and explain document requirements, but we do not create false records or alter official information.",
  },
  {
    question: "Does document preparation guarantee employment?",
    answer:
      "No. Document readiness supports a professional application, but employer selection depends on the vacancy, candidate suitability and the employer's decision.",
  },
  {
    question: "When do visa and work-permit documents become important?",
    answer:
      "They normally become important after a genuine employment opportunity and employer-selection pathway has been established. Requirements vary by destination and programme.",
  },
];

export default function CandidateSupportPage() {
  const pageUrl = `${SITE_URL}/candidate-support`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Candidate Support & Documentation",
            serviceType: "International recruitment candidate support and documentation guidance",
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
                name: "Candidate Support & Documentation",
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
            Candidate services
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Candidate Support & Documentation
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Professional support for job applications, CV preparation, document readiness, interviews and the transition from employer selection to post-selection requirements.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Browse Jobs
            </Link>
            <Link
              href="/apply"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Start Application
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="What candidates receive"
          title="Support designed around a real recruitment process"
          body="The goal is to help candidates submit accurate information, prepare the right documents and understand what happens at each stage."
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
              Candidate document checklist
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">
              Common documents to prepare
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The exact checklist depends on the vacancy, employer and destination. These are common records candidates may be asked to provide during recruitment or later stages.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {documents.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-black text-[#B8860B]">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Candidate protection
            </p>
            <h2 className="mt-3 text-3xl font-black">Accuracy matters</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Candidates should never submit false employment history, altered certificates, fake references or incorrect identity information. Inaccurate documents can affect recruitment, employer trust and later immigration processes.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Use your legal name consistently",
                "Keep passport and contact information current",
                "Submit only genuine qualifications and work records",
                "Read job requirements before applying",
                "Keep copies of documents and official receipts",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-100">
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/candidate-protection"
              className="mt-6 inline-flex text-sm font-black text-[#F2D675] hover:underline"
            >
              Read Candidate Protection Guidance →
            </Link>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Candidate journey"
          title="From profile creation to post-selection preparation"
          body="A clear sequence helps candidates understand what should happen before more advanced documentation or immigration stages begin."
        />
        <div className="mt-10">
          <ProcessSteps steps={steps} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Candidate support questions"
          body="Straightforward answers to common questions about recruitment documents and application preparation."
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

      <Band>
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Ready to begin?
            </p>
            <h2 className="mt-2 text-3xl font-black">Start with a genuine vacancy</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Browse current opportunities, review the requirements and begin your application with accurate information and the documents you already have.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/jobs"
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
            >
              Find Jobs
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
