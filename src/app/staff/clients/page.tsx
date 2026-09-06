import Link from "next/link";

import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { ReferralLinkCard } from "@/components/staff/referral-link-card";
import { requireStaff } from "@/lib/admin/auth";
import {
  createOwnStaffClient,
  updateOwnClientStatus,
} from "@/lib/staff/actions";
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

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual Entry" },
  { value: "referral_link", label: "Referral Link" },
  { value: "walk_in", label: "Walk-In" },
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const PASSPORT_OPTIONS = [
  { value: "unknown", label: "Unknown" },
  { value: "none", label: "No Passport" },
  { value: "valid", label: "Valid Passport" },
  { value: "expired", label: "Expired Passport" },
  { value: "processing", label: "Passport Processing" },
];

const MEDICAL_OPTIONS = [
  { value: "unknown", label: "Unknown" },
  { value: "not_started", label: "Not Started" },
  { value: "pending", label: "Medical Pending" },
  { value: "booked", label: "Medical Booked" },
  { value: "completed", label: "Medical Completed" },
  { value: "failed", label: "Medical Failed" },
  { value: "waived", label: "Medical Waived" },
  { value: "expired", label: "Medical Expired" },
];

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
  updated_at: string;
};

type CountResult = {
  count: number | null;
};

type StaffClientCounts = Record<ClientStatus | "total", number>;

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    created?: string;
    updated?: string;
    duplicate?: string;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        staff_id,
        job_title,
        department,
        duty_station,
        referral_code
      `
    )
    .eq("id", context.user.id)
    .maybeSingle();

  let clientQuery = supabase
    .from("staff_clients")
    .select(
      `
        id,
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
        notes,
        created_at,
        updated_at
      `,
      { count: "exact" }
    )
    .eq("staff_user_id", context.user.id);

  if (statusFilter) {
    clientQuery = clientQuery.eq("status", statusFilter);
  }

  if (searchText) {
    const value = escapeSearchValue(searchText);
    clientQuery = clientQuery.or(
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

  const [{ data, error, count }, counts] = await Promise.all([
    clientQuery.order("created_at", { ascending: false }).range(from, to),
    loadStaffClientCounts(supabase, context.user.id),
  ]);

  if (error) {
    console.error("[staff] client portfolio load failed", {
      code: error.code ?? null,
      message: error.message,
    });
    throw new Error("Unable to load recruitment clients right now.");
  }

  const clients = (data ?? []) as StaffClient[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const fullName = String(profile?.full_name || "Staff Member");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://redstone.co.ke").replace(/\/+$/, "");
  const referralCode = typeof profile?.referral_code === "string" ? profile.referral_code : null;
  const referralLink = referralCode
    ? `${siteUrl}/r/${encodeURIComponent(referralCode)}`
    : null;

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      <div className="border-b border-[#D4AF37]/30 bg-[#06162F] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Red Stone Secure Recruitment Information System
          </p>
          <p className="text-[11px] font-semibold text-slate-300">
            AUTHENTICATED STAFF SESSION
          </p>
        </div>
      </div>

      <header className="bg-[#071A3D] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center">
          <RedstoneLogo
            href="/"
            size="md"
            showText
            subtitle="Recruitment Operations Centre"
            className="text-white"
            textClassName="text-white"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/staff"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              Staff Dashboard
            </Link>
            <a
              href="#add-client"
              className="rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Add New Client
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8">
        {params.created === "1" ? (
          <Alert tone="success">
            Client added successfully to your private portfolio.
          </Alert>
        ) : null}

        {params.duplicate === "1" ? (
          <Alert tone="warning">
            A possible duplicate was found in your portfolio. The new record was kept separate because identity was not certain.
          </Alert>
        ) : null}

        {params.updated === "1" ? (
          <Alert tone="info">Client status updated successfully.</Alert>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-[#071A3D]/10 bg-white shadow-sm">
          <div className="bg-[#071A3D] px-6 py-8 text-white sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Recruitment CRM
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              My Client Pipeline
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Manage real recruitment leads, document readiness, follow-up dates and pipeline progress from one staff-owned workspace.
            </p>
          </div>
          <div className="grid border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <IdentityCell label="Recruitment Officer" value={fullName} subtext={String(profile?.staff_id || "Staff ID pending")} />
            <IdentityCell label="Department" value={String(profile?.department || "Not assigned")} subtext={String(profile?.job_title || "Recruitment staff")} />
            <IdentityCell label="Duty Station" value={String(profile?.duty_station || "Not assigned")} subtext="Current work location" />
            <IdentityCell label="Open CRM Records" value={String(counts.total - counts.closed)} subtext="Open recruitment cases" last />
          </div>
        </section>

        <div className="mt-7">
          <ReferralLinkCard referralCode={referralCode} referralLink={referralLink} />
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard label="Total" value={counts.total} description="All clients" />
          <MetricCard label="Leads" value={counts.lead} description="New prospects" />
          <MetricCard label="Contacted" value={counts.contacted} description="Follow-up started" />
          <MetricCard label="Registered" value={counts.registered} description="Registered" />
          <MetricCard label="Applied" value={counts.applied} description="Applications" />
          <MetricCard label="Processing" value={counts.processing} description="Active cases" />
          <MetricCard label="Placed" value={counts.placed} description="Successful" highlight />
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[390px_1fr]">
          <aside>
            <section
              id="add-client"
              className="sticky top-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-[#071A3D] px-6 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                  Client Intake
                </p>
                <h2 className="mt-1 text-xl font-black">Register New Client</h2>
              </div>

              <form action={createOwnStaffClient} className="space-y-5 p-6">
                <Field label="Full Name" name="full_name" required placeholder="Client full legal name" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field label="Phone Number" name="phone" placeholder="+254..." />
                  <Field label="Email Address" name="email" type="email" placeholder="client@example.com" />
                </div>
                <p className="-mt-2 text-[11px] leading-5 text-slate-500">
                  At least one phone number or email address is required. This CRM entry does not create a candidate login.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field label="Nationality" name="nationality" placeholder="e.g. Kenyan" />
                  <Field label="Current Country" name="country" placeholder="e.g. Kenya" />
                </div>
                <Field label="Job of Interest" name="interested_job" placeholder="e.g. Warehouse Worker" />
                <Field label="Country of Interest" name="preferred_country" placeholder="e.g. Canada" />
                <Field label="Follow-Up Date" name="follow_up_date" type="date" />
                <SelectField label="Passport Status" name="passport_status" options={PASSPORT_OPTIONS} />
                <SelectField label="Medical Status" name="medical_status" options={MEDICAL_OPTIONS} />
                <SelectField label="Client Source" name="source" options={SOURCE_OPTIONS} />
                <SelectField label="Initial Status" name="status" options={CLIENT_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))} />
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
                    Recruitment Notes
                  </span>
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Initial conversation, documents available, follow-up notes..."
                    className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#D4AF37] px-5 py-3.5 text-sm font-black text-[#071A3D] shadow-sm transition hover:bg-[#F2D675]"
                >
                  Register Client
                </button>
              </form>
            </section>
          </aside>

          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <form method="get" className="grid gap-4 md:grid-cols-[1fr_220px_auto_auto]">
                <Field label="Search Client Records" name="q" defaultValue={params.q ?? ""} placeholder="Name, phone, email, job or destination..." />
                <SelectField
                  label="Pipeline Status"
                  name="status"
                  defaultValue={statusFilter}
                  includeAll="All Statuses"
                  options={CLIENT_STATUSES.map((status) => ({ value: status, label: statusLabel(status) }))}
                />
                <button
                  type="submit"
                  className="self-end rounded-lg bg-[#071A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#102D5A]"
                >
                  Search
                </button>
                <Link
                  href="/staff/clients"
                  className="self-end rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Clear
                </Link>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                    Recruitment Records
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#071A3D]">
                    Assigned Client Portfolio
                  </h2>
                </div>
                <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                  Showing {clients.length} of {count ?? 0}
                </p>
              </div>

              {clients.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <h3 className="text-lg font-black text-[#071A3D]">No matching client records</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Add your first recruitment client or adjust the current search and status filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <TableHeading>Client</TableHeading>
                        <TableHeading>Interest</TableHeading>
                        <TableHeading>Contact</TableHeading>
                        <TableHeading>Readiness</TableHeading>
                        <TableHeading>Status</TableHeading>
                        <TableHeading>Follow-Up</TableHeading>
                        <TableHeading>Control</TableHeading>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clients.map((client) => (
                        <tr key={client.id} className="align-top transition hover:bg-slate-50/70">
                          <td className="min-w-[220px] px-5 py-5">
                            <p className="font-black text-[#071A3D]">{client.full_name}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {client.nationality || "Nationality not set"}
                            </p>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                              Source: {sourceLabel(client.source)}
                            </p>
                            {client.candidate_user_id ? (
                              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">
                                Candidate Account Linked
                              </span>
                            ) : null}
                          </td>
                          <td className="min-w-[210px] px-5 py-5">
                            <p className="text-sm font-bold text-slate-800">
                              {client.interested_job || "Job interest not recorded"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Destination: <strong>{client.preferred_country || "Not specified"}</strong>
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Current: <strong>{client.country || "Not specified"}</strong>
                            </p>
                            {client.notes ? (
                              <p className="mt-3 max-w-[300px] text-xs leading-5 text-slate-500">
                                {truncate(client.notes, 120)}
                              </p>
                            ) : null}
                          </td>
                          <td className="min-w-[210px] px-5 py-5">
                            {client.phone ? <ContactLink href={`tel:${client.phone}`} label={client.phone} /> : <Muted>No phone</Muted>}
                            {client.email ? <ContactLink href={`mailto:${client.email}`} label={client.email} small /> : <Muted>No email</Muted>}
                          </td>
                          <td className="min-w-[170px] px-5 py-5">
                            <p className="text-xs font-bold text-slate-700">
                              Passport: {optionLabel(PASSPORT_OPTIONS, client.passport_status)}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-700">
                              Medical: {optionLabel(MEDICAL_OPTIONS, client.medical_status)}
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <StatusBadge status={client.status} />
                          </td>
                          <td className="min-w-[145px] px-5 py-5">
                            <p className="text-xs font-bold text-slate-700">
                              {formatDate(client.follow_up_date)}
                            </p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Created {formatDate(client.created_at)}
                            </p>
                          </td>
                          <td className="min-w-[230px] px-5 py-5">
                            <form action={updateOwnClientStatus} className="space-y-2">
                              <input type="hidden" name="client_id" value={client.id} />
                              <select
                                name="status"
                                defaultValue={client.status}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:border-[#D4AF37]"
                              >
                                {CLIENT_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel(status)}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="w-full rounded-lg border border-[#071A3D] px-3 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
                              >
                                Update Status
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <PageLink page={page - 1} disabled={page <= 1} params={params}>Previous</PageLink>
              <p className="rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-600">
                Page {page} of {totalPages}
              </p>
              <PageLink page={page + 1} disabled={page >= totalPages} params={params}>Next</PageLink>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

async function loadStaffClientCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffUserId: string
) {
  const [total, ...statusCounts] = await Promise.all([
    countClients(supabase, staffUserId),
    ...CLIENT_STATUSES.map((status) => countClients(supabase, staffUserId, status)),
  ]);

  return CLIENT_STATUSES.reduce(
    (counts, status, index) => ({
      ...counts,
      [status]: statusCounts[index],
    }),
    { total } as StaffClientCounts
  );
}

async function countClients(
  supabase: Awaited<ReturnType<typeof createClient>>,
  staffUserId: string,
  status?: ClientStatus
) {
  let query = supabase
    .from("staff_clients")
    .select("id", { count: "exact", head: true })
    .eq("staff_user_id", staffUserId);

  if (status) {
    query = query.eq("status", status);
  }

  const result = (await query) as CountResult;
  return result.count ?? 0;
}

function Alert({ tone, children }: { tone: "success" | "warning" | "info"; children: React.ReactNode }) {
  const classes = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-bold ${classes[tone]}`}>
      {children}
    </div>
  );
}

