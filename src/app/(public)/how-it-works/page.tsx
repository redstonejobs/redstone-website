import type { Metadata } from "next";
import { Band, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { canonical, RECRUITMENT_DISCLAIMER } from "@/lib/public/site";

export const metadata: Metadata = { title: "How It Works", description: "Understand Red Stone's recruitment process from profile submission to deployment support.", alternates: { canonical: canonical("/how-it-works") } };

export default function HowItWorksPage() {
  return (
    <>
      <Hero eyebrow="Process" title="A clear recruitment lifecycle." body="Red Stone uses a structured process so candidates and employers understand each step." primary={{ label: "Apply", href: "/apply" }} />
      <Band>
        <ProcessSteps steps={["Create/Submit Candidate Profile", "Candidate Screening", "Job Matching", "Application", "Employer Review", "Interview", "Offer / Selection", "Documentation", "Work Permit / Visa Process", "Pre-Departure", "Deployment", "Follow-Up"]} />
      </Band>
      <Band tone="grey">
        <SectionHeading title="Status Tracking" body="Internal application statuses help staff coordinate review, interviews, documentation, approvals and deployment stages." />
        <div className="mt-10"><InfoGrid items={[
          { title: "Transparent Updates", body: "Candidates should use official channels for updates and document requests." },
          { title: "Authority Decisions", body: "Work permit and visa decisions are made by relevant authorities, not Red Stone." },
          { title: "No Guarantee", body: RECRUITMENT_DISCLAIMER },
        ]} /></div>
      </Band>
    </>
  );
}

