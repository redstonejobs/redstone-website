import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Band, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Employers", description: "Recruitment support for employers seeking reliable candidates through Red Stone.", alternates: { canonical: canonical("/employers") } };

export default function EmployersPage() {
  return (
    <>
      <Hero eyebrow="Employers" title="Hire through Red Stone." body="Red Stone supports employers with candidate sourcing, screening, interview coordination and recruitment administration." primary={{ label: "Request Recruitment Support", href: "#employer-form" }} />
      <Band>
        <InfoGrid items={[
          { title: "International Recruitment Support", body: "Structured support for employers sourcing workers across skilled and general categories." },
          { title: "Candidate Sourcing", body: "Candidate identification based on role requirements and available profiles." },
          { title: "Screening", body: "Profile and document review before employer consideration." },
          { title: "Interview Coordination", body: "Support for scheduling and candidate communication." },
          { title: "Workforce Categories", body: "Healthcare, hospitality, logistics, construction, technical services, facilities and general labour." },
          { title: "Recruitment Process", body: "Clear stages from employer need through selection, documentation and deployment support." },
        ]} />
      </Band>
      <Band tone="grey">
        <SectionHeading title="Employer Process" />
        <div className="mt-10"><ProcessSteps steps={["Request Support", "Define Roles", "Source Candidates", "Screen Profiles", "Coordinate Interviews", "Selection and Documentation"]} /></div>
      </Band>
      <Band>
        <div id="employer-form" className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-black text-[#071A3D]">Contact Recruitment Team</h2>
            <p className="mt-4 text-slate-600">Email: <a className="font-bold text-[#071A3D]" href={`mailto:${CONTACT.emails.employers}`}>{CONTACT.emails.employers}</a></p>
          </div>
          <ContactForm type="employer" />
        </div>
      </Band>
    </>
  );
}

