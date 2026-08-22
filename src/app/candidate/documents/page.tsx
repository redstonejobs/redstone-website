import Link from "next/link";
import { requireCandidate } from "@/lib/candidate/auth";
import { candidateDocumentStatus } from "@/lib/candidate/constants";
import { getCandidateDocuments } from "@/lib/candidate/data";
import { dateText } from "@/lib/admin/format";

export default async function CandidateDocumentsPage() {
  const context = await requireCandidate();
  const { documents } = await getCandidateDocuments(context);
  return (
    <div>
      <h1 className="text-3xl font-black text-[#071A3D]">Documents</h1>
      <p className="mt-2 text-slate-600">Private document metadata for your own applications only.</p>
      <div className="mt-6 space-y-3">
        {documents.map((document) => (
          <div key={String(document.id)} className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
            <span className="font-bold text-[#071A3D]">{String(document.document_type ?? "document")}</span>
            <span>{String(document.file_name ?? "File")}</span>
            <span>{candidateDocumentStatus(String(document.verification_status ?? "pending"))}</span>
            <span>{dateText(document.created_at)}</span>
            <Link href={`/candidate/documents/${String(document.id)}/view`} className="font-bold text-[#B8860B]">View</Link>
          </div>
        ))}
        {!documents.length ? <p className="rounded-md bg-white p-6 text-slate-600">No documents uploaded yet.</p> : null}
      </div>
    </div>
  );
}

