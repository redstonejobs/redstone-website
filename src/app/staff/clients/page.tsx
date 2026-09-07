import Link from "next/link";

import { requireStaff } from "@/lib/admin/auth";
import {
  convertOwnStaffClientToCandidate,
  deleteOwnStaffClient,
  updateOwnClientStatus,
} from "@/lib/staff/actions";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const CLIENT_STATUSES = [
  "lead",
  "contacted",
  "registered",
  "applied",
  "processing",
  "placed",
  "closed",
] as const;

const PAGE_SIZE = 25;

type ClientStatus = (typeof CLIENT_STATUSES)[number];

type StaffClient = {
  id: string;
  candidate_user_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  country: string | null;
  interested_job: string | null;
  preferred_country: string | null;
  passport_status: string | null;
  medical_status: string | null;
  follow_up_date: string | null;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    created?: string;
    updated?: string;
    duplicate?: string;
    converted?: string;
    deleted?: string;
    conversion_error?: string;
    page?: string;
  }>;
};

export default async function StaffClientsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const context = await requireStaff();
  const supabase = await createClient();

  const searchText = (params.q ?? "").trim();
  const statusFilter = CLIENT_STATUSES.includes(params.status as ClientStatus)
    ? (params.status as ClientStatus)
    : "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("staff_clients")
    .select(
      "id,candidate_user_id,full_name,email,phone,nationality,country,interested_job,preferred_country,passport_status,medical_status,follow_up_date,status,source,notes,created_at",
      { count: "exact" },
    )
    .eq("staff_user_id", context.user.id);

  if (statusFilter) query = query.eq("status", statusFilter);

  if (searchText) {
    const value = escapeSearchValue(searchText);
    query = query.or(
      [
        `full_name.ilike.%${value}%`,
        `email.ilike.%${value}%`,
        `phone.ilike.%${value}%`,
        `interested_job.ilike.%${value}%`,
        `preferred_country.ilike.%${value}%`,
      ].join(","),
    );
  }

  let clients: StaffClient[] = [];
  let totalCount = 0;
  let loadFailed = false;

  try {
    const result = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (result.error) {
      loadFailed = true;
      console.error("[staff] client portfolio load failed", {
        code: result.error.code ?? null,
        message: result.error.message,
      });
    } else {
      clients = (result.data ?? []) as StaffClient[];
      totalCount = result.count ?? 0;
    }
  } catch (error) {
    loadFailed = true;
    console.error("[staff] client portfolio request threw", {
      message: error instanceof Error ? error.message : "Unknown portfolio error",
    });
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const fullName = context.profile.full_name?.trim() || "Staff Member";

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-5 py-7 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-2xl bg-[#071A3D] px-6 py-7 text-white shadow-sm sm:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
                Recruitment CRM
              </p>
              <h1 className="mt-2 text-3xl font-black">My Client Pipeline</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {fullName}, manage only your assigned recruitment clients and their current processing status.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/staff"
                className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/staff/clients/new"
                className="rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D]"
              >
                + Register Client
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-5 space-y-3">
          {params.created === "1" ? (
            <Alert tone="success">Client registered successfully.</Alert>
          ) : null}
          {params.duplicate === "1" ? (
            <Alert tone="warning">
              A possible duplicate exists in your portfolio. The records were kept separate for safety.
            </Alert>
          ) : null}
          {params.updated === "1" ? (
            <Alert tone="info">Client status updated successfully.</Alert>
          ) : null}
          {params.deleted === "1" ? (
            <Alert tone="success">Client CRM record deleted.</Alert>
          ) : null}
          {params.converted === "1" ? (
            <Alert tone="success">Candidate invitation sent successfully.</Alert>
          ) : null}
          {params.converted === "already" ? (
            <Alert tone="info">This client is already linked to a candidate account.</Alert>
          ) : null}
          {params.conversion_error ? (
            <Alert tone="warning">Candidate conversion could not be completed. Check the client email and try again.</Alert>
          ) : null}
          {loadFailed ? (
            <Alert tone="warning">
              Client records could not be loaded right now. Registration is still available from the Register Client button.
            </Alert>
          ) : null}
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form method="get" className="grid gap-4 md:grid-cols-[1fr_220px_auto_auto]">
            <Field
              label="Search Client Records"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Name, phone, email, job or destination..."
            />
            <SelectField
              label="Pipeline Status"
              name="status"
              defaultValue={statusFilter}
              options={[{ value: "", label: "All Statuses" }, ...CLIENT_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))]}
            />
            <button
              type="submit"
              className="self-end rounded-lg bg-[#071A3D] px-5 py-3 text-sm font-black text-white"
            >
              Search
            </button>
            <Link
              href="/staff/clients"
              className="self-end rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-700"
            >
              Clear
            </Link>
          </form>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Assigned Records
              </p>
              <h2 className="mt-1 text-xl font-black text-[#071A3D]">My Clients</h2>
            </div>
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
              {loadFailed ? "Temporarily unavailable" : `${totalCount} total`}
            </p>
          </div>

          {!loadFailed && clients.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h3 className="text-lg font-black text-[#071A3D]">No client records yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Register your first client without loading any additional dashboard data.
              </p>
              <Link
                href="/staff/clients/new"
                className="mt-5 inline-flex rounded-lg bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
              >
                Register First Client
              </Link>
            </div>
          ) : null}

          {!loadFailed && clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Interest</th>
                    <th className="px-5 py-3">Readiness</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Follow-Up</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <tr key={client.id} className="align-top">
                      <td className="min-w-[220px] px-5 py-5">
                        <p className="font-black text-[#071A3D]">{client.full_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.phone || client.email || "No contact"}</p>
                        {client.candidate_user_id ? (
                          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black uppercase text-blue-700">
                            Candidate Linked
                          </span>
                        ) : null}
                      </td>
                      <td className="min-w-[190px] px-5 py-5 text-sm text-slate-700">
                        <p className="font-bold">{client.interested_job || "Not recorded"}</p>
                        <p className="mt-1 text-xs text-slate-500">{client.preferred_country || "No destination"}</p>
                      </td>
                      <td className="min-w-[175px] px-5 py-5 text-xs font-semibold text-slate-600">
                        <p>Passport: {friendly(client.passport_status)}</p>
                        <p className="mt-1">Medical: {friendly(client.medical_status)}</p>
                        {client.medical_status === "completed" ? (
                          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">
                            Positive Client
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="min-w-[140px] px-5 py-5 text-xs font-semibold text-slate-600">
                        {formatDate(client.follow_up_date)}
                      </td>
                      <td className="min-w-[230px] px-5 py-5">
                        <form action={updateOwnClientStatus} className="space-y-2">
                          <input type="hidden" name="client_id" value={client.id} />
                          <select
                            name="status"
                            defaultValue={client.status}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold"
                          >
                            {CLIENT_STATUSES.map((status) => (
                              <option key={status} value={status}>{statusLabel(status)}</option>
                            ))}
                          </select>
                          <button type="submit" className="w-full rounded-lg border border-[#071A3D] px-3 py-2 text-xs font-black text-[#071A3D]">
                            Update Status
                          </button>
                        </form>

                        {!client.candidate_user_id && client.email ? (
                          <form action={convertOwnStaffClientToCandidate} className="mt-2">
                            <input type="hidden" name="client_id" value={client.id} />
                            <button type="submit" className="w-full rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-black text-[#071A3D]">
                              Convert to Candidate
                            </button>
                          </form>
                        ) : null}

                        <details className="mt-2 rounded-lg border border-red-200 bg-red-50/50">
                          <summary className="cursor-pointer px-3 py-2 text-center text-[10px] font-black uppercase text-red-700">
                            Delete CRM Record
                          </summary>
                          <form action={deleteOwnStaffClient} className="border-t border-red-100 p-3">
                            <input type="hidden" name="client_id" value={client.id} />
                            <input type="hidden" name="confirm" value="yes" />
                            <button type="submit" className="w-full rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">
                              Confirm Delete
                            </button>
                          </form>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        {!loadFailed && totalPages > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-3">
            <PageLink page={page - 1} disabled={page <= 1} params={params}>Previous</PageLink>
            <p className="text-sm font-black text-slate-600">Page {page} of {totalPages}</p>
            <PageLink page={page + 1} disabled={page >= totalPages} params={params}>Next</PageLink>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Alert({ children, tone }: { children: React.ReactNode; tone: "success" | "warning" | "info" }) {
  const classes = tone === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-blue-200 bg-blue-50 text-blue-800";
  return <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${classes}`}>{children}</div>;
}

function Field({ label, name, defaultValue, placeholder }: { label: string; name: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm" />
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-700">{statusLabel(status)}</span>;
}

function PageLink({ page, disabled, params, children }: { page: number; disabled: boolean; params: Awaited<PageProps["searchParams"]> extends infer T ? T : never; children: React.ReactNode }) {
  if (disabled) return <span className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-400">{children}</span>;
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.status) query.set("status", params.status);
  query.set("page", String(page));
  return <Link href={`/staff/clients?${query.toString()}`} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-[#071A3D]">{children}</Link>;
}

function statusLabel(status: string) {
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function friendly(value: string | null) {
  return value ? statusLabel(value) : "Unknown";
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeSearchValue(value: string) {
  return value.replace(/[%,()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}
