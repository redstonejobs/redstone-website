import type { Metadata } from "next";
import Link from "next/link";
import { Band, Hero, InfoGrid } from "@/components/public/sections";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Apply", description: "Learn how to apply for published Red Stone job opportunities.", alternates: { canonical: canonical("/apply") } };

type ApplyProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ApplyPage({ searchParams }: ApplyProps) {
  const params = (await searchParams) ?? {};
  const job = typeof params.job === "string" ? params.job : null;
  return (
    <>
      <Hero eyebrow="Applications" title="Start with a published job." body="Browse available jobs and use the job-specific Apply button when a vacancy matches your profile. This page does not create unfinished anonymous application records." primary={{ label: "Browse Available Jobs", href: "/jobs" }} secondary={{ label: "Candidate Login", href: "/login" }} />
      <Band>
        {job ? <p className="mb-8 rounded-md bg-[#F2D675]/45 p-4 font-semibold text-[#071A3D]">You came from job: {job}. Continue by reviewing the vacancy and official application instructions.</p> : null}
        <InfoGrid items={[
          { title: "Review Published Jobs", body: "Only apply for vacancies that are visible on the official Red Stone jobs page." },
          { title: "Prepare Documents", body: "Keep your CV, certificates, references and identity documents current and consistent." },
          { title: "Use Official Channels", body: "Never send documents or payments to unverified contacts." },
          { title: "Future Portal", body: "Candidate account features may be added in a later phase after approval." },
          { title: "No Anonymous Records", body: "This phase avoids creating unsecured anonymous applications." },
          { title: "Need Help?", body: "Contact Red Stone through official support or jobs email addresses." },
        ]} />
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/jobs" className="rounded-md bg-[#071A3D] px-5 py-3 text-center text-sm font-black text-white">Browse Available Jobs</Link>
          <Link href="/contact" className="rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-black text-[#071A3D]">Contact Support</Link>
        </div>
      </Band>
    </>
  );
}
