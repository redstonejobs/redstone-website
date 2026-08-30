export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "employer_review",
  "offer_pending",
  "offer_issued",
  "documentation",
  "visa_processing",
  "approved",
  "deployed",
  "rejected",
  "withdrawn",
] as const;

export const JOB_STATUSES = ["draft", "published", "paused", "closed", "archived"] as const;

export const EMPLOYER_VERIFICATION_STATUSES = ["pending", "under_review", "verified", "suspended", "rejected"] as const;

export const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  paused: "bg-amber-50 text-amber-700 ring-amber-200",
  closed: "bg-slate-200 text-slate-800 ring-slate-300",
  archived: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  submitted: "bg-blue-50 text-blue-700 ring-blue-200",
  under_review: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  shortlisted: "bg-purple-50 text-purple-700 ring-purple-200",
  interview: "bg-amber-50 text-amber-700 ring-amber-200",
  employer_review: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  offer_pending: "bg-orange-50 text-orange-700 ring-orange-200",
  offer_issued: "bg-yellow-50 text-[#8A6300] ring-yellow-200",
  documentation: "bg-teal-50 text-teal-700 ring-teal-200",
  visa_processing: "bg-sky-50 text-sky-700 ring-sky-200",
  approved: "bg-green-50 text-green-700 ring-green-200",
  deployed: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  withdrawn: "bg-slate-100 text-slate-700 ring-slate-200",
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  suspended: "bg-slate-200 text-slate-800 ring-slate-300",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function labelForStatus(status: string | null | undefined) {
  if (!status) {
    return "Not set";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
