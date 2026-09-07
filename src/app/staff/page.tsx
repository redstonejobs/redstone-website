import Link from "next/link";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  finance: "Finance Officer",
  hr: "Human Resources Officer",
  recruiter: "Recruitment Officer",
  moderator: "Moderator",
  staff: "Staff Member",
};

const secondaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-center text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:border-[#D4AF37] hover:bg-[#FFFBEB]";

const primaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[#D4AF37] px-4 text-center text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]";

export default async function StaffDashboardPage() {
  const context = await requireStaff();

  if (
    context.profile.profile_type === "admin" ||
    context.profile.profile_type === "super_admin"
  ) {
    redirect("/admin");
  }

  const fullName = context.profile.full_name?.trim() || "Staff Member";
  const firstName = fullName.split(/\s+/)[0] || "Staff";
  const roleLabel = ROLE_LABELS[context.highestRole] ?? "Staff Member";

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      <section className="bg-[#071A3D] text-white shadow-sm">
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
            Red Stone Employment Agency
          </p>
          <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Use the secure staff workspaces below to manage recruitment,
                applications, follow-up and placements.
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
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
            Quick Operations
          </p>
          <h2 className="mt-1 text-xl font-black text-[#071A3D]">
            Staff Action Centre
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            The dashboard home is intentionally lightweight for reliability on
            Cloudflare. Detailed client counts, referral tools and case records
            remain inside the dedicated workspaces.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Link href="/staff/clients" className={primaryButton}>
              My Clients
            </Link>
            <Link href="/staff/applications" className={secondaryButton}>
              Applications
            </Link>
            <Link href="/staff/clients#add-client" className={secondaryButton}>
              + Register Client
            </Link>
            <Link href="/staff/clients?status=contacted" className={secondaryButton}>
              Follow-Up
            </Link>
            <Link href="/staff/clients?status=processing" className={secondaryButton}>
              Processing
            </Link>
            <Link href="/staff/clients?status=placed" className={secondaryButton}>
              Placements
            </Link>
          </div>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <WorkspaceCard
            title="Client CRM"
            body="Open your assigned client pipeline, referral link, passport and medical tracking, notes and follow-up dates."
            href="/staff/clients"
            action="Open My Clients"
          />
          <WorkspaceCard
            title="Applications"
            body="Review applications assigned to your staff workspace and continue candidate processing."
            href="/staff/applications"
            action="Open Applications"
          />
          <WorkspaceCard
            title="Positive Clients"
            body="Medical completion remains the operational definition of a positive client. Update and review medical status in your client CRM."
            href="/staff/clients"
            action="Review Medical Status"
          />
        </section>

        <section className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
            Account Status
          </p>
          <h2 className="mt-1 text-lg font-black text-[#071A3D]">
            Staff account active
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your staff identity and role were verified before this page was rendered.
          </p>
        </section>
      </div>
    </main>
  );
}

function WorkspaceCard({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#071A3D]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#071A3D] px-4 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
      >
        {action}
      </Link>
    </section>
  );
}
