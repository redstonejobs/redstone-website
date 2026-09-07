"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[staff] server component render failed", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-[#EEF1F5] px-5 py-10 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-200 bg-[#071A3D] px-6 py-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
            Red Stone Staff Portal
          </p>
          <h1 className="mt-2 text-2xl font-black">
            Staff dashboard could not finish loading
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Your authenticated session is still protected. Retry the dashboard or open one of your staff workspaces below.
          </p>
        </div>

        <div className="p-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-950">
              A server-side dashboard component failed temporarily.
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              The technical reference has been logged for troubleshooting without exposing sensitive server details.
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-[11px] text-amber-800">
                Reference: {error.digest}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#D4AF37] px-5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Retry Dashboard
            </button>

            <Link
              href="/staff"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#071A3D] bg-white px-5 text-sm font-black text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
            >
              Dashboard Home
            </Link>

            <Link
              href="/staff/clients"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-[#D4AF37] hover:bg-[#FFFBEB]"
            >
              My Clients
            </Link>

            <Link
              href="/staff/applications"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-[#D4AF37] hover:bg-[#FFFBEB]"
            >
              Applications
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
