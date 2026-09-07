import Link from "next/link";
import { redirect } from "next/navigation";

import { ReferralLinkCard } from "@/components/staff/referral-link-card";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

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
] as const;

type StaffProfile = {
  id: string;
  full_name: string | null;
  profile_type: string | null;
  is_active: boolean | null;
  must_change_password: boolean | null;
  staff_id: string | null;
  job_title: string | null;
  department: string | null;
  duty_station: string | null;
  referral_code: string | null;
  reporting_officer: string | null;
  appointment_date: string | null;
  employment_type: string | null;
  avatar_url: string | null;
};

type StaffRoleRow = {
  role: string | null;
  active: boolean | null;
};

type CompensationRow = {
  monthly_salary: number | string | null;
  salary_currency: string | null;
  pay_frequency: string | null;
  salary_effective_date: string | null;
  bank_payment_status: string | null;
};

type DashboardMetrics = {
  total: number;
  leads: number;
  contacted: number;
  registered: number;
  applied: number;
  processing: number;
  placed: number;
  positive: number;
};

export default async function StaffDashboardPage() {
  const user = await loadAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/staff");
  }

  let admin: ReturnType<typeof createAdminClient>;

  try {
    admin = createAdminClient();
  } catch (error) {
    console.error("[staff] privileged dashboard client unavailable", safeError(error));
    return <StaffDashboardUnavailable reference="STAFF-CONFIG" />;
  }

  const [profile, staffRoles, compensation, recruitmentMetrics] = await Promise.all([
    loadStaffProfile(admin, user.id),
    loadStaffRoles(admin, user.id),
    loadCompensation(admin, user.id),
    loadRecruitmentMetrics(admin, user.id),
  ]);

  if (!profile) {
    return <StaffDashboardUnavailable reference="STAFF-PROFILE" />;
  }

  if (profile.is_active !== true) {
    redirect("/login?error=account_not_active");
  }

  if (profile.must_change_password === true) {
    redirect("/reset-password?first_login=1");
  }

  if (profile.profile_type === "admin" || profile.profile_type === "super_admin") {
    redirect("/admin");
  }

  if (profile.profile_type !== "staff") {
    redirect("/auth/redirect");
  }

  const activeRoles = staffRoles
    .filter((row) => row.active === true && typeof row.role === "string")
    .map((row) => row.role as string);
  const primaryRole =
    ROLE_PRIORITY.find((role) => activeRoles.includes(role)) ?? "staff";
  const roleLabel = ROLE_LABELS[primaryRole] ?? "Staff Member";
  const fullName = profile.full_name?.trim() || "Staff Member";
  const firstName = fullName.split(/\s+/)[0] || "Staff";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://redstone.co.ke").replace(/\/+$/, "");
  const referralCode = profile.referral_code || null;
  const referralLink = referralCode
    ? `${siteUrl}/r/${encodeURIComponent(referralCode)}`
    : null;

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      <section className="bg-[#071A3D] text-white shadow-sm">
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
                Red Stone Employment Agency
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Secure staff operations dashboard for client recruitment, applications,
                follow-up and personnel information.
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#F2D675]">
                Authorized Staff
              </p>
              <p className="mt-1 text-sm font-black">{fullName}</p>
              <p className="mt-1 text-xs text-slate-300">{roleLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Quick Operations
            </p>
            <h2 className="mt-1 text-xl font-black text-[#071A3D]">Staff Action Centre</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <ActionButton href="/staff/clients" label="My Clients" primary />
            <ActionButton href="/staff/applications" label="Applications" />
            <ActionButton href="/staff/clients#add-client" label="+ Register Client" />
            <ActionButton href="/staff/clients?status=contacted" label="Follow-Up" />
            <ActionButton href="/staff/clients?status=processing" label="Processing" />
            <ActionButton href="/staff/clients?status=placed" label="Placements" />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Recruitment Overview
              </p>
              <h2 className="mt-1 text-xl font-black text-[#071A3D]">My Client Portfolio</h2>
            </div>
            <Link href="/staff/clients" className="text-xs font-black uppercase tracking-wide text-[#B8860B] hover:underline">
              Open complete portfolio →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <MetricCard label="Total" value={recruitmentMetrics.total} />
            <MetricCard label="New Leads" value={recruitmentMetrics.leads} />
            <MetricCard label="Contacted" value={recruitmentMetrics.contacted} />
            <MetricCard label="Registered" value={recruitmentMetrics.registered} />
            <MetricCard label="Applied" value={recruitmentMetrics.applied} />
            <MetricCard label="Processing" value={recruitmentMetrics.processing} />
            <MetricCard label="Placed" value={recruitmentMetrics.placed} />
            <MetricCard label="Positive Clients" value={recruitmentMetrics.positive} success />
          </div>
        </section>

        <div className="mt-7">
          <ReferralLinkCard referralCode={referralCode} referralLink={referralLink} />
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader eyebrow="Personnel Record" title="Employment Assignment" />
            <dl className="divide-y divide-slate-100 px-6 pb-2">
              <RecordRow label="Full Name" value={fullName} />
              <RecordRow label="Staff ID" value={profile.staff_id || "Pending assignment"} />
              <RecordRow label="Job Title" value={profile.job_title || "Not assigned"} />
              <RecordRow label="Department" value={profile.department || "Not assigned"} />
              <RecordRow label="Duty Station" value={profile.duty_station || "Not assigned"} />
              <RecordRow label="Reporting Officer" value={profile.reporting_officer || "Not assigned"} />
              <RecordRow label="Employment Type" value={formatEmploymentType(profile.employment_type)} />
              <RecordRow label="Appointment Date" value={formatDate(profile.appointment_date)} />
              <RecordRow label="System Role" value={roleLabel} />
            </dl>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader eyebrow="Confidential Personnel Information" title="Salary & Account" />
            <div className="p-6">
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#FFFBEB] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#B8860B]">
                  Monthly Salary
                </p>
                <p className="mt-2 text-3xl font-black text-[#071A3D]">
                  {formatMoney(compensation?.monthly_salary, compensation?.salary_currency || "KES")}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Confidential — visible only inside the secure staff portal.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Pay Frequency" value={formatPayFrequency(compensation?.pay_frequency)} />
                <InfoTile label="Payroll Status" value={formatPayrollStatus(compensation?.bank_payment_status)} />
                <InfoTile label="Effective Date" value={formatDate(compensation?.salary_effective_date)} />
                <InfoTile label="Account Status" value="Active" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/forgot-password"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#071A3D] px-4 text-sm font-black text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
                >
                  Password Help
                </Link>
                <Link
                  href="/staff/applications"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#071A3D] px-4 text-sm font-black text-white transition hover:bg-[#102D5A]"
                >
                  Open Applications
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            System Status
          </p>
          <h2 className="mt-1 text-lg font-black text-[#071A3D]">Staff account active</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Optional dashboard statistics are fail-safe. A temporary reporting or payroll query failure will show a fallback value instead of crashing the entire staff portal.
          </p>
        </section>
      </div>
    </main>
  );
}

