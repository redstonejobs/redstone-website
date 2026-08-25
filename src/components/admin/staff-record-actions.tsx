"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

import type { StaffRecordPdfData } from "@/components/admin/staff-record-pdf";

const StaffRecordPdfDownload = dynamic(
  () =>
    import("@/components/admin/staff-record-pdf").then(
      (module) => module.StaffRecordPdfDownload
    ),
  {
    ssr: false,

    loading: () => (
      <div className="inline-flex h-11 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-6 text-sm font-bold text-amber-900">
        Preparing PDF...
      </div>
    ),
  }
);

export function StaffRecordActions({
  record,
}: {
  record: StaffRecordPdfData;
}) {
  return (
    <div className="mx-auto mb-5 max-w-[210mm] print:hidden">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              Personnel Registry
            </p>

            <h1 className="mt-1 text-base font-black text-slate-950">
              {record.fullName}
            </h1>

            <p className="mt-1 break-all text-xs text-slate-500">
              Record Reference: {record.recordId}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href="/admin/staff"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Staff
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#071A3D] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Print Record
            </button>

            <StaffRecordPdfDownload record={record} />
          </div>
        </div>
      </div>
    </div>
  );
}