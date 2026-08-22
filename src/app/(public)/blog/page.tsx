import type { Metadata } from "next";
import Link from "next/link";
import { Band, Hero, SectionHeading } from "@/components/public/sections";
import { BLOG_POSTS } from "@/lib/public/blog";
import { canonical } from "@/lib/public/site";

export const metadata: Metadata = { title: "Blog", description: "Red Stone editorial guidance for candidates and employers.", alternates: { canonical: canonical("/blog") } };

export default function BlogPage() {
  return (
    <>
      <Hero eyebrow="Insights" title="Recruitment guidance and safety notes." body="Educational Red Stone editorial content. Country-specific legal and immigration claims are intentionally kept general unless verified." />
      <Band>
        <SectionHeading title="Latest Articles" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase text-[#B8860B]">{post.category}</p>
              <h2 className="mt-3 text-xl font-black text-[#071A3D]">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
              <p className="mt-5 text-xs font-semibold text-slate-500">{post.readingTime}</p>
            </Link>
          ))}
        </div>
      </Band>
    </>
  );
}

