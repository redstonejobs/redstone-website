import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startApplication, submitApplication } from "@/lib/candidate/actions";
import { requireCandidate } from "@/lib/candidate/auth";
import { getCandidateApplications, getCandidateDocuments, getPublishedJobBySlug } from "@/lib/candidate/data";
import { dateText } from "@/lib/admin/format";
import { formatContract, formatMoney, formatProcessingTime, resolveProgrammeFee } from "@/lib/jobs/costs";
import { formatSalary } from "@/lib/public/jobs";
import { getJobCatalogueContext } from "@/lib/public/jobs";
import type { PublicJob } from "@/lib/public/jobs";
import { externalJobApplyUrl, type SourceAwareJob } from "@/lib/public/job-source";

type Props = { params: Promise<{ slug: string }> };

export default async function ApplyForJobPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await getPublishedJobBySlug(slug);
  if (!job) notFound();

  // Syndicated listings are discovery pages, not Red Stone recruitment mandates.
  // Never collect a Red Stone candidate application for them; send the applicant
  // to the original source instead.
  const externalApply = externalJobApplyUrl(job as SourceAwareJob);
  if (externalApply) redirect(externalApply);

  const context = await requireCandidate();
  const today = new Date().toISOString().slice(0, 10);
  const deadline = typeof job.application_deadline === "string" ? job.application_deadline : null;
  const closed = deadline !== null && deadline < today;
  const noVacancies = typeof job.vacancies === "number" && job.vacancies <= 0;
  const applications = await getCandidateApplications(context, "all");
  const existing = applications.rows.find((application) => application.job_id === job.id);
  const existingId = existing?.id ? String(existing.id) : null;
  const status = existing?.status ? String(existing.status) : null;
  const draftApplication = existingId && status === "draft" ? existing : null;
  const draftApplicationId = draftApplication ? existingId : null;
  const uploaded = draftApplicationId ? (await getCandidateDocuments(context, draftApplicationId)).documents : [];
  const catalogue = await getJobCatalogueContext(job as PublicJob, uploaded);
  const programmeFee = resolveProgrammeFee(job, catalogue.country);

  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/jobs" className="font-bold text-[#071A3D]">Back to jobs</Link>
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#B8860B]">Job Review</p>
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">{String(job.title)}</h1>
          <p className="mt-2 text-slate-600">{[job.city, job.country].filter(Boolean).join(", ")}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Detail label="Salary" value={formatSalary(job as PublicJob) ?? "To be confirmed"} />
            <Detail label="Contract" value={formatContract(job)} />
            <Detail label="Processing" value={formatProcessingTime(job, catalogue.country)} />
            <Detail label="Programme Fee" value={formatMoney(programmeFee.amount, programmeFee.currency)} />
            <Detail label="Vacancies" value={String(job.vacancies ?? "To be confirmed")} />
            <Detail label="Deadline" value={dateText(job.application_deadline)} />
            <Detail label="Sponsorship" value={job.visa_sponsorship ? "Available" : "Not specified"} />
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#071A3D]">Required Documents for This Job</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {catalogue.documentCosts.lines.length ? catalogue.documentCosts.lines.map((line) => (
              <div key={line.documentType} className="rounded-md border border-slate-200 p-4 text-sm">
                <p className="font-black text-[#071A3D]">{line.label}</p>
                <p className="mt-1 text-slate-600">{line.required ? "Required" : "Optional"} / {line.alreadyUploaded ? "Already Uploaded" : "Upload if requested"}</p>
                <p className="mt-1 text-slate-600">{line.amount !== null ? formatMoney(line.amount, line.currency) : "No preparation fee estimated"}</p>
              </div>
            )) : <p className="text-sm text-slate-600">Document requirements will be confirmed during the recruitment process.</p>}
          </div>
        </section>
        {closed || noVacancies ? <Notice text="That job is no longer accepting applications." /> : existingId && status !== "draft" ? <Notice text="You have already applied for this position." href={`/candidate/applications/${existingId}`} /> : null}
        {!existingId && !closed && !noVacancies ? (
          <form action={startApplication.bind(null, slug)} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#071A3D]">Start Application</h2>
            <p className="mt-3 text-slate-600">This creates a draft application that you can complete before submission.</p>
            <button className="mt-5 rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Start Draft</button>
          </form>
        ) : null}
        {draftApplication && draftApplicationId ? (
          <form action={submitApplication.bind(null, draftApplicationId)} className="grid gap-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#071A3D]">Application Wizard</h2>
            <Step title="Candidate Information"><p>{context.profile.full_name} | {context.profile.phone} | {context.profile.nationality}</p><Link href="/candidate/profile" className="font-bold text-[#B8860B]">Update profile</Link></Step>
            <Step title="Experience / Application Information">
              <Textarea name="cover_letter" label="Cover Letter" defaultValue={String(draftApplication.cover_letter ?? "")} />
              <Textarea name="relevant_experience" label="Relevant Experience" defaultValue={String(draftApplication.relevant_experience ?? "")} />
              <Field name="availability" label="Availability" defaultValue={String(draftApplication.availability ?? "")} />
              <Textarea name="candidate_message" label="Message for Recruiter" defaultValue={String(draftApplication.candidate_message ?? "")} required={false} />
            </Step>
            <Step title="Documents"><p>Upload only the documents requested for this vacancy. Existing acceptable uploads are shown above and do not need to be duplicated.</p><Link href={`/candidate/applications/${draftApplicationId}`} className="font-bold text-[#B8860B]">Manage documents</Link></Step>
            <Step title="Review and Submit"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="confirm" value="yes" required /> I confirm this application information is accurate.</label></Step>
            <button className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Submit Application</button>
          </form>
        ) : null}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}

function Notice({ text, href }: { text: string; href?: string }) {
  return <div className="rounded-md border border-[#F2D675] bg-[#F2D675]/40 p-5 font-semibold text-[#071A3D]">{text} {href ? <Link href={href} className="underline">View Application</Link> : null}</div>;
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md bg-slate-50 p-4"><h3 className="font-black text-[#071A3D]">{title}</h3><div className="mt-3 space-y-3 text-sm text-slate-700">{children}</div></section>;
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return <label className="grid gap-2 font-bold">{label}<input name={name} defaultValue={defaultValue} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" /></label>;
}

function Textarea({ name, label, defaultValue, required = true }: { name: string; label: string; defaultValue: string; required?: boolean }) {
  return <label className="grid gap-2 font-bold">{label}<textarea name={name} defaultValue={defaultValue} required={required} rows={5} className="rounded-md border border-slate-300 px-3 py-2 font-normal" /></label>;
}
