import Link from "next/link";
import type { ReactNode } from "react";

import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { canManageStaff } from "@/lib/admin/auth";
import type { AdminContext } from "@/lib/admin/types";

type NavItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Command Centre",
    items: [
      { label: "Executive Dashboard", href: "/admin" },
      { label: "Notifications", href: "/admin/notifications" },
    ],
  },
  {
    title: "Recruitment Operations",
    items: [
      { label: "Vacancies", href: "/admin/jobs" },
      { label: "Applications", href: "/admin/applications" },
      { label: "Candidates", href: "/admin/candidates" },
      { label: "Documents", href: "/admin/documents" },
    ],
  },
  {
    title: "Employer Management",
    items: [
      { label: "Employers", href: "/admin/employers" },
      {
        label: "Employer Requests",
        href: "/admin/employer-job-requests",
      },
    ],
  },
  {
    title: "Programme Control",
    items: [
      {
        label: "Countries & Fees",
        href: "/admin/countries",
        adminOnly: true,
      },
    ],
  },
  {
    title: "Administration & Security",
    items: [
      {
        label: "Staff Administration",
        href: "/admin/staff",
        adminOnly: true,
      },
      {
        label: "Audit & Compliance",
        href: "/admin/audit",
        adminOnly: true,
      },
    ],
  },
];

type AdminShellProps = {
  context: AdminContext;
  children: ReactNode;
};

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    super_admin: "Super Administrator",
    admin: "Administrator",
    hr: "Human Resources",
    recruiter: "Recruitment Officer",
    finance: "Finance Officer",
    moderator: "Moderator",
    staff: "Staff",
  };

  return labels[role] ?? role.replaceAll("_", " ");
}

export function AdminShell({
  context,
  children,
}: AdminShellProps) {
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          !item.adminOnly ||
          canManageStaff(context)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const administratorName =
    context.profile.full_name ??
    context.user.email ??
    "Administrator";

  const administratorEmail =
    context.user.email ?? "Internal account";

  const highestRole = roleLabel(
    context.highestRole
  );

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900">
      <div className="flex min-h-screen">
        {/* ====================================================
            DESKTOP SIDEBAR
        ==================================================== */}
        <aside className="hidden w-[300px] shrink-0 border-r border-white/10 bg-[#06162F] text-white lg:flex lg:flex-col">
          {/* Brand */}
          <div className="border-b border-white/10 px-6 py-6">
            <RedstoneLogo
              href="/admin"
              size="md"
              showText
              subtitle="Administrative Operations"
              className="text-[#F2D675]"
              textClassName="text-[#F2D675]"
            />

            <div className="mt-5 rounded-xl border border-amber-400/20 bg-white/[0.04] p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-300">
                Secure Administrative Console
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-300">
                Restricted access for authorized Red Stone personnel only.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto px-4 py-5"
            aria-label="Administrative navigation"
          >
            <div className="space-y-6">
              {visibleGroups.map((group) => (
                <section key={group.title}>
                  <p className="px-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">
                    {group.title}
                  </p>

                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
                      >
                        <span>
                          {item.label}
                        </span>

                        <span className="text-xs text-slate-500 transition group-hover:text-amber-300">
                          ›
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </nav>

          {/* Sidebar security footer */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Session Status
                  </p>

                  <p className="mt-1 text-xs font-bold text-emerald-300">
                    Secure / Authenticated
                  </p>
                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <p className="mt-3 text-[10px] leading-4 text-slate-400">
                Administrative actions are subject to audit and access controls.
              </p>
            </div>
          </div>
        </aside>

        {/* ====================================================
            MAIN APPLICATION AREA
        ==================================================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top classification bar */}
          <div className="border-b border-amber-500/30 bg-[#071A3D] px-4 py-2 text-white lg:px-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                Red Stone Employment Agency
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300">
                Internal Administrative System • Restricted Access
              </p>
            </div>
          </div>

          {/* Main header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="px-4 py-5 lg:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                {/* Identity */}
                <div className="flex min-w-0 items-center gap-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <RedstoneLogo
                      href="/admin"
                      size="sm"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8860B]">
                      Administrative Operations Centre
                    </p>

                    <h1 className="mt-1 text-xl font-black text-[#071A3D]">
                      Red Stone Management Console
                    </h1>

                    <p className="mt-1 text-xs text-slate-500">
                      Recruitment, employer, candidate and compliance administration
                    </p>
                  </div>
                </div>

                {/* Administrator profile */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Authorized User
                    </p>

                    <p className="mt-1 truncate text-sm font-black text-[#071A3D]">
                      {administratorName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {administratorEmail}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-amber-800">
                        {highestRole}
                      </span>

                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
                        Active
                      </span>
                    </div>
                  </div>

                  <form
                    action="/auth/logout"
                    method="post"
                  >
                    <button
                      type="submit"
                      className="inline-flex h-11 items-center justify-center rounded-lg bg-[#071A3D] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B2558]"
                    >
                      Secure Logout
                    </button>
                  </form>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto]">
                <div className="relative">
                  <label
                    className="sr-only"
                    htmlFor="admin-search"
                  >
                    Global administrative search
                  </label>

                  <input
                    id="admin-search"
                    type="search"
                    placeholder="Search candidates, applications, jobs, employers or records..."
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Search
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/admin/staff/new"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-500 bg-amber-50 px-4 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                  >
                    + Create Staff
                  </Link>

                  <Link
                    href="/admin/jobs"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Manage Vacancies
                  </Link>

                  <Link
                    href="/admin/audit"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Audit Trail
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <details className="border-t border-slate-100 px-4 py-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-black text-[#071A3D]">
                Administrative Menu
              </summary>

              <nav
                className="mt-4 space-y-5"
                aria-label="Mobile administrative navigation"
              >
                {visibleGroups.map((group) => (
                  <section key={group.title}>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      {group.title}
                    </p>

                    <div className="mt-2 grid gap-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </nav>
            </details>
          </header>

          {/* Main content */}
          <main className="flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white px-4 py-4 lg:px-8">
            <div className="flex flex-col gap-2 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Red Stone Employment Agency Administrative Operations
              </p>

              <p className="font-semibold uppercase tracking-wide text-slate-400">
                Confidential • Internal Use Only • Audited Environment
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}