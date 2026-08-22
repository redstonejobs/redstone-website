import { requireEmployer } from "@/lib/employer/auth";
import { getEmployerDocuments } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

export default async function EmployerDocumentsPage() {
  const context = await requireEmployer();
  const documents = await getEmployerDocuments(context);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[#071A3D]">Verification Documents</h1><p className="mt-2 text-slate-600">Employer verification documents are private. Red Stone staff can review them; they are not public.</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((document) => (
          <article key={String(document.id)} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-black text-[#071A3D]">{textValue(document, ["file_name"])}</p>
            <p className="mt-1 capitalize text-sm text-slate-600">{textValue(document, ["document_type"]).replaceAll("_", " ")}</p>
            <p className="mt-1 capitalize text-sm text-slate-500">{textValue(document, ["status"], "submitted")}</p>
            <p className="mt-1 text-xs text-slate-500">{dateText(document.created_at)}</p>
          </article>
        ))}
        {documents.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-600">No verification documents uploaded yet. Contact support if Red Stone requests documents.</p> : null}
      </div>
    </div>
  );
}
