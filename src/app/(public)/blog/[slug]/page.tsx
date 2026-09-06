import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogArticleContent } from "@/components/public/blog-article-content";
import { Band } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getPost, getRelatedBlogPosts } from "@/lib/public/blog";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found", robots: { index: false, follow: false } };

  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.description;
  const images = post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.imageAlt ?? post.title }] : undefined;

  return {
    title,
    description,
    keywords: post.keywords,
    alternates: { canonical: canonical(`/blog/${slug}`) },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical(`/blog/${slug}`),
      type: "article",
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      section: post.category,
      tags: post.keywords,
      images,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedBlogPosts(post, 3);
  const url = canonical(`/blog/${post.slug}`);

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription ?? post.description,
            url,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: { "@type": "Organization", name: post.authorName, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
            articleSection: post.category,
            keywords: post.keywords.join(", "),
            inLanguage: "en-KE",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: canonical("/blog") },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />

      <section className="bg-[#071A3D] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Link href="/blog" className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">← Red Stone Blog</Link>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-[#F2D675]">
            <span>{post.category}</span><span>•</span><span>{post.readingTime}</span>
          </div>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{post.title}</h1>
          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-200">{post.description}</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <span>By {post.authorName}</span>
            <span>Published {formatDate(post.publishedAt)}</span>
            {post.updatedAt !== post.publishedAt ? <span>Updated {formatDate(post.updatedAt)}</span> : null}
          </div>
        </div>
      </section>

      {post.coverImageUrl ? (
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
          <div
            className="aspect-[16/7] rounded-3xl bg-slate-200 bg-cover bg-center shadow-lg"
            style={{ backgroundImage: `url(${post.coverImageUrl})` }}
            role="img"
            aria-label={post.imageAlt ?? post.title}
          />
        </div>
      ) : null}

      <Band>
        <article className="mx-auto max-w-4xl">
          <BlogArticleContent content={post.contentMarkdown} />

          <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950">
            <strong>Important:</strong> Recruitment opportunities, employer requirements, government rules, visa categories, fees and processing steps can change. Use this article as practical guidance and verify case-specific requirements through the current Red Stone vacancy, written employer information and the relevant official authority.
          </div>

          {post.keywords.length ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{keyword}</span>
              ))}
            </div>
          ) : null}
        </article>
      </Band>

      <Band tone="grey">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Continue reading</p>
              <h2 className="mt-2 text-3xl font-black text-[#071A3D]">Related recruitment guidance</h2>
            </div>
            <Link href="/blog" className="text-sm font-black text-[#B8860B]">View all articles →</Link>
          </div>

          {related.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#B8860B]">{item.category}</p>
                  <h3 className="mt-3 text-xl font-black leading-snug text-[#071A3D]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <p className="mt-5 text-xs font-semibold text-slate-500">{item.readingTime}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">More articles in this category will appear here as they are published.</div>
          )}
        </div>
      </Band>

      <Band>
        <div className="mx-auto grid max-w-5xl gap-6 rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Next step</p>
            <h2 className="mt-2 text-3xl font-black">Explore current Red Stone opportunities</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">Published vacancies are the authoritative source for currently available jobs on the Red Stone platform.</p>
          </div>
          <Link href="/jobs" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-black text-[#071A3D]">Browse Jobs</Link>
        </div>
      </Band>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-KE", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
