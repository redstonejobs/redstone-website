import Image from "next/image";
import { notFound } from "next/navigation";

import { StaffRecordActions } from "@/components/admin/staff-record-actions";
import { requireAdmin } from "@/lib/admin/auth";
import { fetchStaffRecord } from "@/lib/admin/data";

type PageProps = {
  params: Promise<{ id: string }>;
};

function value(
  row: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback = "Not recorded"
) {
  if (!row) return fallback;

  for (const key of keys) {
    const current = row[key];

    if (
      typeof current === "string" &&
      current.trim().length > 0
    ) {
      return current.trim();
    }

    if (typeof current === "number") {
      return String(current);
    }
  }

  return fallback;
}

function formatDate(raw: unknown) {
  if (typeof raw !== "string" || !raw) {
    return "Not recorded";
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    moderator: "Moderator",
    recruiter: "Recruitment Officer",
    hr: "Human Resources Officer",
    finance: "Finance Officer",
    staff: "Staff Member",
  };

  return labels[role] ?? role.replaceAll("_", " ");
}

function roleCode(role: string) {
  const codes: Record<string, string> = {
    super_admin: "SADM",
    admin: "ADM",
    moderator: "MOD",
    recruiter: "REC",
    hr: "HR",
    finance: "FIN",
    staff: "STF",
  };

  return codes[role] ?? "STF";
}

