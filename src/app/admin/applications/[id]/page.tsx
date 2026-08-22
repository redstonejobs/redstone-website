import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { addApplicationNote, assignApplication, updateApplicationStatus } from "@/lib/admin/actions";
import { attachApplicationRelations, fetchById, fetchDocumentsWithRelations, fetchRows } from "@/lib/admin/data";
import { dateText, nestedRow, textValue } from "@/lib/admin/format";
import { APPLICATION_STATUSES } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: application, error } = await fetchById("applications", id);

  if (error || !application) {
    notFound();
  }

  const [history, documents] = await Promise.all([
    fetchRows({
      table: "application_status_history",
      filters: { application_id: id },
      orderBy: "created_at",
      ascending: true,
    }),
    fetchDocumentsWithRelations({ page: 1, filters: { application_id: id } }),
  ]);
  const related = (await attachApplicationRelations({ rows: [application] })).rows[0];
  const candidate = nestedRow(related, "candidate");
  const job = nestedRow(related, "job");
  const employer = nestedRow(related, "employer");
  const assigned = nestedRow(related, "assigned_staff");
  const [staff, notes] = await Promise.all([
    fetchRows({ table: "staff_roles", filters: { active: "true" }, page: 1 }),
    fetchRows({ table: "application_notes", filters: { application_id: id }, page: 1 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Application Case</h1>
        <p className="mt-1 text-sm text-slate-600">Case ID: {id}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Candidate Summary">
          <Field label="Candidate" value={textValue(candidate, ["full_name"], textValue(application, ["candidate_id"], "Candidate"))} />
          <Field label="Nationality" value={textValue(candidate, ["nationality"])} />
          <Field label="Phone" value={textValue(candidate, ["phone"])} />
          <Field label="Location" value={textValue(candidate, ["city", "country"])} />
        </Panel>
        <Panel title="Job Summary">
          <Field label="Job" value={textValue(job, ["title"], textValue(application, ["job_id"], "Job"))} />
          <Field label="Destination" value={textValue(job, ["country", "city"])} />
          <Field label="Employer" value={textValue(employer, ["company_name"], "Employer")} />
          <Field label="Deadline" value={dateText(job?.deadline)} />
        </Panel>
        <Panel title="Application Details">
          <Field label="Status" value={<StatusBadge status={textValue(application, ["status"], "draft")} />} />
          <Field label="Submitted" value={dateText(application.submitted_at ?? application.created_at)} />
          <Field label="Reviewed" value={dateText(application.reviewed_at)} />
          <Field label="Assigned Staff" value={textValue(assigned, ["full_name"], "Unassigned")} />
        </Panel>
      </div>

      <Panel title="Internal Recruitment Notes">
        <form action={addApplicationNote.bind(null, id)} className="mb-4 grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Add Note
            <textarea name="note" rows={4} className="rounded-md border border-slate-300 px-3 py-2" required />
          </label>
          <button type="submit" className="w-fit rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Add Note</button>
        </form>
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {textValue(application, ["internal_notes"], "No internal notes saved.")}
        </p>
        <div className="mt-4 space-y-3">
          {notes.rows.map((note) => (
            <div key={textValue(note, ["id"])} className="rounded-md border border-slate-200 p-3">
              <p className="text-sm text-slate-700">{textValue(note, ["note"])}</p>
              <p className="mt-2 text-xs text-slate-500">{dateText(note.created_at)}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Status Update Control">
        <form action={updateApplicationStatus.bind(null, id)} className="grid gap-3 md:grid-cols-[minmax(180px,240px)_1fr_auto]">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            New Status
            <select name="status" defaultValue={textValue(application, ["status"], "submitted")} className="min-h-11 rounded-md border border-slate-300 bg-white px-3">
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Override Reason
            <input
              name="override_reason"
              className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal"
              placeholder="Required only for super admin overrides"
            />
          </label>
          <button type="submit" className="self-end rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">
            Update Status
          </button>
        </form>
      </Panel>

      <Panel title="Assign Staff">
        <form action={assignApplication.bind(null, id)} className="grid gap-3 md:grid-cols-[minmax(220px,320px)_1fr_auto]">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Staff User ID
            <select name="assigned_staff_id" className="min-h-11 rounded-md border border-slate-300 bg-white px-3">
              {staff.rows.map((staffRole) => (
                <option key={textValue(staffRole, ["id"])} value={textValue(staffRole, ["user_id"])}>
                  {textValue(staffRole, ["user_id"])} ({textValue(staffRole, ["role"])})
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Assignment Reason
            <input name="assignment_reason" className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal" />
          </label>
          <button type="submit" className="self-end rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">
            Assign
          </button>
        </form>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Status Timeline">
          {history.rows.length === 0 ? (
            <p className="text-sm text-slate-500">No status history records found.</p>
          ) : (
            <ol className="space-y-3">
              {history.rows.map((item: Row) => (
                <li key={textValue(item, ["id"])} className="border-l-2 border-[#D4AF37] pl-3">
                  <p className="text-sm font-semibold text-[#071A3D]">
                    {textValue(item, ["previous_status"], "Not set")} to {textValue(item, ["new_status", "status"])}
                  </p>
                  <p className="text-xs text-slate-500">{dateText(item.created_at)}</p>
                  {item.reason ? <p className="mt-1 text-xs text-slate-600">{textValue(item, ["reason"])}</p> : null}
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Documents">
          {documents.rows.length === 0 ? (
            <p className="text-sm text-slate-500">No application documents found.</p>
          ) : (
            <div className="space-y-3">
              {documents.rows.map((document: Row) => (
                <div key={textValue(document, ["id"])} className="rounded-md border border-slate-200 p-3">
                  <p className="font-semibold text-[#071A3D]">{textValue(document, ["file_name", "document_type", "type"])}</p>
                  <p className="text-sm text-slate-500">{textValue(document, ["verification_status", "status"], "pending")}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#071A3D]">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
