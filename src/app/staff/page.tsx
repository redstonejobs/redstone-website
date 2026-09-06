import Link from "next/link";
import { redirect } from "next/navigation";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { ReferralLinkCard } from "@/components/staff/referral-link-card";
import { uploadOwnStaffAvatar } from "@/lib/staff/actions";
import { createClient } from "@/utils/supabase/server";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  hr: "Human Resources Officer",
  finance: "Finance Officer",
  recruiter: "Recruitment Officer",
  moderator: "Moderator",
  staff: "Staff Member",
};

const ROLE_PRIORITY = [
  "super_admin",
  "admin",
  "hr",
  "finance",
  "recruiter",
  "moderator",
  "staff",
];

const ROLE_PORTAL_TITLES: Record<string, string> = {
  recruiter: "Recruitment Operations Centre",
  hr: "Human Resources Operations Centre",
  finance: "Finance Operations Centre",
  moderator: "Compliance & Moderation Centre",
  staff: "Staff Operations Centre",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  recruiter:
    "Manage your client portfolio, recruitment pipeline, applications, processing cases and successful placements from one secure staff workspace.",
  hr:
    "Access authorized personnel, employee administration and human-resources operations.",
  finance:
    "Access authorized finance, payment, payroll and reconciliation operations.",
  moderator:
    "Review authorized records, compliance activity and moderation assignments.",
  staff:
    "Access your employment information, personnel account and authorized staff services.",
};

type CompensationRow = {
  monthly_salary: number | string | null;
  salary_currency: string | null;
  pay_frequency: string | null;
  salary_effective_date: string | null;
  bank_payment_status: string | null;
};

