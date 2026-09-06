import Link from "next/link";

import { APPLICATION_STATUSES, labelForStatus } from "@/lib/admin/status";
import { requireStaff } from "@/lib/admin/auth";
import { deleteOwnStaffApplication } from "@/lib/staff/application-actions";
import { createAdminClient } from "@/utils/supabase/admin";

const EXTRA_APPLICATION_STATUSES = ["ready_for_payment", "payment_pending"] as const;
const PAGE_SIZE = 30;

type ApplicationRow = {
  id: string;
  candidate_id: string;
  job_id: string | null;
  status: string | null;
  assigned_staff_id: string | null;
  created_at: string | null;
  submitted_at: string | null;
  updated_at: string | null;
};

type CandidateRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

type JobRow = {
  id: string;
  title: string | null;
  country: string | null;
  city: string | null;
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
    deleted?: string;
    delete_error?: string;
  }>;
};

export default async function StaffApplicationsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const context = await requireStaff();
  const admin = createAdminClient();

  const [{ data: crmClients }, { data: referredCandidates }] = await Promise.all([
    admin
      .from("staff_clients")
      .select("candidate_user_id")
      .eq("staff_user_id", context.user.id)
      .not("candidate_user_id", "is", null)
      .limit(1000),
    admin
      .from("profiles")
      .select("id")
      .eq("referred_by_staff_id", context.user.id)
      .limit(1000),
  ]);

  const candidateIds = [
    ...new Set([
      ...(crmClients ?? [])
        .map((row) => (typeof row.candidate_user_id === "string" ? row.candidate_user_id : ""))
        .filter(Boolean),
      ...(referredCandidates ?? [])
        .map((row) => (typeof row.id === "string" ? row.id : ""))
        .filter(Boolean),
    ]),
  ];

  const { data: assignedApplications, error: assignedError } = await admin
    .from("applications")
    .select("id, candidate_id, job_id, status, assigned_staff_id, created_at, submitted_at, updated_at")
    .eq("assigned_staff_id", context.user.id)
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<ApplicationRow[]>();

  if (assignedError) {
    console.error("[staff] assigned application load failed", {
      code: assignedError.code ?? null,
      message: assignedError.message,
    });
  }

  const candidateApplications: ApplicationRow[] = [];

  for (let index = 0; index < candidateIds.length; index += 100) {
    const candidateChunk = candidateIds.slice(index, index + 100);
    const { data, error } = await admin
      .from("applications")
      .select("id, candidate_id, job_id, status, assigned_staff_id, created_at, submitted_at, updated_at")
      .in("candidate_id", candidateChunk)
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<ApplicationRow[]>();

    if (error) {
      console.error("[staff] portfolio application load failed", {
        code: error.code ?? null,
        message: error.message,
      });
      continue;
    }

    candidateApplications.push(...(data ?? []));
  }

  const applications = [...new Map(
    [...(assignedApplications ?? []), ...candidateApplications].map((application) => [
      application.id,
      application,
    ])
  ).values()].sort((a, b) => timestamp(b.created_at) - timestamp(a.created_at));

  const uniqueCandidateIds = [...new Set(applications.map((application) => application.candidate_id))];
  const uniqueJobIds = [...new Set(applications.map((application) => application.job_id).filter((id): id is string => Boolean(id)))];

  const [{ data: candidates }, { data: jobs }] = await Promise.all([
    uniqueCandidateIds.length
      ? admin
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", uniqueCandidateIds)
          .returns<CandidateRow[]>()
      : Promise.resolve({ data: [] as CandidateRow[], error: null }),
    uniqueJobIds.length
      ? admin
          .from("jobs")
          .select("id, title, country, city")
          .in("id", uniqueJobIds)
          .returns<JobRow[]>()
      : Promise.resolve({ data: [] as JobRow[], error: null }),
  ]);

  const candidateMap = new Map((candidates ?? []).map((candidate) => [candidate.id, candidate]));
  const jobMap = new Map((jobs ?? []).map((job) => [job.id, job]));

  const query = (params.q ?? "").trim().toLowerCase();
  const status = (params.status ?? "").trim();
  const allowedStatuses = [...APPLICATION_STATUSES, ...EXTRA_APPLICATION_STATUSES] as readonly string[];
  const statusFilter = allowedStatuses.includes(status) ? status : "";

  const filtered = applications.filter((application) => {
    if (statusFilter && application.status !== statusFilter) return false;
    if (!query) return true;

    const candidate = candidateMap.get(application.candidate_id);
    const job = application.job_id ? jobMap.get(application.job_id) : null;
    const haystack = [
      application.id,
      application.status,
      candidate?.full_name,
      candidate?.phone,
      job?.title,
      job?.country,
      job?.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
          <div className="px-6 py-8 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
              Staff Recruitment Workspace
            </p>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-black text-white sm:text-4xl">My Applications</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                  Review applications assigned to you or linked to candidates in your own recruitment portfolio.
                </p>
              </div>
              <Link
                href="/staff/clients"
                className="inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
              >
                Open Client Pipeline
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-3">
          {params.deleted === "1" ? (
            <Alert tone="success">Application deleted successfully.</Alert>
          ) : null}
          {deleteErrorMessage(params.delete_error) ? (
            <Alert tone="warning">{deleteErrorMessage(params.delete_error)}</Alert>
          ) : null}
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form method="get" className="grid gap-4 md:grid-cols-[1fr_240px_auto_auto]">
            <label>
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Search</span>
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Candidate, phone, job, country or application ID"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </label>
            <label>
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Status</span>
              <select
                name="status"
                defaultValue={statusFilter}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#D4AF37]"
              >
                <option value="">All statuses</option>
                {allowedStatuses.map((item) => (
                  <option key={item} value={item}>{labelForStatus(item)}</option>
                ))}
              </select>
            </label>
            <button className="self-end rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white hover:bg-[#102D5A]">
              Search
            </button>
            <Link
              href="/staff/applications"
              className="self-end rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-700 hover:bg-slate-50"
            >
              Clear
            </Link>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">Application Register</p>
              <h2 className="mt-1 text-xl font-black text-[#071A3D]">My Candidate Applications</h2>
            </div>
            <p className="text-sm font-bold text-slate-500">{filtered.length} applications</p>
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-black text-[#071A3D]">No applications found</h3>
              <p className="mt-2 text-sm text-slate-500">No application records match your current portfolio and filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    {['Candidate','Job','Status','Created','Application','Control'].map((heading) => (
                      <th key={heading} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((application) => {
                    const candidate = candidateMap.get(application.candidate_id);
                    const job = application.job_id ? jobMap.get(application.job_id) : null;
                    return (
                      <tr key={application.id} className="align-top hover:bg-slate-50/70">
                        <td className="min-w-[210px] px-5 py-5">
                          <p className="font-black text-[#071A3D]">{candidate?.full_name || "Candidate"}</p>
                          <p className="mt-1 text-xs text-slate-500">{candidate?.phone || "Phone not recorded"}</p>
                        </td>
                        <td className="min-w-[220px] px-5 py-5">
                          <p className="font-bold text-slate-800">{job?.title || "Job not identified"}</p>
                          <p className="mt-1 text-xs text-slate-500">{jobLocation(job)}</p>
                        </td>
                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-700">
                            {labelForStatus(application.status)}
                          </span>
                        </td>
                        <td className="min-w-[145px] px-5 py-5 text-sm text-slate-600">
                          {formatDate(application.submitted_at || application.created_at)}
                        </td>
                        <td className="min-w-[170px] px-5 py-5">
                          <p className="text-[10px] font-black uppercase tracking-wide text-[#B8860B]">
                            APP-{application.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="mt-1 break-all text-[10px] text-slate-400">{application.id}</p>
                        </td>
                        <td className="min-w-[220px] px-5 py-5">
                          <details className="rounded-xl border border-red-200 bg-red-50/50">
                            <summary className="cursor-pointer px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-red-700">
                              Delete Application
                            </summary>
                            <div className="border-t border-red-100 p-4">
                              <p className="text-[11px] leading-5 text-red-700">
                                Permanent action. The candidate account remains active. Applications with any payment record cannot be deleted by staff.
                              </p>
                              <form action={deleteOwnStaffApplication} className="mt-3">
                                <input type="hidden" name="application_id" value={application.id} />
                                <input type="hidden" name="confirm" value="yes" />
                                <button className="w-full rounded-lg bg-red-700 px-3 py-2.5 text-xs font-black uppercase tracking-wide text-white hover:bg-red-800">
                                  Confirm Delete
                                </button>
                              </form>
                            </div>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-5">
              <PageLink page={safePage - 1} disabled={safePage <= 1} params={params}>Previous</PageLink>
              <p className="text-sm font-black text-slate-500">Page {safePage} of {totalPages}</p>
              <PageLink page={safePage + 1} disabled={safePage >= totalPages} params={params}>Next</PageLink>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function timestamp(value: string | null) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDate(value: string | null) {
  if (!value) return "Not submitted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(date);
}

function jobLocation(job: JobRow | null | undefined) {
  if (!job) return "Destination not recorded";
  if (job.city && job.country) return `${job.city}, ${job.country}`;
  return job.country || job.city || "Destination not recorded";
}

function deleteErrorMessage(code?: string) {
  const messages: Record<string, string> = {
    confirmation: "Deletion was not confirmed.",
    not_found: "The application could not be found.",
    not_allowed: "You can delete only applications assigned to you or belonging to candidates in your own portfolio.",
    payment_record: "This application has a payment record and cannot be deleted by staff. An administrator must review it.",
    blocked: "The application could not be safely deleted because related protected records exist.",
  };
  return code ? messages[code] ?? "The application could not be deleted." : "";
}

function Alert({ tone, children }: { tone: "success" | "warning"; children: React.ReactNode }) {
  const classes = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-amber-200 bg-amber-50 text-amber-800";
  return <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${classes}`}>{children}</div>;
}

function PageLink({
  page,
  disabled,
  params,
  children,
}: {
  page: number;
  disabled: boolean;
  params: { q?: string; status?: string };
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-black text-slate-400">{children}</span>;
  }

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  query.set("page", String(page));

  return (
    <Link href={`/staff/applications?${query.toString()}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}
