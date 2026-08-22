import type { Metadata } from "next";
import { Band, ContactCTA, Hero, InfoGrid, SectionHeading } from "@/components/public/sections";
import { canonical, RECRUITMENT_DISCLAIMER } from "@/lib/public/site";

export const metadata: Metadata = { title: "Services", description: "Candidate and employer recruitment services from Red Stone Employment Agency.", alternates: { canonical: canonical("/services") } };

export default function ServicesPage() {
  return (
    <>
      <Hero eyebrow="Services" title="Recruitment services for candidates and employers." body="Red Stone supports the recruitment journey with structured screening, coordination and preparation guidance." primary={{ label: "Contact Us", href: "/contact" }} />
      <Band>
        <SectionHeading title="Candidate Services" />
        <div className="mt-10"><InfoGrid items={[
          { title: "Job Matching", body: "Matching published opportunities with candidate profile information where suitable." },
          { title: "Profile Review", body: "Reviewing candidate records for completeness and consistency." },
          { title: "CV Guidance", body: "Helping candidates present experience clearly and honestly." },
          { title: "Interview Preparation", body: "Guidance on employer interview expectations and communication." },
          { title: "Documentation Support", body: "General guidance on commonly requested recruitment documents." },
          { title: "Pre-Departure Guidance", body: "Preparation support after selection and required approvals." },
        ]} /></div>
      </Band>
      <Band tone="grey">
        <SectionHeading title="Employer Services" />
        <div className="mt-10"><InfoGrid items={[
          { title: "Workforce Sourcing", body: "Candidate sourcing aligned to employer role requirements." },
          { title: "Candidate Screening", body: "Structured review before employer consideration." },
          { title: "Interview Coordination", body: "Support scheduling and communication between employers and candidates." },
          { title: "Recruitment Administration", body: "Process support from request to selection." },
          { title: "Documentation Coordination", body: "Organizing recruitment documentation without guaranteeing authority decisions." },
          { title: "Deployment Support", body: "Coordination once employer selection and required approvals are complete." },
        ]} /></div>
        <p className="mt-8 rounded-md bg-white p-4 text-sm text-slate-600">{RECRUITMENT_DISCLAIMER}</p>
      </Band>
      <ContactCTA />
    </>
  );
}

