import { AdminTable } from "@/components/admin/admin-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/admin/auth";
import { fetchRows } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

export default async function StaffPage() {
  await requireAdmin();
  const result = await fetchRows({
    table: "staff_roles",
    page: 1,
    filters: {},
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Staff</h1>
        <p className="mt-1 text-sm text-slate-600">
          Active and historical staff role records. Role assignment safeguards belong in the next staff-management phase.
        </p>
      </div>

      <AdminTable
        columns={["User", "Role", "State", "Created"]}
        rows={result.rows}
        emptyTitle="No staff roles found"
        emptyMessage="Staff role records will appear here when administrators create them."
        renderRow={(staffRole: Row) => (
          <tr key={textValue(staffRole, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(staffRole, ["user_id"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(staffRole, ["role"])}</td>
            <td className="px-4 py-3">
              <StatusBadge status={staffRole.active === false ? "inactive" : "active"} />
            </td>
            <td className="px-4 py-3 text-slate-600">{dateText(staffRole.created_at)}</td>
          </tr>
        )}
      />
    </div>
  );
}

