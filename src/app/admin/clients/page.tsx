import Link from "next/link";

import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

const CLIENT_STATUSES = [
  "lead",
  "contacted",
  "registered",
  "applied",
  "processing",
  "placed",
  "closed",
] as const;

const PAGE_SIZE = 30;

type ClientStatus = (typeof CLIENT_STATUSES)[number];

type StaffClient = {
  id: string;
  staff_user_id: string;
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
  created_at: string;
  updated_at: string;
};

type StaffProfile = {
  id: string;
  full_name: string | null;
  staff_id: string | null;
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    staff?: string;
    country?: string;
    page?: string;
  }>;
};

export default async function AdminClientsPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = (await searchParams) ?? {};
  const supabase = await createClient();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const statusFilter = CLIENT_STATUSES.includes(params.status as ClientStatus)
    ? (params.status as ClientStatus)
    : "";
  const searchText = (params.q ?? "").trim();
  const staffFilter = (params.staff ?? "").trim();
  const countryFilter = (params.country ?? "").trim();

  let query = supabase
    .from("staff_clients")
    .select(
      `
        id,
        staff_user_id,
        candidate_user_id,
        full_name,
        email,
        phone,
        nationality,
        country,
        interested_job,
        preferred_country,
        passport_status,
        medical_status,
        follow_up_date,
        status,
        source,
        created_at,
        updated_at
      `,
      { count: "exact" }
    );

  if (statusFilter) query = query.eq("status", statusFilter);
  if (staffFilter) query = query.eq("staff_user_id", staffFilter);
  if (countryFilter) query = query.ilike("preferred_country", `%${escapeSearchValue(countryFilter)}%`);
  if (searchText) {
    const value = escapeSearchValue(searchText);
    query = query.or(
      [
        `full_name.ilike.%${value}%`,
        `email.ilike.%${value}%`,
        `phone.ilike.%${value}%`,
        `nationality.ilike.%${value}%`,
        `country.ilike.%${value}%`,
        `interested_job.ilike.%${value}%`,
        `preferred_country.ilike.%${value}%`,
      ].join(",")
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[admin] staff client registry load failed", {
      code: error.code ?? null,
      message: error.message,
    });
    throw new Error("Unable to load staff clients right now.");
  }

  const clients = (data ?? []) as StaffClient[];
  const staffIds = [...new Set(clients.map((client) => client.staff_user_id))];
  const { data: staffProfiles } = staffIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, staff_id")
        .in("id", staffIds)
        .returns<StaffProfile[]>()
    : { data: [] as StaffProfile[] };
  const staffById = new Map((staffProfiles ?? []).map((profile) => [profile.id, profile]));
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-[#071A3D]/10 bg-white shadow-sm">
        <div className="bg-[#071A3D] px-6 py-7 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2D675]">
            Recruitment Oversight
          </p>
          <h1 className="mt-2 text-3xl font-black">Staff Client Registry</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Admin-only visibility across recruiter client portfolios, referral-linked candidates and pipeline readiness.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form method="get" className="grid gap-4 lg:grid-cols-[1fr_180px_220px_auto_auto]">
          <Field name="q" label="Search" defaultValue={params.q ?? ""} placeholder="Name, phone, email, job..." />
          <Select name="status" label="Status" defaultValue={statusFilter} />
          <Field name="country" label="Country" defaultValue={params.country ?? ""} placeholder="Destination..." />
          <button className="self-end rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">
            Filter
          </button>
          <Link
            href="/admin/clients"
            className="self-end rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-700"
          >
            Clear
          </Link>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Client Records
            </p>
            <h2 className="mt-1 text-xl font-black text-[#071A3D]">
              All Staff Clients
            </h2>
          </div>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
            Showing {clients.length} of {count ?? 0}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <Heading>Client</Heading>
                <Heading>Staff Owner</Heading>
                <Heading>Interest</Heading>
                <Heading>Readiness</Heading>
                <Heading>Status</Heading>
                <Heading>Follow-Up</Heading>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => {
                const staff = staffById.get(client.staff_user_id);

                return (
                  <tr key={client.id} className="align-top">
                    <Cell>
                      <p className="font-black text-[#071A3D]">{client.full_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{client.phone || client.email || "No contact"}</p>
                      {client.candidate_user_id ? (
                        <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">
                          Candidate linked
                        </span>
                      ) : null}
                    </Cell>
                    <Cell>
                      <Link
                        href={`/admin/staff/${client.staff_user_id}`}
                        className="font-bold text-[#B8860B] hover:underline"
                      >
                        {staff?.full_name || "Staff record"}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{staff?.staff_id || "Staff ID pending"}</p>
                    </Cell>
                    <Cell>
                      <p className="font-bold text-slate-800">{client.interested_job || "Job not recorded"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {client.preferred_country || "Destination not recorded"}
                      </p>
                    </Cell>
                    <Cell>
                      <p className="text-xs font-bold text-slate-700">Passport: {label(client.passport_status)}</p>
                      <p className="mt-1 text-xs font-bold text-slate-700">Medical: {label(client.medical_status)}</p>
                    </Cell>
                    <Cell>
                      <StatusBadge status={client.status} />
                    </Cell>
                    <Cell>
                      <p className="text-xs font-bold text-slate-700">{formatDate(client.follow_up_date)}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Created {formatDate(client.created_at)}
                      </p>
                    </Cell>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap justify-between gap-3">
        <PageLink page={page - 1} disabled={page <= 1} params={params}>Previous</PageLink>
        <p className="rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-600">
          Page {page} of {totalPages}
        </p>
        <PageLink page={page + 1} disabled={page >= totalPages} params={params}>Next</PageLink>
      </div>
    </div>
  );
}

function Field({ name, label, defaultValue, placeholder }: { name: string; label: string; defaultValue?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-[#D4AF37]"
      />
    </label>
  );
}

function Select({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-[#D4AF37]"
      >
        <option value="">All Statuses</option>
        {CLIENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {labelStatus(status)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wide text-slate-500">{children}</th>;
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="min-w-[180px] px-5 py-5 text-sm">{children}</td>;
}

function PageLink({
  page,
  disabled,
  params,
  children,
}: {
  page: number;
  disabled: boolean;
  params: Record<string, string | undefined>;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-md border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-black text-slate-400">{children}</span>;
  }

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  if (params.staff) query.set("staff", params.staff);
  if (params.country) query.set("country", params.country);
  query.set("page", String(page));

  return (
    <Link
      href={`/admin/clients?${query.toString()}`}
      className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700"
    >
      {children}
    </Link>
  );
}

function labelStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function label(value?: string | null) {
  return value ? labelStatus(value) : "Unknown";
}

function formatDate(value?: string | null) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(date);
}

function escapeSearchValue(value: string) {
  return value.replace(/[,%]/g, " ").trim();
}
