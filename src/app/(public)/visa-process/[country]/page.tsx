import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Band, ContactCTA, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getVisaGuide, VISA_GUIDES } from "@/lib/public/visa-guides";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

type Props = { params: Promise<{ country: string }> };

export function generateStaticParams() {
  return VISA_GUIDES.map((guide) => ({ country: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const guide = getVisaGuide(country);
  if (!guide) return { title: "Visa Guide Not Found" };

  const url = canonical(`/visa-process/${guide.slug}`);
  const description = `Detailed ${guide.country} visa process guide covering work visas, visitor visas, student visas, family routes, business visas and residence permits. Includes official authority guidance and Red Stone application links.`;

  return {
    title: `${guide.country} Visa Types & Application Process | 2026 Guide`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${guide.country} Visa Process & Visa Types | Red Stone Employment Agency`,
      description,
      url,
      type: "article",
    },
  };
}

const standardProcess = [
  "Confirm the Exact Purpose of Travel",
  "Choose the Correct Visa / Permit Category",
  "Check Eligibility on the Official Government Website",
  "Secure Job Offer, School Admission or Sponsor Documents Where Required",
  "Prepare Passport, Forms and Supporting Evidence",
  "Submit the Official Application and Government Fee",
  "Complete Biometrics, Medical Examination or Interview Where Required",
  "Respond to Any Official Request for More Information",
  "Wait for the Government Decision",
  "Travel Only After Required Approval",
  "Complete Arrival / Residence Registration Where Required",
];

export default async function CountryVisaGuidePage({ params }: Props) {
  const { country } = await params;
  const guide = getVisaGuide(country);
  if (!guide) notFound();

  const pageUrl = `${SITE_URL}/visa-process/${guide.slug}`;
  const faq = [
    {
      question: `What visa do I need to work in ${guide.country}?`,
      answer: `The correct work route depends on your job, nationality, employer and qualifications. ${guide.country} may use a work visa, work permit, residence permit or employer-sponsored process. Review the work categories on this page and confirm the final route with ${guide.authority}.`,
    },
    {
      question: `Can Red Stone guarantee a ${guide.country} visa?`,
      answer: `No. Red Stone can support recruitment and document preparation, but ${guide.authority} or another competent government authority makes the visa, permit and entry decision.`,
    },
    {
      question: `Can I use a visitor visa to work in ${guide.country}?`,
      answer: `Ordinary employment normally requires the correct work authorization. A visitor visa or visitor status should not be treated as permission to work unless the official rules expressly allow the specific activity.`,
    },
    {
      question: `Where should I verify current ${guide.country} visa requirements?`,
      answer: `Use the official authority linked on this page before applying. Visa names, fees, salary thresholds, documents, eligible occupations and processing procedures can change.`,
    },
  ];

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${guide.country} Visa Types & Application Process`,
            description: guide.overview,
            dateModified: "2026-09-06",
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            mainEntityOfPage: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Visa Process", item: `${SITE_URL}/visa-process` },
              { "@type": "ListItem", position: 3, name: `${guide.country} Visa Process`, item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${guide.country} visa and permit categories`,
            numberOfItems: guide.visaTypes.length,
            itemListElement: guide.visaTypes.map((visa, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: visa.name,
              description: `${visa.purpose}. ${visa.details}`,
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
          <Link href="/visa-process" className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675] hover:underline">
            ← All 26 Visa Guides
          </Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            {guide.region} · 2026 visa guidance
          </p>
          <h1 className="mt-3 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {guide.country} Visa Types & Application Process
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">{guide.overview}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D]">
              Apply Through Red Stone
            </Link>
            <Link
              href={`/jobs?country=${encodeURIComponent(guide.country)}`}
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white"
            >
              View {guide.country} Jobs
            </Link>
            <a
              href={guide.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white"
            >
              Official Immigration Authority ↗
            </a>
          </div>
        </div>
      </section>

      <Band>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Visa and permit categories"
              title={`${guide.visaTypes.length} ${guide.country} visa / permit routes explained`}
              body="These categories cover the main official visitor, work, study, family, business, residence and special-purpose routes relevant to international applicants."
            />
            <div className="mt-8 grid gap-4">
              {guide.visaTypes.map((visa, index) => (
                <article key={visa.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071A3D] text-xs font-black text-[#F2D675]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-black text-[#071A3D]">{visa.name}</h2>
                      <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#B8860B]">{visa.purpose}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{visa.details}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-[#071A3D] p-7 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Official authority</p>
              <h2 className="mt-2 text-2xl font-black">{guide.authority}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-200">{guide.entryNote}</p>
              <a
                href={guide.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
              >
                Check Current Official Rules ↗
              </a>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Important</p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Visa rules can change</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                This Red Stone guide is designed for recruitment preparation and general education. Always verify the latest visa name, eligibility, official fee, documents, processing time and appointment procedure before submitting an application.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Work applicants</p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Start with the recruitment application</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                If your goal is employment, begin with a genuine vacancy and candidate application. Employer selection and the correct work-authorization route normally come before deployment.
              </p>
              <Link href="/apply" className="mt-5 inline-flex rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">
                Apply Now
              </Link>
            </div>
          </aside>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Application process"
          title={`How to prepare for a ${guide.country} visa or permit`}
          body="Use this sequence as a preparation checklist, then follow the exact instructions for your chosen category on the official government website."
        />
        <div className="mt-10">
          <ProcessSteps steps={standardProcess} />
        </div>
      </Band>

      <Band>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Before applying</p>
            <h2 className="mt-2 text-xl font-black text-[#071A3D]">Confirm your real purpose</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Do not choose a visitor or student category if your real purpose is employment. Use the route that matches what you will actually do in {guide.country}.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Documents</p>
            <h2 className="mt-2 text-xl font-black text-[#071A3D]">Use genuine, consistent records</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Passport details, employment history, qualifications, police clearances, medical records and financial evidence must be genuine and consistent with the official application.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">Decision</p>
            <h2 className="mt-2 text-xl font-black text-[#071A3D]">Government approval is separate</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">A job offer, recruitment payment, medical examination or Red Stone application does not guarantee a visa, permit, border admission or permanent residence.</p>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Frequently asked questions" title={`${guide.country} visa questions`} />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black text-[#071A3D]">{item.question}</summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band>
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Ready to start?</p>
            <h2 className="mt-2 text-3xl font-black">Apply for a genuine international job opportunity</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Complete your Red Stone candidate application, upload genuine documents and follow the recruitment stages. If selected, the case can then move into the appropriate {guide.country} work-permit or visa preparation process.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Apply Now</Link>
            <Link href="/sponsorship-jobs" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white">Sponsorship Jobs</Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
