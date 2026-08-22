import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { duplicateJob, setJobStatus } from "@/lib/admin/actions";
import { fetchById } from "@/lib/admin/data";
import { booleanText, dateText, moneyText, numberValue, textValue } from "@/lib/admin/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: job, error } = await fetchById("jobs", id);

  if (error || !job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">{textValue(job, ["title"])}</h1>
          <p className="mt-1 text-sm text-slate-600">{textValue(job, ["country"])} / {textValue(job, ["city"])}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/jobs/${id}/edit`} className="rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">
            Edit
          </Link>
          <form action={duplicateJob.bind(null, id)}>
            <button className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#071A3D]" type="submit">
              Duplicate
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Detail label="Status" value={<StatusBadge status={textValue(job, ["status"], "draft")} />} />
        <Detail label="Vacancies" value={numberValue(job, ["vacancies"]).toString()} />
        <Detail label="Deadline" value={dateText(job.application_deadline)} />
        <Detail label="Salary" value={moneyText(job)} />
        <Detail label="Skill Level" value={textValue(job, ["skill_level"])} />
        <Detail label="Job Type" value={textValue(job, ["job_type"])} />
        <Detail label="Visa Sponsorship" value={booleanText(job, ["visa_sponsorship"])} />
        <Detail label="Accommodation" value={booleanText(job, ["accommodation"])} />
        <Detail label="Transport" value={booleanText(job, ["transport"])} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(job, ["description"], "No description saved.")}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Status Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["published", "paused", "closed", "archived"].map((status) => (
            <form key={status} action={setJobStatus.bind(null, id, status)}>
              <button type="submit" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-[#071A3D]">
                {status}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <div className="mt-2 text-sm font-semibold text-[#071A3D]">{value}</div>
    </div>
  );
}
