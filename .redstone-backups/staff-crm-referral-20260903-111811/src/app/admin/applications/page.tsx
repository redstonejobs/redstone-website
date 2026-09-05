import Link from "next/link";

import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  fetchApplicationsWithRelations,
  getPage,
  getParam,
} from "@/lib/admin/data";
import {
  dateText,
  nestedRow,
  textValue,
} from "@/lib/admin/format";
import { APPLICATION_STATUSES } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function applicationReference(application: Row) {
  const id = textValue(application, ["id"], "");

  if (!id) {
    return "—";
  }

  return `APP-${id.slice(0, 8).toUpperCase()}`;
}

function locationText(job: Row | null) {
  if (!job) {
    return "Not specified";
  }

  const city = textValue(job, ["city"], "");
  const country = textValue(job, ["country"], "");

  if (city && country) {
    return `${city}, ${country}`;
  }

  return country || city || "Not specified";
}

function candidateLocation(candidate: Row | null) {
  if (!candidate) {
    return "Location not recorded";
  }

  const city = textValue(candidate, ["city"], "");
  const country = textValue(candidate, ["country"], "");
  const nationality = textValue(candidate, ["nationality"], "");

  if (city && country) {
    return `${city}, ${country}`;
  }

  if (country) {
    return country;
  }

  if (nationality) {
    return `${nationality} national`;
  }

  return "Location not recorded";
}

function visibleStatusCount(rows: Row[], status: string) {
  return rows.filter(
    (row) =>
      textValue(row, ["status"], "draft").toLowerCase() ===
      status.toLowerCase(),
  ).length;
}