export default async function StaffDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/staff");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        profile_type,
        is_active,
        must_change_password,
        staff_id,
        job_title,
        department,
        duty_station,
        avatar_url,
        referral_code,
        reporting_officer,
        appointment_date,
        employment_type
      `
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  if (profile.is_active !== true) {
    redirect("/login?error=account_not_active");
  }

  if (profile.must_change_password === true) {
    redirect("/reset-password?first_login=1");
  }

  if (
    profile.profile_type === "admin" ||
    profile.profile_type === "super_admin"
  ) {
    redirect("/admin");
  }

  if (profile.profile_type !== "staff") {
    redirect("/auth/redirect");
  }

  const { data: staffRoles } = await supabase
    .from("staff_roles")
    .select("role, active")
    .eq("user_id", user.id)
    .eq("active", true);

  const activeRoles =
    staffRoles
      ?.filter((item) => item.active === true)
      .map((item) => item.role)
      .filter((role): role is string => Boolean(role)) ?? [];

  const primaryRole =
    ROLE_PRIORITY.find((role) => activeRoles.includes(role)) ?? "staff";

  const roleLabel =
    ROLE_LABELS[primaryRole] ?? "Staff Member";

  const recruitmentWorkspaceEnabled = profile.profile_type === "staff";

  const fullName =
    profile.full_name || "Staff Member";

  const firstName =
    fullName.trim().split(/\s+/)[0] || "Staff";

  const initials = getInitials(fullName);

  const portalTitle =
    ROLE_PORTAL_TITLES[primaryRole] ??
    "Staff Operations Centre";

  const portalDescription =
    ROLE_DESCRIPTIONS[primaryRole] ??
    ROLE_DESCRIPTIONS.staff;

  const lastSignIn =
    formatDateTime(user.last_sign_in_at);

  /* ============================================================
     COMPENSATION
  ============================================================ */

  const { data: compensationData } = await supabase
    .from("staff_compensation")
    .select(
      `
        monthly_salary,
        salary_currency,
        pay_frequency,
        salary_effective_date,
        bank_payment_status
      `
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const compensation =
    (compensationData as CompensationRow | null) ?? null;

  /* ============================================================
     RECRUITMENT COUNTERS
  ============================================================ */

  const recruitmentMetrics = await loadRecruitmentMetrics(
    supabase,
    user.id
  );

  const salaryDisplay = formatMoney(
    compensation?.monthly_salary,
    compensation?.salary_currency || "KES"
  );

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://redstone.co.ke").replace(/\/+$/, "");
  const referralCode = profile.referral_code || null;
  const referralLink = referralCode
    ? `${siteUrl}/r/${encodeURIComponent(referralCode)}`
    : null;

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      {/* ======================================================
          SECURITY BAR
      ====================================================== */}

      <div className="border-b border-[#D4AF37]/30 bg-[#06162F] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Red Stone Secure Staff Information System
          </p>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AUTHENTICATED SESSION
          </div>
        </div>
      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="bg-[#071A3D] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center">
          <RedstoneLogo
            href="/"
            size="md"
            showText
            subtitle="Staff Operations Portal"
            className="text-white"
            textClassName="text-white"
          />

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
                Authorized Personnel
              </p>

              <p className="mt-1 text-sm font-bold">
                {fullName}
              </p>

              <p className="mt-0.5 text-xs text-slate-300">
                {roleLabel}
              </p>
            </div>

            <StaffAvatar
              src={profile.avatar_url}
              initials={initials}
              size="small"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8">
        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Staff Portal</span>
            <span>/</span>
            <span className="text-[#071A3D]">
              Operations Dashboard
            </span>
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-emerald-700">
            Account Active
          </div>
        </div>

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[#071A3D]/10 bg-white shadow-sm">
          <div className="relative bg-[#071A3D] px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/15 to-transparent" />

            <div className="relative max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                  {roleLabel}
                </span>

                <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-200">
                  Internal Personnel System
                </span>

                <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                  Active
                </span>
              </div>

              <p className="text-sm font-semibold text-[#F2D675]">
                Welcome back, {firstName}
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {portalTitle}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {portalDescription}
              </p>

              {recruitmentWorkspaceEnabled ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/staff/clients"
                    className="rounded-lg bg-[#D4AF37] px-5 py-3 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
                  >
                    Open Client Pipeline
                  </Link>

                  <Link
                    href="/staff/clients#add-client"
                    className="rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white/10"
                  >
                    + Register Client
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* IDENTITY SUMMARY */}

          <div className="grid border-t border-slate-200 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCell
              label="Staff Identification"
              value={
                profile.staff_id ||
                "Pending Assignment"
              }
              subtext="Official personnel identifier"
            />

            <SummaryCell
              label="System Role"
              value={roleLabel}
              subtext="Role-based authorization"
            />

            <SummaryCell
              label="Department"
              value={
                profile.department ||
                "Not assigned"
              }
              subtext="Operational department"
            />

            <SummaryCell
              label="Duty Station"
              value={
                profile.duty_station ||
                "Not assigned"
              }
              subtext="Assigned work location"
              last
            />
          </div>
        </section>

        <div className="mt-7">
          <ReferralLinkCard
            referralCode={referralCode}
            referralLink={referralLink}
          />
        </div>

        {/* ====================================================
            CLIENT PORTFOLIO SNAPSHOT
        ==================================================== */}

        {recruitmentWorkspaceEnabled ? (
          <section className="mt-7">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                  Recruitment Overview
                </p>

                <h2 className="mt-1 text-xl font-black text-[#071A3D]">
                  My Client Portfolio
                </h2>
              </div>

              <Link
                href="/staff/clients"
                className="text-xs font-black uppercase tracking-wide text-[#B8860B] hover:underline"
              >
                View Complete Portfolio →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              <MetricCard
                label="Total Clients"
                value={recruitmentMetrics.total}
                subtext="Portfolio"
              />

              <MetricCard
                label="New Leads"
                value={recruitmentMetrics.leads}
                subtext="Awaiting action"
              />

              <MetricCard
                label="Contacted"
                value={recruitmentMetrics.contacted}
                subtext="Follow-up"
              />

              <MetricCard
                label="Registered"
                value={recruitmentMetrics.registered}
                subtext="Onboarded"
              />

              <MetricCard
                label="Applied"
                value={recruitmentMetrics.applied}
                subtext="Applications"
              />

              <MetricCard
                label="Processing"
                value={recruitmentMetrics.processing}
                subtext="Active cases"
              />

              <MetricCard
                label="Placed"
                value={recruitmentMetrics.placed}
                subtext="Successful"
                success
              />
            </div>
          </section>
        ) : null}

        {/* ====================================================
            MAIN LAYOUT
        ==================================================== */}

        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            {/* ==================================================
                WORKSPACE
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                eyebrow="Authorized Operations"
                title="My Workspace"
                description="Secure operational modules available according to your assigned role."
              />

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {primaryRole === "recruiter" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Candidate Pipeline"
                      description="Open your complete client portfolio and manage recruitment cases."
                      status="Recruitment"
                      href="/staff/clients"
                    />

                    <OperationCard
                      number="02"
                      title="Application Review"
                      description="Review candidates who have progressed to the application stage."
                      status="Applications"
                      href="/staff/clients?status=applied"
                    />

                    <OperationCard
                      number="03"
                      title="Client Follow-Up"
                      description="Continue follow-up with prospects who have already been contacted."
                      status="Follow-Up"
                      href="/staff/clients?status=contacted"
                    />

                    <OperationCard
                      number="04"
                      title="Registered Clients"
                      description="Review clients who have completed registration and onboarding."
                      status="Registered"
                      href="/staff/clients?status=registered"
                    />

                    <OperationCard
                      number="05"
                      title="Processing Cases"
                      description="Monitor candidates whose recruitment cases are actively processing."
                      status="Processing"
                      href="/staff/clients?status=processing"
                    />

                    <OperationCard
                      number="06"
                      title="Successful Placements"
                      description="Review clients who have successfully reached placement."
                      status="Placements"
                      href="/staff/clients?status=placed"
                    />
                  </>
                ) : null}

                {primaryRole === "hr" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Personnel Administration"
                      description="Authorized human-resources personnel administration."
                      status="Personnel"
                    />

                    <OperationCard
                      number="02"
                      title="Employee Records"
                      description="Authorized employee and personnel information."
                      status="Records"
                    />

                    <OperationCard
                      number="03"
                      title="HR Activity"
                      description="Human-resource operational activity and assignments."
                      status="HR"
                    />
                  </>
                ) : null}

                {primaryRole === "finance" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Finance Operations"
                      description="Authorized finance administration and payroll operations."
                      status="Finance"
                    />

                    <OperationCard
                      number="02"
                      title="Payment Review"
                      description="Authorized payment and reconciliation activity."
                      status="Payments"
                    />

                    <OperationCard
                      number="03"
                      title="Financial Records"
                      description="Financial records permitted by your assigned role."
                      status="Records"
                    />
                  </>
                ) : null}

                {primaryRole === "moderator" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Review Queue"
                      description="Authorized moderation and review assignments."
                      status="Moderation"
                    />

                    <OperationCard
                      number="02"
                      title="Compliance Review"
                      description="Operational compliance review activities."
                      status="Compliance"
                    />

                    <OperationCard
                      number="03"
                      title="Activity Review"
                      description="Records assigned to your moderation role."
                      status="Activity"
                    />
                  </>
                ) : null}

                {primaryRole === "staff" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Employment Record"
                      description="Review your identity and current employment assignment."
                      status="Personnel"
                    />

                    <OperationCard
                      number="02"
                      title="Account Security"
                      description="Manage access to your secure staff account."
                      status="Security"
                    />

                    <OperationCard
                      number="03"
                      title="Staff Information"
                      description="Access authorized company staff information."
                      status="Staff"
                    />
                  </>
                ) : null}
              </div>
            </section>

            {/* ==================================================
                EMPLOYMENT + COMPENSATION
            ================================================== */}

            <div className="grid gap-7 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  eyebrow="Personnel Record"
                  title="Employment Assignment"
                  description="Current employment information recorded against your personnel account."
                />

                <dl className="divide-y divide-slate-100 px-6 pb-3">
                  <RecordRow
                    label="Full Name"
                    value={fullName}
                  />

                  <RecordRow
                    label="Staff ID"
                    value={
                      profile.staff_id ||
                      "Pending"
                    }
                  />

                  <RecordRow
                    label="Job Title"
                    value={
                      profile.job_title ||
                      "Not assigned"
                    }
                  />

                  <RecordRow
                    label="Department"
                    value={
                      profile.department ||
                      "Not assigned"
                    }
                  />

                  <RecordRow
                    label="Employment Type"
                    value={formatEmploymentType(
                      profile.employment_type
                    )}
                  />

                  <RecordRow
                    label="Duty Station"
                    value={
                      profile.duty_station ||
                      "Not assigned"
                    }
                  />

                  <RecordRow
                    label="Reporting Officer"
                    value={
                      profile.reporting_officer ||
                      "Not assigned"
                    }
                  />

                  <RecordRow
                    label="Appointment Date"
                    value={formatDate(
                      profile.appointment_date
                    )}
                  />

                  <RecordRow
                    label="System Role"
                    value={roleLabel}
                  />
                </dl>
              </section>

              {/* COMPENSATION */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-[#071A3D] to-[#102D5A] px-6 py-5 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                    Confidential Personnel Information
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Salary & Compensation
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-300">
                    Your authorized compensation record.
                  </p>
                </div>

                <div className="p-6">
                  <div className="rounded-xl border border-[#D4AF37]/30 bg-[#FFFBEB] p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#B8860B]">
                      Monthly Salary
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#071A3D]">
                      {salaryDisplay}
                    </p>

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Confidential — visible only to the employee and authorized management.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <CompensationDetail
                      label="Currency"
                      value={
                        compensation?.salary_currency ||
                        "Not configured"
                      }
                    />

                    <CompensationDetail
                      label="Pay Frequency"
                      value={formatPayFrequency(
                        compensation?.pay_frequency
                      )}
                    />

                    <CompensationDetail
                      label="Effective Date"
                      value={formatDate(
                        compensation?.salary_effective_date
                      )}
                    />

                    <CompensationDetail
                      label="Payroll Status"
                      value={formatPayrollStatus(
                        compensation?.bank_payment_status
                      )}
                    />
                  </div>

                  {!compensation ? (
                    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-bold leading-5 text-amber-800">
                        Compensation has not yet been entered by an authorized HR, Finance or Administrative officer.
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            {/* ==================================================
                SECURITY
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                eyebrow="Account Control"
                title="Security & Access"
                description="Security status for your authenticated Red Stone personnel account."
              />

              <div className="grid gap-4 p-6 md:grid-cols-2">
                <SecurityRow
                  title="Account Status"
                  value="Active"
                  tone="success"
                />

                <SecurityRow
                  title="Password Status"
                  value="Personal password established"
                  tone="success"
                />

                <SecurityRow
                  title="Access Level"
                  value={roleLabel}
                  tone="neutral"
                />

                <SecurityRow
                  title="Last Sign-In"
                  value={lastSignIn}
                  tone="neutral"
                />
              </div>

              <div className="border-t border-slate-100 p-6">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center justify-center rounded-lg border border-[#071A3D] px-5 py-3 text-sm font-black text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
                >
                  Account Recovery & Password Help
                </Link>
              </div>
            </section>
          </div>

          {/* ====================================================
              RIGHT SIDEBAR
          ==================================================== */}

          <aside className="space-y-7">
            {/* STAFF IDENTITY CARD */}

            <section className="overflow-hidden rounded-2xl border border-[#071A3D]/15 bg-white shadow-sm">
              <div className="bg-[#071A3D] px-6 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
                  Official Staff Identity
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Personnel Account
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center text-center">
                  <StaffAvatar
                    src={profile.avatar_url}
                    initials={initials}
                    size="large"
                  />

                  <p className="mt-4 text-lg font-black text-[#071A3D]">
                    {fullName}
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-600">
                    {roleLabel}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {profile.job_title ||
                      "Staff appointment"}
                  </p>
                </div>

                {/* PHOTO UPLOAD */}

                <form
                  action={uploadOwnStaffAvatar}
                  className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#071A3D]">
                    Profile Photograph
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Upload a professional staff photograph. JPG, PNG or WEBP. Maximum 5 MB.
                  </p>

                  <input
                    type="file"
                    name="avatar"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="mt-4 block w-full text-xs font-semibold text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#071A3D] file:px-3 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-[#102D5A]"
                  />

                  <button
                    type="submit"
                    className="mt-4 w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
                  >
                    {profile.avatar_url
                      ? "Change Profile Photo"
                      : "Upload Profile Photo"}
                  </button>
                </form>

                <div className="my-5 h-px bg-slate-200" />

                <div className="space-y-4">
                  <CompactDetail
                    label="Staff ID"
                    value={
                      profile.staff_id ||
                      "Pending"
                    }
                  />

                  <CompactDetail
                    label="Email"
                    value={
                      user.email ||
                      "Not available"
                    }
                  />

                  <CompactDetail
                    label="Department"
                    value={
                      profile.department ||
                      "Not assigned"
                    }
                  />

                  <CompactDetail
                    label="Duty Station"
                    value={
                      profile.duty_station ||
                      "Not assigned"
                    }
                  />

                  <CompactDetail
                    label="Reporting Officer"
                    value={
                      profile.reporting_officer ||
                      "Not assigned"
                    }
                  />
                </div>

                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                    Verified Active Staff Account
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}

            {primaryRole === "recruiter" ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                    Quick Actions
                  </p>

                  <h2 className="mt-1 text-lg font-black text-[#071A3D]">
                    Recruitment Tools
                  </h2>
                </div>

                <div className="space-y-3 p-6">
                  <QuickAction
                    href="/staff/clients#add-client"
                    title="+ Register New Client"
                    primary
                  />

                  <QuickAction
                    href="/staff/clients"
                    title="Open Client Portfolio"
                  />

                  <QuickAction
                    href="/staff/clients?status=processing"
                    title="Processing Cases"
                  />

                  <QuickAction
                    href="/staff/clients?status=placed"
                    title="Successful Placements"
                  />
                </div>
              </section>
            ) : null}

            {/* ACCESS POLICY */}

            <section className="rounded-2xl border border-amber-200 bg-[#FFFBEB] p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Access Control Notice
              </p>

              <h2 className="mt-2 text-lg font-black text-[#071A3D]">
                Role-Based Authorization
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                Your account can access only the modules and records authorized for your assigned Red Stone staff role.
              </p>

              <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
                <p className="text-xs font-bold leading-5 text-slate-700">
                  Staff creation, system configuration, audit controls and privileged administrative operations remain restricted to authorized administrators.
                </p>
              </div>
            </section>

            {/* SUPPORT */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Staff Support
              </p>

              <h2 className="mt-2 text-lg font-black text-[#071A3D]">
                Need assistance?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                If your personnel information, compensation record or system permissions are incorrect, contact an authorized administrator.
              </p>
            </section>
          </aside>
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="mt-8 border-t border-slate-300 py-6">
          <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <p className="font-semibold">
              © Red Stone Employment Agency — Internal Staff System
            </p>

            <p>
              Confidential • Authorized personnel only
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function StaffAvatar({
  src,
  initials,
  size,
}: {
  src?: string | null;
  initials: string;
  size: "small" | "large";
}) {
  const sizeClasses =
    size === "large"
      ? "h-28 w-28 text-2xl"
      : "h-12 w-12 text-sm";

  if (src) {
    return (
      <div
        className={`${sizeClasses} overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white shadow`}
      >
        <img
          src={src}
          alt="Staff profile"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-white font-black text-[#071A3D] shadow`}
    >
      {initials}
    </div>
  );
}

