/**
 * NeoWhisper - RSS Feed
 * Generates RSS 2.0 feed for blog posts
 */

import { getPosts, getPostLanguage } from "@/lib/posts";
import { SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getPosts();
  const siteUrl = SITE_URL;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>NeoWhisper Blog</title>
    <link>${siteUrl}</link>
    <description>Technical guides on Next.js, React, TypeScript, and modern web development best practices.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/og-image.jpg</url>
      <title>NeoWhisper Blog</title>
      <link>${siteUrl}</link>
    </image>
    ${posts
      .filter((post) => getPostLanguage(post.slug) === "en") // Only English posts in main RSS
      .slice(0, 20) // Last 20 posts
      .map((post) => {
        const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;
        const pubDate = new Date(post.date).toUTCString();
        const description = post.excerpt || post.content.slice(0, 300).replace(/[#*`]/g, "");

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      <description>${escapeXml(description)}...</description>
    </item>`;
      })
      .join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
