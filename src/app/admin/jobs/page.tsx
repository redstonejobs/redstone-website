import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { bulkSetAdminJobStatus, setJobStatus } from "@/lib/admin/actions";
import { fetchAdminJobs, getPage, getParam } from "@/lib/admin/data";
import { dateText, numberValue, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";
import { JOB_CATEGORIES, SKILL_LEVELS } from "@/lib/jobs/catalogue";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JobsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const currentStatus = getParam(params, "status") || "all";
  const result = await fetchAdminJobs({
    page: getPage(params),
    query: getParam(params, "q"),
    country: getParam(params, "country"),
    category: getParam(params, "category"),
    skillLevel: getParam(params, "skill_level"),
    employer: getParam(params, "employer"),
    status: currentStatus,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">Jobs</h1>
          <p className="mt-1 text-sm text-slate-600">Search, filter and manage vacancies.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/job-imports" className="rounded-md border border-[#D4AF37] bg-amber-50 px-4 py-3 text-sm font-semibold text-[#071A3D]">
            Automatic Imports
          </Link>
          <Link href="/admin/jobs/bulk-create" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#071A3D]">
            Bulk Job Publisher
          </Link>
          <Link href="/admin/jobs/new" className="rounded-md bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#071A3D]">
            Create Job
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Job status filters">
        {[
          ["All", "all"],
          ["Draft", "draft"],
          ["Published", "published"],
          ["Expired", "expired"],
          ["Archived", "archived"],
        ].map(([label, status]) => (
          <Link
            key={status}
            href={status === "all" ? "/admin/jobs" : `/admin/jobs?status=${status}`}
            className={`rounded-md border px-4 py-2 text-sm font-bold ${currentStatus === status ? "border-[#071A3D] bg-[#071A3D] text-white" : "border-slate-200 bg-white text-[#071A3D]"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <FilterBar
        searchPlaceholder="Search title, employer, country, category"
        filters={[
          { name: "status", label: "Status", options: ["draft", "published", "paused", "closed", "archived"] },
          { name: "skill_level", label: "Skill", options: SKILL_LEVELS.map((item) => item.value) },
          { name: "category", label: "Category", options: [...JOB_CATEGORIES] },
        ]}
      />

      {result.rows.length ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <p>Select rows below, tick the confirmation box, then apply a bulk status action. Publication still runs server-side validation before a vacancy becomes public.</p>
        </section>
      ) : null}

      <form className="space-y-4">
        <AdminTable
          columns={["Select", "Job title", "Country", "Employer", "Vacancies", "Status", "Deadline", "Publication date", "Applications", "Last updated", "Actions"]}
          rows={result.rows}
          emptyTitle="No jobs found"
          emptyMessage="No vacancies match the current filters."
          renderRow={(job: Row) => {
            const id = textValue(job, ["id"]);
            const status = textValue(job, ["status"], "draft");

            return (
              <tr key={id}>
                <td className="px-4 py-3">
                  <input name="job_id" value={id} type="checkbox" className="h-4 w-4 accent-[#D4AF37]" />
                </td>
                <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(job, ["title"])}</td>
                <td className="px-4 py-3 text-slate-600">{textValue(job, ["country"])}</td>
                <td className="px-4 py-3 text-slate-600">{employerName(job)}</td>
                <td className="px-4 py-3 text-slate-600">{numberValue(job, ["vacancies"])}</td>
                <td className="px-4 py-3"><StatusBadge status={status} /></td>
                <td className="px-4 py-3 text-slate-600">{dateText(job.application_deadline)}</td>
                <td className="px-4 py-3 text-slate-600">{dateText(job.published_at)}</td>
                <td className="px-4 py-3 text-slate-600">{applicationCount(job)}</td>
                <td className="px-4 py-3 text-slate-600">{dateText(job.updated_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/jobs/${id}`} className="font-semibold text-[#071A3D]">View</Link>
                    <Link href={`/admin/jobs/${id}/edit`} className="font-semibold text-[#B8860B]">Edit</Link>
                    {status !== "published" ? (
                      <button type="submit" formNoValidate formAction={setJobStatus.bind(null, id, "published")} className="font-semibold text-emerald-700">Publish</button>
                    ) : (
                      <button type="submit" formNoValidate formAction={setJobStatus.bind(null, id, "draft")} className="font-semibold text-slate-700">Unpublish</button>
                    )}
                    {status !== "archived" ? (
                      <button type="submit" formNoValidate formAction={setJobStatus.bind(null, id, "archived")} className="font-semibold text-red-700">Archive</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          }}
        />

        {result.rows.length ? (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <label className="flex items-start gap-2 text-sm font-semibold text-slate-700">
              <input name="confirm" type="checkbox" value="yes" required className="mt-1 h-4 w-4 accent-[#D4AF37]" />
              Confirm bulk action for selected vacancies.
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" formAction={bulkSetAdminJobStatus.bind(null, "published")} className="rounded-md bg-[#071A3D] px-4 py-2 text-sm font-bold text-white">Publish Selected</button>
              <button type="submit" formAction={bulkSetAdminJobStatus.bind(null, "draft")} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-[#071A3D]">Unpublish Selected</button>
              <button type="submit" formAction={bulkSetAdminJobStatus.bind(null, "archived")} className="rounded-md border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Archive Selected</button>
            </div>
          </div>
        ) : null}
      </form>

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/jobs" />
    </div>
  );
}

function employerName(job: Row) {
  const employer = job.employer;
  if (Array.isArray(employer)) return textValue(employer[0] ?? {}, ["company_name"], "Employer not set");
  if (employer && typeof employer === "object") return textValue(employer as Row, ["company_name"], "Employer not set");
  return textValue(job, ["employer_id"], "Employer not set");
}

function applicationCount(job: Row) {
  const applications = job.applications;
  if (Array.isArray(applications)) {
    const first = applications[0] as Row | undefined;
    return numberValue(first ?? {}, ["count"]);
  }

  if (applications && typeof applications === "object") {
    return numberValue(applications as Row, ["count"]);
  }

  return 0;
}
