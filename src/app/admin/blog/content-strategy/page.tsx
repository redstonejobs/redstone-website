import Link from "next/link";

import {
  BLOG_STRATEGY_COUNTRIES,
  BLOG_STRATEGY_INTENTS,
  BLOG_STRATEGY_TOPICS,
} from "@/lib/admin/blog-content-strategy";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogContentStrategyPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const q = param(params, "q").toLowerCase();
  const country = param(params, "country");
  const intent = param(params, "intent");
  const priority = param(params, "priority");

  const topics = BLOG_STRATEGY_TOPICS.filter((topic) => {
    if (country && (topic.countrySlug ?? "global") !== country) return false;
    if (intent && topic.intent !== intent) return false;
    if (priority && topic.priority !== priority) return false;
    if (!q) return true;
    const haystack = [topic.title, topic.primaryKeyword, topic.category, topic.country ?? "Global", topic.intent, ...topic.keywords]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  const highPriority = BLOG_STRATEGY_TOPICS.filter((topic) => topic.priority === "High").length;
  const globalCount = BLOG_STRATEGY_TOPICS.filter((topic) => !topic.country).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Content & SEO · Editorial planner</p>
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">182-Topic SEO Blog Content Strategy</h1>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
            Build topical authority across all 26 Red Stone recruitment destinations with country job, work-visa, document, salary, interview, safety and employer-guidance content. Use the planner to create a pre-filled draft, then add current verified facts before publication.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/blog" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-[#071A3D]">Manage Blog</Link>
          <Link href="/admin/blog/new" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Create Custom Article</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["SEO topics", BLOG_STRATEGY_TOPICS.length, "Complete editorial roadmap"],
          ["Countries", BLOG_STRATEGY_COUNTRIES.length, "Six core articles per destination"],
          ["Country topics", BLOG_STRATEGY_COUNTRIES.length * 6, "Jobs, visa, docs, salary, interviews"],
          ["Global topics", globalCount, "Cross-country authority content"],
          ["High priority", highPriority, "Publish these first"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#071A3D]">{value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-[#D4AF37]/40 bg-amber-50 p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Recommended publishing plan</p>
        <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Publish 4 strong articles per week instead of flooding the site</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Monday", "High-priority country jobs article"],
            ["Wednesday", "Visa, work-permit or document guide"],
            ["Friday", "Candidate interview, safety or employment article"],
            ["Sunday", "Global authority or employer-focused article"],
          ].map(([day, focus]) => (
            <div key={day} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-black text-[#071A3D]">{day}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{focus}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-6 text-amber-950/80">
          Ranking is never guaranteed. Search performance depends on useful original content, crawlability, backlinks, user trust, competition and how well each article satisfies the reader. For visa rules, salary figures, fees, processing periods and legal requirements, verify current official or primary sources before publishing.
        </p>
      </section>

      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1.5fr_repeat(3,0.8fr)_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Search topics
          <input name="q" defaultValue={param(params, "q")} placeholder="Canada jobs, work visa, interview..." className="min-h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Country
          <select name="country" defaultValue={country} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-[#D4AF37]">
            <option value="">All countries + global</option>
            <option value="global">Global topics</option>
            {BLOG_STRATEGY_COUNTRIES.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Search intent
          <select name="intent" defaultValue={intent} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-[#D4AF37]">
            <option value="">All intents</option>
            {BLOG_STRATEGY_INTENTS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Priority
          <select name="priority" defaultValue={priority} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-[#D4AF37]">
            <option value="">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button className="min-h-12 rounded-xl bg-[#071A3D] px-5 text-sm font-black text-white">Filter</button>
          <Link href="/admin/blog/content-strategy" className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700">Reset</Link>
        </div>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#071A3D]">Editorial Topic Library</h2>
          <p className="mt-1 text-sm text-slate-500">Showing {topics.length} of {BLOG_STRATEGY_TOPICS.length} topics.</p>
        </div>
        <p className="text-xs font-semibold text-slate-500">Create Draft pre-fills the title, summary, SEO metadata, keywords and article outline.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-[#071A3D] text-white">
              <tr>
                <th className="p-4">Topic</th>
                <th className="p-4">Country / Cluster</th>
                <th className="p-4">Intent</th>
                <th className="p-4">Primary keyword</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topics.map((topic) => (
                <tr key={topic.id} className="align-top">
                  <td className="p-4">
                    <p className="max-w-xl font-black leading-6 text-[#071A3D]">{topic.title}</p>
                    <p className="mt-2 max-w-xl text-xs leading-5 text-slate-600">{topic.summary}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-black text-[#071A3D]">{topic.country ?? "Global"}</p>
                    <p className="mt-1 text-xs text-slate-500">{topic.region}</p>
                  </td>
                  <td className="p-4 text-slate-600">{topic.intent}</td>
                  <td className="p-4"><code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{topic.primaryKeyword}</code></td>
                  <td className="p-4"><Priority value={topic.priority} /></td>
                  <td className="p-4">
                    <Link href={`/admin/blog/new?topic=${encodeURIComponent(topic.id)}`} className="inline-flex rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-black text-[#071A3D]">Create Draft</Link>
                    {topic.countrySlug ? <Link href={`/countries/${topic.countrySlug}`} target="_blank" className="mt-2 block text-xs font-black text-[#B8860B]">Country guide ↗</Link> : null}
                  </td>
                </tr>
              ))}
              {!topics.length ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500">No strategy topics match these filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Priority({ value }: { value: "High" | "Medium" }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${value === "High" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{value}</span>;
}

function param(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
