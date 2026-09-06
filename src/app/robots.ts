import type { MetadataRoute } from "next";
import {
  getPublishedJobSitemapCount,
  getPublishedJobSitemapShardCount,
} from "@/lib/public/jobs";
import { SITE_URL } from "@/lib/public/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const jobCount = await getPublishedJobSitemapCount();
  const jobShardCount = getPublishedJobSitemapShardCount(jobCount);
  const sitemaps = [
    `${SITE_URL}/sitemap.xml`,
    ...Array.from(
      { length: jobShardCount },
      (_, id) => `${SITE_URL}/sitemap/${id}.xml`
    ),
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/auth/", "/login"],
      },
    ],
    sitemap: sitemaps,
  };
}

