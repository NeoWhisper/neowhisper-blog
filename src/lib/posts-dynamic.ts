import { createClient } from "@supabase/supabase-js";
import type { Post } from "@/types";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

type TranslationGroupRow = {
  id: string;
  slug: string;
};

type DynamicPostRow = {
  id: number;
  translation_group_id: string;
  locale: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  cover_image: string | null;
  status: "draft" | "published" | "scheduled";
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
};

export type DynamicPost = Post & {
  locale: SupportedLang;
  source: "dynamic";
  publishedAt: string;
  updatedAt: string;
};

function getPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapDynamicPost(row: DynamicPostRow, slug: string): DynamicPost {
  const publishedAt = row.published_at ?? row.created_at ?? new Date().toISOString();
  const updatedAt = row.updated_at ?? publishedAt;

  return {
    slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    content: row.content,
    category: row.category ?? undefined,
    coverImage: row.cover_image ?? undefined,
    date: publishedAt,
    locale: normalizeLang(row.locale),
    source: "dynamic",
    publishedAt,
    updatedAt,
  };
}

async function getTranslationGroupBySlug(
  slug: string,
): Promise<TranslationGroupRow | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("translation_groups")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[posts-dynamic] getTranslationGroupBySlug error:", error.message);
    return null;
  }

  return data;
}

function isPublishable(row: DynamicPostRow): boolean {
  if (row.status !== "published") return false;
  if (!row.published_at) return true;
  return new Date(row.published_at).getTime() <= Date.now();
}

async function getSlugByGroupId(
  groupIds: string[],
): Promise<Map<string, string>> {
  const supabase = getPublicSupabaseClient();
  if (!supabase || groupIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("translation_groups")
    .select("id, slug")
    .in("id", groupIds);

  if (error) {
    console.error("[posts-dynamic] getSlugByGroupId error:", error.message);
    return new Map();
  }

  return new Map(data.map((row) => [row.id, row.slug]));
}

export async function getDynamicPostsByLocale(
  locale: SupportedLang,
): Promise<DynamicPost[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts_dynamic")
    .select(
      "id, translation_group_id, locale, title, excerpt, content, category, cover_image, status, published_at, updated_at, created_at",
    )
    .eq("locale", locale)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[posts-dynamic] getDynamicPostsByLocale error:", error.message);
    return [];
  }

  const publishableRows = data.filter(isPublishable);
  const groupIds = Array.from(
    new Set(publishableRows.map((row) => row.translation_group_id)),
  );
  const slugMap = await getSlugByGroupId(groupIds);

  return publishableRows
    .map((row) => {
      const slug = slugMap.get(row.translation_group_id);
      if (!slug) return null;
      return mapDynamicPost(row, slug);
    })
    .filter((post): post is DynamicPost => Boolean(post));
}

export async function getDynamicPostBySlugLocale(
  slug: string,
  locale: SupportedLang,
): Promise<DynamicPost | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return null;

  const group = await getTranslationGroupBySlug(slug);
  if (!group) return null;

  const { data, error } = await supabase
    .from("posts_dynamic")
    .select(
      "id, translation_group_id, locale, title, excerpt, content, category, cover_image, status, published_at, updated_at, created_at",
    )
    .eq("translation_group_id", group.id)
    .eq("locale", locale)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(
      "[posts-dynamic] getDynamicPostBySlugLocale error:",
      error.message,
    );
    return null;
  }

  if (!data || !isPublishable(data)) return null;
  return mapDynamicPost(data, group.slug);
}

export async function getDynamicLocalesBySlug(
  slug: string,
): Promise<SupportedLang[]> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];

  const group = await getTranslationGroupBySlug(slug);
  if (!group) return [];

  const { data, error } = await supabase
    .from("posts_dynamic")
    .select("locale, status, published_at")
    .eq("translation_group_id", group.id)
    .eq("status", "published");

  if (error) {
    console.error("[posts-dynamic] getDynamicLocalesBySlug error:", error.message);
    return [];
  }

  return Array.from(
    new Set(
      data
        .filter((row) => {
          if (!row.published_at) return true;
          return new Date(row.published_at).getTime() <= Date.now();
        })
        .map((row) => normalizeLang(row.locale)),
    ),
  );
}

export async function getAllDynamicSitemapEntries(): Promise<
  Array<{ slug: string; locale: SupportedLang; lastModified: string }>
> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("posts_dynamic")
    .select("translation_group_id, locale, status, published_at, updated_at")
    .eq("status", "published");

  if (error) {
    console.error("[posts-dynamic] getAllDynamicSitemapEntries error:", error.message);
    return [];
  }

  const publishableRows = data.filter((row) => {
    if (!row.published_at) return true;
    return new Date(row.published_at).getTime() <= Date.now();
  });

  const groupIds = Array.from(
    new Set(publishableRows.map((row) => row.translation_group_id)),
  );
  const slugMap = await getSlugByGroupId(groupIds);

  return publishableRows
    .map((row) => {
      const slug = slugMap.get(row.translation_group_id);
      if (!slug) return null;

      return {
        slug,
        locale: normalizeLang(row.locale),
        lastModified: row.updated_at ?? row.published_at ?? new Date().toISOString(),
      };
    })
    .filter(
      (entry): entry is { slug: string; locale: SupportedLang; lastModified: string } =>
        Boolean(entry),
    );
}
