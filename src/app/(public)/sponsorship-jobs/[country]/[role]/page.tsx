import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SponsorshipCountdown } from "@/components/public/sponsorship-countdown";
import { Band, ContactCTA, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import {
  getSponsorshipJob,
  SPONSORSHIP_APPLICATION_FEE,
  SPONSORSHIP_BENEFITS,
  SPONSORSHIP_INTAKE_DEADLINE,
  SPONSORSHIP_JOBS,
  SPONSORSHIP_MEDICALS,
} from "@/lib/public/sponsorship-jobs";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

type Props = { params: Promise<{ country: string; role: string }> };

export function generateStaticParams() {
  return SPONSORSHIP_JOBS.map((job) => ({
    country: job.countrySlug,
    role: job.roleSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, role } = await params;
  const job = getSponsorshipJob(country, role);
  if (!job) return { title: "Sponsorship Role Not Found" };

  const url = canonical(`/sponsorship-jobs/${job.countrySlug}/${job.roleSlug}`);
  const description = `${job.role} sponsorship recruitment pathway in ${job.country}. Indicative salary ${job.salary}. View duties, requirements, sponsored benefits, medical costs and Red Stone application steps.`;

  return {
    title: `${job.role} Sponsorship Jobs in ${job.country} 2026`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${job.role} Sponsorship Recruitment - ${job.country}`,
      description,
      url,
      type: "website",
    },
  };
}

const process = [
  "Review Role & Requirements",
  "Start Candidate Application",
  "Complete Personal & Passport Details",
  "Upload Genuine Documents",
  "Application Review",
  "KES 2,000 CV / Document Verification Stage",
  "Employer Matching & Selection",
  "Red Stone Medical Booking When Required",
  "Work Permit / Visa / Compliance",
  "Travel & Deployment",
];

export default async function SponsorshipRolePage({ params }: Props) {
  const { country, role } = await params;
  const job = getSponsorshipJob(country, role);
  if (!job) notFound();

  const pageUrl = `${SITE_URL}/sponsorship-jobs/${job.countrySlug}/${job.roleSlug}`;
  const medical = job.countrySlug === "gulf" ? SPONSORSHIP_MEDICALS[0] : SPONSORSHIP_MEDICALS[1];

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `${job.role} Sponsorship Recruitment - ${job.country}`,
            serviceType: "International sponsorship recruitment pathway",
            description: job.summary,
            provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            areaServed: job.country,
            url: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Sponsorship Jobs", item: `${SITE_URL}/sponsorship-jobs` },
              { "@type": "ListItem", position: 3, name: `${job.role} - ${job.country}`, item: pageUrl },
            ],
          },
        ]}
      />

      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <Link href="/sponsorship-jobs" className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675] hover:underline">
              ← Sponsorship Jobs
            </Link>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">{job.country} · {job.region}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              {job.role} Sponsorship Recruitment in {job.country}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">{job.summary}</p>
            <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-[#F2D675]">Indicative salary</p>
              <p className="mt-2 text-xl font-black text-white">{job.salary}</p>
              <p className="mt-2 text-xs leading-6 text-slate-300">{job.salaryNote}</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D]">
                Apply for Sponsorship
              </Link>
              <Link
                href={`/jobs?search=${encodeURIComponent(job.role)}&country=${encodeURIComponent(job.country === "Gulf Countries" ? "" : job.country)}`}
                className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black text-white"
              >
                Check Published Vacancies
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Current intake</p>
            <h2 className="mt-2 text-2xl font-black">Closes 6 October 2026</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">This is the programme intake deadline, not a promise that every employer vacancy remains open until that date.</p>
            <div className="mt-6"><SponsorshipCountdown deadline={SPONSORSHIP_INTAKE_DEADLINE} /></div>
          </div>
        </div>
      </section>

      <Band>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Role description" title={`What a ${job.role} does`} body="Duties vary by employer, but a typical placement can include the responsibilities below." />
            <div className="mt-7 space-y-3">
              {job.duties.map((duty) => (
                <div key={duty} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="font-black text-[#B8860B]">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{duty}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Candidate requirements" title="Who should apply" body="Candidates must provide truthful information and satisfy the actual employer and legal requirements for the vacancy." />
            <div className="mt-7 space-y-3">
              {job.requirements.map((requirement) => (
                <div key={requirement} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="font-black text-[#B8860B]">•</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{requirement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Sponsored package"
          title="Benefits for qualifying employer-sponsored placements"
          body="The exact benefits must appear in the candidate's written offer or employment contract. They are not guaranteed merely by submitting an application."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SPONSORSHIP_BENEFITS.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold leading-7 text-[#071A3D]">{benefit}</p>
            </div>
          ))}
        </div>
      </Band>

      <Band>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-[#071A3D] p-7 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Application payment stage</p>
            <h2 className="mt-2 text-3xl font-black">{SPONSORSHIP_APPLICATION_FEE.amount}</h2>
            <p className="mt-1 font-black">{SPONSORSHIP_APPLICATION_FEE.label}</p>
            <p className="mt-4 text-sm leading-7 text-slate-200">{SPONSORSHIP_APPLICATION_FEE.note}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Applicable programme medical</p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">{medical.amount}</h2>
            <p className="mt-1 font-black text-[#071A3D]">{medical.label}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{medical.note}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">IOM route</p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">{SPONSORSHIP_MEDICALS[2].amount}</h2>
            <p className="mt-1 font-black text-[#071A3D]">{SPONSORSHIP_MEDICALS[2].label}</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">{SPONSORSHIP_MEDICALS[2].note}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>Medical booking rule:</strong> for this programme, the applicable medical must be initiated or authorized through the Red Stone application process when the candidate reaches the correct stage. Do not arrange a programme medical independently unless Red Stone or the relevant official authority instructs you to do so. Government-approved provider rules always take priority.
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Application process"
          title="Complete every applicable stage"
          body="Skipping required information, submitting false documents or failing to complete a required compliance stage can leave the application incomplete or make the candidate unsuitable for employer presentation."
        />
        <div className="mt-10"><ProcessSteps steps={process} /></div>
      </Band>

      <Band>
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Important candidate notice</p>
            <h2 className="mt-2 text-3xl font-black">Sponsorship is subject to employer and government approval</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              Red Stone supports recruitment, documentation and process coordination. Applying or paying the CV and document verification fee does not buy a job, sponsorship, visa or work permit. Employer selection and official immigration decisions remain separate.
            </p>
          </div>
          <Link href="/apply" className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] lg:mt-0 lg:shrink-0">
            Start Application
          </Link>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
