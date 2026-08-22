import type { Metadata } from "next";
import { Band, ContactCTA, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "About Us", description: "Learn about Red Stone Employment Agency and its responsible recruitment approach.", alternates: { canonical: canonical("/about") } };

export default function AboutPage() {
  return (
    <>
      <Hero eyebrow="About Red Stone" title="Professional, responsible recruitment support." body="Red Stone Employment Agency supports candidates and employers through transparent, structured and ethical recruitment coordination." primary={{ label: "How It Works", href: "/how-it-works" }} />
      <Band>
        <InfoGrid items={[
          { title: "Who We Are", body: "A recruitment agency focused on professional support for candidates and employers seeking responsible international hiring pathways." },
          { title: "What We Do", body: "We help candidates prepare profiles and help employers coordinate sourcing, screening, interviews and recruitment administration." },
          { title: "Mission", body: "To connect people and employers through responsible, transparent and professional recruitment." },
          { title: "Vision", body: "To be a trusted recruitment partner known for clarity, care and ethical candidate support." },
          { title: "Ethical Recruitment", body: "We avoid guaranteed-job or guaranteed-visa language and encourage candidates to verify official channels." },
          { title: "Trust & Transparency", body: "Candidates and employers should understand process stages, requirements and decision boundaries." },
        ]} />
      </Band>
      <Band tone="grey">
        <SectionHeading title="Our Process" />
        <div className="mt-10"><ProcessSteps steps={["Candidate Registration", "Profile Review", "Job Matching", "Employer Review", "Interview", "Documentation", "Deployment Support"]} /></div>
      </Band>
      <ContactCTA />
    </>
  );
}

