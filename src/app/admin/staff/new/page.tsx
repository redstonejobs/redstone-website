import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createStaffAccount } from "@/lib/admin/actions";
import { canManageStaff, requireAdmin } from "@/lib/admin/auth";

/* ============================================================
   RED STONE EMPLOYMENT AGENCY
   INTERNATIONAL HR STAFF ENROLMENT
============================================================ */

const STAFF_ROLES = [
  {
    value: "admin",
    label: "Administrator",
    code: "ADM",
    description:
      "Administrative access to approved management and operational functions.",
  },
  {
    value: "hr",
    label: "Human Resources Officer",
    code: "HR",
    description:
      "Personnel administration, employee records, recruitment and HR operations.",
  },
  {
    value: "finance",
    label: "Finance Officer",
    code: "FIN",
    description:
      "Restricted access to approved payroll, finance and payment functions.",
  },
  {
    value: "recruiter",
    label: "Recruitment Officer",
    code: "REC",
    description:
      "Candidate sourcing, applications, recruitment cases and placement coordination.",
  },
  {
    value: "moderator",
    label: "Moderator",
    code: "MOD",
    description:
      "Restricted operational moderation and administrative support.",
  },
  {
    value: "staff",
    label: "General Staff",
    code: "STF",
    description:
      "Standard employee access limited to assigned operational duties.",
  },
] as const;

