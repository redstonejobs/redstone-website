import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { updateBlogPost } from "@/lib/admin/blog-actions";
import { fetchAdminBlogPost } from "@/lib/admin/blog-data";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const post = await fetchAdminBlogPost(id);
  if (!post) notFound();

  const query = (await searchParams) ?? {};
  const saved = query.saved === "1";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Content & SEO</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Edit Blog Post</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          Update the article, SEO metadata, publication status and homepage visibility. Public pages refresh after each save.
        </p>
      </div>

      {saved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Article saved successfully.</div>
      ) : null}

      <BlogPostForm post={post} action={updateBlogPost.bind(null, id)} />
    </div>
  );
}
