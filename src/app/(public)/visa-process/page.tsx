import type { Metadata } from "next";
import Link from "next/link";

import { Band, ContactCTA, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { VISA_GUIDES } from "@/lib/public/visa-guides";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Visa Process Guide for 26 Countries | Work, Study, Visit & Family Visas",
  description:
    "Detailed visa process guidance for 26 Red Stone recruitment destinations, covering work visas, visitor visas, student visas, family visas, business routes, residence permits and official immigration authorities.",
  alternates: { canonical: canonical("/visa-process") },
  openGraph: {
    title: "Visa Process Guide for 26 Countries | Red Stone Employment Agency",
    description:
      "Compare visa and residence routes for the USA, Canada, Gulf, Europe, Australia, New Zealand, Singapore, Chile and Peru, then start your Red Stone application.",
    url: canonical("/visa-process"),
    type: "website",
  },
};

const process = [
  "Choose the Correct Country & Visa Purpose",
  "Check the Official Eligibility Rules",
  "Secure Employer, School or Sponsor Documents Where Required",
  "Prepare Passport & Supporting Documents",
  "Submit the Official Visa / Permit Application",
  "Pay Official Government Fees",
  "Complete Biometrics, Medicals or Interview Where Required",
  "Wait for the Government Decision",
  "Travel Only After Required Approval",
  "Complete Residence / Arrival Formalities Where Required",
];

const faq = [
  {
    question: "Does Red Stone issue visas?",
    answer:
      "No. Red Stone Employment Agency provides recruitment and application-preparation support. Visas, work permits and residence permits are issued or refused by the relevant government authority.",
  },
  {
    question: "Are the visa categories the same in every country?",
    answer:
      "No. Some countries use visas, some use work or study permits, and others combine entry visas with residence permits. Each country page explains the main official categories and links to the relevant authority.",
  },
  {
    question: "Can I apply for a work visa before getting a job?",
    answer:
      "It depends on the country and route. Many work visas require a qualifying employer or job offer first, while some countries also offer job-seeker or points-based pathways. Always check the country-specific guide and official authority.",
  },
  {
    question: "Can visa rules change?",
    answer:
      "Yes. Governments can change eligibility, fees, required documents, salary thresholds, occupations and application procedures. The official immigration authority remains the final source for current requirements.",
  },
];

export default function VisaProcessPage() {
  const pageUrl = `${SITE_URL}/visa-process`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "International Visa Process Guidance",
            serviceType: "Visa, work permit and residence process guidance for international recruitment candidates",
            provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            areaServed: VISA_GUIDES.map((guide) => guide.country),
            url: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Visa Process", item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Visa process country guides",
            numberOfItems: VISA_GUIDES.length,
            itemListElement: VISA_GUIDES.map((guide, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${guide.country} visa process guide`,
              url: `${SITE_URL}/visa-process/${guide.slug}`,
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

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            26 destination visa guides
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Visa Process Guide: Work, Visit, Study, Family & Residence Routes
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            Explore detailed visa and immigration-process guidance for all 26 Red Stone recruitment destinations. The guides cover the main official visa, work-permit, study, family, business and residence categories used by each country.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/apply"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Start Application
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Country-by-country guidance"
          title="Choose your destination"
          body="Each guide explains the country's visa and permit structure, the main categories, practical application stages, official authority and Red Stone application links."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {VISA_GUIDES.map((guide) => (
            <article key={guide.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B8860B]">{guide.region}</p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">{guide.country} Visa Process</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{guide.overview}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                {guide.visaTypes.length} visa / permit categories covered
              </p>
              <Link
                href={`/visa-process/${guide.slug}`}
                className="mt-6 inline-flex rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white"
              >
                View {guide.country} Guide →
              </Link>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Standard application journey"
          title="How a visa or permit application usually moves"
          body="The exact sequence differs by country and visa type, but these are the stages candidates should expect to verify."
        />
        <div className="mt-10">
          <ProcessSteps steps={process} />
        </div>
      </Band>

      <Band>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Important immigration notice</p>
            <h2 className="mt-3 text-3xl font-black">Use the right visa for the real purpose of travel</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              A visitor visa is not a work visa. A student permit is not automatically permanent residence. Employer sponsorship does not guarantee government approval. Every candidate must use genuine documents and follow the official rules for the exact route being applied for.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              The country guides are detailed educational and recruitment-preparation resources. Government authorities remain the final source for eligibility, fees, processing, approval and entry conditions.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Red Stone application</p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D]">Applying for a work opportunity?</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Start with the recruitment application and genuine vacancy. Red Stone can then help organize the candidate, document and post-selection process that applies to the employment route.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Apply Now</Link>
              <Link href="/sponsorship-jobs" className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Sponsorship Jobs</Link>
            </div>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Questions" title="Visa process FAQs" />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black text-[#071A3D]">{item.question}</summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
