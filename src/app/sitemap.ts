import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/public/blog";
import { COUNTRIES } from "@/lib/public/countries";
import { getPublishedJobSitemapEntries } from "@/lib/public/jobs";
import { SITE_URL } from "@/lib/public/site";

const staticRoutes = [
  "",
  "/about",
  "/mission-vision",
  "/why-red-stone",
  "/ethical-recruitment",
  "/candidate-protection",
  "/employer-services",
  "/recruitment-process",
  "/compliance",
  "/our-commitment",
  "/safety",
  "/official-channels",
  "/jobs",
  "/skilled-jobs",
  "/unskilled-jobs",
  "/countries",
  "/services",
  "/how-it-works",
  "/apply",
  "/employers",
  "/blog",
  "/testimonials",
  "/faq",
  "/contact",
  "/fraud-awareness",
  "/complaints",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const jobs = await getPublishedJobSitemapEntries();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
    })),

    ...COUNTRIES.map((country) => ({
      url: `${SITE_URL}/countries/${country.slug}`,
      lastModified: now,
    })),

    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: safeDate(post.date, now),
    })),

    ...jobs.map((job) => ({
      url: `${SITE_URL}${job.route}`,
      lastModified: firstValidDate(
        [job.updated_at, job.published_at, job.created_at],
        now
      ),
    })),
  ];
}

function firstValidDate(
  candidates: Array<string | null | undefined>,
  fallback: Date
) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    const parsed = new Date(candidate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function safeDate(value: string, fallback: Date) {
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}
