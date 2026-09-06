import Link from "next/link";
import type { ReactNode } from "react";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="border-b border-[#D4AF37]/20 bg-[#06162F] text-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2.5 sm:px-8">
          <span className="mr-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
            Staff Navigation
          </span>
          <Link
            href="/staff"
            className="rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/staff/clients"
            className="rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Clients
          </Link>
          <Link
            href="/staff/applications"
            className="rounded-lg bg-[#D4AF37]/15 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#F2D675] transition hover:bg-[#D4AF37]/25"
          >
            Applications
          </Link>
        </div>
      </div>
      {children}
    </>
  );
}
