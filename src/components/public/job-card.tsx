import Link from "next/link";
import { dateText } from "@/lib/admin/format";
import { formatContract, formatProcessingTime } from "@/lib/jobs/costs";
import { skillLevelLabel } from "@/lib/jobs/catalogue";
import { formatSalary, jobHref, type PublicJob } from "@/lib/public/jobs";
import {
  externalJobApplyUrl,
  foreignWorkerLabel,
  isExternalJob,
  sourceLabel,
} from "@/lib/public/job-source";

export function JobCard({ job }: { job: PublicJob }) {
  const salary = formatSalary(job);
  const external = isExternalJob(job);
  const externalApply = externalJobApplyUrl(job);
  const employerName = job.employer?.company_name || job.source_employer_name;
  const badges = [
    skillLevelLabel(job.skill_level),
    job.visa_sponsorship ? "Visa Sponsorship" : null,
    job.accommodation ? "Accommodation" : null,
    job.transport ? "Transport" : null,
    job.meals ? "Meals" : null,
    external ? sourceLabel(job) : null,
  ].filter(Boolean);

  return (
    <article className="flex h-full flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex-1">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => <span key={badge} className="rounded-full bg-[#F2D675]/45 px-3 py-1 text-xs font-black uppercase text-[#071A3D]">{badge}</span>)}
        </div>
        <h3 className="mt-4 text-xl font-black text-[#071A3D]">{job.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{[job.city, job.country].filter(Boolean).join(", ") || "Location to be confirmed"}</p>
        {employerName ? <p className="mt-1 text-sm text-slate-500">{employerName}</p> : null}
        {external ? (
          <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <strong className="text-[#071A3D]">{foreignWorkerLabel(job.foreign_worker_status)}</strong>
            {job.source_posted_at ? <span> • Source posted {dateText(job.source_posted_at)}</span> : null}
          </div>
        ) : null}
        <div className="mt-4 grid gap-2 text-sm text-slate-700">
          {salary ? <p><strong>Salary:</strong> {salary}</p> : null}
          {!salary ? <p><strong>Salary:</strong> To be confirmed by employer</p> : null}
          <p><strong>Contract:</strong> {formatContract(job as unknown as Record<string, unknown>)}</p>
          {!external ? <p><strong>Processing:</strong> {formatProcessingTime(job as unknown as Record<string, unknown>)}</p> : null}
          {job.vacancies ? <p><strong>Vacancies:</strong> {job.vacancies}</p> : null}
          {job.application_deadline ? <p><strong>Deadline:</strong> {dateText(job.application_deadline)}</p> : null}
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link href={jobHref(job)} className="rounded-md bg-[#071A3D] px-4 py-3 text-center text-sm font-black text-white">View Details</Link>
        {external && externalApply ? (
          <a
            href={externalApply}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-md border border-[#D4AF37] px-4 py-3 text-center text-sm font-black text-[#071A3D]"
          >
            Apply
          </a>
        ) : (
          <Link href={`/apply/${job.slug}`} className="rounded-md border border-[#D4AF37] px-4 py-3 text-center text-sm font-black text-[#071A3D]">Apply</Link>
        )}
      </div>
    </article>
  );
}

export function EmptyJobsState() {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <h3 className="text-xl font-black text-[#071A3D]">New opportunities are being prepared.</h3>
      <p className="mt-2 text-slate-600">Check back soon or contact Red Stone through official channels for guidance.</p>
    </div>
  );
}
