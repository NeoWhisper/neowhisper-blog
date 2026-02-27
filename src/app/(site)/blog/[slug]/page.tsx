import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostTemplate from "@/components/BlogPostTemplate";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { renderMarkdownToSafeHtml } from "@/lib/markdown";
import {
  getHybridLanguageVariants,
  getHybridPost,
  getHybridRelatedPosts,
} from "@/lib/posts-hybrid";
import { getPostLanguage, getPosts, getPostBySlug } from "@/lib/posts";

const baseUrl = "https://www.neowhisper.net";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    lang?: string;
  }>;
}

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

    return {
      title: post.title,
      description: post.excerpt,
      alternates: {
        canonical: buildPostUrl(post.slug, post.locale, post.source),
        languages: languageAlternates,
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
      console.log(`[BlogPost] Render attempt: ${decodedSlug} (Resolved Lang: ${resolvedLang})`);

      const post = await getHybridPost(decodedSlug, resolvedLang);

      if (!post) {
        console.warn(`[BlogPost] No data found for ${decodedSlug}`);
        return null;
      }

      console.log(`[BlogPost] Post source: ${post.source}`);

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
          renderedHtml = renderMarkdownToSafeHtml(post.content);
        } catch (htmlErr) {
          console.error(`[BlogPost] HTML render error for ${decodedSlug}:`, htmlErr);
          throw htmlErr;
        }
      }

      return { post, languageVariants, relatedPosts, renderedHtml };
    } catch (error) {
      console.error(`[BlogPost] CRITICAL RENDER ERROR for ${decodedSlug}:`, error);

      // EMERGENCY FALLBACK: serve from local filesystem.
      // IMPORTANT: No logger here — logger calls cookies()/Supabase which can
      // itself throw, causing a second cascading failure that blocks this fallback.
      try {
        const staticPost = getPostBySlug(decodedSlug);
        if (staticPost) {
          console.log("[BlogPost] Fallback to static markdown successful");
          const lSuffix = getPostLanguage(staticPost.slug) as SupportedLang;
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

  const { post, languageVariants, relatedPosts, renderedHtml } = data;

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
      lang={post.locale}
      languageSwitchMode={post.source === "dynamic" ? "query" : "suffix"}
      canonicalUrl={buildPostUrl(post.slug, post.locale, post.source)}
    />
  );
}
