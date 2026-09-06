import { setNewsletterSubscriberStatus } from "@/lib/admin/subscriber-actions";
import { fetchNewsletterSubscribers } from "@/lib/admin/subscriber-data";

export default async function NewsletterSubscribersPage() {
  const data = await fetchNewsletterSubscribers();
  const total = data.rows.length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Audience Growth</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Newsletter Subscribers</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          People who subscribe through the floating website subscription button appear here. Use subscriber data only for legitimate Red Stone recruitment, jobs, blog and candidate-guidance communications.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Visible records</p>
          <p className="mt-2 text-3xl font-black text-[#071A3D]">{total}</p>
          <p className="mt-1 text-xs text-slate-500">Latest 500 subscriber records</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Active</p>
          <p className="mt-2 text-3xl font-black text-emerald-900">{data.activeCount}</p>
          <p className="mt-1 text-xs text-emerald-700">Eligible for Red Stone updates</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Unsubscribed</p>
          <p className="mt-2 text-3xl font-black text-[#071A3D]">{data.unsubscribedCount}</p>
          <p className="mt-1 text-xs text-slate-500">Must not receive marketing updates</p>
        </article>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong>Privacy rule:</strong> do not export or share subscriber emails unnecessarily. Newsletter data is collected with consent and should be used only for relevant Red Stone updates. Respect any unsubscribe request promptly.
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#071A3D] text-white">
              <tr>
                <th className="p-4">Subscriber</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source page</th>
                <th className="p-4">First subscribed</th>
                <th className="p-4">Latest subscription</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.rows.map((row) => (
                <tr key={row.id}>
                  <td className="p-4">
                    <p className="font-black text-[#071A3D]">{row.full_name || "Name not supplied"}</p>
                    <p className="mt-1 text-xs text-slate-600">{row.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${row.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{row.source_path || "—"}</td>
                  <td className="p-4 text-slate-600">{formatDate(row.subscribed_at)}</td>
                  <td className="p-4 text-slate-600">{formatDate(row.last_subscribed_at)}</td>
                  <td className="p-4">
                    {row.status === "active" ? (
                      <form action={setNewsletterSubscriberStatus.bind(null, row.id, "unsubscribed")}>
                        <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-50">Mark Unsubscribed</button>
                      </form>
                    ) : (
                      <form action={setNewsletterSubscriberStatus.bind(null, row.id, "active")}>
                        <button className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-50">Reactivate</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {!data.rows.length ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    No subscribers yet. New website subscriptions will appear here automatically.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}
