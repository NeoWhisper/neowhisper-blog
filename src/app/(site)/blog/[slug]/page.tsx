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
import { getBaseSlug, getPostLanguage, getPosts } from "@/lib/posts";

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

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const resolvedLang = resolveLanguage(slug, lang);
  const post = await getHybridPost(slug, resolvedLang);

  if (!post) return {};

  const isWelcomePost = getBaseSlug(post.slug) === "welcome";
  const languageVariants = await getHybridLanguageVariants(post.slug, post.locale);
  const languageAlternates: Record<string, string> = {};

  languageVariants.forEach((variant) => {
    languageAlternates[variant.lang] = buildPostUrl(
      variant.slug,
      variant.lang,
      post.source,
    );
  });

  const defaultVariant =
    languageVariants.find((variant) => variant.lang === "en") ??
    languageVariants[0];

  if (defaultVariant) {
    languageAlternates["x-default"] = buildPostUrl(
      defaultVariant.slug,
      "en",
      post.source,
    );
  }

  return {
    title: post.title,
    description: post.excerpt,
    robots: isWelcomePost
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    alternates: {
      canonical: buildPostUrl(post.slug, post.locale, post.source),
      languages: languageAlternates,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      locale: toOpenGraphLocale(post.locale),
      alternateLocale: languageVariants
        .filter((variant) => variant.lang !== post.locale)
        .map((variant) => toOpenGraphLocale(variant.lang)),
    },
  };
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const resolvedLang = resolveLanguage(slug, lang);

  const post = await getHybridPost(slug, resolvedLang);
  if (!post) {
    notFound();
  }

  const languageVariants = await getHybridLanguageVariants(post.slug, post.locale);
  const relatedPosts = await getHybridRelatedPosts(post, 3);

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
