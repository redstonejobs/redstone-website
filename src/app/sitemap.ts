import type { MetadataRoute } from "next";
import { getBlogSitemapEntries } from "@/lib/public/blog";
import { COUNTRIES } from "@/lib/public/countries";
import { FAQ_CATEGORIES } from "@/lib/public/faq-library";
import {
  getPublishedJobSitemapCount,
  getPublishedJobSitemapEntries,
  getPublishedJobSitemapShardCount,
} from "@/lib/public/jobs";
import { SPONSORSHIP_JOBS } from "@/lib/public/sponsorship-jobs";
import { VISA_GUIDES } from "@/lib/public/visa-guides";
import { SITE_URL } from "@/lib/public/site";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/about",
  "/mission-vision",
  "/why-red-stone",
  "/ethical-recruitment",
  "/candidate-protection",
  "/candidate-support",
  "/medicals-compliance",
  "/immigration-services",
  "/employer-services",
  "/pre-departure-support",
  "/sponsorship-jobs",
  "/visa-process",
  "/success-stories",
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
  "/faq",
  "/contact",
  "/fraud-awareness",
  "/complaints",
  "/refund-cancellation",
  "/payment-terms",
  "/account-deletion",
  "/data-protection",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
] as const;

export async function generateSitemaps() {
  const count = await getPublishedJobSitemapCount();
  const shardCount = getPublishedJobSitemapShardCount(count);

  return Array.from({ length: shardCount }, (_, id) => ({
    id,
  }));
}

export default async function sitemap({
  id,
}: {
  id?: number;
} = {}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const isJobShard = typeof id === "number";
  const [jobs, blogPosts] = await Promise.all([
    isJobShard ? getPublishedJobSitemapEntries(id) : Promise.resolve([]),
    isJobShard ? Promise.resolve([]) : getBlogSitemapEntries(),
  ]);

  return [
    ...(isJobShard
      ? []
      : staticRoutes.map((route) => ({
          url: `${SITE_URL}${route}`,
          lastModified: now,
        }))),

    ...(isJobShard
      ? []
      : COUNTRIES.map((country) => ({
          url: `${SITE_URL}/countries/${country.slug}`,
          lastModified: now,
        }))),

    ...(isJobShard
      ? []
      : FAQ_CATEGORIES.map((category) => ({
          url: `${SITE_URL}/faq/${category.slug}`,
          lastModified: now,
        }))),

    ...(isJobShard
      ? []
      : SPONSORSHIP_JOBS.map((job) => ({
          url: `${SITE_URL}/sponsorship-jobs/${job.countrySlug}/${job.roleSlug}`,
          lastModified: now,
        }))),

    ...(isJobShard
      ? []
      : VISA_GUIDES.map((guide) => ({
          url: `${SITE_URL}/visa-process/${guide.slug}`,
          lastModified: now,
        }))),

    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: firstValidDate([post.updatedAt, post.publishedAt], now),
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
