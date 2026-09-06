import type { Metadata } from "next";
import Link from "next/link";

import { Band, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { getPublishedBlogPosts } from "@/lib/public/blog";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "International Recruitment Blog | Jobs Abroad, Visas & Candidate Guides",
  description:
    "Read professional Red Stone Employment Agency articles on international recruitment, jobs abroad, candidate preparation, documents, visa processes, fraud prevention, interviews and employer guidance.",
  keywords: [
    "international recruitment blog Kenya",
    "jobs abroad advice Kenya",
    "work visa jobs blog",
    "overseas jobs Kenya",
    "recruitment agency Kenya blog",
    "candidate recruitment guidance",
    "international employer recruitment",
  ],
  alternates: { canonical: canonical("/blog") },
  openGraph: {
    title: "International Recruitment Blog | Red Stone Employment Agency",
    description:
      "Practical recruitment, jobs-abroad, visa-process and candidate guidance from Red Stone Employment Agency.",
    url: canonical("/blog"),
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "International Recruitment Blog | Red Stone",
    description: "Professional guidance for candidates and international employers.",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(48);
  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const remaining = featured ? posts.filter((post) => post.slug !== featured.slug) : posts;
  const categories = [...new Set(posts.map((post) => post.category))];

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Red Stone International Recruitment Blog",
            description: metadata.description,
            url: canonical("/blog"),
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            blogPost: posts.slice(0, 20).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.metaDescription ?? post.description,
              url: canonical(`/blog/${post.slug}`),
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: { "@type": "Organization", name: post.authorName },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: canonical("/blog") },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0D2B59] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">Red Stone Editorial & Recruitment Insights</p>
          <h1 className="mt-4 max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            International Recruitment, Jobs Abroad & Candidate Guidance
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
            Practical articles for candidates and employers covering international recruitment, application preparation, documentation, work-permit and visa processes, interview readiness, fraud prevention and responsible recruitment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/jobs" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D]">Browse Jobs</Link>
            <Link href="/visa-process" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white">Visa Process Guides</Link>
            <Link href="/candidate-support" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white">Candidate Support</Link>
          </div>
        </div>
      </section>

      {featured ? (
        <Band>
          <SectionHeading eyebrow="Featured insight" title="Start with our latest featured guidance" />
          <Link
            href={`/blog/${featured.slug}`}
            className="group mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl lg:grid-cols-[0.95fr_1.05fr]"
          >
            <div
              className="min-h-72 bg-gradient-to-br from-[#071A3D] via-[#12376D] to-[#B8860B] bg-cover bg-center"
              style={featured.coverImageUrl ? { backgroundImage: `linear-gradient(rgba(7,26,61,.28),rgba(7,26,61,.28)),url(${featured.coverImageUrl})` } : undefined}
              role="img"
              aria-label={featured.imageAlt ?? `${featured.title} editorial feature`}
            />
            <div className="p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-[#B8860B]">
                <span>{featured.category}</span><span>•</span><span>{featured.readingTime}</span>
              </div>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#071A3D] sm:text-4xl">{featured.title}</h2>
              <p className="mt-5 text-base leading-8 text-slate-600">{featured.description}</p>
              <p className="mt-6 text-sm text-slate-500">By {featured.authorName} · {formatDate(featured.publishedAt)}</p>
              <span className="mt-7 inline-flex text-sm font-black text-[#B8860B] group-hover:underline">Read full article →</span>
            </div>
          </Link>
        </Band>
      ) : null}

      <Band tone="grey">
        <SectionHeading
          eyebrow="Latest articles"
          title="Professional recruitment knowledge library"
          body="New published articles automatically appear here and on the Red Stone homepage."
        />

        {categories.length ? (
          <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <span key={category} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-[#071A3D] shadow-sm">{category}</span>
            ))}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remaining.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-xl">
              <div
                className="h-48 bg-gradient-to-br from-[#071A3D] via-[#174177] to-[#B8860B] bg-cover bg-center"
                style={post.coverImageUrl ? { backgroundImage: `linear-gradient(rgba(7,26,61,.24),rgba(7,26,61,.24)),url(${post.coverImageUrl})` } : undefined}
                role="img"
                aria-label={post.imageAlt ?? `${post.title} article image`}
              />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#B8860B]">
                  <span>{post.category}</span><span>•</span><span>{post.readingTime}</span>
                </div>
                <h2 className="mt-3 text-xl font-black leading-snug text-[#071A3D] group-hover:text-[#B8860B]">{post.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{post.description}</p>
                <p className="mt-5 text-xs font-semibold text-slate-500">{formatDate(post.publishedAt)}</p>
              </div>
            </Link>
          ))}
        </div>

        {!posts.length ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            New editorial guidance is being prepared. Please check again soon.
          </div>
        ) : null}
      </Band>

      <Band>
        <div className="mx-auto grid max-w-6xl gap-6 rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Responsible guidance</p>
            <h2 className="mt-3 text-3xl font-black">Use blog articles together with live job and official government information</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              Recruitment programmes, visa rules, employer requirements, fees and processing procedures can change. Red Stone articles provide practical guidance, while current vacancy records and official authorities remain the final source for case-specific requirements.
            </p>
          </div>
          <Link href="/countries" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-black text-[#071A3D]">Explore 26 Countries</Link>
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
