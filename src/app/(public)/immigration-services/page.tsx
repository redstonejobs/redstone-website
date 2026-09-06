import type { Metadata } from "next";
import Link from "next/link";

import {
  Band,
  ContactCTA,
  ProcessSteps,
  SectionHeading,
} from "@/components/public/sections";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Immigration Services & Work Visa Guidance",
  description:
    "Professional post-selection guidance for work permits, visa documentation, medicals, travel preparation and international deployment through Red Stone Employment Agency.",
  alternates: { canonical: canonical("/immigration-services") },
};

const process = [
  "Employer Selection",
  "Document Review",
  "Work Permit / Sponsorship Preparation",
  "Medical & Compliance Requirements",
  "Visa Application Preparation",
  "Official Decision",
  "Pre-Departure Briefing",
  "Travel & Deployment",
];

const supportAreas = [
  {
    title: "Work Permit & Sponsorship Preparation",
    body: "Guidance on the documents and recruitment records commonly required after an employer selects a candidate for an international role.",
  },
  {
    title: "Visa Documentation Guidance",
    body: "Practical support with organizing application documents, forms, appointment requirements and supporting records before submission to the relevant authority.",
  },
  {
    title: "Medical & Compliance Preparation",
    body: "Guidance on employer, destination and authority requirements such as medical examinations, police clearance, biometrics and document verification where applicable.",
  },
  {
    title: "Document Readiness Checks",
    body: "Review of common employment and travel documents for completeness before a candidate proceeds to the next official stage.",
  },
  {
    title: "Pre-Departure Support",
    body: "Travel preparation, employer reporting instructions, document checklists and practical guidance once the required approvals are complete.",
  },
  {
    title: "Candidate Case Coordination",
    body: "Structured communication between the candidate, recruitment team and employer while the case moves through post-selection requirements.",
  },
];

const commonDocuments = [
  "Valid passport",
  "Employment offer or contract where applicable",
  "Curriculum vitae and employment records",
  "Academic or professional certificates where required",
  "Police clearance / certificate of good conduct where required",
  "Medical examination records where required",
  "Passport photographs",
  "Work permit, sponsorship or employer supporting documents",
  "Biometric or appointment records where applicable",
  "Additional documents requested by the destination authority",
];

export default function ImmigrationServicesPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1771945029451-da143c6ea0e8?auto=format&fit=crop&fm=jpg&q=82&w=1800)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A3D] via-[#071A3D]/95 to-[#071A3D]/70" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            International mobility support
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Immigration Services & Work Visa Guidance
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Red Stone supports candidates after employer selection with structured preparation for work-permit, visa, medical, documentation and travel requirements. Immigration approvals are issued only by the relevant government authorities.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/countries"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Explore Destination Guidance
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Browse Available Jobs
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="How we support candidates"
          title="Professional guidance after employer selection"
          body="Our role is to help candidates understand and prepare for the post-selection stages connected to a genuine employment opportunity."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {supportAreas.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 h-1.5 w-14 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Important distinction
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#071A3D] sm:text-4xl">
              Recruitment comes first. Immigration preparation follows.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Candidates should normally have a genuine employment opportunity and employer-selection pathway before beginning job-related immigration preparation. Red Stone does not sell visas, work permits or guaranteed approvals.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Requirements vary by country, employer, occupation and immigration programme. Candidates should always follow the latest instructions issued by the relevant embassy, immigration authority, work-permit authority or other official body.
            </p>
          </div>

          <div className="rounded-3xl bg-[#071A3D] p-7 text-white shadow-xl sm:p-9">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Before immigration preparation
            </p>
            <div className="mt-6 space-y-4">
              {[
                "Confirm the vacancy and employer-selection stage",
                "Verify your personal and passport information",
                "Review the destination-specific requirements",
                "Keep payment and appointment records from official channels",
                "Do not rely on promises of guaranteed visa approval",
              ].map((item, index) => (
                <div key={item} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-black text-[#071A3D]">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Typical pathway"
          title="From employer selection to deployment"
          body="The exact sequence differs by destination, but international employment cases commonly move through the following stages."
        />
        <div className="mt-10">
          <ProcessSteps steps={process} />
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Document checklist
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
              Common documents candidates may need
            </h2>
            <div className="mt-6 grid gap-3">
              {commonDocuments.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="mt-0.5 text-sm font-black text-[#B8860B]">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">
                No approval guarantee
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
                Government authorities make the final decision
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Red Stone can provide recruitment administration and preparation guidance, but cannot issue visas, work permits, residence permits or guarantee an immigration decision.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Candidate protection
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#071A3D]">
                Use official channels and keep records
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Candidates should verify instructions, keep receipts and appointment confirmations, protect personal documents and report suspicious recruitment or payment requests.
              </p>
              <Link
                href="/fraud-awareness"
                className="mt-5 inline-flex text-sm font-black text-[#B8860B] hover:underline"
              >
                Read Fraud Awareness Guidance →
              </Link>
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Need destination-specific information?
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Review country guidance before your next step
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Country requirements can change. Use destination guidance together with instructions from the relevant official authorities and your Red Stone case team.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/countries"
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
            >
              View Countries
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white"
            >
              Contact Red Stone
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
