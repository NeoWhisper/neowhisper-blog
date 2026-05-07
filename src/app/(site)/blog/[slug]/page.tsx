import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";
import {
  getHybridLanguageVariants,
  getHybridPost,
  getHybridRelatedPosts,
} from "@/lib/posts-hybrid";
import { getPostLanguage, getPosts, getPostBySlug, getPrevNextPosts } from "@/lib/posts";
import { isLowValueBriefPost } from "@/lib/brief-quality";

const baseUrl = SITE_URL;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

// Word-count threshold and detection logic are centralised in @/lib/brief-quality
// so that sitemap.ts and this page stay in sync without circular imports.

function resolveLanguage(slug: string, lang?: string | null): SupportedLang {
  if (lang) return normalizeLang(lang);
  return normalizeLang(getPostLanguage(slug));
}

function buildPostUrl(
  slug: string,
  lang: SupportedLang,
  source: "static" | "dynamic",
): string {
  const encodedSlug = encodeURIComponent(slug);

  if (source === "dynamic") {
    if (lang === "en") {
      return `${baseUrl}/blog/${encodedSlug}`;
    }
    return `${baseUrl}/blog/${encodedSlug}?lang=${lang}`;
  }

  return `${baseUrl}/blog/${encodedSlug}`;
}

function getOgLocale(lang: SupportedLang): string {
  if (lang === "ja") return "ja_JP";
  if (lang === "ar") return "ar_SA";
  return "en_US";
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Force dynamic to prevent static-gen errors if Supabase is unavailable during build
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { lang } = await searchParams;
    const decodedSlug = decodeURIComponent(slug);
    const resolvedLang = resolveLanguage(decodedSlug, lang);

    const post = await getHybridPost(decodedSlug, resolvedLang).catch(err => {
      console.error(`[Metadata Error] for ${decodedSlug}:`, err);
      return null;
    });

    if (!post) {
      return { title: "Blog Post | NeoWhisper" };
    }

    const languageVariants = await getHybridLanguageVariants(post.slug, post.locale).catch(() => []);
    const languageAlternates: Record<string, string> = {};

    languageVariants.forEach((variant) => {
      languageAlternates[variant.lang] = buildPostUrl(
        variant.slug,
        variant.lang,
        post.source,
      );
    });

    const noIndex = isLowValueBriefPost(
      post.slug,
      post.content,
      post.coverImage,
    );
    const canonicalUrl = buildPostUrl(post.slug, post.locale, post.source);
    const publishedTime = toIsoDate(post.publishedAt ?? post.date);
    const modifiedTime = toIsoDate(post.updatedAt ?? post.publishedAt ?? post.date);
    const ogImage = post.coverImage
      ? post.coverImage.startsWith("http://") || post.coverImage.startsWith("https://")
        ? post.coverImage
        : `${baseUrl}${post.coverImage.startsWith("/") ? post.coverImage : `/${post.coverImage}`}`
      : `${baseUrl}/og-image.jpg`;

    return {
      title: post.title,
      description: post.excerpt,
      authors: [{ name: "Yousif Alqadi", url: `${baseUrl}/about` }],
      category: post.category,
      alternates: {
        canonical: canonicalUrl,
        languages: languageAlternates,
      },
      openGraph: {
        type: "article",
        url: canonicalUrl,
        title: post.title,
        description: post.excerpt,
        siteName: "NeoWhisper",
        locale: getOgLocale(post.locale),
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime,
        modifiedTime,
        section: post.category,
        tags: post.category ? [post.category] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [ogImage],
      },
      robots: noIndex
        ? {
            index: false,
            follow: true,
          }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
    };
  } catch (error) {
    console.error("[Metadata Critical] Fatal crash:", error);
    return { title: "Blog Post | NeoWhisper" };
  }
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  // Decode slug in case it arrived URL-encoded from CDN/proxy
  const decodedSlug = decodeURIComponent(slug);
  const resolvedLang = resolveLanguage(decodedSlug, lang);

  const data = await (async () => {
    try {
      const post = await getHybridPost(decodedSlug, resolvedLang);

      if (!post) {
        return null;
      }

      const [languageVariants, relatedPosts] = await Promise.all([
        getHybridLanguageVariants(post.slug, post.locale).catch(e => {
          console.error("[BlogPost] Variants fetch error:", e);
          return [];
        }),
        getHybridRelatedPosts(post, 3).catch(e => {
          console.error("[BlogPost] Related fetch error:", e);
          return [];
        }),
      ]);

      let renderedHtml: string | undefined = undefined;

      if (post.source === "dynamic") {
        try {
          const { renderMarkdownToSafeHtml } = await import("@/lib/markdown");
          renderedHtml = renderMarkdownToSafeHtml(post.content);
        } catch (htmlErr) {
          console.error(`[BlogPost] HTML render error for ${decodedSlug}:`, htmlErr);
          renderedHtml = undefined;
        }
      }

      // Get prev/next posts for navigation
      const { prev, next } = getPrevNextPosts(decodedSlug);

      return { post, languageVariants, relatedPosts, renderedHtml, prevPost: prev, nextPost: next };
    } catch (error) {
      console.error(`[BlogPost] CRITICAL RENDER ERROR for ${decodedSlug}:`, error);

      // EMERGENCY FALLBACK: serve from local filesystem.
      // IMPORTANT: No logger here — logger calls cookies()/Supabase which can
      // itself throw, causing a second cascading failure that blocks this fallback.
      try {
        const staticPost = getPostBySlug(decodedSlug);
        if (staticPost) {
          const lSuffix = getPostLanguage(staticPost.slug) as SupportedLang;
          const { prev, next } = getPrevNextPosts(decodedSlug);
          return {
            post: {
              ...staticPost,
              locale: lSuffix,
              source: "static" as const,
              publishedAt: staticPost.date,
              updatedAt: staticPost.date,
            },
            languageVariants: [{ lang: lSuffix, slug: staticPost.slug }],
            relatedPosts: [],
            prevPost: prev,
            nextPost: next,
          };
        }
      } catch (fError) {
        console.error("[BlogPost] Fallback also crashed:", fError);
      }

      return null;
    }
  })();

  if (!data) {
    notFound();
  }

  const { post, languageVariants, relatedPosts, renderedHtml, prevPost, nextPost } = data;
  try {
    const { default: BlogPostTemplate } = await import(
      "@/components/BlogPostTemplate"
    );

    return (
      <BlogPostTemplate
        slug={post.slug}
        title={post.title}
        date={post.date}
        content={post.content}
        renderedHtml={renderedHtml}
        coverImage={post.coverImage}
        category={post.category}
        readTime={post.readTime}
        isRTL={post.locale === "ar"}
        availableLanguages={languageVariants.map((variant) => variant.lang)}
        relatedPosts={relatedPosts}
        prevPost={prevPost}
        nextPost={nextPost}
        lang={post.locale}
        languageSwitchMode={post.source === "dynamic" ? "query" : "suffix"}
        canonicalUrl={buildPostUrl(post.slug, post.locale, post.source)}
      />
    );
  } catch (templateErr) {
    console.error("[BlogPost] Template import error:", templateErr);
    return (
      <article className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-4 text-sm opacity-70">{post.date}</p>
        <div className="mt-8 whitespace-pre-wrap">{post.content}</div>
      </article>
    );
  }
}
