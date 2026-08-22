import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/contact-form";
import { Band, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Employers", description: "Recruitment support for employers seeking reliable candidates through Red Stone.", alternates: { canonical: canonical("/employers") } };

export default function EmployersPage() {
  return (
    <>
      <Hero eyebrow="Employers" title="Hire through Red Stone." body="Red Stone supports employers with candidate sourcing, screening, interview coordination and recruitment administration." primary={{ label: "Register as Employer", href: "/employer/register" }} secondary={{ label: "Employer Login", href: "/login?next=/employer" }} />
      <Band>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/employer/register" className="rounded-md bg-[#071A3D] p-6 text-white shadow-sm"><h2 className="text-xl font-black">Create Employer Account</h2><p className="mt-2 text-sm text-slate-200">Register your company and complete Red Stone verification before submitting vacancy requests.</p></Link>
          <Link href="/login?next=/employer" className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#071A3D]">Employer Portal Login</h2><p className="mt-2 text-sm text-slate-600">Access company profile, vacancy requests and applicant review after sign-in.</p></Link>
        </div>
      </Band>
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
