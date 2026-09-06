import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Band, ContactCTA, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { FAQ_CATEGORIES, getFaqCategory } from "@/lib/public/faq-library";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return FAQ_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getFaqCategory(slug);
  if (!category) return { title: "FAQ Category Not Found" };

  const url = canonical(`/faq/${category.slug}`);
  const description = `${category.description} Read 40 detailed answers from Red Stone Employment Agency.`;

  return {
    title: `${category.name} FAQs | 40 Detailed Recruitment Answers`,
    description,
    keywords: category.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.name} FAQs | Red Stone Employment Agency`,
      description,
      url,
      type: "article",
    },
  };
}

export default async function FaqCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = getFaqCategory(slug);
  if (!category) notFound();

  const pageUrl = `${SITE_URL}/faq/${category.slug}`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            name: `${category.name} Frequently Asked Questions`,
            mainEntity: category.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "FAQs", item: `${SITE_URL}/faq` },
              { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${category.name} FAQs`,
            description: category.description,
            dateModified: "2026-09-06",
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            mainEntityOfPage: pageUrl,
          },
        ]}
      />

      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <Link
            href="/faq"
            className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675] hover:underline"
          >
            ← All FAQs
          </Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Detailed recruitment knowledge base
          </p>
          <h1 className="mt-3 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {category.name} FAQs
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            {category.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/apply"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D]"
            >
              Start Application
            </Link>
            <Link
              href={category.relatedHref}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white"
            >
              {category.relatedLabel}
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow={`${category.faqs.length} detailed answers`}
          title={`Questions about ${category.name.toLowerCase()}`}
          body="Open any question below for a detailed explanation. Requirements can vary by vacancy, employer, destination and government rules, so important case-specific instructions should always be checked against your application and the relevant official authority."
        />

        <div className="mx-auto mt-10 max-w-5xl space-y-4">
          {category.faqs.map((faq, index) => (
            <details
              key={faq.id}
              id={faq.id}
              className="group scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:border-[#D4AF37]/60 open:shadow-md"
            >
              <summary className="cursor-pointer list-none pr-8 text-lg font-black leading-7 text-[#071A3D] sm:text-xl">
                <span className="mr-3 text-sm text-[#B8860B]">{String(index + 1).padStart(2, "0")}</span>
                {faq.question}
              </summary>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <p className="text-sm leading-8 text-slate-650 sm:text-base">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="mx-auto max-w-5xl rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Need case-specific help?</p>
            <h2 className="mt-2 text-3xl font-black">Use your application record for the most relevant answer</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              General FAQs explain the process, but a candidate&apos;s real next step depends on the vacancy, employer, destination and current application status.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
              Apply Now
            </Link>
            <Link href="/contact" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white">
              Contact Support
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
