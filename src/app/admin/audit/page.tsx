import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { requireAdmin } from "@/lib/admin/auth";
import { fetchRows, getPage, getParam } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuditPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "admin_audit_logs",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["action", "entity_type", "description"],
    filters: {
      actor_user_id: getParam(params, "actor"),
      action: getParam(params, "action"),
      entity_type: getParam(params, "entity_type"),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Audit Log</h1>
        <p className="mt-1 text-sm text-slate-600">Administrative activity without passwords, tokens or document contents.</p>
      </div>
      <FilterBar
        searchPlaceholder="Search action or entity"
        filters={[
          { name: "entity_type", label: "Entity", options: ["employer", "job", "application", "application_document", "candidate", "staff_role"] },
          { name: "action", label: "Action", options: [] },
        ]}
      />
      <AdminTable
        columns={["When", "Actor", "Role", "Action", "Entity", "Description"]}
        rows={result.rows}
        emptyTitle="No audit entries"
        emptyMessage="Audit entries will appear as admin actions are performed."
        renderRow={(entry: Row) => (
          <tr key={textValue(entry, ["id"])}>
            <td className="px-4 py-3 text-slate-600">{dateText(entry.created_at)}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(entry, ["actor_user_id"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(entry, ["actor_role"])}</td>
            <td className="px-4 py-3 font-semibold text-[#071A3D]">{textValue(entry, ["action"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(entry, ["entity_type"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(entry, ["description"])}</td>
          </tr>
        )}
      />
      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/audit" />
    </div>
  );
}
