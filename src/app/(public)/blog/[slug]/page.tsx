import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getPost } from "@/lib/public/blog";
import { canonical, SITE_NAME } from "@/lib/public/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: canonical(`/blog/${slug}`) },
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Band>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, author: { "@type": "Organization", name: SITE_NAME }, datePublished: post.date }} />
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">{post.category}</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-[#071A3D]">{post.title}</h1>
        <p className="mt-4 text-slate-500">{post.readingTime}</p>
        <p className="mt-6 text-lg leading-8 text-slate-700">{post.description}</p>
        <div className="mt-10 space-y-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-black text-[#071A3D]">{section.heading}</h2>
              <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </Band>
  );
}
