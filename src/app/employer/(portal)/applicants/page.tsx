import Link from "next/link";
import { requireVerifiedEmployer } from "@/lib/employer/auth";
import { getEmployerApplicants } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

export default async function EmployerApplicantsPage() {
  const context = await requireVerifiedEmployer();
  const result = await getEmployerApplicants(context);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[#071A3D]">Applicants</h1><p className="mt-2 text-slate-600">Only applicants to your company jobs are shown. Internal Red Stone notes are not exposed.</p></div>
      <div className="grid gap-3">
        {result.rows.map((application) => (
          <Link key={String(application.id)} href={`/employer/applicants/${application.id}`} className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
            <span className="font-bold text-[#071A3D]">{textValue(application.candidate as Record<string, unknown>, ["full_name"], "Candidate")}</span>
            <span>{textValue(application.job as Record<string, unknown>, ["title"], "Job")}</span>
            <span>{textValue(application.job as Record<string, unknown>, ["country"], "Country")}</span>
            <span className="capitalize">{textValue(application, ["status"], "submitted").replaceAll("_", " ")}</span>
            <span>{dateText(application.submitted_at)}</span>
          </Link>
        ))}
        {result.rows.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-600">No applicants found for your company jobs.</p> : null}
      </div>
    </div>
  );
}
