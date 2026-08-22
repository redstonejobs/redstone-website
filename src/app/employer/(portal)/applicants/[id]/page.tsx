import { notFound } from "next/navigation";
import { recordEmployerDecision, requestEmployerInterview } from "@/lib/employer/actions";
import { requireVerifiedEmployer } from "@/lib/employer/auth";
import { getEmployerApplicant } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";
import { EMPLOYER_DECISIONS } from "@/lib/employer/constants";

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployerApplicantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireVerifiedEmployer();
  const { application, documents } = await getEmployerApplicant(context, id);
  if (!application) notFound();
  const candidate = application.candidate as Record<string, unknown> | null;
  const job = application.job as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-black uppercase text-[#B8860B]">{textValue(job, ["title"], "Job")}</p><h1 className="mt-2 text-3xl font-black text-[#071A3D]">{textValue(candidate, ["full_name"], "Candidate")}</h1></div>
      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <Detail label="Nationality" value={textValue(candidate, ["nationality"])} />
        <Detail label="Location" value={[candidate?.city, candidate?.country].filter(Boolean).join(" / ") || "Not set"} />
        <Detail label="Submitted" value={dateText(application.submitted_at)} />
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Candidate Application</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(application, ["cover_letter"], "No cover letter provided.")}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(application, ["relevant_experience"], "No experience summary provided.")}</p>
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Employer-Visible Documents</h2>
        <p className="mt-2 text-sm text-slate-600">Only CV/CV-cover-letter documents are listed by default. Passport, national ID, medical, police clearance and immigration documents are not exposed here.</p>
        <div className="mt-4 grid gap-3">{documents.length ? documents.map((document) => <div key={String(document.id)} className="rounded-md border border-slate-200 p-3 text-sm"><strong>{textValue(document, ["file_name"])}</strong><span className="ml-2 capitalize text-slate-500">{textValue(document, ["document_type"])}</span></div>) : <p className="text-sm text-slate-500">No employer-visible CV document found.</p>}</div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <form action={recordEmployerDecision.bind(null, id)} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#071A3D]">Record Employer Decision</h2>
          <select name="decision" className="mt-4 min-h-11 w-full rounded-md border border-slate-300 px-3">
            {EMPLOYER_DECISIONS.map((decision) => <option key={decision} value={decision}>{decision.replaceAll("_", " ")}</option>)}
          </select>
          <textarea name="note" rows={4} placeholder="Notes to Red Stone" className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2" />
          <label className="mt-3 flex gap-2 text-sm font-bold"><input type="checkbox" name="confirm" value="yes" required /> Confirm this employer decision</label>
          <button className="mt-4 rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Save Decision</button>
        </form>
        <form action={requestEmployerInterview.bind(null, id)} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#071A3D]">Request Interview</h2>
          <textarea name="preferred_times" rows={3} placeholder="Preferred dates/times" required className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2" />
          <input name="timezone" placeholder="Timezone" className="mt-3 min-h-11 w-full rounded-md border border-slate-300 px-3" />
          <input name="method" placeholder="Method" className="mt-3 min-h-11 w-full rounded-md border border-slate-300 px-3" />
          <input name="interviewer_name" placeholder="Interviewer / contact" className="mt-3 min-h-11 w-full rounded-md border border-slate-300 px-3" />
          <input name="interviewer_contact" placeholder="Contact details" className="mt-3 min-h-11 w-full rounded-md border border-slate-300 px-3" />
          <textarea name="notes_to_red_stone" rows={3} placeholder="Coordination notes" className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2" />
          <label className="mt-3 flex gap-2 text-sm font-bold"><input type="checkbox" name="confirm" value="yes" required /> Confirm interview request</label>
          <button className="mt-4 rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Request Interview</button>
        </form>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-[#071A3D]">{value}</p></div>;
}
