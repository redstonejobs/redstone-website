import type { Metadata } from "next";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { Band, Hero, InfoGrid, SectionHeading } from "@/components/public/sections";
import { getPublishedJobs } from "@/lib/public/jobs";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Skilled Jobs",
  description: "Explore published skilled international job opportunities and preparation guidance.",
  alternates: { canonical: canonical("/skilled-jobs") },
};

export const dynamic = "force-dynamic";

export default async function SkilledJobsPage() {
  const [skilled, professional] = await Promise.all([
    getPublishedJobs({ skill: "skilled", page: "1" }),
    getPublishedJobs({ skill: "professional", page: "1" }),
  ]);
  const jobs = [...skilled.jobs, ...professional.jobs].slice(0, 9);
  return (
    <>
      <Hero eyebrow="Skilled roles" title="Skilled International Job Opportunities" body="Explore professional and technical categories where employers may require experience, certifications, licensing or language ability." primary={{ label: "Browse All Jobs", href: "/jobs" }} />
      <Band tone="grey">
        <SectionHeading title="Currently Published Skilled Jobs" />
        <div className="mt-10">{jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}</div>
      </Band>
      <Band>
        <InfoGrid items={[
          { title: "Qualifications", body: "Employers may ask for education records, trade certificates or professional registration depending on the role." },
          { title: "Experience", body: "Prepare clear employment history, references and examples of responsibilities handled." },
          { title: "Licensing", body: "Some sectors require local licensing or authority recognition. Requirements vary by destination and role." },
          { title: "Language", body: "Communication requirements differ by employer and country. Candidates should prepare honestly." },
          { title: "Interview Readiness", body: "Be ready to discuss practical experience, safety, teamwork and reliability." },
          { title: "Documents", body: "Keep certificates, CVs and references consistent and available for review." },
        ]} />
      </Band>
    </>
  );
}
