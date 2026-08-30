import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { setEmployerState } from "@/lib/admin/actions";
import { fetchEmployersWithJobCounts, getPage, getParam } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmployersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchEmployersWithJobCounts({
    page: getPage(params),
    query: getParam(params, "q"),
    country: getParam(params, "country"),
    verificationStatus: getParam(params, "verification_status"),
    active: getParam(params, "active"),
    sort: getParam(params, "sort"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Employers</h1>
        <p className="mt-1 text-sm text-slate-600">Employer records, verification state and recruitment volume.</p>
        <Link href="/admin/employers/new" className="mt-3 inline-flex rounded-md bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#071A3D]">
          Add Employer
        </Link>
      </div>

      <FilterBar
        searchPlaceholder="Search company, email, phone"
        filters={[
          { name: "verification_status", label: "Verification", options: ["pending", "under_review", "verified", "suspended", "rejected"] },
          { name: "active", label: "State", options: ["true", "false"] },
          { name: "sort", label: "Sort", options: ["newest", "company"] },
        ]}
      />

      <AdminTable
        columns={["Company", "Country", "Contact", "Verification", "Active", "Jobs", "Created", "Actions"]}
        rows={result.rows}
        emptyTitle="No employers found"
        emptyMessage="Employer records will appear here after they are created."
        renderRow={(employer: Row) => (
          <tr key={textValue(employer, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(employer, ["company_name", "name"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(employer, ["country", "city"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(employer, ["email", "phone"])}</td>
            <td className="px-4 py-3"><StatusBadge status={textValue(employer, ["verification_status", "status"], "pending")} /></td>
            <td className="px-4 py-3"><StatusBadge status={employer.is_active === false || employer.active === false ? "inactive" : "active"} /></td>
            <td className="px-4 py-3 text-slate-600">{textValue(employer, ["job_count"], "0")}</td>
            <td className="px-4 py-3 text-slate-600">{dateText(employer.created_at)}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/employers/${textValue(employer, ["id"])}`} className="font-semibold text-[#071A3D]">View</Link>
                <Link href={`/admin/employers/${textValue(employer, ["id"])}/edit`} className="font-semibold text-[#B8860B]">Edit</Link>
                <ConfirmAction action={setEmployerState.bind(null, textValue(employer, ["id"]), "verified")} label="Verify" message="Verify this employer?" />
                <ConfirmAction action={setEmployerState.bind(null, textValue(employer, ["id"]), "rejected")} label="Reject" message="Reject this employer?" tone="danger" />
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/employers" />
    </div>
  );
}
