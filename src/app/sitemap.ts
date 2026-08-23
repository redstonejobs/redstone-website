import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/public/blog";
import { COUNTRIES } from "@/lib/public/countries";
import { getFeaturedJobs } from "@/lib/public/jobs";
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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { jobs } = await getFeaturedJobs(100);
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({ url: `${SITE_URL}${route}`, lastModified: now })),
    ...COUNTRIES.map((country) => ({ url: `${SITE_URL}/countries/${country.slug}`, lastModified: now })),
    ...BLOG_POSTS.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: new Date(post.date) })),
    ...jobs.filter((job) => job.slug).map((job) => ({ url: `${SITE_URL}/jobs/${job.slug}`, lastModified: job.published_at ? new Date(job.published_at) : now })),
  ];
}
