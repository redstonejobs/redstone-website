import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createBlogPost } from "@/lib/admin/blog-actions";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Content & SEO</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Create Blog Post</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          Write a professional recruitment article, prepare its Google metadata and publish it when it is ready. Published articles automatically flow into the public blog and homepage.
        </p>
      </div>
      <BlogPostForm action={createBlogPost} />
    </div>
  );
}
