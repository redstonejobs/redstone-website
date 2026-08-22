import { JobCard } from "@/components/public/job-card";
import { getRecentPublishedJobs } from "@/lib/candidate/data";
import type { PublicJob } from "@/lib/public/jobs";

export default async function CandidateJobsPage() {
  const { jobs } = await getRecentPublishedJobs(24);
  return (
    <div>
      <h1 className="text-3xl font-black text-[#071A3D]">Find Jobs</h1>
      <p className="mt-2 text-slate-600">Published opportunities from the Red Stone system.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => <JobCard key={String(job.id)} job={job as PublicJob} />)}
      </div>
    </div>
  );
}

