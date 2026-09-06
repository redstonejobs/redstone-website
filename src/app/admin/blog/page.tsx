import Link from "next/link";

import { setBlogPostStatus } from "@/lib/admin/blog-actions";
import { fetchAdminBlogPosts } from "@/lib/admin/blog-data";

export default async function AdminBlogPage() {
  const posts = await fetchAdminBlogPosts();
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;
  const archived = posts.filter((post) => post.status === "archived").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Content & SEO</p>
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Blog & Editorial Management</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Create, edit, publish and archive recruitment articles. Published posts automatically appear on the public blog, enter the sitemap and can appear in the homepage Latest Guidance section.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" target="_blank" className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-[#071A3D]">View Public Blog ↗</Link>
          <Link href="/admin/blog/new" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">+ Create Blog Post</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["All articles", posts.length, "Total editorial records"],
          ["Published", published, "Visible to the public"],
          ["Drafts", drafts, "Waiting for publication"],
          ["Archived", archived, "Hidden from public pages"],
        ].map(([label, value, note]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#071A3D]">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </article>
        ))}
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <strong>SEO workflow:</strong> publish only useful, original articles with a strong title, summary, detailed content, meta description and focused keywords. The system automatically creates canonical URLs, Article structured data, Open Graph metadata, sitemap entries and homepage discovery.
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-[#071A3D] text-white">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Published</th>
                <th className="p-4">Updated</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="align-top">
                  <td className="p-4">
                    <p className="max-w-md font-black text-[#071A3D]">{post.title}</p>
                    <p className="mt-1 max-w-md text-xs text-slate-500">/blog/{post.slug}</p>
                    <p className="mt-2 max-w-md line-clamp-2 text-xs leading-5 text-slate-600">{post.description}</p>
                  </td>
                  <td className="p-4 text-slate-600">{post.category}</td>
                  <td className="p-4"><Status status={post.status} /></td>
                  <td className="p-4 text-slate-600">{post.featured ? "Yes" : "No"}</td>
                  <td className="p-4 text-slate-600">{formatDate(post.published_at)}</td>
                  <td className="p-4 text-slate-600">{formatDate(post.updated_at)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-x-3 gap-y-2">
                      <Link href={`/admin/blog/${post.id}/edit`} className="font-black text-[#B8860B]">Edit</Link>
                      {post.status === "published" ? <Link href={`/blog/${post.slug}`} target="_blank" className="font-black text-[#071A3D]">View ↗</Link> : null}
                      {post.status !== "published" ? (
                        <form action={setBlogPostStatus.bind(null, post.id, "published")}><button className="font-black text-emerald-700">Publish</button></form>
                      ) : (
                        <form action={setBlogPostStatus.bind(null, post.id, "draft")}><button className="font-black text-slate-700">Unpublish</button></form>
                      )}
                      {post.status !== "archived" ? (
                        <form action={setBlogPostStatus.bind(null, post.id, "archived")}><button className="font-black text-red-700">Archive</button></form>
                      ) : (
                        <form action={setBlogPostStatus.bind(null, post.id, "draft")}><button className="font-black text-slate-700">Restore Draft</button></form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!posts.length ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-500">No blog posts yet. Create the first article to begin the Red Stone editorial library.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const classes = status === "published" ? "bg-emerald-100 text-emerald-800" : status === "archived" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${classes}`}>{status}</span>;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "short", day: "numeric" }).format(date);
}
