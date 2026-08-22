import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { bulkSetJobStatus, setJobStatus } from "@/lib/admin/actions";
import { BULK_JOB_WARNING } from "@/lib/admin/bulk-jobs";
import { requireAdmin } from "@/lib/admin/auth";
import { dateText, moneyText, numberValue, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";
import { createClient } from "@/utils/supabase/server";
import { skillLevelLabel } from "@/lib/jobs/catalogue";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BulkCreateReviewPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = (await searchParams) ?? {};
  const ids = parseIds(params.ids);
  const jobs = ids.length ? await fetchJobs(ids) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">Review Generated Drafts</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review every generated vacancy before publishing it to the public jobs page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/jobs/bulk-create" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#071A3D]">
            Create More
          </Link>
          <Link href="/admin/jobs" className="rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">
            All Jobs
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
        {BULK_JOB_WARNING}
      </section>

      {jobs.length ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#071A3D]">Controlled Bulk Actions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Bulk publish validates every selected vacancy before any status change is applied.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ConfirmAction
              action={bulkSetJobStatus.bind(null, "published")}
              label="Bulk Publish"
              message="Publish all generated jobs shown on this review page?"
              tone="gold"
            >
              {jobs.map((job) => (
                <input key={textValue(job, ["id"])} type="hidden" name="job_id" value={textValue(job, ["id"])} />
              ))}
            </ConfirmAction>
            <ConfirmAction
              action={bulkSetJobStatus.bind(null, "paused")}
              label="Bulk Pause"
              message="Pause all jobs shown on this review page?"
            >
              {jobs.map((job) => (
                <input key={textValue(job, ["id"])} type="hidden" name="job_id" value={textValue(job, ["id"])} />
              ))}
            </ConfirmAction>
            <ConfirmAction
              action={bulkSetJobStatus.bind(null, "archived")}
              label="Bulk Archive"
              message="Archive all jobs shown on this review page?"
              tone="danger"
            >
              {jobs.map((job) => (
                <input key={textValue(job, ["id"])} type="hidden" name="job_id" value={textValue(job, ["id"])} />
              ))}
            </ConfirmAction>
          </div>
        </section>
      ) : null}

      <AdminTable
        columns={["Title", "Employer", "Country", "Skill", "Vacancies", "Salary", "Deadline", "Status", "Actions"]}
        rows={jobs}
        emptyTitle="No generated jobs selected"
        emptyMessage="Return to bulk create and generate draft vacancies first."
        renderRow={(job) => (
          <tr key={textValue(job, ["id"])}>
            <td className="px-4 py-3">
              <p className="font-semibold text-[#071A3D]">{textValue(job, ["title"])}</p>
              <p className="mt-1 text-xs text-slate-500">{textValue(job, ["category"])}</p>
            </td>
            <td className="px-4 py-3 text-slate-600">{employerName(job)}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(job, ["country"])} / {textValue(job, ["city"])}</td>
            <td className="px-4 py-3 text-slate-600">{skillLevelLabel(job.skill_level)}</td>
            <td className="px-4 py-3 text-slate-600">{numberValue(job, ["vacancies"])}</td>
            <td className="px-4 py-3 text-slate-600">{salaryText(job)}</td>
            <td className="px-4 py-3 text-slate-600">{dateText(job.application_deadline)}</td>
            <td className="px-4 py-3"><StatusBadge status={textValue(job, ["status"], "draft")} /></td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/jobs/${textValue(job, ["id"])}`} className="font-semibold text-[#071A3D]">View</Link>
                <Link href={`/admin/jobs/${textValue(job, ["id"])}/edit`} className="font-semibold text-[#B8860B]">Edit</Link>
                <ConfirmAction
                  action={setJobStatus.bind(null, textValue(job, ["id"]), "published")}
                  label="Publish"
                  message="Publish this vacancy to redstone.co.ke?"
                  tone="gold"
                />
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

async function fetchJobs(ids: string[]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, title, employer_id, employer:employers(company_name), country, city, category, skill_level, vacancies, salary_min, salary_max, currency, salary_period, salary_confirmed, application_deadline, status, created_at")
    .in("id", ids)
    .returns<Row[]>();
  const byId = new Map((data ?? []).map((job) => [textValue(job, ["id"], ""), job]));

  return ids.map((id) => byId.get(id)).filter((job): job is Row => Boolean(job));
}

function parseIds(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value.join(",") : value ?? "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function salaryText(job: Row) {
  if (job.salary_confirmed === false && !job.salary_min && !job.salary_max) {
    return "To be confirmed by employer.";
  }

  return moneyText(job);
}

function employerName(job: Row) {
  const employer = job.employer;
  if (Array.isArray(employer) && employer[0] && typeof employer[0] === "object") {
    return textValue(employer[0] as Row, ["company_name"], "Employer");
  }

  if (employer && typeof employer === "object") {
    return textValue(employer as Row, ["company_name"], "Employer");
  }

  return "Employer";
}
