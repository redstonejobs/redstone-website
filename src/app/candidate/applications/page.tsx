import Link from "next/link";
import { requireCandidate } from "@/lib/candidate/auth";
import { candidateStatusLabel } from "@/lib/candidate/constants";
import { getCandidateApplications } from "@/lib/candidate/data";
import { dateText } from "@/lib/admin/format";

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function CandidateApplicationsPage({ searchParams }: Props) {
  const context = await requireCandidate();
  const params = (await searchParams) ?? {};
  const filter = typeof params.filter === "string" ? params.filter : "active";
  const { rows } = await getCandidateApplications(context, filter);

  return (
    <div>
      <h1 className="text-3xl font-black text-[#071A3D]">My Applications</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
        {["active", "completed", "withdrawn", "rejected", "all"].map((item) => <Link key={item} href={`/candidate/applications?filter=${item}`} className="rounded-md bg-white px-3 py-2 text-[#071A3D]">{item}</Link>)}
      </div>
      <div className="mt-6 space-y-3">
        {rows.map((application) => {
          const job = application.job as Record<string, unknown> | null;
          return (
            <Link key={String(application.id)} href={`/candidate/applications/${String(application.id)}`} className="grid gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
              <span className="font-black text-[#071A3D]">{String(job?.title ?? "Job")}</span>
              <span>{String(job?.country ?? "")}</span>
              <span>{candidateStatusLabel(String(application.status))}</span>
              <span>{dateText(application.submitted_at ?? application.created_at)}</span>
              <span className="font-bold text-[#B8860B]">View</span>
            </Link>
          );
        })}
        {!rows.length ? <p className="rounded-md bg-white p-6 text-slate-600">No applications found for this filter.</p> : null}
      </div>
    </div>
  );
}

