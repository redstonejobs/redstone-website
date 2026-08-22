import Link from "next/link";
import { requireEmployer } from "@/lib/employer/auth";
import { getEmployerJobRequests } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function EmployerJobsPage({ searchParams }: PageProps) {
  const context = await requireEmployer();
  const params = (await searchParams) ?? {};
  const status = typeof params.status === "string" ? params.status : undefined;
  const result = await getEmployerJobRequests(context, 1, status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-black text-[#071A3D]">Jobs / Vacancy Requests</h1><p className="mt-2 text-slate-600">Employers submit requests for Red Stone review. Publication remains controlled by Red Stone.</p></div>
        <Link href="/employer/jobs/new" className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">New Vacancy Request</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {result.rows.map((request) => (
          <Link key={String(request.id)} href={`/employer/jobs/${request.id}`} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase text-[#B8860B]">{textValue(request, ["status"], "draft").replaceAll("_", " ")}</p>
            <h2 className="mt-2 text-xl font-black text-[#071A3D]">{textValue(request, ["title"])}</h2>
            <p className="mt-2 text-sm text-slate-600">{[request.country, request.city].filter(Boolean).join(" / ")}</p>
            <p className="mt-3 text-sm text-slate-500">Vacancies: {textValue(request, ["vacancies"], "Not set")}</p>
            <p className="mt-1 text-sm text-slate-500">Created: {dateText(request.created_at)}</p>
          </Link>
        ))}
        {result.rows.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-600">No vacancy requests found.</p> : null}
      </div>
    </div>
  );
}
