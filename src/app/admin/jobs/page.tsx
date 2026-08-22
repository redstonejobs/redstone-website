import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchRows, getPage, getParam } from "@/lib/admin/data";
import { dateText, numberValue, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "jobs",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["title", "country", "city", "category", "skill_level", "status"],
    filters: {
      country: getParam(params, "country"),
      category: getParam(params, "category"),
      skill_level: getParam(params, "skill_level"),
      status: getParam(params, "status"),
      employer_id: getParam(params, "employer"),
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">Jobs</h1>
          <p className="mt-1 text-sm text-slate-600">Search, filter and manage vacancies.</p>
        </div>
        <Link href="/admin/jobs/new" className="rounded-md bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#071A3D]">
          Create Job
        </Link>
      </div>

      <FilterBar
        searchPlaceholder="Search title, country, category"
        filters={[
          { name: "status", label: "Status", options: ["draft", "published", "paused", "closed", "archived"] },
          { name: "skill_level", label: "Skill", options: ["skilled", "unskilled"] },
          { name: "country", label: "Country", options: [] },
        ]}
      />

      <AdminTable
        columns={["Title", "Country", "Category", "Skill", "Vacancies", "Status", "Deadline", "Actions"]}
        rows={result.rows}
        emptyTitle="No jobs found"
        emptyMessage="No vacancies match the current filters."
        renderRow={(job: Row) => (
          <tr key={textValue(job, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(job, ["title"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(job, ["country"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(job, ["category"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(job, ["skill_level"])}</td>
            <td className="px-4 py-3 text-slate-600">{numberValue(job, ["vacancies"])}</td>
            <td className="px-4 py-3"><StatusBadge status={textValue(job, ["status"], "draft")} /></td>
            <td className="px-4 py-3 text-slate-600">{dateText(job.application_deadline)}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                <Link href={`/admin/jobs/${textValue(job, ["id"])}`} className="font-semibold text-[#071A3D]">View</Link>
                <Link href={`/admin/jobs/${textValue(job, ["id"])}/edit`} className="font-semibold text-[#B8860B]">Edit</Link>
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/jobs" />
    </div>
  );
}
