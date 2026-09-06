import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  addApplicationNote,
  assignApplication,
  updateApplicationStatus,
} from "@/lib/admin/actions";
import {
  attachApplicationRelations,
  fetchById,
  fetchDocumentsWithRelations,
  fetchRows,
} from "@/lib/admin/data";
import {
  dateText,
  nestedRow,
  textValue,
} from "@/lib/admin/format";
import { APPLICATION_STATUSES } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

function caseReference(id: string) {
  return `APP-${id.slice(0, 8).toUpperCase()}`;
}

function locationText(row: Row | null) {
  if (!row) {
    return "Not recorded";
  }

  const city = textValue(row, ["city"], "");
  const country = textValue(row, ["country"], "");

  if (city && country) {
    return `${city}, ${country}`;
  }

  return city || country || "Not recorded";
}

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

function documentState(document: Row) {
  return textValue(
    document,
    ["verification_status", "status"],
    "pending",
  ).toLowerCase();
}

export default async function ApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { data: application, error } = await fetchById(
    "applications",
    id,
  );

  if (error || !application) {
    notFound();
  }

  const [history, documents, staff, notes] =
    await Promise.all([
      fetchRows({
        table: "application_status_history",
        filters: { application_id: id },
        orderBy: "created_at",
        ascending: true,
      }),

      fetchDocumentsWithRelations({
        page: 1,
        filters: { application_id: id },
      }),

      fetchRows({
        table: "staff_roles",
        filters: { active: "true" },
        page: 1,
      }),

      fetchRows({
        table: "application_notes",
        filters: { application_id: id },
        page: 1,
      }),
    ]);

  const related = (
    await attachApplicationRelations({
      rows: [application],
    })
  ).rows[0];

  const candidate = nestedRow(related, "candidate");
  const job = nestedRow(related, "job");
  const employer = nestedRow(related, "employer");
  const assigned = nestedRow(
    related,
    "assigned_staff",
  );
  const referralStaff = nestedRow(related, "referral_staff");

  /*
   * Resolve names for staff assignment options so admins
   * do not have to work with raw UUIDs.
   */
  const staffUserIds = Array.from(
    new Set(
      staff.rows
        .map((staffRole) =>
          textValue(staffRole, ["user_id"], ""),
        )
        .filter(Boolean),
    ),
  );

  const staffProfiles = await Promise.all(
    staffUserIds.map(async (userId) => {
      const { data } = await fetchById(
        "profiles",
        userId,
      );

      return [userId, data] as const;
    }),
  );

  const staffProfileMap = new Map(
    staffProfiles.filter(([, profile]) => profile),
  );

  const currentStatus = textValue(
    application,
    ["status"],
    "draft",
  );

  const assignedStaffId = textValue(
    application,
    ["assigned_staff_id"],
    "",
  );

  const verifiedDocuments = documents.rows.filter(
    (document) => {
      const status = documentState(document);

      return (
        status === "verified" ||
        status === "approved" ||
        status === "accepted"
      );
    },
  ).length;

  const pendingDocuments =
    documents.rows.length - verifiedDocuments;

  return (
    <div className="space-y-7">
      {/* BACK NAVIGATION */}
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#071A3D] transition hover:text-[#B8860B]"
        >
          <span aria-hidden="true">←</span>
          Back to Applications
        </Link>
      </div>

      {/* CASE HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F2D675]">
                Recruitment Case Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Application Case
              </h1>

              <p className="mt-2 font-mono text-sm font-semibold text-[#F2D675]">
                {caseReference(id)}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Review candidate information, recruitment
                assignment, submitted documents, internal
                case notes and application workflow history.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Current Case Status
              </p>

              <StatusBadge status={currentStatus} />

              <p className="mt-3 text-xs text-slate-400">
                Last updated
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {dateText(application.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CASE METRICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Documents"
          value={documents.rows.length}
          description="Files attached to this case"
        />

        <MetricCard
          label="Verified"
          value={verifiedDocuments}
          description="Documents cleared or approved"
        />

        <MetricCard
          label="Pending Review"
          value={pendingDocuments}
          description="Documents not yet cleared"
        />

        <MetricCard
          label="Case Activity"
          value={history.rows.length}
          description="Recorded status changes"
        />
      </section>

      {/* MAIN RECORD */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Candidate Record"
          subtitle="Applicant identity and contact information."
        >
          <Field
            label="Candidate"
            value={textValue(
              candidate,
              ["full_name"],
              textValue(
                application,
                ["candidate_id"],
                "Candidate",
              ),
            )}
          />

          <Field
            label="Nationality"
            value={textValue(
              candidate,
              ["nationality"],
              "Not recorded",
            )}
          />

          <Field
            label="Phone"
            value={textValue(
              candidate,
              ["phone"],
              "Not recorded",
            )}
          />

          <Field
            label="Current Location"
            value={locationText(candidate)}
          />
        </Panel>

        <Panel
          title="Job & Employer"
          subtitle="Position associated with this application."
        >
          <Field
            label="Position"
            value={textValue(
              job,
              ["title"],
              textValue(
                application,
                ["job_id"],
                "Job not identified",
              ),
            )}
          />

          <Field
            label="Destination"
            value={locationText(job)}
          />

          <Field
            label="Employer"
            value={textValue(
              employer,
              ["company_name"],
              "Employer not recorded",
            )}
          />

          <Field
            label="Job Status"
            value={titleCase(
              textValue(
                job,
                ["status"],
                "Not recorded",
              ),
            )}
          />
        </Panel>

        <Panel
          title="Case Administration"
          subtitle="Current workflow and administrative ownership."
        >
          <Field
            label="Application Status"
            value={
              <StatusBadge status={currentStatus} />
            }
          />

          <Field
            label="Submitted / Created"
            value={dateText(
              application.submitted_at ??
                application.created_at,
            )}
          />

          <Field
            label="Reviewed"
            value={dateText(
              application.reviewed_at,
            )}
          />

          <Field
            label="Assigned Officer"
            value={textValue(
              assigned,
              ["full_name"],
              "Unassigned",
            )}
          />

          <Field
            label="Referral Staff"
            value={textValue(
              referralStaff,
              ["full_name"],
              "Direct / Unattributed",
            )}
          />

          <Field
            label="Referral Code"
            value={textValue(
              referralStaff,
              ["referral_code"],
              "No staff referral",
            )}
          />
        </Panel>
      </div>

      {/* OPERATION CONTROLS */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#071A3D]">
            Case Processing Controls
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Administrative actions affecting the active
            recruitment case.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {/* STATUS */}
          <Panel
            title="Application Status"
            subtitle="Advance or update the recruitment workflow."
            accent
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Current Status
              </p>

              <div className="mt-2">
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            <form
              action={updateApplicationStatus.bind(
                null,
                id,
              )}
              className="space-y-4"
            >
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                New Status

                <select
                  name="status"
                  defaultValue={currentStatus}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
                >
                  {APPLICATION_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {titleCase(status)}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Override / Decision Reason

                <textarea
                  name="override_reason"
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
                  placeholder="Enter a reason where required by workflow or administrative override."
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B2859]"
              >
                Update Application Status
              </button>
            </form>
          </Panel>

          {/* ASSIGNMENT */}
          <Panel
            title="Case Officer Assignment"
            subtitle="Assign responsibility for this application."
            accent
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Current Officer
              </p>

              <p className="mt-2 font-bold text-[#071A3D]">
                {textValue(
                  assigned,
                  ["full_name"],
                  "Unassigned",
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {assignedStaffId
                  ? "Officer currently responsible for this case."
                  : "This case requires staff assignment."}
              </p>
            </div>

            <form
              action={assignApplication.bind(null, id)}
              className="space-y-4"
            >
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Assign Staff Member

                <select
                  name="assigned_staff_id"
                  defaultValue={assignedStaffId}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
                  required
                >
                  <option value="" disabled>
                    Select staff member
                  </option>

                  {staff.rows.map((staffRole) => {
                    const roleId = textValue(
                      staffRole,
                      ["id"],
                    );

                    const userId = textValue(
                      staffRole,
                      ["user_id"],
                    );

                    const role = textValue(
                      staffRole,
                      ["role"],
                      "staff",
                    );

                    const profile =
                      staffProfileMap.get(userId);

                    const staffName = profile
                      ? textValue(
                          profile,
                          ["full_name"],
                          userId,
                        )
                      : userId;

                    return (
                      <option
                        key={roleId}
                        value={userId}
                      >
                        {staffName} —{" "}
                        {titleCase(role)}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Assignment Reason

                <textarea
                  name="assignment_reason"
                  rows={3}
                  className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
                  placeholder="Why is this case being assigned or reassigned?"
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B2859]"
              >
                Save Case Assignment
              </button>
            </form>
          </Panel>
        </div>
      </section>

      {/* NOTES */}
      <Panel
        title="Internal Recruitment Notes"
        subtitle="Private administrative notes associated with this case."
      >
        <form
          action={addApplicationNote.bind(null, id)}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Add Internal Note

            <textarea
              name="note"
              rows={4}
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
              placeholder="Record candidate communication, document issues, employer feedback or administrative follow-up..."
              required
            />
          </label>

          <button
            type="submit"
            className="mt-4 rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0B2859]"
          >
            Add Internal Note
          </button>
        </form>

        {textValue(
          application,
          ["internal_notes"],
          "",
        ) && (
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8A6D12]">
              Legacy / Case Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {textValue(application, [
                "internal_notes",
              ])}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {notes.rows.length === 0 ? (
            <EmptyState message="No internal notes have been recorded yet." />
          ) : (
            notes.rows.map((note) => (
              <article
                key={textValue(note, ["id"])}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {textValue(
                    note,
                    ["note"],
                    "No note text",
                  )}
                </p>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  {dateText(note.created_at)}
                </p>
              </article>
            ))
          )}
        </div>
      </Panel>

      {/* HISTORY + DOCUMENTS */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Case Status Timeline"
          subtitle="Recorded history of workflow changes."
        >
          {history.rows.length === 0 ? (
            <EmptyState message="No status history records found." />
          ) : (
            <ol className="space-y-1">
              {history.rows.map(
                (item: Row, index) => (
                  <li
                    key={textValue(item, ["id"])}
                    className="relative pl-8 pb-6 last:pb-0"
                  >
                    {index <
                      history.rows.length - 1 && (
                      <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
                    )}

                    <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-white bg-[#D4AF37] shadow" />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-bold text-[#071A3D]">
                        {titleCase(
                          textValue(
                            item,
                            ["previous_status"],
                            "Not set",
                          ),
                        )}
                        <span className="mx-2 text-slate-400">
                          →
                        </span>
                        {titleCase(
                          textValue(
                            item,
                            [
                              "new_status",
                              "status",
                            ],
                            "Unknown",
                          ),
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {dateText(item.created_at)}
                      </p>

                      {item.reason ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {textValue(item, [
                            "reason",
                          ])}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ),
              )}
            </ol>
          )}
        </Panel>

        <Panel
          title="Application Documents"
          subtitle={`${verifiedDocuments} verified • ${pendingDocuments} pending review`}
        >
          {documents.rows.length === 0 ? (
            <EmptyState message="No application documents have been submitted." />
          ) : (
            <div className="space-y-3">
              {documents.rows.map(
                (document: Row) => {
                  const status =
                    documentState(document);

                  const verified =
                    status === "verified" ||
                    status === "approved" ||
                    status === "accepted";

                  return (
                    <div
                      key={textValue(
                        document,
                        ["id"],
                      )}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#071A3D]">
                          {textValue(
                            document,
                            [
                              "file_name",
                              "document_type",
                              "type",
                            ],
                            "Application Document",
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {titleCase(
                            textValue(
                              document,
                              ["document_type"],
                              "Document",
                            ),
                          )}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          verified
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {titleCase(status)}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* SECURITY */}
      <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-5 py-4">
        <p className="font-semibold text-[#071A3D]">
          Confidential Recruitment Record
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Candidate records, uploaded documents, internal
          notes and recruitment decisions should only be
          accessed or modified by authorised personnel.
          Status changes and staff assignments may form part
          of the administrative audit trail.
        </p>
      </section>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
        accent
          ? "border-[#D4AF37]/30"
          : "border-slate-200"
      }`}
    >
      <header
        className={`border-b px-5 py-4 sm:px-6 ${
          accent
            ? "border-[#D4AF37]/20 bg-[#D4AF37]/5"
            : "border-slate-200 bg-slate-50/80"
        }`}
      >
        <h2 className="text-lg font-bold text-[#071A3D]">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div className="space-y-4 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>

      <div className="mt-1.5 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function MetricCard({
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
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
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

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}