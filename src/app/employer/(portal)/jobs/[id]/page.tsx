import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmployer } from "@/lib/employer/auth";
import { getEmployerJobRequest } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function EmployerJobRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireEmployer();
  const { data: request } = await getEmployerJobRequest(context, id);
  if (!request) notFound();
  const editable = ["employer_draft", "changes_requested"].includes(String(request.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-black uppercase text-[#B8860B]">{textValue(request, ["status"]).replaceAll("_", " ")}</p><h1 className="mt-2 text-3xl font-black text-[#071A3D]">{textValue(request, ["title"])}</h1></div>
        {editable ? <Link href={`/employer/jobs/${id}/edit`} className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Edit Draft</Link> : null}
      </div>
      <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <Detail label="Country" value={textValue(request, ["country"])} />
        <Detail label="Category" value={textValue(request, ["category"])} />
        <Detail label="Skill" value={textValue(request, ["skill_level"])} />
        <Detail label="Vacancies" value={textValue(request, ["vacancies"])} />
        <Detail label="Deadline" value={dateText(request.requested_application_deadline)} />
        <Detail label="Submitted" value={dateText(request.submitted_at)} />
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Description</h2>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{textValue(request, ["description"], "No description saved.")}</p>
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Notes to Red Stone</h2>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{textValue(request, ["notes_to_red_stone"], "No notes saved.")}</p>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-[#071A3D]">{value}</p></div>;
}
