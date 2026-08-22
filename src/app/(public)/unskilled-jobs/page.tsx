import type { Metadata } from "next";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { Band, Hero, InfoGrid, SectionHeading } from "@/components/public/sections";
import { getPublishedJobs } from "@/lib/public/jobs";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Entry-Level & General Jobs",
  description: "Explore published entry-level and general labour opportunities responsibly.",
  alternates: { canonical: canonical("/unskilled-jobs") },
};

export default async function UnskilledJobsPage() {
  const [entryLevel, semiSkilled] = await Promise.all([
    getPublishedJobs({ skill: "unskilled", page: "1" }),
    getPublishedJobs({ skill: "semi_skilled", page: "1" }),
  ]);
  const jobs = [...entryLevel.jobs, ...semiSkilled.jobs].slice(0, 9);
  return (
    <>
      <Hero eyebrow="General labour" title="Entry-Level & General Jobs" body="Entry-level roles may still require reliability, fitness, experience, checks, language ability or licenses. Red Stone presents only published vacancies from the recruitment system." primary={{ label: "Browse All Jobs", href: "/jobs" }} />
      <Band tone="grey">
        <SectionHeading title="Currently Published Entry-Level and Semi-Skilled Jobs" />
        <div className="mt-10">{jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}</div>
      </Band>
      <Band>
        <InfoGrid items={[
          { title: "Common Categories", body: "Housekeeping, cleaning, warehouse support, farm work, factory work and general labour may appear when employers publish vacancies." },
          { title: "Physical Readiness", body: "Some roles can involve standing, lifting, shift work or outdoor conditions." },
          { title: "Background Checks", body: "Employers or authorities may request checks depending on the role and destination." },
          { title: "Medical Checks", body: "Health or fitness checks may be required by employers or relevant authorities." },
          { title: "Language Skills", body: "Basic communication may be required even for entry-level work." },
          { title: "Honest Applications", body: "Candidates should provide accurate work history and document information." },
        ]} />
      </Band>
    </>
  );
}
