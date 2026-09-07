import Link from "next/link";
import type { ReactNode } from "react";

const secondaryActionClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-100 transition hover:border-[#D4AF37]/60 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]";

const primaryActionClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#071A3D] shadow-sm transition hover:bg-[#F2D675] focus:outline-none focus:ring-2 focus:ring-[#F2D675]";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="border-b border-[#D4AF37]/20 bg-[#06162F] text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                Staff Navigation
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
                Secure Operations
              </span>
            </div>

            <nav
              className="flex flex-wrap gap-2"
              aria-label="Staff dashboard actions"
            >
              <Link href="/staff" className={secondaryActionClass}>
                Dashboard
              </Link>
              <Link href="/staff/clients" className={secondaryActionClass}>
                My Clients
              </Link>
              <Link href="/staff/applications" className={primaryActionClass}>
                Applications
              </Link>
              <Link href="/staff/clients/new" className={secondaryActionClass}>
                + Register Client
              </Link>
              <Link href="/staff/clients?status=processing" className={secondaryActionClass}>
                Processing Cases
              </Link>
              <Link href="/staff/clients?status=placed" className={secondaryActionClass}>
                Placements
              </Link>
            </nav>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