/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#071A3D] text-sm font-black text-white">
          {number}
        </div>

        <div>
          <h2 className="text-lg font-black tracking-tight text-[#071A3D]">
            {title}
          </h2>

          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required = false,
  helper,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}

        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children}

      {helper ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100";

const selectClass =
  "h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100";

/* ============================================================
   PAGE
============================================================ */

export default async function CreateStaffPage() {
  const context = await requireAdmin();

  if (!canManageStaff(context)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#071A3D]">
          <div className="h-1 bg-[#D4AF37]" />

          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
              Red Stone Employment Agency
            </p>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Human Resources Information System
            </p>
          </div>
        </div>

        <div className="px-6 py-7 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-blue-800">
                  Employee Onboarding
                </span>

                <span className="rounded-md bg-red-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-red-700">
                  Confidential HR Record
                </span>

                <span className="rounded-md bg-amber-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-800">
                  Authorized Personnel Only
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#071A3D] sm:text-4xl">
                New Employee Enrolment
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Establish an official personnel record, employment terms,
                compensation profile, work schedule and secure system
                authorization for a new Red Stone employee.
              </p>

              <p className="mt-3 text-xs font-semibold text-slate-500">
                Fields marked with{" "}
                <span className="text-red-600">*</span> are mandatory.
              </p>
            </div>

            <Link
              href="/admin/staff"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Return to Staff Register
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          SECURITY NOTICE
      ====================================================== */}

      <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-800">
            !
          </div>

          <div>
            <h2 className="font-black text-red-950">
              Restricted HR Administration
            </h2>

            <p className="mt-1 max-w-4xl text-sm leading-6 text-red-900">
              Personnel information may contain confidential identity,
              employment and compensation information. Access should be
              restricted to authorized administrators and HR personnel.
            </p>
          </div>
        </div>
      </section>

      <form action={createStaffAccount} className="space-y-6">

        {/* ====================================================
            01 — PERSONAL INFORMATION
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="01"
            title="Personal & Identity Information"
            description="Record the employee's legal identity and essential personnel information."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3 lg:p-8">
            <Field label="Full Legal Name" required>
              <input
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Enter employee's full legal name"
                className={inputClass}
              />
            </Field>

            <Field label="Date of Birth">
              <input
                name="date_of_birth"
                type="date"
                className={inputClass}
              />
            </Field>

            <Field label="Gender">
              <select
                name="gender"
                defaultValue=""
                className={selectClass}
              >
                <option value="">Select if recorded</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">
                  Prefer not to say
                </option>
              </select>
            </Field>

            <Field label="National ID / Passport Number">
              <input
                name="identity_number"
                type="text"
                placeholder="Official identity number"
                className={inputClass}
              />
            </Field>

            <Field label="Mobile Number" required>
              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+254..."
                className={inputClass}
              />
            </Field>

            <Field
              label="Personal / Contact Email"
              required
              helper="The employee must be able to access this address for secure account activation."
            >
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="employee@example.com"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ====================================================
            02 — EMPLOYMENT
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="02"
            title="Employment & Organizational Assignment"
            description="Define the employee's position, organizational placement, employment classification and reporting structure."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-3 lg:p-8">
            <Field label="Job Title" required>
              <input
                name="job_title"
                type="text"
                required
                placeholder="e.g. Recruitment Officer"
                className={inputClass}
              />
            </Field>

            <Field label="Department" required>
              <select
                name="department"
                required
                defaultValue=""
                className={selectClass}
              >
                <option value="" disabled>
                  Select department
                </option>

                <option value="management">Management</option>
                <option value="human_resources">
                  Human Resources
                </option>
                <option value="recruitment">Recruitment</option>
                <option value="documentation">Documentation</option>
                <option value="customer_support">
                  Customer Support
                </option>
                <option value="finance">Finance & Accounts</option>
                <option value="compliance">Compliance</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="technology">Technology / IT</option>
                <option value="administration">Administration</option>
              </select>
            </Field>

            <Field label="Duty Station / Branch" required>
              <input
                name="duty_station"
                type="text"
                required
                placeholder="e.g. Kisii Head Office"
                className={inputClass}
              />
            </Field>

            <Field label="Employment Type" required>
              <select
                name="employment_type"
                required
                defaultValue="full_time"
                className={selectClass}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Fixed-Term Contract</option>
                <option value="temporary">Temporary</option>
                <option value="intern">Internship</option>
              </select>
            </Field>

            <Field label="Employment Start Date" required>
              <input
                name="employment_start_date"
                type="date"
                required
                className={inputClass}
              />
            </Field>

            <Field label="Appointment Date">
              <input
                name="appointment_date"
                type="date"
                className={inputClass}
              />
            </Field>

            <Field label="Supervisor / Reporting Officer">
              <input
                name="reporting_officer"
                type="text"
                placeholder="Supervisor's name or position"
                className={inputClass}
              />
            </Field>

            <Field
              label="Probation Period"
              helper="Enter the number of months. Use 0 if no probation applies."
            >
              <input
                name="probation_period_months"
                type="number"
                min="0"
                max="24"
                defaultValue="3"
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* ====================================================
            03 — COMPENSATION
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="03"
            title="Compensation & Payroll Terms"
            description="Record the employee's agreed compensation terms. Access to this information should be restricted to authorized HR and finance personnel."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4 lg:p-8">
            <Field label="Basic Salary">
              <input
                name="salary_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 45000"
                className={inputClass}
              />
            </Field>

            <Field label="Salary Currency">
              <select
                name="salary_currency"
                defaultValue="KES"
                className={selectClass}
              >
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="QAR">QAR — Qatari Riyal</option>
                <option value="SAR">SAR — Saudi Riyal</option>
              </select>
            </Field>

            <Field label="Salary Period">
              <select
                name="salary_period"
                defaultValue="monthly"
                className={selectClass}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </select>
            </Field>

            <Field
              label="Payroll Status"
              helper="The personnel record will initially be created as an active employee record."
            >
              <input
                type="text"
                value="Active Employee"
                readOnly
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-600"
              />
            </Field>
          </div>

          <div className="border-t border-slate-200 bg-amber-50 px-6 py-4 lg:px-8">
            <p className="text-xs leading-5 text-amber-900">
              <strong>Confidential compensation data:</strong> Salary
              information should not be exposed through ordinary staff
              directories or general administrative views.
            </p>
          </div>
        </section>

        {/* ====================================================
            04 — WORK SCHEDULE
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="04"
            title="Working Hours & Schedule"
            description="Define the employee's normal working pattern for attendance, scheduling and HR administration."
          />

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4 lg:p-8">
            <Field label="Working Days Per Week">
              <input
                name="working_days_per_week"
                type="number"
                min="1"
                max="7"
                step="1"
                defaultValue="5"
                className={inputClass}
              />
            </Field>

            <Field label="Working Hours Per Day">
              <input
                name="working_hours_per_day"
                type="number"
                min="1"
                max="24"
                step="0.5"
                defaultValue="8"
                className={inputClass}
              />
            </Field>

            <Field label="Working Hours Per Week">
              <input
                name="working_hours_per_week"
                type="number"
                min="1"
                max="168"
                step="0.5"
                defaultValue="40"
                className={inputClass}
              />
            </Field>

            <Field label="Work Schedule">
              <select
                name="work_schedule"
                defaultValue="monday_friday"
                className={selectClass}
              >
                <option value="monday_friday">
                  Monday – Friday
                </option>

                <option value="monday_saturday">
                  Monday – Saturday
                </option>

                <option value="shift">
                  Shift Schedule
                </option>

                <option value="rotational">
                  Rotational Schedule
                </option>

                <option value="flexible">
                  Flexible Schedule
                </option>

                <option value="remote">
                  Remote Schedule
                </option>

                <option value="hybrid">
                  Hybrid Schedule
                </option>
              </select>
            </Field>
          </div>
        </section>

        {/* ====================================================
            05 — SYSTEM IDENTITY
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="05"
            title="Personnel Identity & Corporate Account"
            description="The HR system will generate official personnel identifiers after successful employee provisioning."
          />

          <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4 lg:p-8">
            {[
              {
                title: "Staff ID",
                value: "RSE-STF-XXXXXX",
                caption: "Generated automatically",
              },
              {
                title: "Referral Code",
                value: "RSE-XXXXXX",
                caption: "Unique personnel reference",
              },
              {
                title: "Account State",
                value: "ACTIVE",
                caption: "Initial HR account state",
              },
              {
                title: "Authentication",
                value: "SECURE INVITATION",
                caption: "Password set by employee",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {item.title}
                </p>

                <p className="mt-3 font-mono text-sm font-black text-[#071A3D]">
                  {item.value}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-6 lg:p-8">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">
                Corporate Email Provisioning
              </p>

              <h3 className="mt-2 font-black text-blue-950">
                Company Email Account
              </h3>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-blue-800">
                A company mailbox such as
                hr@redstone.co.ke can be assigned
                separately after the employee record is created. The
                employee&apos;s accessible contact email above is used for
                secure initial account activation.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            06 — ROLE AUTHORIZATION
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="06"
            title="Role-Based System Authorization"
            description="Assign the employee's primary system role according to their official duties and the principle of least privilege."
          />

          <div className="grid gap-4 p-6 lg:grid-cols-2 lg:p-8">
            {STAFF_ROLES.map((role) => (
              <label
                key={role.value}
                className="group flex cursor-pointer gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#D4AF37] hover:bg-amber-50/30 has-[:checked]:border-[#071A3D] has-[:checked]:bg-blue-50/50 has-[:checked]:shadow-sm"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  required
                  className="mt-1 h-4 w-4 accent-[#071A3D]"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-[#071A3D]">
                      {role.label}
                    </span>

                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-black text-slate-600">
                      {role.code}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {role.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* ====================================================
            07 — NOTIFICATIONS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeader
            number="07"
            title="Employee Notifications & Onboarding"
            description="Review the communications associated with creation of the employee account."
          />

          <div className="grid gap-4 p-6 md:grid-cols-3 lg:p-8">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                Account Invitation
              </p>

              <p className="mt-2 font-black text-emerald-950">
                Secure Email Activation
              </p>

              <p className="mt-2 text-xs leading-5 text-emerald-800">
                A secure account invitation is sent to the employee&apos;s
                registered email address.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-700">
                HR Notification
              </p>

              <p className="mt-2 font-black text-blue-950">
                Personnel Record Created
              </p>

              <p className="mt-2 text-xs leading-5 text-blue-800">
                The employee record, Staff ID and assigned role become part
                of the official personnel registry.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-700">
                Future HR Alerts
              </p>

              <p className="mt-2 font-black text-amber-950">
                Employment Notifications
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-800">
                The HR system can later send probation, contract, leave,
                document and employment-status notifications.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            08 — FINAL AUTHORIZATION
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <SectionHeader
            number="08"
            title="Administrative Authorization"
            description="Confirm the employee appointment, employment terms and system authorization before creating the official personnel account."
          />

          <div className="p-6 lg:p-8">
            <label className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <input
                type="checkbox"
                name="authorization_confirmed"
                value="true"
                required
                className="mt-1 h-4 w-4 accent-amber-700"
              />

              <span>
                <span className="block font-black text-amber-950">
                  HR & Administrative Authorization
                </span>

                <span className="mt-1 block text-sm leading-6 text-amber-900">
                  I confirm that the information entered relates to an
                  authorized Red Stone employee, that the employment terms
                  have been reviewed and that the selected system role is
                  appropriate for the employee&apos;s assigned duties.
                </span>
              </span>
            </label>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs leading-6 text-slate-600">
                <strong className="text-slate-900">
                  Upon authorization:
                </strong>{" "}
                the system will provision the employee account, create the
                personnel profile, generate the Staff ID and referral code,
                assign the selected role, record the administrative action
                and initiate secure account activation.
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-5 text-slate-500">
                Verify all personal, employment, salary and authorization
                information before final submission.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  href="/admin/staff"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-[#071A3D] px-8 text-sm font-black text-white shadow-sm transition hover:bg-[#0B2558] focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Authorize & Create Employee
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <section className="border-t border-slate-200 pt-5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#071A3D]">
          Red Stone Employment Agency
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          Human Resources Information System • Confidential Personnel
          Administration • Authorized Internal Use Only
        </p>
      </section>
    </div>
  );
}
