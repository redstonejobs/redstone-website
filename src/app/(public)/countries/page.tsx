import type { Metadata } from "next";
import Link from "next/link";

import { CountryCard } from "@/components/public/country-card";
import { Band, Hero, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getCountriesWithPublishedCounts } from "@/lib/public/countries";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "26 Country Recruitment Guides | Overseas Jobs & Work Visas",
  description:
    "Explore 26 detailed Red Stone destination recruitment guides with jobs, candidate requirements, visa and work-permit pathways, documents, medical guidance and application links.",
  keywords: [
    "overseas jobs for Kenyans",
    "international recruitment countries",
    "work visa jobs",
    "jobs abroad",
    "country recruitment guides",
    "Red Stone Employment Agency countries",
    "international jobs Kenya",
  ],
  alternates: { canonical: canonical("/countries") },
  openGraph: {
    title: "26 Country Recruitment Guides | Red Stone Employment Agency",
    description:
      "Detailed country-by-country recruitment, jobs and work-visa guidance across Red Stone's 26 destinations.",
    url: canonical("/countries"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export const dynamic = "force-dynamic";

export default async function CountriesPage() {
  const countries = await getCountriesWithPublishedCounts();
  const regions = Array.from(new Set(countries.map((country) => country.region)));

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "26 Country Recruitment Guides",
            description:
              "Country-by-country international recruitment, jobs, candidate requirements and work-visa guidance from Red Stone Employment Agency.",
            url: canonical("/countries"),
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Red Stone recruitment destinations",
            numberOfItems: countries.length,
            itemListElement: countries.map((country, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: country.name,
              url: canonical(`/countries/${country.slug}`),
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Countries", item: canonical("/countries") },
            ],
          },
        ]}
      />

      <Hero
        eyebrow="26 international recruitment destinations"
        title="Country Recruitment, Jobs & Work Visa Guides"
        body="Explore detailed destination pages covering current jobs, common career pathways, candidate requirements, documents, recruitment stages, medical and compliance preparation, visa and work-permit categories, official immigration sources and Red Stone application links."
        primary={{ label: "Browse All Jobs", href: "/jobs" }}
        secondary={{ label: "Start Application", href: "/apply" }}
      />

      <Band>
        <SectionHeading
          eyebrow="Destination intelligence"
          title="One detailed recruitment guide for every Red Stone country"
          body="Each destination page is designed to answer the questions candidates usually need before applying: what jobs may be relevant, what employers look for, what documents to prepare, how the recruitment process works and which immigration authority makes the final visa or work-permit decision."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["26", "Country recruitment guides"],
            ["Jobs", "Live vacancies connected by destination"],
            ["Visa", "Country-specific work and residence guidance"],
            ["Apply", "Direct Red Stone application pathway"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-black text-[#D4AF37]">{value}</p>
              <p className="mt-2 text-sm font-bold text-[#071A3D]">{label}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="All destinations"
          title={`${countries.length} detailed country recruitment pages`}
          body="Choose a destination to view live jobs, common job descriptions, candidate requirements, visa categories, official immigration links and the full application process."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {countries.map((country) => <CountryCard key={country.slug} country={country} />)}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Browse by region"
          title="International recruitment markets"
          body="Destination availability depends on current employer demand and lawful recruitment pathways. A country guide can remain available even when no live vacancy is currently published."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const regionCountries = countries.filter((country) => country.region === region);
            return (
              <article key={region} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Region</p>
                <h2 className="mt-2 text-2xl font-black text-[#071A3D]">{region}</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {regionCountries.map((country) => (
                    <Link key={country.slug} href={`/countries/${country.slug}`} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-[#FFF4C7] hover:text-[#071A3D]">
                      {country.name}
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-7 rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Visa process library</p>
            <h2 className="mt-3 text-3xl font-black">Compare visa and work-permit categories across all 26 destinations</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              Country recruitment pages connect directly to the Red Stone visa-process library and to official government immigration sources so candidates can distinguish recruitment guidance from government decisions.
            </p>
          </div>
          <Link href="/visa-process" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-black text-[#071A3D]">
            Explore Visa Guides
          </Link>
        </div>
      </Band>
    </main>
  );
}
