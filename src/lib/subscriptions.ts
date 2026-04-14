import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupportedLang } from "@/lib/i18n";

const TABLE_NAME = "post_subscribers";

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}

export type SubscriberRow = {
  email: string;
  lang: SupportedLang;
  last_sent_slug: string | null;
  last_sent_published_at: string | null;
  subscribed_at: string;
  updated_at: string;
};

export async function upsertSubscriber(email: string, lang: SupportedLang) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: "Supabase service role key is not configured." };
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .upsert({ email, lang }, { onConflict: "email" })
    .select(
      "email, lang, last_sent_slug, last_sent_published_at, subscribed_at, updated_at",
    )
    .single();

  return { data: (data as SubscriberRow | null) ?? null, error: error?.message };
}

export async function fetchSubscribers(lang?: SupportedLang) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: "Supabase service role key is not configured." };
  }

  let query = client
    .from(TABLE_NAME)
    .select(
      "email, lang, last_sent_slug, last_sent_published_at, subscribed_at, updated_at",
    )
    .order("subscribed_at", { ascending: true });

  if (lang) {
    query = query.eq("lang", lang);
  }

  const { data, error } = await query;
  return { data: (data as SubscriberRow[] | null) ?? null, error: error?.message };
}

export async function updateSubscriberLastSent(
  email: string,
  slug: string,
  publishedAt: string,
) {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: "Supabase service role key is not configured." };
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .update({
      last_sent_slug: slug,
      last_sent_published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
    .select(
      "email, lang, last_sent_slug, last_sent_published_at, subscribed_at, updated_at",
    )
    .maybeSingle();

  return { data: (data as SubscriberRow | null) ?? null, error: error?.message };
}
