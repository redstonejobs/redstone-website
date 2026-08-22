import { requireVerifiedEmployer } from "@/lib/employer/auth";
import { getEmployerInterviews } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

export default async function EmployerInterviewsPage() {
  const context = await requireVerifiedEmployer();
  const interviews = await getEmployerInterviews(context);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[#071A3D]">Interviews</h1><p className="mt-2 text-slate-600">Interview requests require Red Stone coordination before they are confirmed.</p></div>
      <div className="grid gap-3">
        {interviews.map((interview) => (
          <article key={String(interview.id)} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="font-black capitalize text-[#071A3D]">{textValue(interview, ["status"]).replaceAll("_", " ")}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{textValue(interview, ["preferred_times"])}</p>
            <p className="mt-2 text-sm text-slate-500">{textValue(interview, ["method"], "Method not set")} / {textValue(interview, ["timezone"], "Timezone not set")}</p>
            <p className="mt-1 text-xs text-slate-500">Requested {dateText(interview.created_at)}</p>
          </article>
        ))}
        {interviews.length === 0 ? <p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-600">No interview requests yet.</p> : null}
      </div>
    </div>
  );
}
