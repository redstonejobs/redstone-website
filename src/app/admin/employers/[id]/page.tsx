import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { setEmployerState } from "@/lib/admin/actions";
import { countRows, fetchById, fetchRows } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: employer, error } = await fetchById("employers", id);

  if (error || !employer) {
    notFound();
  }

  const [totalJobs, publishedJobs, applications, deployedApplications, jobs] = await Promise.all([
    countRows("jobs", { employer_id: id }),
    countRows("jobs", { employer_id: id, status: "published" }),
    countRows("applications", { employer_id: id }),
    countRows("applications", { employer_id: id, status: "deployed" }),
    fetchRows({ table: "jobs", filters: { employer_id: id }, page: 1 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">{textValue(employer, ["company_name", "name"])}</h1>
          <p className="mt-1 text-sm text-slate-600">{textValue(employer, ["country", "city"])}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/employers/${id}/edit`} className="rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Edit</Link>
          <ConfirmAction action={setEmployerState.bind(null, id, "verified")} label="Verify" message="Verify this employer?" />
          <ConfirmAction action={setEmployerState.bind(null, id, "suspended")} label="Suspend" message="Suspend this employer?" tone="danger" />
          <ConfirmAction action={setEmployerState.bind(null, id, "reactivated")} label="Reactivate" message="Reactivate this employer?" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Total Jobs" value={totalJobs} />
        <Metric label="Published Jobs" value={publishedJobs} />
        <Metric label="Applications" value={applications} />
        <Metric label="Deployed" value={deployedApplications} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Company Overview</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Registration" value={textValue(employer, ["registration_number"])} />
          <Field label="Website" value={textValue(employer, ["website"])} />
          <Field label="Email" value={textValue(employer, ["email"])} />
          <Field label="Phone" value={textValue(employer, ["phone"])} />
          <Field label="Verification" value={<StatusBadge status={textValue(employer, ["verification_status"], "pending")} />} />
          <Field label="Active" value={<StatusBadge status={employer.is_active === false ? "inactive" : "active"} />} />
          <Field label="Created" value={dateText(employer.created_at)} />
          <Field label="Updated" value={dateText(employer.updated_at)} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(employer, ["description"], "No description saved.")}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Jobs</h2>
        <div className="mt-4 space-y-3">
          {jobs.rows.length === 0 ? (
            <p className="text-sm text-slate-500">No jobs found for this employer.</p>
          ) : (
            jobs.rows.map((job) => (
              <Link key={textValue(job, ["id"])} href={`/admin/jobs/${textValue(job, ["id"])}`} className="block rounded-md border border-slate-200 p-3">
                <span className="font-semibold text-[#071A3D]">{textValue(job, ["title"])}</span>
                <span className="ml-3 text-sm text-slate-500">{textValue(job, ["status"], "draft")}</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#071A3D]">{value ?? "Unavailable"}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

