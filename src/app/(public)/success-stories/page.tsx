import type { Metadata } from "next";
import Link from "next/link";

import { SuccessStorySlider } from "@/components/public/success-story-slider";
import { Band, ContactCTA, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { VERIFIED_SUCCESS_STORIES } from "@/lib/public/success-stories";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Verified Client Success Stories | International Recruitment",
  description:
    "Explore 1,000 verified Red Stone Employment Agency client journeys across international jobs and destinations. View authorized client names, roles, destinations and recruitment travel dates.",
  keywords: [
    "Red Stone success stories",
    "international recruitment success stories",
    "Kenyan workers abroad",
    "overseas jobs client stories",
    "verified recruitment clients",
    "international employment journeys",
  ],
  alternates: { canonical: canonical("/success-stories") },
  openGraph: {
    title: "1,000 Verified Client Success Stories | Red Stone Employment Agency",
    description:
      "Browse 1,000 verified international recruitment journeys published with client authorization.",
    url: canonical("/success-stories"),
    type: "website",
  },
};

export default function SuccessStoriesPage() {
  const pageUrl = `${SITE_URL}/success-stories`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "1,000 Verified Client Success Stories",
            description:
              "Verified and authorized international recruitment client journeys from Red Stone Employment Agency.",
            url: pageUrl,
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              {
                "@type": "ListItem",
                position: 2,
                name: "Success Stories",
                item: pageUrl,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Verified Red Stone client journeys",
            numberOfItems: VERIFIED_SUCCESS_STORIES.length,
            itemListElement: VERIFIED_SUCCESS_STORIES.map((story, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Person",
                name: story.clientName,
                description: `${story.role} — ${story.destination}`,
              },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0B2550] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Verified client journeys
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            1,000 Client Success Stories
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            Browse the complete set of 1,000 verified Red Stone client journeys approved for publication. Each record shows the client name, role, destination and recorded travel date without publishing personal photographs.
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
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Start Application
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Complete verified register"
          title={`${VERIFIED_SUCCESS_STORIES.length.toLocaleString("en-KE")} verified client success stories`}
          body="All 1,000 authorized client journeys are loaded into the slider. They rotate automatically, and you can use Previous, Next or the browse control to jump directly through the full collection."
        />
        <div className="mt-10">
          <SuccessStorySlider stories={VERIFIED_SUCCESS_STORIES} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Responsible publication"
          title="Clear client details without unnecessary personal exposure"
          body="The success-stories section is designed to show real recruitment outcomes while limiting the personal information displayed publicly."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Verified client record",
              body: "Each story is tied to a client journey that Red Stone has confirmed for public presentation.",
            },
            {
              title: "Publication permission",
              body: "Client names and journey details are displayed only where Red Stone has confirmed authorization to publish them.",
            },
            {
              title: "No client photographs",
              body: "The current success-story design uses professional initials instead of personal photographs, as requested.",
            },
            {
              title: "No outcome guarantees",
              body: "A previous client journey does not guarantee another applicant the same employer, visa, work permit, travel date or placement result.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 h-1.5 w-14 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <div className="grid gap-7 rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Begin your own application
            </p>
            <h2 className="mt-3 text-3xl font-black">Your recruitment journey starts with a real vacancy and a complete application.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              Browse currently published opportunities, review the requirements carefully and use the Red Stone application system to create your candidate record.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/jobs" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#071A3D]">
              View Jobs
            </Link>
            <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
              Apply Now
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
