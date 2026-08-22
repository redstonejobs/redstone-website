import Link from "next/link";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { CONTACT } from "@/lib/public/site";
import type { CandidateContext } from "@/lib/candidate/types";

const links = [
  ["Dashboard", "/candidate"],
  ["Find Jobs", "/candidate/jobs"],
  ["My Applications", "/candidate/applications"],
  ["Documents", "/candidate/documents"],
  ["Profile", "/candidate/profile"],
  ["Help", "/candidate/help"],
];

export function CandidateShell({ context, children }: { context: CandidateContext; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900">
      <div className="bg-[#071A3D] px-4 py-2 text-center text-xs font-semibold text-[#F2D675]">
        Protect your account and documents. Red Stone will never ask you to share your password. <Link href="/fraud-awareness" className="underline">Fraud awareness</Link>
      </div>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <RedstoneLogo
            href="/candidate"
            size="sm"
            showText
            subtitle="Candidate Portal"
            className="text-[#071A3D]"
            textClassName="text-[#071A3D]"
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{context.profile.full_name ?? context.user.email}</span>
            <form action="/auth/logout" method="post">
              <button className="rounded-md border border-slate-300 px-3 py-2 font-bold text-[#071A3D]">Logout</button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 text-sm font-bold">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-2 text-[#071A3D] hover:bg-[#F2D675]/60">{label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Need help? <a className="font-bold text-[#071A3D]" href={`mailto:${CONTACT.emails.support}`}>{CONTACT.emails.support}</a>
      </footer>
    </div>
  );
}
