import Link from "next/link";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { createBlogPost } from "@/lib/admin/blog-actions";
import { getBlogStrategyTopic, strategyDraftContent } from "@/lib/admin/blog-content-strategy";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewBlogPostPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const topicId = first(params.topic);
  const topic = topicId ? getBlogStrategyTopic(topicId) : undefined;

  const initial = topic
    ? {
        title: topic.title,
        slug: topic.id,
        description: topic.summary,
        category: topic.category,
        author_name: "Red Stone Editorial Team",
        content_markdown: strategyDraftContent(topic),
        seo_title: topic.seoTitle,
        meta_description: topic.metaDescription,
        keywords: topic.keywords,
        status: "draft",
        featured: false,
        image_alt: topic.country
          ? `${topic.country} international recruitment and employment guidance`
          : "International recruitment and jobs abroad guidance",
      }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Content & SEO</p>
          <h1 className="mt-2 text-3xl font-black text-[#071A3D]">Create Blog Post</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Write a professional recruitment article, prepare its Google metadata and publish it when it is ready. Published articles automatically flow into the public blog and homepage.
          </p>
        </div>
        <Link href="/admin/blog/content-strategy" className="rounded-xl border border-[#D4AF37] bg-amber-50 px-4 py-3 text-sm font-black text-[#071A3D]">
          Open 182-Topic SEO Planner
        </Link>
      </div>

      {topic ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
          <p className="font-black">SEO strategy draft loaded: {topic.primaryKeyword}</p>
          <p className="mt-1">
            The title, summary, SEO metadata, keywords and article outline are pre-filled. Add original, useful content and verify current employer, salary, visa, fee, legal and government information before publishing.
          </p>
        </section>
      ) : null}

      <BlogPostForm action={createBlogPost} initial={initial} />
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
