import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminContext } from "@/lib/admin/types";
import { canManageStaff } from "@/lib/admin/auth";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Jobs", href: "/admin/jobs" },
  { label: "Countries", href: "/admin/countries", adminOnly: true },
  { label: "Applications", href: "/admin/applications" },
  { label: "Candidates", href: "/admin/candidates" },
  { label: "Employers", href: "/admin/employers" },
  { label: "Employer Requests", href: "/admin/employer-job-requests" },
  { label: "Documents", href: "/admin/documents" },
  { label: "Staff", href: "/admin/staff", adminOnly: true },
  { label: "Audit", href: "/admin/audit", adminOnly: true },
];

type AdminShellProps = {
  context: AdminContext;
  children: ReactNode;
};

export function AdminShell({ context, children }: AdminShellProps) {
  const visibleNav = navItems.filter((item) => !item.adminOnly || canManageStaff(context));

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#071A3D] text-white lg:block">
          <div className="px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Red Stone</p>
            <h1 className="mt-2 text-xl font-bold">Admin Platform</h1>
          </div>
          <nav className="space-y-1 px-3" aria-label="Admin navigation">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B8860B]">
                  Red Stone Employment Agency
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Dashboard / Administration
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="sr-only" htmlFor="admin-search">
                  Global search
                </label>
                <input
                  id="admin-search"
                  type="search"
                  placeholder="Search candidates, jobs, employers"
                  className="min-h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                />
                <div className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span className="font-semibold text-[#071A3D]">
                    {context.profile.full_name ?? context.user.email ?? "Administrator"}
                  </span>
                  <span className="ml-2 rounded-full bg-[#FFF8DF] px-2 py-1 text-xs font-semibold text-[#8A6300]">
                    {context.highestRole}
                  </span>
                </div>
                <div className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-500">
                  Notifications
                </div>
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="min-h-10 rounded-md bg-[#071A3D] px-4 text-sm font-semibold text-white transition hover:bg-[#0B2558]"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
            <details className="border-t border-slate-100 px-4 py-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-[#071A3D]">Menu</summary>
              <nav className="mt-3 grid gap-2" aria-label="Mobile admin navigation">
                {visibleNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </details>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