async function loadAuthenticatedUser() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      if (error) {
        console.error("[staff] authenticated user lookup failed", {
          code: error.name ?? null,
          message: error.message,
        });
      }
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("[staff] authenticated user lookup threw", safeError(error));
    return null;
  }
}

async function loadStaffProfile(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<StaffProfile | null> {
  try {
    const { data, error } = await admin
      .from("profiles")
      .select(
        "id, full_name, profile_type, is_active, must_change_password, staff_id, job_title, department, duty_station, referral_code, reporting_officer, appointment_date, employment_type, avatar_url",
      )
      .eq("id", userId)
      .maybeSingle<StaffProfile>();

    if (error) {
      console.error("[staff] dashboard profile load failed", {
        code: error.code ?? null,
        message: error.message,
      });
      return null;
    }

    return data ?? null;
  } catch (error) {
    console.error("[staff] dashboard profile load threw", safeError(error));
    return null;
  }
}

async function loadStaffRoles(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<StaffRoleRow[]> {
  try {
    const { data, error } = await admin
      .from("staff_roles")
      .select("role, active")
      .eq("user_id", userId)
      .eq("active", true)
      .returns<StaffRoleRow[]>();

    if (error) {
      console.error("[staff] dashboard role load failed", {
        code: error.code ?? null,
        message: error.message,
      });
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("[staff] dashboard role load threw", safeError(error));
    return [];
  }
}

async function loadCompensation(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<CompensationRow | null> {
  try {
    const { data, error } = await admin
      .from("staff_compensation")
      .select("monthly_salary, salary_currency, pay_frequency, salary_effective_date, bank_payment_status")
      .eq("user_id", userId)
      .maybeSingle<CompensationRow>();

    if (error) {
      console.error("[staff] dashboard compensation load failed", {
        code: error.code ?? null,
        message: error.message,
      });
      return null;
    }

    return data ?? null;
  } catch (error) {
    console.error("[staff] dashboard compensation load threw", safeError(error));
    return null;
  }
}

async function loadRecruitmentMetrics(
  supabase: ReturnType<typeof createAdminClient>,
  staffUserId: string,
): Promise<DashboardMetrics> {
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
    ...statuses.map((status) => countOwnStaffClients(supabase, staffUserId, status)),
  ]);

  const positive = await countOwnStaffClients(
    supabase,
    staffUserId,
    undefined,
    "completed",
  );

  return {
    total,
    leads: statusCounts[0] ?? 0,
    contacted: statusCounts[1] ?? 0,
    registered: statusCounts[2] ?? 0,
    applied: statusCounts[3] ?? 0,
    processing: statusCounts[4] ?? 0,
    placed: statusCounts[5] ?? 0,
    positive,
  };
}

async function countOwnStaffClients(
  supabase: ReturnType<typeof createAdminClient>,
  staffUserId: string,
  status?: string,
  medicalStatus?: string,
) {
  try {
    let query = supabase
      .from("staff_clients")
      .select("id", { count: "exact", head: true })
      .eq("staff_user_id", staffUserId);

    if (status) {
      query = query.eq("status", status);
    }

    if (medicalStatus) {
      query = query.eq("medical_status", medicalStatus);
    }

    const { count, error } = await query;

    if (error) {
      console.error("[staff] dashboard client count failed", {
        status: status ?? null,
        medicalStatus: medicalStatus ?? null,
        code: error.code ?? null,
        message: error.message,
      });
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("[staff] dashboard client count threw", {
      status: status ?? null,
      medicalStatus: medicalStatus ?? null,
      ...safeError(error),
    });
    return 0;
  }
}

function StaffDashboardUnavailable({ reference }: { reference: string }) {
  return (
    <main className="min-h-[70vh] bg-[#EEF1F5] px-5 py-10 sm:px-8">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="bg-[#071A3D] px-6 py-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
            Red Stone Staff Portal
          </p>
          <h1 className="mt-2 text-2xl font-black">Dashboard data is temporarily unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Your account remains protected. Use one of the staff workspaces below or retry the dashboard shortly.
          </p>
        </div>
        <div className="p-6">
          <p className="font-mono text-xs text-slate-500">Reference: {reference}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/staff" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#D4AF37] px-4 text-sm font-black text-[#071A3D]">
              Retry Dashboard
            </Link>
            <Link href="/staff/clients" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#071A3D] px-4 text-sm font-black text-[#071A3D]">
              My Clients
            </Link>
            <Link href="/staff/applications" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-black text-slate-700">
              Applications
            </Link>
            <Link href="/forgot-password" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-black text-slate-700">
              Account Help
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionButton({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-center text-xs font-black uppercase tracking-wide transition ${
        primary
          ? "bg-[#D4AF37] text-[#071A3D] hover:bg-[#F2D675]"
          : "border border-slate-300 bg-white text-[#071A3D] hover:border-[#D4AF37] hover:bg-[#FFFBEB]"
      }`}
    >
      {label}
    </Link>
  );
}

function MetricCard({ label, value, success = false }: { label: string; value: number; success?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${success ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.14em] ${success ? "text-emerald-700" : "text-slate-500"}`}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#071A3D]">{value}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-slate-200 px-6 py-5">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black text-[#071A3D]">{title}</h2>
    </div>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[170px_1fr] sm:gap-5">
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="font-bold text-slate-900">{value}</dd>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-black text-[#071A3D]">{value}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not recorded";
  return parsed.toISOString().slice(0, 10);
}

function formatEmploymentType(value?: string | null) {
  const labels: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Fixed-Term Contract",
    temporary: "Temporary",
    intern: "Internship",
  };
  return value ? labels[value] ?? value : "Not recorded";
}

function formatPayFrequency(value?: string | null) {
  const labels: Record<string, string> = {
    monthly: "Monthly",
    biweekly: "Biweekly",
    weekly: "Weekly",
    daily: "Daily",
    hourly: "Hourly",
  };
  return value ? labels[value] ?? value : "Not configured";
}

function formatPayrollStatus(value?: string | null) {
  const labels: Record<string, string> = {
    not_configured: "Not Configured",
    pending: "Pending Verification",
    verified: "Verified",
    on_hold: "On Hold",
  };
  return value ? labels[value] ?? value : "Not configured";
}

function formatMoney(value: number | string | null | undefined, currency: string) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not recorded";
  const fixed = amount.toFixed(2);
  const [whole, decimals] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${grouped}.${decimals}`;
}

function safeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  return { name: "UnknownError", message: "Unknown dashboard error" };
}