function QueueStat({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#071A3D]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default async function ApplicationsPage({
  searchParams,
}: PageProps) {
  const params = (await searchParams) ?? {};

  const query = getParam(params, "q");
  const status = getParam(params, "status");

  const result = await fetchApplicationsWithRelations({
    page: getPage(params),
    query,
    filters: {
      status,
      assigned_staff_id: getParam(
        params,
        "assigned_staff",
      ),
      job_id: getParam(params, "job"),
      candidate_id: getParam(params, "candidate"),
    },
  });

  const visibleRows = result.rows;

  const draftCount = visibleStatusCount(
    visibleRows,
    "draft",
  );

  const submittedCount = visibleStatusCount(
    visibleRows,
    "submitted",
  );

  const processingCount =
    visibleStatusCount(visibleRows, "processing") +
    visibleStatusCount(visibleRows, "under_review") +
    visibleStatusCount(visibleRows, "reviewing");

  const placedCount =
    visibleStatusCount(visibleRows, "placed") +
    visibleStatusCount(visibleRows, "approved") +
    visibleStatusCount(visibleRows, "accepted");

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F2D675]">
                Recruitment Operations
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Application Operations Centre
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Review candidate applications, monitor case
                progress, verify recruitment assignments and
                open individual application records for
                administrative action.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                Total matching records
              </p>

              <p className="mt-1 text-3xl font-bold text-[#F2D675]">
                {result.count}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Page {result.page}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUEUE SNAPSHOT */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#071A3D]">
            Queue Snapshot
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Status indicators below reflect applications
            currently visible on this page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <QueueStat
            label="Visible Cases"
            value={visibleRows.length}
            description="Applications loaded on this page"
          />

          <QueueStat
            label="Draft"
            value={draftCount}
            description="Applications still in draft state"
          />

          <QueueStat
            label="Submitted"
            value={submittedCount}
            description="Submitted cases awaiting workflow"
          />

          <QueueStat
            label="In Process"
            value={processingCount}
            description="Cases currently under processing"
          />

          <QueueStat
            label="Advanced"
            value={placedCount}
            description="Approved, accepted or placed cases"
          />
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#071A3D]">
            Search Application Register
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search application notes, case status or narrow
            the register using workflow filters.
          </p>
        </div>

        <FilterBar
          searchPlaceholder="Search application notes or status"
          filters={[
            {
              name: "status",
              label: "Application Status",
              options: [...APPLICATION_STATUSES],
            },
          ]}
        />
      </section>

      {/* APPLICATION TABLE */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#071A3D]">
                Application Case Register
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Candidate, job, destination and officer
                assignment overview.
              </p>
            </div>

            {(query || status) && (
              <Link
                href="/admin/applications"
                className="text-sm font-semibold text-[#071A3D] hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        </div>

        <AdminTable
          columns={[
            "Case / Applicant",
            "Job & Employer",
            "Destination",
            "Status",
            "Assigned Officer",
            "Created / Submitted",
            "Last Updated",
            "Action",
          ]}
          rows={result.rows}
          emptyTitle="No applications found"
          emptyMessage="No application records match the current search or filters."
          renderRow={(application: Row) => {
            const candidate = nestedRow(
              application,
              "candidate",
            );

            const job = nestedRow(application, "job");

            const employer = nestedRow(
              application,
              "employer",
            );

            const assigned = nestedRow(
              application,
              "assigned_staff",
            );

            const applicationId = textValue(
              application,
              ["id"],
            );

            const candidateName = textValue(
              candidate,
              ["full_name"],
              textValue(
                application,
                ["candidate_id"],
                "Candidate",
              ),
            );

            const phone = textValue(
              candidate,
              ["phone"],
              "",
            );

            const jobTitle = textValue(
              job,
              ["title"],
              textValue(
                application,
                ["job_id"],
                "Job not identified",
              ),
            );

            const employerName = textValue(
              employer,
              ["company_name"],
              "Employer not recorded",
            );

            const assignedName = textValue(
              assigned,
              ["full_name"],
              "Unassigned",
            );

            const createdDate =
              application.submitted_at ??
              application.created_at;

            return (
              <tr
                key={applicationId}
                className="transition hover:bg-slate-50"
              >
                {/* APPLICANT */}
                <td className="px-4 py-4 align-top">
                  <div className="min-w-[190px]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B8860B]">
                      {applicationReference(application)}
                    </p>

                    <p className="mt-1 font-bold text-[#071A3D]">
                      {candidateName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {candidateLocation(candidate)}
                    </p>

                    {phone && (
                      <p className="mt-1 text-xs text-slate-500">
                        {phone}
                      </p>
                    )}
                  </div>
                </td>

                {/* JOB */}
                <td className="px-4 py-4 align-top">
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-slate-800">
                      {jobTitle}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {employerName}
                    </p>

                    {job && (
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Job:{" "}
                        {textValue(
                          job,
                          ["status"],
                          "Status unavailable",
                        )}
                      </p>
                    )}
                  </div>
                </td>

                {/* DESTINATION */}
                <td className="px-4 py-4 align-top text-sm text-slate-600">
                  <div className="min-w-[130px]">
                    <p className="font-medium text-slate-700">
                      {locationText(job)}
                    </p>
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-4 align-top">
                  <StatusBadge
                    status={textValue(
                      application,
                      ["status"],
                      "draft",
                    )}
                  />
                </td>

                {/* OFFICER */}
                <td className="px-4 py-4 align-top">
                  <div className="min-w-[130px]">
                    <p
                      className={`text-sm font-semibold ${
                        assignedName === "Unassigned"
                          ? "text-amber-700"
                          : "text-slate-700"
                      }`}
                    >
                      {assignedName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {assignedName === "Unassigned"
                        ? "Requires assignment"
                        : "Case officer"}
                    </p>
                  </div>
                </td>

                {/* CREATED / SUBMITTED */}
                <td className="px-4 py-4 align-top text-sm text-slate-600">
                  <div className="min-w-[120px]">
                    <p>{dateText(createdDate)}</p>

                    <p className="mt-1 text-xs text-slate-400">
                      {application.submitted_at
                        ? "Submitted"
                        : "Created"}
                    </p>
                  </div>
                </td>

                {/* UPDATED */}
                <td className="px-4 py-4 align-top text-sm text-slate-600">
                  <div className="min-w-[120px]">
                    <p>
                      {dateText(application.updated_at)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Last activity
                    </p>
                  </div>
                </td>

                {/* ACTION */}
                <td className="px-4 py-4 align-top">
                  <Link
                    href={`/admin/applications/${applicationId}`}
                    className="inline-flex min-w-[105px] items-center justify-center rounded-xl bg-[#071A3D] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B2859]"
                  >
                    Open Case
                  </Link>
                </td>
              </tr>
            );
          }}
        />

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            count={result.count}
            basePath="/admin/applications"
          />
        </div>
      </section>

      {/* SECURITY NOTICE */}
      <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-5 py-4">
        <p className="text-sm font-semibold text-[#071A3D]">
          Administrative Case Management
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Application records may contain confidential
          candidate and recruitment information. Case
          decisions, document verification and workflow
          changes should be performed only by authorised
          personnel.
        </p>
      </section>
    </div>
  );
}