import { buildCategorySlug } from "@/lib/categories";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import {
  getBaseSlug,
  getLanguageVariants,
  getPostBySlug,
  getPostLanguage,
  getPosts,
} from "@/lib/posts";
import {
  getAllDynamicSitemapEntries,
  getDynamicLocalesBySlug,
  getDynamicPostBySlugLocale,
  getDynamicPostsByLocale,
} from "@/lib/posts-dynamic";
import type { Post } from "@/types";

export type HybridPost = Post & {
  locale: SupportedLang;
  source: "static" | "dynamic";
  publishedAt: string;
  updatedAt: string;
};

function toHybridStaticPost(post: Post): HybridPost {
  const locale = normalizeLang(getPostLanguage(post.slug));
  const publishedAt = post.date ?? new Date().toISOString();

  return {
    ...post,
    locale,
    source: "static",
    publishedAt,
    updatedAt: publishedAt,
  };
}

function staticSlugCandidates(slug: string, locale: SupportedLang): string[] {
  const candidates = new Set<string>([slug]);

  if (locale === "ja" && !slug.endsWith("-ja")) {
    candidates.add(`${slug}-ja`);
  }

  if (locale === "ar" && !slug.endsWith("-ar")) {
    candidates.add(`${slug}-ar`);
  }

  if (locale === "en") {
    candidates.add(getBaseSlug(slug));
  }

  return Array.from(candidates);
}

function dedupeDynamicFirst(posts: HybridPost[]): HybridPost[] {
  const seen = new Set<string>();
  const result: HybridPost[] = [];

  for (const post of posts) {
    const key = `${post.locale}:${post.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(post);
  }

  return result;
}

export async function getHybridPosts(locale: string): Promise<HybridPost[]> {
  const currentLang = normalizeLang(locale);

  const staticPosts = getPosts()
    .filter((post) => normalizeLang(getPostLanguage(post.slug)) === currentLang)
    .map(toHybridStaticPost);

  const dynamicPosts = await getDynamicPostsByLocale(currentLang);
  const combined = dedupeDynamicFirst([
    ...dynamicPosts,
    ...staticPosts,
  ] as HybridPost[]);

  return combined.sort((a, b) => {
    const aTime = new Date(a.publishedAt).getTime();
    const bTime = new Date(b.publishedAt).getTime();
    return bTime - aTime;
  });
}

export async function getHybridPost(
  slug: string,
  locale: string,
): Promise<HybridPost | null> {
  const currentLang = normalizeLang(locale);

  const dynamicPost = await getDynamicPostBySlugLocale(slug, currentLang);
  if (dynamicPost) return dynamicPost as HybridPost;

  const candidates = staticSlugCandidates(slug, currentLang);

  for (const candidate of candidates) {
    const post = getPostBySlug(candidate);
    if (!post) continue;

    const postLang = normalizeLang(getPostLanguage(post.slug));
    if (postLang !== currentLang) continue;

    return toHybridStaticPost(post);
  }

  return null;
}

export async function getHybridLanguageVariants(
  slug: string,
  locale: string,
): Promise<Array<{ lang: SupportedLang; slug: string }>> {
  const currentLang = normalizeLang(locale);

  const dynamicLocales = await getDynamicLocalesBySlug(slug);
  if (dynamicLocales.length > 0) {
    return dynamicLocales.map((lang) => ({ lang, slug }));
  }

  const staticVariants = getLanguageVariants(getBaseSlug(slug)).map((variant) => ({
    lang: normalizeLang(variant.lang),
    slug: variant.slug,
  }));

  if (staticVariants.length > 0) {
    return staticVariants;
  }

  return [{ lang: currentLang, slug }];
}

export async function getHybridRelatedPosts(
  post: HybridPost,
  limit = 3,
): Promise<Post[]> {
  if (!post.category) return [];

  const currentCategorySlug = buildCategorySlug(post.category);
  const posts = await getHybridPosts(post.locale);

  return posts
    .filter((candidate) => {
      if (candidate.slug === post.slug && candidate.source === post.source) {
        return false;
      }
      if (!candidate.category) return false;

      return buildCategorySlug(candidate.category) === currentCategorySlug;
    })
    .slice(0, limit);
}

export async function getHybridSitemapBlogEntries(): Promise<
  Array<{
    slug: string;
    locale: SupportedLang;
    lastModified: string;
    source: "static" | "dynamic";
  }>
> {
  const dynamicEntries = (await getAllDynamicSitemapEntries()).map((entry) => ({
    ...entry,
    source: "dynamic" as const,
  }));
  const staticEntries = getPosts().map((post) => ({
    slug: post.slug,
    locale: normalizeLang(getPostLanguage(post.slug)),
    lastModified: post.date ?? new Date().toISOString(),
    source: "static" as const,
  }));

  const combined = [...dynamicEntries, ...staticEntries];
  const seen = new Set<string>();

  return combined.filter((entry) => {
    const key = `${entry.locale}:${entry.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
