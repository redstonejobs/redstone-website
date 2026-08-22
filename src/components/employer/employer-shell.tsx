import Link from "next/link";
import type { ReactNode } from "react";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import type { EmployerContext } from "@/lib/employer/types";
import { textValue } from "@/lib/admin/format";
import { employerStatusLabel } from "@/lib/employer/constants";

const nav = [
  ["Dashboard", "/employer"],
  ["Company Profile", "/employer/profile"],
  ["Jobs / Vacancies", "/employer/jobs"],
  ["Applicants", "/employer/applicants"],
  ["Interviews", "/employer/interviews"],
  ["Documents", "/employer/documents"],
  ["Support", "/employer/support"],
] as const;

export function EmployerShell({ context, children }: { context: EmployerContext; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <RedstoneLogo href="/employer" size="sm" className="shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#B8860B]">Red Stone Employer Portal</p>
              <h1 className="mt-1 text-xl font-black text-[#071A3D]">{textValue(context.employer, ["company_name"], "Employer Account")}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-md bg-slate-100 px-3 py-2 font-semibold capitalize text-slate-700">{employerStatusLabel(context.employer.verification_status)}</span>
            <form action="/auth/logout" method="post"><button className="rounded-md bg-[#071A3D] px-4 py-2 font-semibold text-white">Logout</button></form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4" aria-label="Employer navigation">
          {nav.map(([label, href]) => <Link key={href} href={href} className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#071A3D] hover:bg-slate-50">{label}</Link>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
