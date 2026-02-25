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
import { getBaseSlug, getPostLanguage, getPosts, getPostBySlug } from "@/lib/posts";

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

function toOpenGraphLocale(lang: SupportedLang): string {
  if (lang === "ja") return "ja_JP";
  if (lang === "ar") return "ar_SA";
  return "en_US";
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
    const resolvedLang = resolveLanguage(slug, lang);

    // Defensive lookup to avoid throwing
    const post = await getHybridPost(slug, resolvedLang).catch(err => {
      console.error(`[Metadata Error] for ${slug}:`, err);
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
  const resolvedLang = resolveLanguage(slug, lang);

  const data = await (async () => {
    try {
      console.log(`[BlogPost] Render attempt: ${slug} (Resolved Lang: ${resolvedLang})`);

      const post = await getHybridPost(slug, resolvedLang);

      if (!post) {
        console.warn(`[BlogPost] No data found for ${slug}`);
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

      return { post, languageVariants, relatedPosts };
    } catch (error) {
      console.error(`[BlogPost] CRITICAL RENDER ERROR for ${slug}:`, error);

      // EMERGENCY FALLBACK to local files
      try {
        const staticPost = getPostBySlug(slug);
        if (staticPost) {
          console.log("[BlogPost] Fallback to static markdown successful");
          const lSuffix = getPostLanguage(staticPost.slug) as SupportedLang;
          return {
            post: {
              ...staticPost,
              locale: lSuffix,
              source: "static" as const,
              publishedAt: staticPost.date,
              updatedAt: staticPost.date
            },
            languageVariants: [{ lang: lSuffix, slug: staticPost.slug }],
            relatedPosts: []
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

  const { post, languageVariants, relatedPosts } = data;

  return (
    <BlogPostTemplate
      slug={post.slug}
      title={post.title}
      date={post.date}
      content={post.content}
      renderedHtml={
        post.source === "dynamic" ? renderMarkdownToSafeHtml(post.content) : undefined
      }
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