function SummaryCell({
  label,
  value,
  subtext,
  last = false,
}: {
  label: string;
  value: string;
  subtext: string;
  last?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${
        last
          ? ""
          : "border-b border-slate-200 xl:border-b-0 xl:border-r"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-black text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {subtext}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-black text-[#071A3D]">
        {title}
      </h2>

      <p className="mt-1.5 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  success = false,
}: {
  label: string;
  value: number;
  subtext: string;
  success?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        success
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-[0.15em] ${
          success
            ? "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        {subtext}
      </p>
    </div>
  );
}

function OperationCard({
  number,
  title,
  description,
  status,
  href,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#071A3D] text-xs font-black text-[#F2D675]">
          {number}
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-base font-black text-[#071A3D]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#B8860B]">
        {href
          ? "Open Workspace"
          : "Authorized Module"}

        <span aria-hidden="true">
          {href ? "→" : "•"}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 p-5">
      {content}
    </div>
  );
}

function RecordRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-5">
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="font-bold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

function CompensationDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-black text-[#071A3D]">
        {value}
      </p>
    </div>
  );
}

function SecurityRow({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "success" | "neutral";
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>

      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          tone === "success"
            ? "bg-emerald-500"
            : "bg-[#D4AF37]"
        }`}
      />
    </div>
  );
}

function CompactDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  primary = false,
}: {
  href: string;
  title: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-xs font-black uppercase tracking-wide transition ${
        primary
          ? "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
          : "border border-slate-300 bg-white text-[#071A3D] hover:border-[#D4AF37] hover:bg-[#FFFBEB]"
      }`}
    >
      <span>{title}</span>
      <span>→</span>
    </Link>
  );
}

/* ============================================================
   FORMATTERS
============================================================ */

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "RS";
  }

  return parts
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(date);
}

