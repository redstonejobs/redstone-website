import Link from "next/link";
import { requireCandidate } from "@/lib/candidate/auth";
import { candidateStatusLabel } from "@/lib/candidate/constants";
import { getCandidateApplications, getCandidateDocuments, getRecentPublishedJobs } from "@/lib/candidate/data";
import { profileCompletion } from "@/lib/candidate/progress";
import { JobCard } from "@/components/public/job-card";
import type { PublicJob } from "@/lib/public/jobs";

const trackedStatuses = ["submitted", "under_review", "interview", "documentation", "visa_processing", "approved"];

export default async function CandidateDashboard() {
  const context = await requireCandidate();
  const [applications, documents, jobs] = await Promise.all([
    getCandidateApplications(context, "all"),
    getCandidateDocuments(context),
    getRecentPublishedJobs(4),
  ]);
  const hasCv = documents.documents.some((document) => document.document_type === "cv");
  const completion = profileCompletion(context.profile, hasCv);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-[#B8860B]">Welcome</p>
        <h1 className="text-3xl font-black text-[#071A3D]">{context.profile.full_name ?? "Candidate Dashboard"}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {trackedStatuses.map((status) => <Metric key={status} label={candidateStatusLabel(status)} value={applications.rows.filter((app) => app.status === status).length} />)}
      </div>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#071A3D]">Profile {completion.percent}% complete</h2>
            <p className="mt-2 text-sm text-slate-600">{completion.missing.length ? `Missing: ${completion.missing.join(", ")}` : "Your core profile is complete."}</p>
          </div>
          <Link href="/candidate/profile" className="rounded-md bg-[#D4AF37] px-4 py-3 text-center text-sm font-black text-[#071A3D]">Update Profile</Link>
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Applications">
          {applications.rows.length ? applications.rows.slice(0, 5).map((application) => (
            <Link key={String(application.id)} href={`/candidate/applications/${String(application.id)}`} className="block rounded-md border border-slate-200 p-3">
              <span className="font-bold text-[#071A3D]">{candidateStatusLabel(String(application.status))}</span>
              <span className="ml-2 text-sm text-slate-600">{String((application.job as Record<string, unknown> | null)?.title ?? "Job")}</span>
            </Link>
          )) : <p className="text-sm text-slate-600">Start by completing your profile and exploring available jobs.</p>}
        </Panel>
        <Panel title="Next Steps">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Keep your profile accurate and current.</li>
            <li>Upload your CV when applying for a job.</li>
            <li>Use official Red Stone channels for every document request.</li>
          </ul>
        </Panel>
      </div>
      <Panel title="Recent Published Jobs">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{jobs.jobs.map((job) => <JobCard key={String(job.id)} job={job as PublicJob} />)}</div>
      </Panel>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-[#071A3D]">{value}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#071A3D]">{title}</h2><div className="mt-4 space-y-3">{children}</div></section>;
}