function IdentityCell({ label, value, subtext, last = false }: { label: string; value: string; subtext: string; last?: boolean }) {
  return (
    <div className={`px-6 py-5 ${last ? "" : "border-b border-slate-200 lg:border-b-0 lg:border-r"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-base font-black text-[#071A3D]">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

function MetricCard({ label, value, description, highlight = false }: { label: string; value: number; description: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${highlight ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${highlight ? "text-emerald-700" : "text-slate-500"}`}>{label}</p>
      <p className="mt-2 text-2xl font-black text-[#071A3D]">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
        {label}{required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  includeAll,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  includeAll?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      >
        {includeAll ? <option value="">{includeAll}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
      {children}
    </th>
  );
}

function ContactLink({ href, label, small = false }: { href: string; label: string; small?: boolean }) {
  return (
    <a
      href={href}
      className={`${small ? "mt-1 text-xs text-[#B8860B]" : "text-sm text-[#071A3D]"} block break-all font-bold hover:underline`}
    >
      {label}
    </a>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-slate-400">{children}</p>;
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    lead: "border-slate-200 bg-slate-100 text-slate-700",
    contacted: "border-blue-200 bg-blue-50 text-blue-700",
    registered: "border-indigo-200 bg-indigo-50 text-indigo-700",
    applied: "border-violet-200 bg-violet-50 text-violet-700",
    processing: "border-amber-200 bg-amber-50 text-amber-800",
    placed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    closed: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${classes[status] ?? classes.lead}`}>
      {statusLabel(status)}
    </span>
  );
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
    return (
      <span className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-black text-slate-400">
        {children}
      </span>
    );
  }

  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status) query.set("status", params.status);
  query.set("page", String(page));

  return (
    <Link
      href={`/staff/clients?${query.toString()}`}
      className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    lead: "Lead",
    contacted: "Contacted",
    registered: "Registered",
    applied: "Applied",
    processing: "Processing",
    placed: "Placed",
    closed: "Closed",
  };

  return labels[status] ?? status;
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    manual: "Manual",
    referral_link: "Referral Link",
    walk_in: "Walk-In",
    phone: "Phone",
    whatsapp: "WhatsApp",
    other: "Other",
  };

  return labels[source] ?? source;
}

function optionLabel(options: { value: string; label: string }[], value?: string | null) {
  return options.find((option) => option.value === value)?.label ?? "Unknown";
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}...`;
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
