import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchApplicationsWithRelations, getPage, getParam } from "@/lib/admin/data";
import { dateText, nestedRow, textValue } from "@/lib/admin/format";
import { APPLICATION_STATUSES } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchApplicationsWithRelations({
    page: getPage(params),
    query: getParam(params, "q"),
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
        renderRow={(application: Row) => {
          const candidate = nestedRow(application, "candidate");
          const job = nestedRow(application, "job");
          const employer = nestedRow(application, "employer");
          const assigned = nestedRow(application, "assigned_staff");

          return (
            <tr key={textValue(application, ["id"])}>
              <td className="px-4 py-3 font-medium text-[#071A3D]">
                {textValue(candidate, ["full_name"], textValue(application, ["candidate_id"], "Candidate"))}
              </td>
              <td className="px-4 py-3 text-slate-600">{textValue(job, ["title"], textValue(application, ["job_id"], "Job"))}</td>
              <td className="px-4 py-3 text-slate-600">{textValue(job, ["country", "city"], "Not set")}</td>
              <td className="px-4 py-3"><StatusBadge status={textValue(application, ["status"], "draft")} /></td>
              <td className="px-4 py-3 text-slate-600">{textValue(assigned, ["full_name"], "Unassigned")}</td>
              <td className="px-4 py-3 text-slate-600">{textValue(employer, ["company_name"], "Employer")}</td>
              <td className="px-4 py-3 text-slate-600">{dateText(application.updated_at)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/applications/${textValue(application, ["id"])}`} className="font-semibold text-[#071A3D]">
                  View
                </Link>
              </td>
            </tr>
          );
        }}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/applications" />
    </div>
  );
}
