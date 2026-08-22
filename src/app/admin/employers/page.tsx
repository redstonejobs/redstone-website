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

export default async function EmployersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "employers",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["company_name", "name", "email", "phone", "country", "city"],
    filters: {
      country: getParam(params, "country"),
      verification_status: getParam(params, "verification_status"),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Employers</h1>
        <p className="mt-1 text-sm text-slate-600">Employer records, verification state and contact information.</p>
      </div>

      <FilterBar
        searchPlaceholder="Search company, email, phone"
        filters={[
          { name: "verification_status", label: "Verification", options: ["pending", "verified", "rejected"] },
          { name: "country", label: "Country", options: [] },
        ]}
      />

      <AdminTable
        columns={["Company", "Country", "Contact", "Verification", "Active", "Created"]}
        rows={result.rows}
        emptyTitle="No employers found"
        emptyMessage="Employer records will appear here after they are created."
        renderRow={(employer: Row) => (
          <tr key={textValue(employer, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(employer, ["company_name", "name"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(employer, ["country", "city"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(employer, ["email", "phone"])}</td>
            <td className="px-4 py-3"><StatusBadge status={textValue(employer, ["verification_status", "status"], "pending")} /></td>
            <td className="px-4 py-3"><StatusBadge status={employer.active === false ? "inactive" : "active"} /></td>
            <td className="px-4 py-3 text-slate-600">{dateText(employer.created_at)}</td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/employers" />
    </div>
  );
}

