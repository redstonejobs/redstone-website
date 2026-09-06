import { getPublishedBlogPosts } from "@/lib/public/blog";
import { SITE_NAME, SITE_URL } from "@/lib/public/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPublishedBlogPosts(50);
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${encodeURIComponent(post.slug)}</guid>
      <description>${escapeXml(post.metaDescription ?? post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.authorName)}</author>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${SITE_NAME} Blog`)}</title>
    <link>${SITE_URL}/blog</link>
    <description>International recruitment, jobs abroad, candidate guidance, documentation, visa-process and employer insights from ${escapeXml(SITE_NAME)}.</description>
    <language>en-ke</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
