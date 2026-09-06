import type { Metadata } from "next";
import { CountryCard } from "@/components/public/country-card";
import { Band, Hero, SectionHeading } from "@/components/public/sections";
import { getCountriesWithPublishedCounts } from "@/lib/public/countries";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Countries We Serve",
  description: "Explore Red Stone recruitment destination guidance and published jobs by country.",
  alternates: { canonical: canonical("/countries") },
};

export const dynamic = "force-dynamic";

export default async function CountriesPage() {
  const countries = await getCountriesWithPublishedCounts();

  return (
    <>
      <Hero eyebrow="Destinations" title="Countries We Serve" body="Explore recruitment guidance by destination. Requirements can change and should be verified through official sources." primary={{ label: "Browse Jobs", href: "/jobs" }} />
      <Band tone="grey">
        <SectionHeading title="Destination Guidance" body="These pages provide general recruitment preparation, not legal or immigration advice." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {countries.map((country) => <CountryCard key={country.slug} country={country} />)}
        </div>
      </Band>
    </>
  );
}
