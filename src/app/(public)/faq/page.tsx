import type { Metadata } from "next";
import Link from "next/link";

import { Band, ContactCTA, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { FAQ_CATEGORIES, FAQ_TOTAL } from "@/lib/public/faq-library";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "International Recruitment FAQs | 520 Detailed Answers",
  description:
    "Explore 520 detailed Red Stone Employment Agency FAQs covering applications, sponsorship jobs, medicals, fees, visas, work permits, documents, employers, interviews, travel, fraud prevention and candidate support.",
  keywords: [
    "international recruitment FAQ",
    "visa sponsorship questions",
    "work visa FAQ",
    "job application questions",
    "recruitment medical questions",
    "Red Stone Employment Agency FAQ",
  ],
  alternates: { canonical: canonical("/faq") },
  openGraph: {
    title: "520 International Recruitment FAQs | Red Stone Employment Agency",
    description:
      "A detailed recruitment knowledge base covering the full candidate journey from application and employer selection to medicals, visas, travel and fraud prevention.",
    url: canonical("/faq"),
    type: "website",
  },
};

const featuredQuestions = FAQ_CATEGORIES.flatMap((category) =>
  category.faqs.slice(0, 1).map((faq) => ({ ...faq, categoryName: category.name, categorySlug: category.slug }))
).slice(0, 12);

export default function FAQPage() {
  const pageUrl = `${SITE_URL}/faq`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "International Recruitment FAQs",
            description: `Red Stone Employment Agency knowledge base with ${FAQ_TOTAL} detailed recruitment questions and answers.`,
            url: pageUrl,
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "FAQ categories",
            numberOfItems: FAQ_CATEGORIES.length,
            itemListElement: FAQ_CATEGORIES.map((category, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: category.name,
              url: `${SITE_URL}/faq/${category.slug}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: featuredQuestions.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0B2550] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Red Stone recruitment knowledge base
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {FAQ_TOTAL} Detailed International Recruitment FAQs
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            Clear, detailed answers covering job applications, sponsorship, documents, medicals, payments, visas, employers, interviews, travel, fraud prevention, privacy and candidate support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D]">
              Start Application
            </Link>
            <Link href="/visa-process" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white">
              Explore 26 Visa Guides
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow={`${FAQ_CATEGORIES.length} specialist categories`}
          title="Choose the topic that matches your question"
          body="Each category contains 40 detailed answers written around the real Red Stone recruitment process. This structure keeps the information easier to read, easier to link internally and easier for search engines and AI systems to understand by topic."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FAQ_CATEGORIES.map((category, index) => (
            <Link
              key={category.slug}
              href={`/faq/${category.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">40 FAQs</span>
              </div>
              <h2 className="mt-5 text-xl font-black text-[#071A3D] group-hover:text-[#B8860B]">{category.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
              <p className="mt-5 text-sm font-black text-[#B8860B]">Read detailed answers →</p>
            </Link>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Popular questions"
          title="Start with these common recruitment questions"
          body="These examples link into the wider 520-question knowledge base."
        />
        <div className="mx-auto mt-10 max-w-5xl space-y-4">
          {featuredQuestions.map((faq) => (
            <details key={faq.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black leading-7 text-[#071A3D]">
                {faq.question}
              </summary>
              <p className="mt-4 text-sm leading-8 text-slate-600">{faq.answer}</p>
              <Link
                href={`/faq/${faq.categorySlug}`}
                className="mt-4 inline-flex text-sm font-black text-[#B8860B] hover:underline"
              >
                More {faq.categoryName} FAQs →
              </Link>
            </details>
          ))}
        </div>
      </Band>

      <Band>
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Important</p>
          <h2 className="mt-2 text-3xl font-black text-[#071A3D]">FAQs explain the process; official decisions remain with the responsible organization</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            Recruitment questions can often be answered generally, but an individual candidate&apos;s next step depends on the vacancy, employer, documents, destination and application status. Employers make hiring decisions, qualified medical providers make medical assessments, and government authorities make visa, work-permit and entry decisions. Where rules can change, use the linked country and visa guides and verify the latest official requirement before acting.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/jobs" className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Browse Jobs</Link>
            <Link href="/contact" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Contact Red Stone</Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
