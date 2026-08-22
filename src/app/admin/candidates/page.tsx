import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchRows, getPage, getParam } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CandidatesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "profiles",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["full_name", "phone", "nationality", "country", "city"],
    filters: {
      profile_type: "candidate",
      country: getParam(params, "country"),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Candidates</h1>
        <p className="mt-1 text-sm text-slate-600">Candidate-only profiles with searchable contact and location data.</p>
      </div>

      <FilterBar searchPlaceholder="Search name, phone, nationality" filters={[{ name: "country", label: "Country", options: [] }]} />

      <AdminTable
        columns={["Candidate", "Phone", "Nationality", "Location", "Active", "Joined"]}
        rows={result.rows}
        emptyTitle="No candidates found"
        emptyMessage="Candidate profiles will appear here after registration."
        renderRow={(candidate: Row) => (
          <tr key={textValue(candidate, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">
              <Link href={`/admin/candidates/${textValue(candidate, ["id"])}`}>{textValue(candidate, ["full_name"])}</Link>
            </td>
            <td className="px-4 py-3 text-slate-600">{textValue(candidate, ["phone"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(candidate, ["nationality"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(candidate, ["city", "country"])}</td>
            <td className="px-4 py-3"><StatusBadge status={candidate.is_active === false ? "inactive" : "active"} /></td>
            <td className="px-4 py-3 text-slate-600">{dateText(candidate.created_at)}</td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/candidates" />
    </div>
  );
}
import Link from "next/link";