function formatEmploymentType(
  value?: string | null
) {
  const labels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Fixed-Term Contract",
    temporary: "Temporary",
    intern: "Internship",
  };

  return value
    ? labels[value] ?? value
    : "Not specified";
}

function formatPayFrequency(
  value?: string | null
) {
  const labels: Record<string, string> = {
    monthly: "Monthly",
    biweekly: "Biweekly",
    weekly: "Weekly",
    daily: "Daily",
    hourly: "Hourly",
  };

  return value
    ? labels[value] ?? value
    : "Not configured";
}

function formatPayrollStatus(
  value?: string | null
) {
  const labels: Record<string, string> = {
    not_configured: "Not Configured",
    pending: "Pending Verification",
    verified: "Verified",
    on_hold: "On Hold",
  };

  return value
    ? labels[value] ?? value
    : "Not configured";
}

function formatMoney(
  value: number | string | null | undefined,
  currency: string
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not recorded";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Not recorded";
  }

  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }
}

async function loadRecruitmentMetrics(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffUserId: string
) {
  const statuses = [
    "lead",
    "contacted",
    "registered",
    "applied",
    "processing",
    "placed",
  ] as const;

  const [total, ...statusCounts] = await Promise.all([
    countOwnStaffClients(supabase, staffUserId),
    ...statuses.map((status) =>
      countOwnStaffClients(supabase, staffUserId, status)
    ),
  ]);

  return {
    total,
    leads: statusCounts[0] ?? 0,
    contacted: statusCounts[1] ?? 0,
    registered: statusCounts[2] ?? 0,
    applied: statusCounts[3] ?? 0,
    processing: statusCounts[4] ?? 0,
    placed: statusCounts[5] ?? 0,
  };
}

async function countOwnStaffClients(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffUserId: string,
  status?: string
) {
  let query = supabase
    .from("staff_clients")
    .select("id", { count: "exact", head: true })
    .eq("staff_user_id", staffUserId);

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    console.error("[staff] dashboard client count failed", {
      code: error.code ?? null,
      message: error.message,
    });
    return 0;
  }

  return count ?? 0;
}
