import type { Metadata } from "next";
import Link from "next/link";

import { SuccessStorySlider } from "@/components/public/success-story-slider";
import { Band, ContactCTA, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { VERIFIED_SUCCESS_STORIES } from "@/lib/public/success-stories";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Client Success Stories | International Recruitment Journeys",
  description:
    "Read verified and authorized Red Stone Employment Agency client success stories from international recruitment journeys. Only checked client records with publication consent are displayed.",
  alternates: { canonical: canonical("/success-stories") },
  openGraph: {
    title: "Client Success Stories | Red Stone Employment Agency",
    description:
      "Verified international recruitment journeys published only after outcome checks and client authorization.",
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
            name: "Client Success Stories",
            description:
              "Verified and authorized client recruitment journeys from Red Stone Employment Agency.",
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
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0B2550] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Verified client journeys
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Client Success Stories
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            Recruitment is personal. This page is reserved for real Red Stone clients whose journey and outcome have been checked and who have given permission for their story to be published.
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
          eyebrow="Real stories, published responsibly"
          title="Verified recruitment journeys — not fictional examples"
          body="The slider below is designed for authorized client stories. Red Stone does not use generated identities, invented placements or sample travel outcomes as public testimonials."
        />
        <div className="mt-10">
          <SuccessStorySlider stories={VERIFIED_SUCCESS_STORIES} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Publication standard"
          title="What must be checked before a success story appears"
          body="A success story should help future candidates understand the recruitment journey without creating misleading guarantees."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Client identity confirmed",
              body: "The story must relate to a real Red Stone client record, not a sample name, generated profile or marketing placeholder.",
            },
            {
              title: "Journey outcome checked",
              body: "The published role, destination and recruitment stage must match the information Red Stone can verify from the client record.",
            },
            {
              title: "Publication consent",
              body: "The client must agree to the public use of the approved name, story details and any photograph before publication.",
            },
            {
              title: "No outcome guarantees",
              body: "A past client outcome does not promise the same result for another applicant. Employer selection and immigration decisions remain case-specific.",
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
              Browse currently published opportunities, review the job requirements carefully and use the Red Stone application system to create your candidate record.
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
