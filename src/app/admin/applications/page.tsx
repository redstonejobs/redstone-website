import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchRows, getPage, getParam } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import { APPLICATION_STATUSES } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "applications",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["status", "cover_letter", "candidate_notes", "internal_notes"],
    filters: {
      status: getParam(params, "status"),
      assigned_staff_id: getParam(params, "assigned_staff"),
      job_id: getParam(params, "job"),
      candidate_id: getParam(params, "candidate"),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Applications</h1>
        <p className="mt-1 text-sm text-slate-600">Recruitment case queue with server-side filtering.</p>
      </div>

      <FilterBar
        searchPlaceholder="Search notes or status"
        filters={[{ name: "status", label: "Status", options: [...APPLICATION_STATUSES] }]}
      />

      <AdminTable
        columns={["Applicant", "Job", "Destination", "Status", "Assigned Staff", "Submitted", "Updated", "Actions"]}
        rows={result.rows}
        emptyTitle="No applications found"
        emptyMessage="Applications will appear here when candidates submit them."
        renderRow={(application: Row) => (
          <tr key={textValue(application, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">
              {textValue(application, ["candidate_name", "candidate_id"], "Candidate")}
            </td>
            <td className="px-4 py-3 text-slate-600">{textValue(application, ["job_title", "job_id"], "Job")}</td>
            <td className="px-4 py-3 text-slate-600">
              {textValue(application, ["country", "destination", "city"], "Not set")}
            </td>
            <td className="px-4 py-3"><StatusBadge status={textValue(application, ["status"], "draft")} /></td>
            <td className="px-4 py-3 text-slate-600">{textValue(application, ["assigned_staff_id"], "Unassigned")}</td>
            <td className="px-4 py-3 text-slate-600">{dateText(application.submitted_at ?? application.created_at)}</td>
            <td className="px-4 py-3 text-slate-600">{dateText(application.updated_at)}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/applications/${textValue(application, ["id"])}`} className="font-semibold text-[#071A3D]">
                View
              </Link>
            </td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/applications" />
    </div>
  );
}

