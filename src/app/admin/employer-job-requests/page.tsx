import { ConfirmAction } from "@/components/admin/confirm-action";
import { setEmployerJobRequestState } from "@/lib/admin/actions";
import { fetchRows } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";

export default async function AdminEmployerJobRequestsPage() {
  const result = await fetchRows({ table: "employer_job_requests", page: 1, orderBy: "created_at", ascending: false });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-[#071A3D]">Employer Vacancy Requests</h1><p className="mt-1 text-sm text-slate-600">Review employer-submitted vacancy drafts before Red Stone publication work.</p></div>
      <div className="grid gap-4">
        {result.rows.map((request) => (
          <article key={String(request.id)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-[#B8860B]">{textValue(request, ["status"]).replaceAll("_", " ")}</p>
                <h2 className="mt-1 text-xl font-bold text-[#071A3D]">{textValue(request, ["title"])}</h2>
                <p className="mt-2 text-sm text-slate-600">{[request.country, request.city, request.category].filter(Boolean).join(" / ")}</p>
                <p className="mt-1 text-xs text-slate-500">Submitted {dateText(request.submitted_at)} / Created {dateText(request.created_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ConfirmAction action={setEmployerJobRequestState.bind(null, String(request.id), "under_review")} label="Under Review" message="Mark this request under review?" />
                <ConfirmAction action={setEmployerJobRequestState.bind(null, String(request.id), "changes_requested")} label="Request Changes" message="Request employer changes?" />
                <ConfirmAction action={setEmployerJobRequestState.bind(null, String(request.id), "approved")} label="Approve" message="Approve this employer request for Red Stone processing?" />
                <ConfirmAction action={setEmployerJobRequestState.bind(null, String(request.id), "rejected")} label="Reject" message="Reject this employer request?" tone="danger" />
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(request, ["description"], "No description saved.")}</p>
          </article>
        ))}
        {result.rows.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-slate-600">No employer vacancy requests found.</p> : null}
      </div>
    </div>
  );
}
