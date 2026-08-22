import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { updateApplicationStatus } from "@/lib/admin/actions";
import { fetchById, fetchRows } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
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
    fetchRows({
      table: "application_documents",
      filters: { application_id: id },
      orderBy: "created_at",
      ascending: false,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Application Case</h1>
        <p className="mt-1 text-sm text-slate-600">Case ID: {id}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Candidate Summary">
          <Field label="Candidate" value={textValue(application, ["candidate_name", "candidate_id"], "Candidate")} />
          <Field label="Nationality" value={textValue(application, ["nationality"])} />
          <Field label="Phone" value={textValue(application, ["phone"])} />
          <Field label="Location" value={textValue(application, ["city", "country"])} />
        </Panel>
        <Panel title="Job Summary">
          <Field label="Job" value={textValue(application, ["job_title", "job_id"], "Job")} />
          <Field label="Destination" value={textValue(application, ["destination", "country", "city"])} />
          <Field label="Employer" value={textValue(application, ["employer_name", "employer_id"])} />
          <Field label="Deadline" value={dateText(application.deadline)} />
        </Panel>
        <Panel title="Application Details">
          <Field label="Status" value={<StatusBadge status={textValue(application, ["status"], "draft")} />} />
          <Field label="Submitted" value={dateText(application.submitted_at ?? application.created_at)} />
          <Field label="Reviewed" value={dateText(application.reviewed_at)} />
          <Field label="Assigned Staff" value={textValue(application, ["assigned_staff_id"], "Unassigned")} />
        </Panel>
      </div>

      <Panel title="Internal Recruitment Notes">
        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {textValue(application, ["internal_notes"], "No internal notes saved.")}
        </p>
      </Panel>

      <Panel title="Status Update Control">
        <form action={updateApplicationStatus.bind(null, id)} className="flex flex-col gap-3 sm:flex-row">
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
          <button type="submit" className="self-end rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">
            Update Status
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
                  <p className="text-sm font-semibold text-[#071A3D]">{textValue(item, ["status", "new_status"])}</p>
                  <p className="text-xs text-slate-500">{dateText(item.created_at)}</p>
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

