import Link from "next/link";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  assignStaffRole,
  deactivateStaffAccount,
  reactivateStaffAccount,
  revokeStaffRole,
} from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import {
  countRows,
  fetchById,
  fetchRows,
} from "@/lib/admin/data";
import {
  dateText,
  textValue,
} from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const roles = [
  "staff",
  "moderator",
  "recruiter",
  "hr",
  "finance",
  "admin",
  "super_admin",
];

const ROLE_LABELS: Record<string, string> = {
  staff: "Staff Member",
  moderator: "Moderator",
  recruiter: "Recruitment Officer",
  hr: "Human Resources Officer",
  finance: "Finance Officer",
  admin: "Administrator",
  super_admin: "Super Administrator",
};

export default async function StaffDetailPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const [
    { data: profile },
    staffRoles,
    assigned,
    audit,
  ] = await Promise.all([
    fetchById("profiles", id),

    fetchRows({
      table: "staff_roles",
      filters: { user_id: id },
      page: 1,
    }),

    countRows("applications", {
      assigned_staff_id: id,
    }),

    fetchRows({
      table: "admin_audit_logs",
      filters: { actor_user_id: id },
      page: 1,
    }),
  ]);

  const fullName = textValue(
    profile,
    ["full_name"],
    "Staff Member"
  );

  const staffId = textValue(
    profile,
    ["staff_id"],
    "Pending Assignment"
  );

  const jobTitle = textValue(
    profile,
    ["job_title"],
    "Not assigned"
  );

  const department = textValue(
    profile,
    ["department"],
    "Not assigned"
  );

  const dutyStation = textValue(
    profile,
    ["duty_station"],
    "Not assigned"
  );

  const profileType = textValue(
    profile,
    ["profile_type"],
    "Not set"
  );

  const isActive =
    profile?.is_active !== false;

  const activeRoles = staffRoles.rows.filter(
    (role: Row) => role.active !== false
  );

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="overflow-hidden rounded-xl border border-[#071A3D]/10 bg-white shadow-sm">
        <div className="bg-[#071A3D] px-6 py-7 text-white">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
                Red Stone Personnel Administration
              </p>

              <h1 className="mt-2 text-3xl font-black">
                {fullName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-slate-200">
                  {staffId}
                </span>

                <StatusBadge
                  status={
                    isActive
                      ? "active"
                      : "inactive"
                  }
                />
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Administrative personnel record,
                role authorization, account status
                and staff access controls.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/staff/${id}/record`}
                className="rounded-lg bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
              >
                Official Personnel Record
              </Link>

              <Link
                href="/admin/staff"
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white/10"
              >
                ← All Staff
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Assigned Applications"
          value={assigned}
        />

        <Metric
          label="Active Roles"
          value={activeRoles.length}
        />

        <Metric
          label="Profile Type"
          value={profileType}
        />

        <Metric
          label="Account Status"
          value={
            isActive
              ? "Active"
              : "Deactivated"
          }
          status={
            isActive
              ? "success"
              : "danger"
          }
        />
      </div>

      {/* =====================================================
          STAFF ACCOUNT CONTROL
      ===================================================== */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
            Administrative Control
          </p>

          <h2 className="mt-1 text-xl font-black text-[#071A3D]">
            Staff Account Status
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Control whether this employee may access
            the Red Stone internal staff system.
            Deactivation preserves personnel records,
            Staff ID, recruitment history and audit
            information.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div
              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {isActive
                ? "Active Staff Account"
                : "Staff Account Deactivated"}
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {isActive
                ? "The staff member is currently authorized to sign in according to their active role permissions."
                : "The staff member has been disabled from normal staff access. Personnel and operational history remain preserved."}
            </p>
          </div>

          <div className="min-w-[220px]">
            {isActive ? (
              <ConfirmAction
                action={deactivateStaffAccount.bind(
                  null,
                  id
                )}
                label="Deactivate Staff"
                message={`Deactivate ${fullName}? Their personnel records and history will be preserved, but staff access will be disabled.`}
                tone="danger"
              />
            ) : (
              <ConfirmAction
                action={reactivateStaffAccount.bind(
                  null,
                  id
                )}
                label="Reactivate Staff"
                message={`Reactivate ${fullName} and restore staff account access?`}
              />
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          EMPLOYMENT SUMMARY
      ===================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
            Personnel Information
          </p>

          <h2 className="mt-1 text-xl font-black text-[#071A3D]">
            Employment Assignment
          </h2>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4">
          <DetailCell
            label="Staff ID"
            value={staffId}
          />

          <DetailCell
            label="Job Title"
            value={jobTitle}
          />

          <DetailCell
            label="Department"
            value={department}
          />

          <DetailCell
            label="Duty Station"
            value={dutyStation}
            last
          />
        </div>
      </section>

      {/* =====================================================
          ROLES
      ===================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Authorization
            </p>

            <h2 className="mt-1 text-xl font-black text-[#071A3D]">
              Staff Roles & Permissions
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Roles determine which internal
              workspaces and records the staff member
              may access.
            </p>
          </div>

          <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
            {activeRoles.length} Active
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {staffRoles.rows.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                No staff roles have been assigned.
              </p>
            </div>
          ) : null}

          {staffRoles.rows.map(
            (role: Row) => {
              const roleValue =
                textValue(role, ["role"]);

              return (
                <div
                  key={textValue(
                    role,
                    ["id"]
                  )}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-[#071A3D]">
                      {ROLE_LABELS[
                        roleValue
                      ] ?? roleValue}
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={
                          role.active === false
                            ? "inactive"
                            : "active"
                        }
                      />
                    </div>
                  </div>

                  {role.active !== false ? (
                    <ConfirmAction
                      action={revokeStaffRole.bind(
                        null,
                        textValue(
                          role,
                          ["id"]
                        )
                      )}
                      label="Revoke Role"
                      message={`Revoke the ${ROLE_LABELS[roleValue] ?? roleValue} role from ${fullName}?`}
                      tone="danger"
                    />
                  ) : (
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Role Inactive
                    </span>
                  )}
                </div>
              );
            }
          )}
        </div>

        <form
          action={assignStaffRole.bind(
            null,
            id
          )}
          className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5"
        >
          <p className="text-xs font-black uppercase tracking-wide text-[#071A3D]">
            Assign Additional Role
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid flex-1 gap-1.5 text-sm font-semibold text-slate-700">
              Staff Role

              <select
                name="role"
                className="min-h-11 rounded-md border border-slate-300 bg-white px-3"
              >
                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {ROLE_LABELS[role] ??
                      role}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#102D5A]"
            >
              Assign Role
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          AUDIT
      ===================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
            Security Audit
          </p>

          <h2 className="mt-1 text-xl font-black text-[#071A3D]">
            Recent Administrative Activity
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {audit.rows.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No audit entries found.
            </p>
          ) : null}

          {audit.rows.map(
            (entry: Row) => (
              <div
                key={textValue(
                  entry,
                  ["id"]
                )}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-bold text-[#071A3D]">
                  {textValue(
                    entry,
                    ["action"]
                  )}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {dateText(
                    entry.created_at
                  )}
                </p>

                {textValue(
                  entry,
                  ["description"],
                  ""
                ) ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {textValue(
                      entry,
                      ["description"]
                    )}
                  </p>
                ) : null}
              </div>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          SECURITY NOTICE
      ===================================================== */}

      <section className="rounded-xl border border-amber-200 bg-[#FFFBEB] p-5">
        <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">
          Personnel Security Notice
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Deactivation is preferred over permanent
          deletion because employment, recruitment and
          security records may be required for audit,
          operational history or future reactivation.
        </p>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  status,
}: {
  label: string;
  value: string | number | null;
  status?: "success" | "danger";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-black ${
          status === "success"
            ? "text-emerald-700"
            : status === "danger"
              ? "text-red-700"
              : "text-[#071A3D]"
        }`}
      >
        {value ?? "Unavailable"}
      </p>
    </div>
  );
}

function DetailCell({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`p-6 ${
        last
          ? ""
          : "border-b border-slate-200 xl:border-b-0 xl:border-r"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-black text-[#071A3D]">
        {value}
      </p>
    </div>
  );
}