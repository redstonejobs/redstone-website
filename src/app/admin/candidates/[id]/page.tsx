import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { addCandidateNote } from "@/lib/admin/actions";
import { attachApplicationRelations, fetchById, fetchDocumentsWithRelations, fetchRows } from "@/lib/admin/data";
import { dateText, nestedRow, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: candidate, error } = await fetchById("profiles", id);

  if (error || !candidate || candidate.profile_type !== "candidate") {
    notFound();
  }

  const [applicationsRaw, documents, notes] = await Promise.all([
    fetchRows({ table: "applications", filters: { candidate_id: id }, page: 1 }),
    fetchDocumentsWithRelations({ page: 1, filters: { candidate_id: id } }),
    fetchRows({ table: "candidate_notes", filters: { candidate_id: id }, page: 1 }),
  ]);
  const applications = await attachApplicationRelations(applicationsRaw);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-[#071A3D] p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Candidate Profile</p>
        <h1 className="mt-2 text-3xl font-bold">{textValue(candidate, ["full_name"])}</h1>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
          <span>ID: {id}</span>
          <span>{textValue(candidate, ["nationality"])}</span>
          <span>{textValue(candidate, ["phone"])}</span>
          <span>{textValue(candidate, ["city", "country"])}</span>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Detail label="Date of Birth" value={dateText(candidate.date_of_birth)} />
        <Detail label="Current City" value={textValue(candidate, ["city"])} />
        <Detail label="Current Country" value={textValue(candidate, ["country"])} />
        <Detail label="Joined" value={dateText(candidate.created_at)} />
      </div>

      <Panel title="Applications">
        {applications.rows.length === 0 ? (
          <p className="text-sm text-slate-500">No applications found.</p>
        ) : (
          <div className="space-y-3">
            {applications.rows.map((application: Row) => {
              const job = nestedRow(application, "job");
              const employer = nestedRow(application, "employer");
              const assigned = nestedRow(application, "assigned_staff");
              return (
                <Link key={textValue(application, ["id"])} href={`/admin/applications/${textValue(application, ["id"])}`} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-6">
                  <span className="font-semibold text-[#071A3D]">{textValue(job, ["title"], textValue(application, ["job_id"], "Job"))}</span>
                  <span className="text-sm text-slate-600">{textValue(job, ["country"], "Destination")}</span>
                  <span className="text-sm text-slate-600">{textValue(employer, ["company_name"], "Employer")}</span>
                  <StatusBadge status={textValue(application, ["status"], "draft")} />
                  <span className="text-sm text-slate-600">{dateText(application.submitted_at ?? application.created_at)}</span>
                  <span className="text-sm text-slate-600">{textValue(assigned, ["full_name"], "Unassigned")}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Documents">
        {documents.rows.length === 0 ? (
          <p className="text-sm text-slate-500">No documents found.</p>
        ) : (
          <div className="space-y-3">
            {documents.rows.map((document: Row) => (
              <div key={textValue(document, ["id"])} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-5">
                <span className="font-semibold text-[#071A3D]">{textValue(document, ["document_type", "type"])}</span>
                <span className="text-sm text-slate-600">{textValue(document, ["file_name"], "Private file")}</span>
                <span className="text-sm text-slate-600">{textValue(document, ["application_id"])}</span>
                <StatusBadge status={textValue(document, ["verification_status", "status"], "pending")} />
                <span className="text-sm text-slate-600">{dateText(document.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Candidate Internal Notes">
        <form action={addCandidateNote.bind(null, id)} className="mb-4 grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            New Note
            <textarea name="note" rows={4} className="rounded-md border border-slate-300 px-3 py-2" required />
          </label>
          <button type="submit" className="w-fit rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Add Note</button>
        </form>
        {notes.rows.length === 0 ? (
          <p className="text-sm text-slate-500">No internal notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.rows.map((note) => (
              <div key={textValue(note, ["id"])} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm text-slate-700">{textValue(note, ["note"])}</p>
                <p className="mt-2 text-xs text-slate-500">{dateText(note.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#071A3D]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#071A3D]">{value}</p>
    </div>
  );
}
