import "server-only";

import { createClient } from "@/utils/supabase/server";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  contentMarkdown: string;
  category: string;
  authorName: string;
  coverImageUrl: string | null;
  imageAlt: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
};

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content_markdown: string;
  category: string;
  author_name: string;
  cover_image_url: string | null;
  image_alt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  featured: boolean | null;
  published_at: string;
  updated_at: string;
};

const LEGACY_POSTS: BlogPost[] = [
  legacyPost({
    slug: "prepare-overseas-job-interview",
    title: "How to Prepare for an Overseas Job Interview",
    description: "Practical interview preparation for candidates applying to international employers.",
    category: "Candidate Guidance",
    date: "2026-08-22T09:00:00Z",
    content: "## Know the role\n\nReview the vacancy carefully and prepare examples that show relevant experience, reliability and communication skills.\n\n## Prepare your documents\n\nKeep your CV, certificates and references consistent. Employers may ask about dates, duties and previous workplaces.\n\n## Be honest\n\nDo not exaggerate experience or qualifications. Responsible recruitment depends on accurate information.",
  }),
  legacyPost({
    slug: "recruitment-scam-warning-signs",
    title: "Recruitment Scam Warning Signs",
    description: "How candidates can identify suspicious job offers and protect their documents.",
    category: "Fraud Awareness",
    date: "2026-08-22T10:00:00Z",
    content: "## Verify channels\n\nCheck that communication uses official Red Stone contact channels and contact the agency directly when unsure.\n\n## Question pressure\n\nBe cautious of urgent payment demands, vague job details or promises of guaranteed visas.\n\n## Protect records\n\nDo not send sensitive documents to unverified contacts or social media impersonators.",
  }),
  legacyPost({
    slug: "documents-for-international-recruitment",
    title: "Documents Commonly Needed for International Recruitment",
    description: "A general guide to records candidates may need during a professional recruitment process.",
    category: "Documents",
    date: "2026-08-22T11:00:00Z",
    content: "## Identity and profile\n\nCandidates are commonly asked for identity documents, contact information and a current CV.\n\n## Experience evidence\n\nEmployment letters, certificates and references can help employers assess suitability.\n\n## Requirements vary\n\nSpecific documents depend on the employer, role and relevant authorities. Always verify current instructions.",
  }),
];

export async function getPublishedBlogPosts(limit = 24) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, description, content_markdown, category, author_name, cover_image_url, image_alt, seo_title, meta_description, keywords, featured, published_at, updated_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 100)));

    if (error) throw error;
    return (data ?? []).map((row) => mapBlogRow(row as BlogRow));
  } catch (error) {
    console.warn("[public-blog] published posts query failed; using legacy fallback", error);
    return LEGACY_POSTS.slice(0, limit);
  }
}

export async function getLatestBlogPosts(limit = 3) {
  return getPublishedBlogPosts(limit);
}

export async function getPost(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, description, content_markdown, category, author_name, cover_image_url, image_alt, seo_title, meta_description, keywords, featured, published_at, updated_at")
      .eq("slug", slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    if (data) return mapBlogRow(data as BlogRow);
  } catch (error) {
    console.warn("[public-blog] post query failed; checking legacy fallback", { slug, error });
  }

  return LEGACY_POSTS.find((post) => post.slug === slug) ?? null;
}

export async function getRelatedBlogPosts(post: BlogPost, limit = 3) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, description, content_markdown, category, author_name, cover_image_url, image_alt, seo_title, meta_description, keywords, featured, published_at, updated_at")
      .eq("status", "published")
      .eq("category", post.category)
      .neq("slug", post.slug)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 6)));

    if (error) throw error;
    return (data ?? []).map((row) => mapBlogRow(row as BlogRow));
  } catch {
    return LEGACY_POSTS.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, limit);
  }
}

export async function getBlogSitemapEntries() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(5000);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      slug: String(row.slug),
      publishedAt: String(row.published_at),
      updatedAt: String(row.updated_at),
    }));
  } catch {
    return LEGACY_POSTS.map((post) => ({ slug: post.slug, publishedAt: post.publishedAt, updatedAt: post.updatedAt }));
  }
}

export function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function mapBlogRow(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    contentMarkdown: row.content_markdown,
    category: row.category,
    authorName: row.author_name || "Red Stone Editorial Team",
    coverImageUrl: row.cover_image_url,
    imageAlt: row.image_alt,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    keywords: Array.isArray(row.keywords) ? row.keywords : [],
    featured: row.featured === true,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingTime: estimateReadingTime(row.content_markdown),
  };
}

function legacyPost(input: {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  content: string;
}): BlogPost {
  return {
    id: `legacy-${input.slug}`,
    slug: input.slug,
    title: input.title,
    description: input.description,
    contentMarkdown: input.content,
    category: input.category,
    authorName: "Red Stone Editorial Team",
    coverImageUrl: null,
    imageAlt: null,
    seoTitle: null,
    metaDescription: null,
    keywords: [],
    featured: false,
    publishedAt: input.date,
    updatedAt: input.date,
    readingTime: estimateReadingTime(input.content),
  };
}
