import Link from "next/link";
import { notFound } from "next/navigation";
import { uploadCandidateDocument, withdrawApplication } from "@/lib/candidate/actions";
import { requireCandidate } from "@/lib/candidate/auth";
import { candidateDocumentStatus, candidateStatusLabel, DOCUMENT_TYPES, WITHDRAWABLE_STATUSES } from "@/lib/candidate/constants";
import { getCandidateApplication } from "@/lib/candidate/data";
import { dateText } from "@/lib/admin/format";

type Props = { params: Promise<{ id: string }> };

export default async function CandidateApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const context = await requireCandidate();
  const { application, documents, timeline } = await getCandidateApplication(context, id);
  if (!application) notFound();
  const job = application.job as Record<string, unknown> | null;
  const status = String(application.status ?? "draft");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-[#B8860B]">{candidateStatusLabel(status)}</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">{String(job?.title ?? "Application")}</h1>
        <p className="mt-2 text-slate-600">{[job?.city, job?.country].filter(Boolean).join(", ")}</p>
      </div>
      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <Detail label="Submitted" value={dateText(application.submitted_at)} />
        <Detail label="Last Updated" value={dateText(application.updated_at)} />
        <Detail label="Current Stage" value={candidateStatusLabel(status)} />
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Application Details</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{String(application.cover_letter ?? "No cover letter saved.")}</p>
        <p className="mt-4 text-sm text-slate-700"><strong>Relevant experience:</strong> {String(application.relevant_experience ?? "Not provided")}</p>
        <p className="mt-2 text-sm text-slate-700"><strong>Availability:</strong> {String(application.availability ?? "Not provided")}</p>
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Documents</h2>
        <form action={uploadCandidateDocument.bind(null, id)} className="mt-4 grid gap-3 rounded-md bg-slate-50 p-4 md:grid-cols-[220px_1fr_auto]">
          <select name="document_type" className="min-h-11 rounded-md border border-slate-300 bg-white px-3">
            {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
          </select>
          <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required className="min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2" />
          <button className="rounded-md bg-[#071A3D] px-4 py-3 text-sm font-black text-white">Upload</button>
        </form>
        <div className="mt-4 space-y-3">
          {documents.map((document) => (
            <div key={String(document.id)} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-[#071A3D]">{String(document.file_name ?? document.document_type)}</p>
                <p className="text-sm text-slate-600">{candidateDocumentStatus(String(document.verification_status ?? "pending"))}</p>
                {document.verification_status === "rejected" && document.verification_note ? <p className="text-sm text-red-700">{String(document.verification_note)}</p> : null}
              </div>
              <Link href={`/candidate/documents/${String(document.id)}/view`} className="font-bold text-[#B8860B]">View</Link>
            </div>
          ))}
          {!documents.length ? <p className="text-sm text-slate-600">No documents uploaded for this application yet.</p> : null}
        </div>
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Recruitment Timeline</h2>
        <ol className="mt-4 space-y-3">
          {timeline.map((event) => <li key={String(event.id)} className="border-l-2 border-[#D4AF37] pl-3"><p className="font-bold">{candidateStatusLabel(String(event.new_status ?? ""))}</p><p className="text-sm text-slate-500">{dateText(event.created_at)}</p></li>)}
        </ol>
      </section>
      {WITHDRAWABLE_STATUSES.includes(status) ? (
        <form action={withdrawApplication.bind(null, id)} className="rounded-md border border-red-200 bg-red-50 p-4">
          <input type="hidden" name="confirm" value="yes" />
          <button className="rounded-md bg-red-700 px-4 py-3 text-sm font-black text-white">Withdraw Application</button>
        </form>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}

