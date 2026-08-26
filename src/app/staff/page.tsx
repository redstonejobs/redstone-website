import Link from "next/link";
import { redirect } from "next/navigation";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
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
    "Manage recruitment assignments, candidate follow-up, interviews, documentation and placement activity from your authorized workspace.",
  hr: "Access authorized personnel, employee administration and human-resources operations.",
  finance:
    "Access authorized finance, payment, reconciliation and reporting operations.",
  moderator:
    "Review authorized records, compliance activity and operational moderation tasks.",
  staff:
    "Access your employment information, authorized tools and secure staff account services.",
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
        duty_station
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

  const roleLabel = ROLE_LABELS[primaryRole] ?? "Staff Member";
  const fullName = profile.full_name || "Staff Member";
  const firstName = fullName.trim().split(/\s+/)[0] || "Staff";
  const initials = getInitials(fullName);

  const portalTitle =
    ROLE_PORTAL_TITLES[primaryRole] ?? "Staff Operations Centre";

  const portalDescription =
    ROLE_DESCRIPTIONS[primaryRole] ?? ROLE_DESCRIPTIONS.staff;

  const lastSignIn = formatDateTime(user.last_sign_in_at);

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      {/* TOP SECURITY BAR */}
      <div className="border-b border-[#D4AF37]/30 bg-[#06162F] text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Red Stone Secure Staff Information System
          </p>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AUTHENTICATED SESSION
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-[#071A3D] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center">
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
              <p className="mt-1 text-sm font-bold">{fullName}</p>
              <p className="mt-0.5 text-xs text-slate-300">
                {roleLabel}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-white text-sm font-black text-[#071A3D] shadow">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8">
        {/* BREADCRUMB */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Staff Portal</span>
            <span>/</span>
            <span className="text-[#071A3D]">Operations Dashboard</span>
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-emerald-700">
            Account Active
          </div>
        </div>

        {/* HERO */}
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
            </div>
          </div>

          {/* IDENTITY SUMMARY */}
          <div className="grid border-t border-slate-200 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCell
              label="Staff Identification"
              value={profile.staff_id || "Pending Assignment"}
              subtext="Official personnel identifier"
            />

            <SummaryCell
              label="System Role"
              value={roleLabel}
              subtext="Role-based authorization"
            />

            <SummaryCell
              label="Department"
              value={profile.department || "Not assigned"}
              subtext="Operational department"
            />

            <SummaryCell
              label="Duty Station"
              value={profile.duty_station || "Not assigned"}
              subtext="Assigned work location"
              last
            />
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            {/* WORKSPACE */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <SectionHeader
                eyebrow="Authorized Operations"
                title="My Workspace"
                description="Operational modules displayed according to your assigned staff role."
              />

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {primaryRole === "recruiter" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Candidate Pipeline"
                      description="Track assigned candidates through recruitment and placement stages."
                      status="Recruitment"
                    />

                    <OperationCard
                      number="02"
                      title="Application Review"
                      description="Review assigned applications and follow up on outstanding information."
                      status="Applications"
                    />

                    <OperationCard
                      number="03"
                      title="Interview Coordination"
                      description="Coordinate candidate interviews and recruitment follow-up."
                      status="Interviews"
                    />

                    <OperationCard
                      number="04"
                      title="Document Follow-up"
                      description="Monitor documentation required for assigned recruitment cases."
                      status="Documents"
                    />

                    <OperationCard
                      number="05"
                      title="Placement Tracking"
                      description="Follow candidate placement activity and authorized case progress."
                      status="Placements"
                    />

                    <OperationCard
                      number="06"
                      title="Recruitment Activity"
                      description="Review your authorized recruitment workload and recent activity."
                      status="Activity"
                    />
                  </>
                ) : null}

                {primaryRole === "hr" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Personnel Administration"
                      description="Access authorized staff and personnel administration activities."
                      status="Personnel"
                    />
                    <OperationCard
                      number="02"
                      title="Employee Records"
                      description="Review authorized employment and personnel information."
                      status="Records"
                    />
                    <OperationCard
                      number="03"
                      title="HR Activity"
                      description="Track authorized human-resource operational activity."
                      status="HR"
                    />
                  </>
                ) : null}

                {primaryRole === "finance" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Finance Operations"
                      description="Access authorized financial administration activities."
                      status="Finance"
                    />
                    <OperationCard
                      number="02"
                      title="Payment Review"
                      description="Review authorized payment and reconciliation activity."
                      status="Payments"
                    />
                    <OperationCard
                      number="03"
                      title="Financial Records"
                      description="Access financial records permitted by your assigned role."
                      status="Records"
                    />
                  </>
                ) : null}

                {primaryRole === "moderator" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Review Queue"
                      description="Access authorized moderation and review assignments."
                      status="Moderation"
                    />
                    <OperationCard
                      number="02"
                      title="Compliance Review"
                      description="Review authorized operational compliance activity."
                      status="Compliance"
                    />
                    <OperationCard
                      number="03"
                      title="Activity Review"
                      description="Monitor records assigned to your moderation role."
                      status="Activity"
                    />
                  </>
                ) : null}

                {primaryRole === "staff" ? (
                  <>
                    <OperationCard
                      number="01"
                      title="Employment Record"
                      description="Review your staff identity and current employment assignment."
                      status="Personnel"
                    />
                    <OperationCard
                      number="02"
                      title="Account Security"
                      description="Manage access to your secure Red Stone staff account."
                      status="Security"
                    />
                    <OperationCard
                      number="03"
                      title="Staff Information"
                      description="Access authorized company staff information and services."
                      status="Staff"
                    />
                  </>
                ) : null}
              </div>
            </section>

            {/* ACCOUNT & EMPLOYMENT */}
            <div className="grid gap-7 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  eyebrow="Personnel Record"
                  title="Employment Assignment"
                  description="Current employment information recorded against your staff account."
                />

                <dl className="divide-y divide-slate-100 px-6 pb-3">
                  <RecordRow label="Full Name" value={fullName} />
                  <RecordRow
                    label="Staff ID"
                    value={profile.staff_id || "Pending"}
                  />
                  <RecordRow
                    label="Job Title"
                    value={profile.job_title || "Not assigned"}
                  />
                  <RecordRow
                    label="Department"
                    value={profile.department || "Not assigned"}
                  />
                  <RecordRow
                    label="Duty Station"
                    value={profile.duty_station || "Not assigned"}
                  />
                  <RecordRow label="System Role" value={roleLabel} />
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SectionHeader
                  eyebrow="Account Control"
                  title="Security & Access"
                  description="Security status for your authenticated staff account."
                />

                <div className="space-y-4 p-6">
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

                  <div className="pt-2">
                    <Link
                      href="/forgot-password"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-[#071A3D] px-4 py-3 text-sm font-black text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
                    >
                      Account Recovery & Password Help
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-7">
            {/* STAFF ID CARD */}
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
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#071A3D] text-xl font-black text-[#F2D675]">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-black text-[#071A3D]">
                      {fullName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <div className="my-5 h-px bg-slate-200" />

                <div className="space-y-4">
                  <CompactDetail
                    label="Staff ID"
                    value={profile.staff_id || "Pending"}
                  />
                  <CompactDetail
                    label="Email"
                    value={user.email || "Not available"}
                  />
                  <CompactDetail
                    label="Department"
                    value={profile.department || "Not assigned"}
                  />
                  <CompactDetail
                    label="Duty Station"
                    value={profile.duty_station || "Not assigned"}
                  />
                </div>

                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                    Verified Active Staff Account
                  </p>
                </div>
              </div>
            </section>

            {/* ACCESS POLICY */}
            <section className="rounded-2xl border border-amber-200 bg-[#FFFBEB] p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Access Control Notice
              </p>

              <h2 className="mt-2 text-lg font-black text-[#071A3D]">
                Role-Based Authorization
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                Your account can access only the modules and records authorized
                for your assigned Red Stone staff role.
              </p>

              <div className="mt-4 rounded-lg border border-amber-200 bg-white p-4">
                <p className="text-xs font-bold leading-5 text-slate-700">
                  Administrative functions, staff creation, security
                  configuration and privileged system controls remain
                  restricted to authorized administrators.
                </p>
              </div>
            </section>

            {/* SUPPORT */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Staff Support
              </p>

              <h2 className="mt-2 text-lg font-black text-[#071A3D]">
                Need account assistance?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                If your personnel information is incorrect or your account
                permissions do not match your assignment, contact an authorized
                administrator.
              </p>
            </section>
          </aside>
        </div>

        {/* FOOTER */}
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
        last ? "" : "border-b border-slate-200 xl:border-b-0 xl:border-r"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-base font-black text-[#071A3D]">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{subtext}</p>
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
      <h2 className="mt-1 text-xl font-black text-[#071A3D]">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function OperationCard({
  number,
  title,
  description,
  status,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#071A3D] text-xs font-black text-[#F2D675]">
          {number}
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-600">
          {status}
        </span>
      </div>

      <h3 className="mt-5 text-base font-black text-[#071A3D]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#B8860B]">
        Authorized Workspace
        <span aria-hidden="true">→</span>
      </div>
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
    <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="font-bold text-slate-900">{value}</dd>
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
        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
      </div>

      <span
        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
          tone === "success" ? "bg-emerald-500" : "bg-[#D4AF37]"
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

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "RS";
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function formatDateTime(value?: string | null) {
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