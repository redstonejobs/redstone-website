import Link from "next/link";
import { dateText } from "@/lib/admin/format";
import { getJobImportDashboard } from "@/lib/admin/job-imports";

export default async function JobImportsPage() {
  const dashboard = await getJobImportDashboard();

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Automatic vacancy engine</p>
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Job Imports</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Monitor FoundRole and authorized Canada Job Bank feed ingestion, automatic quality screening, duplicate handling and publication decisions.
          </p>
        </div>
        <Link href="/admin/jobs" className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-[#071A3D]">Back to Vacancies</Link>
      </div>

      {dashboard.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          Import dashboard is not ready yet. Apply the automatic-job-import database migration first. {dashboard.error.message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {dashboard.sources.map((source) => (
          <section key={source.provider} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Source</p>
                <h2 className="mt-1 text-xl font-black text-[#071A3D]">{source.display_name}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${source.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {source.enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Metric label="Auto publish" value={source.auto_publish_enabled ? "Enabled" : "Disabled"} />
              <Metric label="Quality threshold" value={`${source.publish_threshold}/100`} />
              <Metric label="Application mode" value={source.external_apply_only ? "Original source" : "Configured source"} />
              <Metric label="Last success" value={dateText(source.last_success_at) || "Not run yet"} />
            </dl>
            {source.provider === "jobbank" && !source.enabled ? (
              <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                Canada Job Bank is intentionally disabled until an authorized Job Bank XML feed is approved and configured. The system does not scrape Job Bank.
              </p>
            ) : null}
            {source.last_error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800">{source.last_error}</p> : null}
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-[#071A3D]">Recent Import Runs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Started</th><th className="px-4 py-3">Fetched</th><th className="px-4 py-3">Published</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Rejected</th><th className="px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.runs.length ? dashboard.runs.map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-3 font-bold text-[#071A3D]">{run.provider}</td>
                  <td className="px-4 py-3"><Status value={run.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{dateText(run.started_at)}</td>
                  <td className="px-4 py-3">{run.fetched_count}</td>
                  <td className="px-4 py-3">{run.published_count}</td>
                  <td className="px-4 py-3">{run.updated_count}</td>
                  <td className="px-4 py-3">{run.rejected_count}</td>
                  <td className="px-4 py-3">{run.review_count}</td>
                </tr>
              )) : <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No import runs recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-black text-[#071A3D]">Latest Decisions</h2>
          <p className="mt-1 text-sm text-slate-500">Every automatic publication, duplicate, rejection and held-for-review decision is traceable.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Decision</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Source Link</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.items.length ? dashboard.items.map((item) => {
                const title = typeof item.normalized_payload?.title === "string" ? item.normalized_payload.title : item.external_id;
                return (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-[#071A3D]">{title}</td>
                    <td className="px-4 py-3 text-slate-600">{item.provider}</td>
                    <td className="px-4 py-3"><Status value={item.decision} /></td>
                    <td className="px-4 py-3">{item.quality_score ?? "—"}</td>
                    <td className="max-w-md px-4 py-3 text-xs leading-5 text-slate-600">{item.decision_reason || "—"}</td>
                    <td className="px-4 py-3">{item.source_url ? <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="font-bold text-[#B8860B] underline">Open</a> : "—"}</td>
                  </tr>
                );
              }) : <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No import decisions recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value}</dd></div>;
}

function Status({ value }: { value: string }) {
  const good = ["succeeded", "published", "updated"].includes(value);
  const warning = ["partial", "needs_review", "duplicate", "skipped"].includes(value);
  const classes = good ? "bg-emerald-100 text-emerald-800" : warning ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-800";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${classes}`}>{value.replaceAll("_", " ")}</span>;
}