function RecordField({
  label,
  value: fieldValue,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 min-h-8 break-words border-b border-slate-200 pb-2 text-sm font-semibold text-slate-950">
        {fieldValue}
      </p>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-[#071A3D] pb-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#071A3D] text-xs font-black text-white">
        {number}
      </div>

      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.1em] text-[#071A3D]">
          {title}
        </h2>

        <p className="mt-0.5 text-[10px] text-slate-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default async function StaffPersonnelRecordPage({
  params,
}: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const {
    profile,
    primaryRole,
    activeRoles,
    error,
  } = await fetchStaffRecord(id);

  if (error || !profile) {
    notFound();
  }

  const primaryRoleName = value(
    primaryRole,
    ["role"],
    "staff"
  );

  const active =
    profile.is_active !== false &&
    primaryRole?.active !== false;

  const fullName = value(
    profile,
    ["full_name"],
    "Staff Member"
  );

  /*
   * These fields are read safely from select("*").
   * If your database does not yet have them, the UI displays
   * "Not assigned" / "Not recorded" instead of inventing data.
   */
  const staffId = value(
    profile,
    ["staff_id", "employee_number"],
    "Not assigned"
  );

  const referralCode = value(
    profile,
    ["referral_code"],
    "Not assigned"
  );

  const jobTitle = value(
    profile,
    ["job_title", "position"],
    roleLabel(primaryRoleName)
  );

  const department = value(
    profile,
    ["department"],
    "Not recorded"
  );

  const employmentType = value(
    profile,
    ["employment_type"],
    "Not recorded"
  );

  const dutyStation = value(
    profile,
    ["duty_station", "office", "city"],
    "Not recorded"
  );

  const identityNumber = value(
    profile,
    ["identity_number", "national_id", "passport_number"],
    "Not recorded"
  );

  const phone = value(
    profile,
    ["phone"],
    "Not recorded"
  );

  const appointmentDate = formatDate(
    profile.appointment_date ??
      profile.created_at
  );

  const dateOfBirth = formatDate(
    profile.date_of_birth
  );

  const supervisor = value(
    profile,
    ["supervisor", "reporting_officer"],
    "Not recorded"
  );

  const photoUrl = value(
    profile,
    ["avatar_url", "photo_url"],
    ""
  );

  const record = {
    recordId: id,
    staffId,
    referralCode,
    fullName,
    phone,
    identityNumber,
    dateOfBirth,
    jobTitle,
    department,
    employmentType,
    dutyStation,
    appointmentDate,
    supervisor,
    role: roleLabel(primaryRoleName),
    roleCode: roleCode(primaryRoleName),
    accountStatus: active ? "Active" : "Inactive",
    loginProvisioning: "Secure account access",
  };

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 sm:px-4 sm:py-6 print:bg-white print:p-0">
      <StaffRecordActions record={record} />

      <article className="mx-auto min-h-[297mm] max-w-[210mm] overflow-hidden bg-white shadow-xl print:min-h-0 print:max-w-none print:shadow-none">
        <div className="flex items-center justify-between gap-4 bg-[#071A3D] px-6 py-3 text-white sm:px-[14mm]">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] sm:text-[10px]">
            Red Stone Employment Agency
          </p>

          <p className="text-right text-[8px] font-bold uppercase tracking-wider text-amber-300 sm:text-[9px]">
            Staff Administration System
          </p>
        </div>

        <div className="p-6 sm:p-[14mm] print:p-[12mm]">
          <header className="border-b-4 border-amber-500 pb-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Image
                src="/images/redstone-logo.png"
                alt="Red Stone Employment Agency"
                width={100}
                height={100}
                priority
                className="h-24 w-24 shrink-0 object-contain sm:h-[100px] sm:w-[100px]"
              />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">
                  Red Stone Employment Agency
                </p>

                <h1 className="mt-2 text-2xl font-black uppercase leading-tight tracking-tight text-[#071A3D]">
                  Official Staff Personnel Record
                </h1>

                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Staff Administration & Personnel Registry
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Internal Personnel Documentation
                </p>
              </div>

              <div className="w-fit rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:text-right">
                <p className="text-xs font-black uppercase tracking-wide text-red-700">
                  Confidential
                </p>

                <p className="mt-1 text-[9px] font-semibold uppercase text-red-600">
                  Restricted Record
                </p>
              </div>
            </div>
          </header>

          <section className="mt-5 grid overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:grid-cols-4">
            <ControlField
              label="Record Reference"
              value={id}
              mono
            />

            <ControlField
              label="Classification"
              value="INTERNAL"
              tone="red"
            />

            <ControlField
              label="Record Status"
              value={active ? "ACTIVE" : "INACTIVE"}
              tone={active ? "green" : "red"}
            />

            <ControlField
              label="Document Type"
              value="PERSONNEL"
            />
          </section>

          <section className="mt-8">
            <SectionHeader
              number="01"
              title="Staff Identification"
              subtitle="Official personnel identification information"
            />

            <div className="mt-5 grid gap-6 md:grid-cols-[145px_1fr]">
              <div>
                <div className="flex h-[175px] items-center justify-center overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt={`${fullName} staff photograph`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-2xl font-black text-slate-400">
                        {fullName
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <p className="mt-4 text-[9px] font-black uppercase tracking-wide text-slate-400">
                        Staff Photograph
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-3 rounded-md px-3 py-2 text-center ${
                    active
                      ? "bg-[#071A3D]"
                      : "bg-slate-500"
                  }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-wide text-white">
                    {active
                      ? "Active Personnel"
                      : "Inactive Personnel"}
                  </p>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <RecordField
                  label="Staff ID"
                  value={staffId}
                />

                <RecordField
                  label="Referral Code"
                  value={referralCode}
                />

                <RecordField
                  label="Full Legal Name"
                  value={fullName}
                />

                <RecordField
                  label="Mobile Number"
                  value={phone}
                />

                <RecordField
                  label="National ID / Passport"
                  value={identityNumber}
                />

                <RecordField
                  label="Date of Birth"
                  value={dateOfBirth}
                />

                <RecordField
                  label="Profile Type"
                  value={value(
                    profile,
                    ["profile_type"],
                    "staff"
                  )}
                />

                <RecordField
                  label="Personnel Status"
                  value={active ? "Active" : "Inactive"}
                />
              </div>
            </div>
          </section>

          <section className="mt-9">
            <SectionHeader
              number="02"
              title="Employment Information"
              subtitle="Appointment, department and duty assignment"
            />

            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <RecordField
                label="Job Title"
                value={jobTitle}
              />

              <RecordField
                label="Department"
                value={department}
              />

              <RecordField
                label="Employment Type"
                value={employmentType}
              />

              <RecordField
                label="Duty Station"
                value={dutyStation}
              />

              <RecordField
                label="Date of Appointment"
                value={appointmentDate}
              />

              <RecordField
                label="Reporting Officer"
                value={supervisor}
              />
            </div>
          </section>

          <section className="mt-9">
            <SectionHeader
              number="03"
              title="System Access & Authorization"
              subtitle="Internal access classification and account controls"
            />

            <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <RecordField
                label="Assigned System Role"
                value={roleLabel(primaryRoleName)}
              />

              <RecordField
                label="Role Code"
                value={roleCode(primaryRoleName)}
              />

              <RecordField
                label="Account State"
                value={active ? "Active" : "Inactive"}
              />

              <RecordField
                label="Active Role Count"
                value={String(activeRoles.length)}
              />

              <RecordField
                label="Access Model"
                value="Role-Based Access Control"
              />

              <RecordField
                label="Security Classification"
                value="Internal Staff"
              />
            </div>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-800">
                Access Control Notice
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-950">
                System access is granted according to the employee&apos;s
                authorized duties and the principle of least privilege.
                Access may be amended, suspended or revoked by authorized
                Red Stone administrators.
              </p>
            </div>
          </section>

          <section className="mt-9">
            <SectionHeader
              number="04"
              title="Administrative Authorization"
              subtitle="Official approval and personnel-record authorization"
            />

            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              <SignatureBlock
                title="Authorized Officer Signature"
                subtitle="Staff Administration / Human Resources"
              />

              <SignatureBlock
                title="Official Stamp"
                subtitle="Red Stone Employment Agency"
              />
            </div>
          </section>

          <section className="mt-9 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black text-red-700">
                !
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-red-800">
                  Information Security Notice
                </p>

                <p className="mt-2 text-[10px] leading-5 text-red-900">
                  This personnel record is confidential. It must never contain
                  passwords, one-time passwords, password-reset links, session
                  tokens, API credentials or other authentication secrets.
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-10 border-t-2 border-[#071A3D] pt-5">
            <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#071A3D]">
                  Red Stone Employment Agency
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  P.O. Box 2400-40200, Kisii, Kenya
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[9px] font-black uppercase tracking-wide text-red-700">
                  Confidential Personnel Record
                </p>

                <p className="mt-1 text-[9px] text-slate-500">
                  For authorized administrative use only
                </p>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}

function ControlField({
  label,
  value,
  mono = false,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "red" | "green";
}) {
  return (
    <div className="border-b border-slate-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 break-all text-xs font-black ${
          mono ? "font-mono" : ""
        } ${
          tone === "red"
            ? "text-red-700"
            : tone === "green"
              ? "text-emerald-700"
              : "text-[#071A3D]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SignatureBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="h-20" />

      <div className="border-t border-slate-500 pt-2">
        <p className="text-xs font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[10px] text-slate-500">
          {subtitle}
        </p>

        <p className="mt-3 text-[10px] text-slate-400">
          Date: ______________________
        </p>
      </div>
    </div>
  );
}