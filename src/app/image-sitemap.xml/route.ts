import { getHybridPosts } from "@/lib/posts-hybrid";

const baseUrl = "https://www.neowhisper.net";

function buildPostUrl(
  slug: string,
  locale: "en" | "ja" | "ar",
  source: "static" | "dynamic",
): string {
  const encodedSlug = encodeURIComponent(slug);

  if (source === "dynamic") {
    if (locale === "en") return `${baseUrl}/blog/${encodedSlug}`;
    return `${baseUrl}/blog/${encodedSlug}?lang=${locale}`;
  }

  return `${baseUrl}/blog/${encodedSlug}`;
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const locales = ["en", "ja", "ar"] as const;
  const localizedPosts = await Promise.all(locales.map((locale) => getHybridPosts(locale)));
  const allPosts = localizedPosts.flat();
  const seen = new Set<string>();

  const imageUrls = allPosts
    .filter((post) => {
      if (!post.coverImage) return false;
      const key = `${post.locale}:${post.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((post) => {
      const pageUrl = buildPostUrl(post.slug, post.locale, post.source);
      const imageUrl = toAbsoluteUrl(post.coverImage!);
      const title = escapeXml(post.title);

      return `<url><loc>${escapeXml(pageUrl)}</loc><image:image><image:loc>${escapeXml(
        imageUrl,
      )}</image:loc><image:title>${title}</image:title><image:caption>${title}</image:caption></image:image></url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
