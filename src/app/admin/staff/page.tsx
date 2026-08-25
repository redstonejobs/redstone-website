import type { ReactNode } from "react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/admin/status-badge";
import { canManageStaff, requireAdmin } from "@/lib/admin/auth";
import type { Row } from "@/lib/admin/types";
import { createClient } from "@/utils/supabase/server";

/* ============================================================
   CONFIGURATION
============================================================ */

const ROLE_PRIORITY = [
  "super_admin",
  "admin",
  "hr",
  "finance",
  "recruiter",
  "moderator",
  "staff",
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  hr: "Human Resources",
  finance: "Finance Officer",
  recruiter: "Recruitment Officer",
  moderator: "Moderator",
  staff: "Staff Member",
};

/* ============================================================
   TYPES
============================================================ */

type StaffRecord = {
  userId: string;
  profile: Row | null;
  roles: Row[];
  activeRoles: Row[];
  primaryRole: Row | null;
  active: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function text(
  value: unknown,
  fallback = "Not recorded"
) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function roleLabel(role: unknown) {
  const key =
    typeof role === "string" && role
      ? role
      : "staff";

  return (
    ROLE_LABELS[key] ??
    key
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase()
      )
  );
}

function initials(name: string) {
  const result = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return result || "RS";
}

/* ============================================================
   PAGE
============================================================ */

