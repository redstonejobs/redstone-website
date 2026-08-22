import { ConfirmAction } from "@/components/admin/confirm-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { assignStaffRole, revokeStaffRole } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { countRows, fetchById, fetchRows } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const roles = ["staff", "moderator", "recruiter", "hr", "finance", "admin", "super_admin"];

export default async function StaffDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const [{ data: profile }, staffRoles, assigned, audit] = await Promise.all([
    fetchById("profiles", id),
    fetchRows({ table: "staff_roles", filters: { user_id: id }, page: 1 }),
    countRows("applications", { assigned_staff_id: id }),
    fetchRows({ table: "admin_audit_logs", filters: { actor_user_id: id }, page: 1 }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-[#071A3D] p-6 text-white">
        <h1 className="text-3xl font-bold">{textValue(profile, ["full_name"], "Staff Member")}</h1>
        <p className="mt-2 text-sm text-slate-200">{id}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Assigned Applications" value={assigned} />
        <Metric label="Profile Type" value={textValue(profile, ["profile_type"])} />
        <Metric label="Active Profile" value={profile?.is_active === false ? "No" : "Yes"} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Roles</h2>
        <div className="mt-4 space-y-3">
          {staffRoles.rows.map((role: Row) => (
            <div key={textValue(role, ["id"])} className="flex flex-col gap-3 rounded-md border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[#071A3D]">{textValue(role, ["role"])}</p>
                <StatusBadge status={role.active === false ? "inactive" : "active"} />
              </div>
              <ConfirmAction action={revokeStaffRole.bind(null, textValue(role, ["id"]))} label="Revoke" message="Revoke this staff role?" tone="danger" />
            </div>
          ))}
        </div>
        <form action={assignStaffRole.bind(null, id)} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Assign Role
            <select name="role" className="min-h-11 rounded-md border border-slate-300 bg-white px-3">
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="self-end rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Assign</button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Recent Admin Activity</h2>
        <div className="mt-4 space-y-3">
          {audit.rows.length === 0 ? <p className="text-sm text-slate-500">No audit entries found.</p> : null}
          {audit.rows.map((entry) => (
            <div key={textValue(entry, ["id"])} className="rounded-md border border-slate-200 p-3">
              <p className="font-semibold text-[#071A3D]">{textValue(entry, ["action"])}</p>
              <p className="text-sm text-slate-500">{dateText(entry.created_at)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-[#071A3D]">{value ?? "Unavailable"}</p>
    </div>
  );
}

