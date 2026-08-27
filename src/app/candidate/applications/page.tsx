import Link from "next/link";

import { dateText } from "@/lib/admin/format";
import { requireCandidate } from "@/lib/candidate/auth";
import { candidateStatusLabel } from "@/lib/candidate/constants";
import { getCandidateApplications } from "@/lib/candidate/data";

type Props = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

type ApplicationRow = Record<string, unknown>;

const FILTERS = [
  { key: "active", label: "Active Cases" },
  { key: "completed", label: "Completed" },
  { key: "withdrawn", label: "Withdrawn" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All Applications" },
];

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function statusStyle(status: string) {
  const normalized = status.toLowerCase();

  if (
    ["approved", "accepted", "placed", "completed"].includes(
      normalized,
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    [
      "processing",
      "under_review",
      "reviewing",
      "submitted",
    ].includes(normalized)
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (
    ["rejected", "declined", "cancelled"].includes(normalized)
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (normalized === "withdrawn") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function estimatedProgress(status: string) {
  switch (status.toLowerCase()) {
    case "draft":
      return 15;

    case "submitted":
      return 30;

    case "under_review":
    case "reviewing":
      return 45;

    case "processing":
      return 60;

    case "approved":
    case "accepted":
      return 80;

    case "placed":
      return 95;

    case "completed":
      return 100;

    case "rejected":
    case "declined":
    case "withdrawn":
    case "cancelled":
      return 100;

    default:
      return 25;
  }
}

function applicationReference(id: string) {
  if (!id) {
    return "APPLICATION";
  }

  return `APP-${id.slice(0, 8).toUpperCase()}`;
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function CandidateApplicationsPage({
  searchParams,
}: Props) {
  const context = await requireCandidate();

  const params = (await searchParams) ?? {};

  const filter =
    typeof params.filter === "string"
      ? params.filter
      : "active";

  const { rows } = await getCandidateApplications(
    context,
    filter,
  );

  const applications = rows as ApplicationRow[];

  const activeCount = applications.filter((application) => {
    const status = String(application.status ?? "").toLowerCase();

    return ![
      "completed",
      "placed",
      "rejected",
      "declined",
      "withdrawn",
      "cancelled",
    ].includes(status);
  }).length;

  const processingCount = applications.filter((application) =>
    [
      "submitted",
      "processing",
      "under_review",
      "reviewing",
    ].includes(
      String(application.status ?? "").toLowerCase(),
    ),
  ).length;

  const successfulCount = applications.filter((application) =>
    ["approved", "accepted", "placed", "completed"].includes(
      String(application.status ?? "").toLowerCase(),
    ),
  ).length;

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F2D675]">
              Candidate Immigration Portal
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              My Applications
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Track your employment and immigration cases,
              review application progress, complete required
              information and prepare supporting documents
              for each destination.
            </p>
          </div>
        </div>
      </section>

      {/* CASE METRICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Displayed Cases"
          value={applications.length}
          description="Applications under the selected filter"
        />

        <StatCard
          label="Active"
          value={activeCount}
          description="Cases that may still require action"
        />

        <StatCard
          label="Processing"
          value={processingCount}
          description="Submitted or currently under review"
        />

        <StatCard
          label="Advanced"
          value={successfulCount}
          description="Approved, accepted or completed cases"
        />
      </section>

      {/* IMMIGRATION READINESS */}
      <section className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8A6D12]">
              Immigration Readiness
            </p>

            <h2 className="mt-2 text-xl font-black text-[#071A3D]">
              Keep your case information complete and accurate
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Individual application records can contain
              identity information, passport details,
              education, work history, travel and visa
              history, dependants, declarations, financial
              information, employer details and supporting
              documents.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/30 bg-white px-5 py-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Important
            </p>

            <p className="mt-1 text-sm font-bold text-[#071A3D]">
              Provide truthful information
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-black text-[#071A3D]">
            Application Register
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a category to view your recruitment cases.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const selected = filter === item.key;

            return (
              <Link
                key={item.key}
                href={`/candidate/applications?filter=${item.key}`}
                className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  selected
                    ? "border-[#071A3D] bg-[#071A3D] text-white shadow-sm"
                    : "border-slate-200 bg-white text-[#071A3D] hover:border-[#D4AF37]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* APPLICATIONS */}
      <section className="space-y-4">
        {applications.map((application) => {
          const id = String(application.id ?? "");

          const job =
            application.job as Record<
              string,
              unknown
            > | null;

          const status = String(
            application.status ?? "draft",
          );

          const statusLabel =
            candidateStatusLabel(status);

          const progress =
            estimatedProgress(status);

          const title = String(
            job?.title ?? "Employment Application",
          );

          const country = String(
            job?.country ?? "Destination not specified",
          );

          const city = String(job?.city ?? "");

          const submitted =
            application.submitted_at ??
            application.created_at;

          return (
            <article
              key={id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-[#D4AF37]/60 hover:shadow-md"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#B8860B]">
                        {applicationReference(id)}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(
                          status,
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-black text-[#071A3D]">
                      {title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                      <span>
                        <strong className="text-slate-700">
                          Destination:
                        </strong>{" "}
                        {city
                          ? `${city}, ${country}`
                          : country}
                      </span>

                      <span>
                        <strong className="text-slate-700">
                          Submitted:
                        </strong>{" "}
                        {dateText(submitted)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/candidate/applications/${id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B2859]"
                    >
                      Open Application
                    </Link>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        Case Progress
                      </p>
                    </div>

                    <p className="text-sm font-black text-[#071A3D]">
                      {progress}%
                    </p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#D4AF37]"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Progress is an operational indicator based
                    on the current case stage. It does not
                    guarantee an immigration or employment
                    outcome.
                  </p>
                </div>
              </div>

              <div className="grid border-t border-slate-200 bg-slate-50/80 sm:grid-cols-3">
                <CaseFooterItem
                  label="Application Stage"
                  value={titleCase(status)}
                />

                <CaseFooterItem
                  label="Destination"
                  value={country}
                />

                <CaseFooterItem
                  label="Next Step"
                  value="Open case for requirements"
                />
              </div>
            </article>
          );
        })}

        {applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071A3D] text-xl font-black text-[#F2D675]">
              RS
            </div>

            <h3 className="mt-4 text-lg font-black text-[#071A3D]">
              No applications found
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              There are no applications under the selected
              category. Applications will appear here after
              they are created or submitted.
            </p>
          </div>
        ) : null}
      </section>

      {/* COMPLIANCE NOTICE */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-bold text-[#071A3D]">
          Application Information Notice
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Immigration and employment applications may involve
          sensitive personal information. Candidates should
          provide accurate information and only upload genuine
          documents. Final visa, permit and immigration
          decisions remain with the relevant government
          authority.
        </p>
      </section>
    </div>
  );
}

function CaseFooterItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-[#071A3D]">
        {value}
      </p>
    </div>
  );
}