export default async function StaffPage() {
  const context = await requireAdmin();

  if (!canManageStaff(context)) {
    redirect("/admin");
  }

  const supabase = await createClient();

  /* ----------------------------------------------------------
     LOAD STAFF ROLES
  ---------------------------------------------------------- */

  const {
    data: roleRows,
    error: rolesError,
  } = await supabase
    .from("staff_roles")
    .select(
      "id, user_id, role, active, created_at"
    )
    .order("created_at", {
      ascending: false,
    })
    .returns<Row[]>();

  const roles = roleRows ?? [];

  /* ----------------------------------------------------------
     BUILD UNIQUE STAFF USER IDS
  ---------------------------------------------------------- */

  const userIds = Array.from(
    new Set(
      roles
        .map((role) =>
          typeof role.user_id === "string"
            ? role.user_id
            : ""
        )
        .filter(Boolean)
    )
  );

  /* ----------------------------------------------------------
     LOAD PERSONNEL PROFILES
  ---------------------------------------------------------- */

  let profiles: Row[] = [];
  let profilesError: unknown = null;

  if (userIds.length > 0) {
    const profileResult = await supabase
      .from("profiles")
      .select(
        `
          id,
          full_name,
          phone,
          profile_type,
          is_active,
          avatar_url,
          staff_id,
          personnel_record_no,
          referral_code,
          job_title,
          department,
          employment_type,
          duty_station,
          appointment_date,
          reporting_officer,
          created_at
        `
      )
      .in("id", userIds)
      .returns<Row[]>();

    profiles = profileResult.data ?? [];
    profilesError = profileResult.error;
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      String(profile.id),
      profile,
    ])
  );

  /* ----------------------------------------------------------
     BUILD PERSONNEL REGISTER
  ---------------------------------------------------------- */

  const staffMap = new Map<
    string,
    StaffRecord
  >();

  for (const userId of userIds) {
    const userRoles = roles.filter(
      (role) =>
        String(role.user_id ?? "") === userId
    );

    const activeRoles = userRoles.filter(
      (role) => role.active !== false
    );

    const primaryRole =
      ROLE_PRIORITY
        .map((roleName) =>
          activeRoles.find(
            (role) =>
              String(role.role ?? "") ===
              roleName
          )
        )
        .find(Boolean) ??
      activeRoles[0] ??
      userRoles[0] ??
      null;

    const profile =
      profileMap.get(userId) ?? null;

    staffMap.set(userId, {
      userId,
      profile,
      roles: userRoles,
      activeRoles,
      primaryRole,
      active:
        profile?.is_active !== false &&
        activeRoles.length > 0,
    });
  }

  const staff = Array.from(
    staffMap.values()
  ).sort((a, b) => {
    const aDate = String(
      a.profile?.appointment_date ??
        a.primaryRole?.created_at ??
        ""
    );

    const bDate = String(
      b.profile?.appointment_date ??
        b.primaryRole?.created_at ??
        ""
    );

    return bDate.localeCompare(aDate);
  });

  /* ----------------------------------------------------------
     METRICS
  ---------------------------------------------------------- */

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.active
  ).length;

  const inactiveStaff =
    totalStaff - activeStaff;

  const departmentCount = new Set(
    staff
      .map((member) =>
        text(
          member.profile?.department,
          ""
        )
      )
      .filter(Boolean)
  ).size;

  const activeRoleCount = new Set(
    roles
      .filter((role) => role.active !== false)
      .map((role) =>
        String(role.role ?? "")
      )
      .filter(Boolean)
  ).size;

  const recordsPendingId = staff.filter(
    (member) =>
      !text(member.profile?.staff_id, "")
  ).length;

  const hasError =
    Boolean(rolesError) ||
    Boolean(profilesError);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">
      {/* ======================================================
          PAGE AUTHORITY HEADER
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#071A3D]">
          <div className="h-1 bg-[#D4AF37]" />

          <div className="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
              Personnel Administration Directorate
            </p>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-300">
                Authorized Administrative Access
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-4xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8860B]">
                Red Stone Employment Agency
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#071A3D] lg:text-4xl">
                Staff Administration
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Central personnel registry for
                appointments, employment records,
                organizational assignments, staff
                identifiers and administrative access
                control.
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <span>
                  Module: Personnel Registry
                </span>

                <span>
                  Classification: Confidential
                </span>

                <span>
                  Records: {totalStaff}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/staff/new"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#071A3D] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#0B2558]"
              >
                + Create Staff
              </Link>

              <Link
                href="/admin/audit"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Audit Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PERSONNEL SUMMARY
      ====================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              Registry Overview
            </p>

            <h2 className="mt-1 text-sm font-black text-[#071A3D]">
              Personnel Status Summary
            </h2>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            Live administrative records
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            label="Total Personnel"
            value={totalStaff}
            description="Registered personnel"
          />

          <MetricCard
            label="Active"
            value={activeStaff}
            description="Authorized accounts"
            tone="green"
          />

          <MetricCard
            label="Inactive"
            value={inactiveStaff}
            description="Inactive / revoked"
            tone="red"
          />

          <MetricCard
            label="Departments"
            value={departmentCount}
            description="Organizational units"
          />

          <MetricCard
            label="Role Classes"
            value={activeRoleCount}
            description="Active classifications"
            tone="gold"
          />

          <MetricCard
            label="ID Pending"
            value={recordsPendingId}
            description="Staff IDs outstanding"
            tone={
              recordsPendingId > 0
                ? "gold"
                : "green"
            }
          />
        </div>
      </section>

      {/* ======================================================
          REGISTRY CONTROLS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
            Registry Controls
          </p>

          <h2 className="mt-1 text-base font-black text-[#071A3D]">
            Personnel Search & Administration
          </h2>
        </div>

        <div className="p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="personnel-search"
                className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500"
              >
                Search Personnel Register
              </label>

              <input
                id="personnel-search"
                type="search"
                placeholder="Search staff name, Staff ID, referral code, role, department or duty station"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </div>

            <div className="flex items-end">
              <Link
                href="/admin/staff/new"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#D4AF37] bg-[#FFF9E8] px-5 text-sm font-black text-[#735500] transition hover:bg-[#FFF2C2]"
              >
                New Personnel Appointment
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <RegistryTag label="All Personnel" />
            <RegistryTag label="Active" />
            <RegistryTag label="Inactive" />
            <RegistryTag label="Recruitment" />
            <RegistryTag label="Human Resources" />
            <RegistryTag label="Finance" />
            <RegistryTag label="Administration" />
          </div>
        </div>
      </section>

      {/* ======================================================
          DATABASE WARNING
      ====================================================== */}

      {hasError ? (
        <section
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4"
        >
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-800">
              !
            </div>

            <div>
              <p className="text-sm font-black text-amber-950">
                Personnel registry data is incomplete
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-800">
                One or more personnel datasets could
                not be loaded. Review database access
                controls or recent schema changes
                before relying on these records for
                administrative decisions.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ======================================================
          OFFICIAL PERSONNEL REGISTER
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Official Personnel Register
              </p>

              <h2 className="mt-1 text-lg font-black text-[#071A3D]">
                Staff Directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Authorized personnel and employment
                classification records.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                Register Count
              </p>

              <p className="mt-1 text-sm font-black text-[#071A3D]">
                {totalStaff}{" "}
                {totalStaff === 1
                  ? "Record"
                  : "Records"}
              </p>
            </div>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#071A3D] to-transparent" />
        </div>

        {staff.length === 0 ? (
          <EmptyPersonnelRegister />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                  <TableHeading>
                    Personnel
                  </TableHeading>

                  <TableHeading>
                    Staff ID
                  </TableHeading>

                  <TableHeading>
                    Designation / Role
                  </TableHeading>

                  <TableHeading>
                    Department
                  </TableHeading>

                  <TableHeading>
                    Duty Station
                  </TableHeading>

                  <TableHeading>
                    Referral Code
                  </TableHeading>

                  <TableHeading>
                    Status
                  </TableHeading>

                  <TableHeading>
                    Appointment
                  </TableHeading>

                  <TableHeading align="right">
                    Administrative Action
                  </TableHeading>
                </tr>
              </thead>

              <tbody>
                {staff.map((member) => {
                  const profile =
                    member.profile;

                  const fullName = text(
                    profile?.full_name,
                    "Staff Member"
                  );

                  const jobTitle = text(
                    profile?.job_title,
                    roleLabel(
                      member.primaryRole?.role
                    )
                  );

                  const systemRole = roleLabel(
                    member.primaryRole?.role
                  );

                  const userId =
                    member.userId;

                  const staffId = text(
                    profile?.staff_id,
                    "Pending"
                  );

                  const referralCode = text(
                    profile?.referral_code,
                    "Pending"
                  );

                  return (
                    <tr
                      key={userId}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#FAFBFD]"
                    >
                      {/* Personnel */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A3D] text-xs font-black tracking-wide text-white shadow-sm">
                            {initials(fullName)}
                          </div>

                          <div className="min-w-0">
                            <Link
                              href={`/admin/staff/${userId}`}
                              className="font-black text-[#071A3D] transition hover:text-[#B8860B]"
                            >
                              {fullName}
                            </Link>

                            <p className="mt-1 text-[10px] font-semibold text-slate-500">
                              {jobTitle}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate font-mono text-[8px] text-slate-400">
                              UID: {userId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Staff ID */}

                      <td className="px-5 py-4">
                        <p
                          className={
                            staffId === "Pending"
                              ? "text-xs font-bold text-amber-700"
                              : "font-mono text-xs font-black text-slate-700"
                          }
                        >
                          {staffId}
                        </p>
                      </td>

                      {/* Role */}

                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-700">
                          {systemRole}
                        </p>

                        {member.activeRoles.length >
                        1 ? (
                          <p className="mt-1 text-[9px] font-semibold text-slate-400">
                            +
                            {member.activeRoles.length -
                              1}{" "}
                            additional{" "}
                            {member.activeRoles.length -
                              1 ===
                            1
                              ? "authorization"
                              : "authorizations"}
                          </p>
                        ) : (
                          <p className="mt-1 text-[9px] text-slate-400">
                            Primary authorization
                          </p>
                        )}
                      </td>

                      {/* Department */}

                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-600">
                          {text(
                            profile?.department
                          )}
                        </p>
                      </td>

                      {/* Duty station */}

                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-600">
                          {text(
                            profile?.duty_station
                          )}
                        </p>
                      </td>

                      {/* Referral */}

                      <td className="px-5 py-4">
                        <p
                          className={
                            referralCode === "Pending"
                              ? "text-xs font-bold text-amber-700"
                              : "font-mono text-xs font-black text-[#8A6300]"
                          }
                        >
                          {referralCode}
                        </p>
                      </td>

                      {/* State */}

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            member.active
                              ? "active"
                              : "inactive"
                          }
                        />

                        <p className="mt-1.5 text-[9px] text-slate-400">
                          {member.active
                            ? "Access authorized"
                            : "Access restricted"}
                        </p>
                      </td>

                      {/* Appointment */}

                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-600">
                          {formatDate(
                            profile?.appointment_date ??
                              member.primaryRole
                                ?.created_at
                          )}
                        </p>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/staff/${userId}`}
                            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-black uppercase tracking-wide text-slate-700 transition hover:bg-slate-50"
                          >
                            Manage
                          </Link>

                          <Link
                            href={`/admin/staff/${userId}/record`}
                            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#071A3D] px-3 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-[#0B2558]"
                          >
                            Record
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {staff.length > 0 ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
            <div className="flex flex-col gap-1 text-[9px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {totalStaff} registered
                personnel record
                {totalStaff === 1 ? "" : "s"}.
              </p>

              <p>
                Access to individual records is
                governed by administrative
                authorization.
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* ======================================================
          ADMINISTRATIVE CONTROL NOTICE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[220px_1fr]">
          <div className="bg-[#071A3D] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Data Classification
            </p>

            <p className="mt-2 text-sm font-black text-white">
              Confidential
            </p>

            <p className="mt-2 text-[10px] leading-5 text-slate-300">
              Internal personnel information
            </p>
          </div>

          <div className="p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#071A3D]">
              Personnel Records Control Notice
            </p>

            <p className="mt-2 max-w-4xl text-[11px] leading-5 text-slate-500">
              Personnel records may contain
              restricted identity, employment and
              authorization information. Access,
              amendments, account status changes and
              role assignments should be performed
              only by authorized administrators and
              retained within the administrative
              audit trail.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  label,
  value,
  description,
  tone = "navy",
}: {
  label: string;
  value: number;
  description: string;
  tone?: "navy" | "green" | "red" | "gold";
}) {
  const toneClasses = {
    navy: "text-[#071A3D]",
    green: "text-emerald-700",
    red: "text-red-700",
    gold: "text-amber-700",
  };

  const borderClasses = {
    navy: "border-t-[#071A3D]",
    green: "border-t-emerald-600",
    red: "border-t-red-600",
    gold: "border-t-[#D4AF37]",
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 border-t-[3px] bg-white p-4 shadow-sm ${borderClasses[tone]}`}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <div className="mt-3 flex items-end justify-between gap-2">
        <p
          className={`text-3xl font-black leading-none ${toneClasses[tone]}`}
        >
          {value}
        </p>

        <span className="text-[8px] font-bold uppercase tracking-wide text-slate-300">
          Live
        </span>
      </div>

      <p className="mt-3 text-[9px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   TABLE HEADING
============================================================ */

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-5 py-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* ============================================================
   REGISTRY TAG
============================================================ */

function RegistryTag({
  label,
}: {
  label: string;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-bold text-slate-600">
      {label}
    </span>
  );
}

/* ============================================================
   EMPTY REGISTER
============================================================ */

function EmptyPersonnelRegister() {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071A3D] text-lg font-black text-[#F2D675] shadow-sm">
        RS
      </div>

      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
        Personnel Registry
      </p>

      <h3 className="mt-2 text-xl font-black text-[#071A3D]">
        No Personnel Records
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
        The personnel register does not currently
        contain staff records. Create an authorized
        staff account to establish the first
        personnel record.
      </p>

      <Link
        href="/admin/staff/new"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#071A3D] px-6 text-sm font-black text-white transition hover:bg-[#0B2558]"
      >
        Create First Staff Account
      </Link>
    </div>
  );
}