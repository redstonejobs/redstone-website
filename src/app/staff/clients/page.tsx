import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  createOwnStaffClient,
  updateOwnClientStatus,
} from "@/lib/staff/actions";
import { RedstoneLogo } from "@/components/brand/redstone-logo";

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
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function StaffClientsPage({
  searchParams,
}: PageProps) {
  const params = (await searchParams) ?? {};

  const searchText = (params.q ?? "").trim().toLowerCase();

  const statusFilter = CLIENT_STATUSES.includes(
    params.status as ClientStatus
  )
    ? (params.status as ClientStatus)
    : "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/staff/clients");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        full_name,
        staff_id,
        job_title,
        department,
        duty_station,
        is_active,
        must_change_password
      `
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  if (profile.is_active !== true) {
    redirect("/login?error=account_not_active");
  }

  if (profile.must_change_password === true) {
    redirect("/reset-password?first_login=1");
  }

  const { data, error } = await supabase
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
        status,
        source,
        notes,
        created_at,
        updated_at
      `
    )
    .eq("staff_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Unable to load recruitment clients: ${error.message}`
    );
  }

  const clients = (data ?? []) as StaffClient[];

  const filteredClients = clients.filter((client) => {
    const statusMatches =
      !statusFilter || client.status === statusFilter;

    if (!statusMatches) {
      return false;
    }

    if (!searchText) {
      return true;
    }

    const searchable = [
      client.full_name,
      client.email,
      client.phone,
      client.nationality,
      client.country,
      client.interested_job,
      client.preferred_country,
      client.status,
      client.source,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(searchText);
  });

  const counts = {
    total: clients.length,
    lead: clients.filter((item) => item.status === "lead").length,
    contacted: clients.filter(
      (item) => item.status === "contacted"
    ).length,
    registered: clients.filter(
      (item) => item.status === "registered"
    ).length,
    applied: clients.filter(
      (item) => item.status === "applied"
    ).length,
    processing: clients.filter(
      (item) => item.status === "processing"
    ).length,
    placed: clients.filter(
      (item) => item.status === "placed"
    ).length,
    closed: clients.filter(
      (item) => item.status === "closed"
    ).length,
  };

  const fullName = profile.full_name || "Staff Member";

  return (
    <main className="min-h-screen bg-[#EEF1F5] text-slate-900">
      {/* SECURITY BAR */}
      <div className="border-b border-[#D4AF37]/30 bg-[#06162F] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Red Stone Secure Recruitment Information System
          </p>

          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AUTHENTICATED STAFF SESSION
          </div>
        </div>
      </div>

      {/* HEADER */}
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
              ← Staff Dashboard
            </Link>

            <a
              href="#add-client"
              className="rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              + Add New Client
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8">
        {/* PAGE TITLE */}
        <section className="overflow-hidden rounded-2xl border border-[#071A3D]/10 bg-white shadow-sm">
          <div className="relative bg-[#071A3D] px-6 py-8 text-white sm:px-8">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#D4AF37]/15 to-transparent" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                  Recruitment CRM
                </span>

                <span className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-200">
                  Authorized Personnel
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                My Client Pipeline
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Manage your recruitment leads, candidate follow-up,
                application progress, processing activity and successful
                placements from one secure workspace.
              </p>
            </div>
          </div>

          <div className="grid border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <IdentityCell
              label="Recruitment Officer"
              value={fullName}
              subtext={profile.staff_id || "Staff ID pending"}
            />

            <IdentityCell
              label="Department"
              value={profile.department || "Not assigned"}
              subtext={profile.job_title || "Recruitment staff"}
            />

            <IdentityCell
              label="Duty Station"
              value={profile.duty_station || "Not assigned"}
              subtext="Current work location"
            />

            <IdentityCell
              label="Active CRM Records"
              value={String(
                clients.filter((c) => c.status !== "closed").length
              )}
              subtext="Open recruitment cases"
              last
            />
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard
            label="Total"
            value={counts.total}
            description="All clients"
          />
          <MetricCard
            label="Leads"
            value={counts.lead}
            description="New prospects"
          />
          <MetricCard
            label="Contacted"
            value={counts.contacted}
            description="Follow-up started"
          />
          <MetricCard
            label="Registered"
            value={counts.registered}
            description="Registered"
          />
          <MetricCard
            label="Applied"
            value={counts.applied}
            description="Applications"
          />
          <MetricCard
            label="Processing"
            value={counts.processing}
            description="Active cases"
          />
          <MetricCard
            label="Placed"
            value={counts.placed}
            description="Successful"
            highlight
          />
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[390px_1fr]">
          {/* ADD CLIENT */}
          <aside>
            <section
              id="add-client"
              className="sticky top-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-[#071A3D] px-6 py-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
                  Client Intake
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Register New Client
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Create a new recruitment lead under your staff account.
                </p>
              </div>

              <form
                action={createOwnStaffClient}
                className="space-y-5 p-6"
              >
                <Field
                  label="Full Name"
                  name="full_name"
                  required
                  placeholder="Client full legal name"
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    label="Phone Number"
                    name="phone"
                    placeholder="+254..."
                  />

                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="client@example.com"
                  />
                </div>

                <p className="-mt-2 text-[11px] leading-5 text-slate-500">
                  At least one phone number or email address is required.
                </p>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    label="Nationality"
                    name="nationality"
                    placeholder="e.g. Kenyan"
                  />

                  <Field
                    label="Current Country"
                    name="country"
                    placeholder="e.g. Kenya"
                  />
                </div>

                <Field
                  label="Interested Job"
                  name="interested_job"
                  placeholder="e.g. Warehouse Worker"
                />

                <Field
                  label="Preferred Destination"
                  name="preferred_country"
                  placeholder="e.g. Canada"
                />

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
                    Client Source
                  </span>

                  <select
                    name="source"
                    defaultValue="manual"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  >
                    {SOURCE_OPTIONS.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </label>

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

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-[11px] font-semibold leading-5 text-blue-800">
                    New records automatically enter the pipeline as{" "}
                    <strong>Lead</strong> and remain assigned to your staff
                    account.
                  </p>
                </div>
              </form>
            </section>
          </aside>

          {/* CLIENT PIPELINE */}
          <section className="space-y-5">
            {/* SEARCH / FILTER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <form
                method="get"
                className="grid gap-4 md:grid-cols-[1fr_220px_auto_auto]"
              >
                <label>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    Search Client Records
                  </span>

                  <input
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Name, phone, email, job or destination..."
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    Pipeline Status
                  </span>

                  <select
                    name="status"
                    defaultValue={statusFilter}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-[#D4AF37]"
                  >
                    <option value="">All Statuses</option>

                    {CLIENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

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

            {/* TABLE */}
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

                <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                  Showing {filteredClients.length} of {clients.length}
                </div>
              </div>

              {filteredClients.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#071A3D] text-xl font-black text-[#F2D675]">
                    RS
                  </div>

                  <h3 className="mt-5 text-lg font-black text-[#071A3D]">
                    No matching client records
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Add your first recruitment client or adjust the current
                    search and status filters.
                  </p>

                  <a
                    href="#add-client"
                    className="mt-5 inline-flex rounded-lg bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
                  >
                    Add Client
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <TableHeading>Client</TableHeading>
                        <TableHeading>Recruitment Interest</TableHeading>
                        <TableHeading>Contact</TableHeading>
                        <TableHeading>Status</TableHeading>
                        <TableHeading>Created</TableHeading>
                        <TableHeading>Pipeline Control</TableHeading>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          className="align-top transition hover:bg-slate-50/70"
                        >
                          <td className="min-w-[220px] px-5 py-5">
                            <p className="font-black text-[#071A3D]">
                              {client.full_name}
                            </p>

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
                              {client.interested_job ||
                                "Job interest not recorded"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Destination:{" "}
                              <strong>
                                {client.preferred_country ||
                                  "Not specified"}
                              </strong>
                            </p>

                            {client.notes ? (
                              <p className="mt-3 max-w-[300px] text-xs leading-5 text-slate-500">
                                {truncate(client.notes, 120)}
                              </p>
                            ) : null}
                          </td>

                          <td className="min-w-[210px] px-5 py-5">
                            {client.phone ? (
                              <a
                                href={`tel:${client.phone}`}
                                className="block text-sm font-bold text-[#071A3D] hover:underline"
                              >
                                {client.phone}
                              </a>
                            ) : (
                              <p className="text-xs text-slate-400">
                                No phone
                              </p>
                            )}

                            {client.email ? (
                              <a
                                href={`mailto:${client.email}`}
                                className="mt-1 block break-all text-xs font-semibold text-[#B8860B] hover:underline"
                              >
                                {client.email}
                              </a>
                            ) : (
                              <p className="mt-1 text-xs text-slate-400">
                                No email
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <StatusBadge status={client.status} />
                          </td>

                          <td className="min-w-[145px] px-5 py-5">
                            <p className="text-xs font-bold text-slate-700">
                              {formatDate(client.created_at)}
                            </p>

                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Updated {formatDate(client.updated_at)}
                            </p>
                          </td>

                          <td className="min-w-[230px] px-5 py-5">
                            <form
                              action={updateOwnClientStatus}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="client_id"
                                value={client.id}
                              />

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

            {/* PIPELINE GUIDE */}
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#FFFBEB] p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Recruitment Workflow
              </p>

              <h2 className="mt-1 text-lg font-black text-[#071A3D]">
                Standard Client Pipeline
              </h2>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {CLIENT_STATUSES.map((status, index) => (
                  <div
                    key={status}
                    className="flex items-center gap-2"
                  >
                    <span className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#071A3D]">
                      {statusLabel(status)}
                    </span>

                    {index < CLIENT_STATUSES.length - 1 ? (
                      <span className="font-black text-[#B8860B]">
                        →
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-8 border-t border-slate-300 py-6">
          <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <p className="font-semibold">
              © Red Stone Employment Agency — Recruitment Operations
            </p>

            <p>Confidential • Authorized personnel only</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function IdentityCell({
  label,
  value,
  subtext,
  last = false,
}: {
  label: string;
  value: string;
  subtext: string;
  last?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${
        last
          ? ""
          : "border-b border-slate-200 lg:border-b-0 lg:border-r"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-black text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-[9px] font-black uppercase tracking-[0.16em] ${
          highlight ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-semibold text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
        {label}
        {required ? (
          <span className="ml-1 text-red-600">*</span>
        ) : null}
      </span>

      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
    </label>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    lead: "border-slate-200 bg-slate-100 text-slate-700",
    contacted: "border-blue-200 bg-blue-50 text-blue-700",
    registered:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
    applied:
      "border-violet-200 bg-violet-50 text-violet-700",
    processing:
      "border-amber-200 bg-amber-50 text-amber-800",
    placed:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    closed: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${
        classes[status] ??
        "border-slate-200 bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabel(status)}
    </span>
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

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max).trim()}…`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(date);
}