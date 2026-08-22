import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { Band, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getConfiguredCountry, getCountry } from "@/lib/public/countries";
import { getJobsForCountry } from "@/lib/public/jobs";
import { DEFAULT_PROCESSING_TEXT, formatMoney, PROGRAMME_FEE_DISCLAIMER, PROCESSING_TIME_DISCLAIMER } from "@/lib/jobs/costs";
import { canonical } from "@/lib/public/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) return { title: "Country Not Found" };
  return {
    title: `${country.name} Recruitment Guidance`,
    description: `Explore Red Stone recruitment preparation and published jobs for ${country.name}.`,
    alternates: { canonical: canonical(`/countries/${country.slug}`) },
  };
}

export default async function CountryDetailPage({ params }: Props) {
  const { slug } = await params;
  const country = await getConfiguredCountry(slug);
  if (!country) notFound();
  const { jobs } = await getJobsForCountry(country.name);

  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Countries", item: canonical("/countries") },
        { "@type": "ListItem", position: 2, name: country.name, item: canonical(`/countries/${country.slug}`) },
      ] }} />
      <Hero eyebrow={country.region} title={`${country.name} Recruitment Guidance`} body="Explore recruitment opportunities and preparation guidance. Entry, work permit and visa requirements are determined by relevant government authorities and may change." primary={{ label: `View ${country.name} Jobs`, href: `/jobs?country=${encodeURIComponent(country.name)}` }} />
      <Band>
        <SectionHeading title="Currently Published Jobs" body={`Published jobs for ${country.name} appear only when real vacancies exist in the Red Stone system.`} />
        <div className="mt-10">{jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}</div>
      </Band>
      <Band tone="grey">
        <InfoGrid items={[
          { title: "Recruitment Overview", body: country.shortDescription },
          { title: "Common Sectors", body: country.sectors.join(", ") },
          { title: country.feeLabel, body: `${formatMoney(country.baseRecruitmentFee, country.feeCurrency)}. ${PROGRAMME_FEE_DISCLAIMER}` },
          { title: "Estimated Processing Time", body: `${processing(country)}. ${PROCESSING_TIME_DISCLAIMER}` },
          { title: "Document Guidance", body: "Candidates are commonly asked for identity records, CVs, certificates, references and employment history." },
          { title: "Candidate Preparation", body: country.preparationTips.join(" ") },
          { title: "Important Disclaimer", body: "Entry, work permit and visa requirements are determined by the relevant government authorities and may change. Candidates should verify current requirements through official sources." },
          { title: "Fraud Safety", body: "Only act on information verified through official Red Stone contact channels." },
        ]} />
      </Band>
      <Band>
        <SectionHeading title="Process Overview" />
        <div className="mt-10"><ProcessSteps steps={["Profile Review", "Job Matching", "Employer Selection", "Interview", "Documentation", "Work Permit / Visa Process"]} /></div>
      </Band>
    </>
  );
}

function processing(country: { processingTimeMin: number | null; processingTimeMax: number | null; processingTimeUnit: string | null; processingTimeNote: string | null }) {
  if (country.processingTimeMin && country.processingTimeMax && country.processingTimeUnit) {
    return `${country.processingTimeMin}-${country.processingTimeMax} ${country.processingTimeUnit}`;
  }
  if (country.processingTimeNote) return country.processingTimeNote;
  return DEFAULT_PROCESSING_TEXT;
}
