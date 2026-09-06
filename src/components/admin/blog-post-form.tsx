import Link from "next/link";

import type { AdminBlogPost } from "@/lib/admin/blog-data";

export function BlogPostForm({
  post,
  action,
}: {
  post?: AdminBlogPost | null;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Editorial content</p>
            <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Article details</h2>
          </div>

          <Field name="title" label="Article Title" defaultValue={post?.title} required placeholder="Example: How to Prepare for a Canada Job Interview" />
          <Field name="slug" label="URL Slug" defaultValue={post?.slug} placeholder="Leave blank to generate from the title" help="Use short, descriptive words. Example: canada-job-interview-guide" />

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Article Summary / Description <span className="text-red-600">*</span>
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={post?.description ?? ""}
              placeholder="Write a clear 1–3 sentence summary that explains exactly what the reader will learn."
              className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-7 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
            <span className="text-xs font-normal text-slate-500">Aim for roughly 120–220 characters. This summary also appears on blog cards and the homepage.</span>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <Field name="category" label="Category" defaultValue={post?.category ?? "Recruitment Insights"} required placeholder="Candidate Guidance" />
            <Field name="author_name" label="Author / Editorial Team" defaultValue={post?.author_name ?? "Red Stone Editorial Team"} required />
          </div>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Full Article Content <span className="text-red-600">*</span>
            <textarea
              name="content_markdown"
              required
              rows={24}
              defaultValue={post?.content_markdown ?? ""}
              placeholder={"## Main section heading\n\nWrite useful, original paragraphs here.\n\n### Subheading\n\n- Bullet point\n- Another bullet point\n\n> Optional important note"}
              className="min-h-[560px] rounded-xl border border-slate-300 px-4 py-4 font-mono text-sm font-normal leading-7 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
            <span className="text-xs font-normal leading-6 text-slate-500">
              Formatting supported: <strong>## Heading</strong>, <strong>### Subheading</strong>, bullets using <strong>-</strong>, numbered lists using <strong>1.</strong>, and quotes using <strong>&gt;</strong>. Write original, useful information for people—not keyword stuffing.
            </span>
          </label>
        </section>

        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Publishing</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">Visibility & homepage</h2>
            </div>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Status
              <select name="status" defaultValue={post?.status ?? "draft"} className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
                <option value="draft">Draft — admin only</option>
                <option value="published">Published — public + homepage</option>
                <option value="archived">Archived — hidden</option>
              </select>
            </label>

            <Field
              name="published_at"
              label="Publication Date & Time"
              type="datetime-local"
              defaultValue={toDateTimeLocal(post?.published_at)}
              help="Leave blank when publishing for the first time to use the current time."
            />

            <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} className="mt-1 h-4 w-4 accent-[#D4AF37]" />
              <span><strong>Featured article.</strong> Gives this post priority as the main feature on the blog page.</span>
            </label>

            {post?.status === "published" ? (
              <Link href={`/blog/${post.slug}`} target="_blank" className="block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-black text-[#071A3D]">Open Public Article ↗</Link>
            ) : null}
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Visual</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">Cover image</h2>
            </div>
            <Field name="cover_image_url" label="Cover Image URL" type="url" defaultValue={post?.cover_image_url ?? ""} placeholder="https://..." help="Use a clear 16:9 or wide editorial image. The page still works without an image." />
            <Field name="image_alt" label="Image Alt Text" defaultValue={post?.image_alt ?? ""} placeholder="Describe what is visible in the image" help="Useful for accessibility and image search. Do not stuff keywords." />
          </section>

          <section className="space-y-5 rounded-2xl border border-[#D4AF37]/40 bg-amber-50/40 p-6 shadow-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Google & AI discovery</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">SEO controls</h2>
            </div>

            <Field name="seo_title" label="SEO Title" defaultValue={post?.seo_title ?? ""} placeholder="Clear search-focused title" help="Recommended: about 45–65 characters. If blank, the article title is used." />

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Meta Description
              <textarea
                name="meta_description"
                rows={4}
                defaultValue={post?.meta_description ?? ""}
                placeholder="A compelling, accurate summary for search results."
                className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-6 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <span className="text-xs font-normal text-slate-500">Recommended: about 120–170 characters. Maximum accepted by the editor: 180.</span>
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Focus Keywords
              <textarea
                name="keywords"
                rows={4}
                defaultValue={(post?.keywords ?? []).join(", ")}
                placeholder="international jobs Kenya, Canada jobs, overseas recruitment"
                className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-6 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <span className="text-xs font-normal text-slate-500">Use 2–8 highly relevant phrases separated by commas. These help organize metadata but useful content matters more than keyword repetition.</span>
            </label>

            <div className="rounded-xl bg-white p-4 text-xs leading-6 text-slate-600">
              <p className="font-black text-[#071A3D]">SEO publishing checklist</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>One clear topic and one descriptive H1 title</li>
                <li>Useful introduction and detailed H2/H3 sections</li>
                <li>Original practical guidance—not copied content</li>
                <li>Descriptive meta title and meta description</li>
                <li>Internal links are added automatically around the article</li>
                <li>Published posts enter the sitemap and homepage automatically</li>
                <li>Article and breadcrumb structured data are generated automatically</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-6 text-slate-500">Publishing makes the article publicly indexable and eligible to appear automatically on the homepage.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/blog" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700">Cancel</Link>
          <button type="submit" className="rounded-xl bg-[#071A3D] px-6 py-3 text-sm font-black text-white hover:bg-[#102D5A]">{post ? "Save Article" : "Create Article"}</button>
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
  placeholder,
  help,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
    </label>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
