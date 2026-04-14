#!/usr/bin/env node

import he from "he";
import { supportedLangs, type SupportedLang } from "../src/lib/i18n";
import { getHybridPosts, type HybridPost } from "../src/lib/posts-hybrid";
import { SITE_URL } from "../src/lib/site-config";
import {
  fetchSubscribers,
  updateSubscriberLastSent,
  type SubscriberRow,
} from "../src/lib/subscriptions";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const rawFrom = (process.env.RESEND_FROM ?? "").trim();
const fallbackFrom = "onboarding@resend.dev";
const resolvedFrom = rawFrom.includes("@") ? rawFrom : fallbackFrom;
const formattedFrom = resolvedFrom.includes("<")
  ? resolvedFrom
  : `NeoWhisper <${resolvedFrom}>`;

if (!RESEND_API_KEY) {
  console.error("[send:subscribers] RESEND_API_KEY is required.");
  process.exit(1);
}

const emailCopy: Record<
  SupportedLang,
  {
    subject: string;
    greeting: string;
    intro: string;
    listLabel: string;
    cta: string;
    signature: string;
  }
> = {
  en: {
    subject: "NeoWhisper | Latest posts",
    greeting: "Hi there,",
    intro: "Here are the latest English posts from NeoWhisper.",
    listLabel: "New posts:",
    cta: "Read the blog",
    signature: "NeoWhisper Team",
  },
  ja: {
    subject: "NeoWhisper | 最新記事",
    greeting: "こんにちは、",
    intro: "NeoWhisperの日本語新着記事をお届けします。",
    listLabel: "新着記事:",
    cta: "ブログを読む",
    signature: "NeoWhisperチーム",
  },
  ar: {
    subject: "NeoWhisper | أحدث المقالات",
    greeting: "مرحبا،",
    intro: "إليك أحدث المقالات العربية من NeoWhisper.",
    listLabel: "المقالات الجديدة:",
    cta: "اقرأ المدونة",
    signature: "فريق NeoWhisper",
  },
};

function buildPostUrl(post: HybridPost): string {
  const encodedSlug = encodeURIComponent(post.slug);
  if (post.source === "dynamic") {
    if (post.locale === "en") return `${SITE_URL}/blog/${encodedSlug}`;
    return `${SITE_URL}/blog/${encodedSlug}?lang=${post.locale}`;
  }
  return `${SITE_URL}/blog/${encodedSlug}`;
}

function buildBlogUrl(lang: SupportedLang): string {
  if (lang === "en") return `${SITE_URL}/blog`;
  return `${SITE_URL}/blog?lang=${lang}`;
}

function getPostTimestamp(post: HybridPost): number {
  const candidates = [post.publishedAt, post.date, post.updatedAt];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = Date.parse(candidate);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function getLastSentTimestamp(subscriber: SubscriberRow): number {
  if (!subscriber.last_sent_published_at) return 0;
  const parsed = Date.parse(subscriber.last_sent_published_at);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function composeEmail(lang: SupportedLang, posts: HybridPost[]) {
  const template = emailCopy[lang];
  const blogUrl = buildBlogUrl(lang);

  const textLines = [
    template.greeting,
    "",
    template.intro,
    "",
    template.listLabel,
    ...posts.map((post) => `- ${post.title}: ${buildPostUrl(post)}`),
    "",
    `${template.cta}: ${blogUrl}`,
    "",
    template.signature,
  ];

  const listItems = posts
    .map(
      (post) =>
        `<li><a href="${buildPostUrl(post)}">${he.encode(post.title)}</a></li>`,
    )
    .join("");

  const html = [
    "<html><body style=\"font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111827;\">",
    `<p>${template.greeting}</p>`,
    `<p>${template.intro}</p>`,
    `<p><strong>${template.listLabel}</strong></p>`,
    `<ul>${listItems}</ul>`,
    `<p><a href="${blogUrl}">${template.cta}</a></p>`,
    `<p>${template.signature}</p>`,
    "</body></html>",
  ].join("");

  return {
    subject: template.subject,
    text: textLines.join("\n"),
    html,
  };
}

async function sendToSubscriber(subscriber: SubscriberRow, posts: HybridPost[]) {
  const { subject, text, html } = composeEmail(subscriber.lang, posts);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: formattedFrom,
      to: [subscriber.email],
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(
      `[send:subscribers] Failed for ${subscriber.email}: ${response.status} ${errorText.slice(0, 500)}`,
    );
    return false;
  }

  const latestPost = posts[0];
  const latestPublishedAt =
    latestPost.publishedAt || latestPost.date || new Date().toISOString();
  const update = await updateSubscriberLastSent(
    subscriber.email,
    latestPost.slug,
    latestPublishedAt,
  );
  if (update.error) {
    console.error(
      `[send:subscribers] Sent email but failed to update cursor for ${subscriber.email}: ${update.error}`,
    );
  }

  console.log(
    `[send:subscribers] Sent ${posts.length} post(s) to ${subscriber.email}`,
  );
  return true;
}

async function bootstrapSubscriberCursor(
  subscriber: SubscriberRow,
  latestPost: HybridPost,
) {
  const latestPublishedAt =
    latestPost.publishedAt || latestPost.date || new Date().toISOString();
  const update = await updateSubscriberLastSent(
    subscriber.email,
    latestPost.slug,
    latestPublishedAt,
  );
  if (update.error) {
    console.error(
      `[send:subscribers] Failed to bootstrap cursor for ${subscriber.email}: ${update.error}`,
    );
    return false;
  }
  console.log(
    `[send:subscribers] Bootstrapped cursor for ${subscriber.email} at ${latestPost.slug}`,
  );
  return true;
}

async function main() {
  let sentCount = 0;

  for (const lang of supportedLangs) {
    const posts = await getHybridPosts(lang);
    if (posts.length === 0) continue;

    const { data: subscribers, error } = await fetchSubscribers(lang);
    if (error) {
      console.error(`[send:subscribers] ${error}`);
      continue;
    }
    if (!subscribers || subscribers.length === 0) continue;

    for (const subscriber of subscribers) {
      const lastSentTs = getLastSentTimestamp(subscriber);
      if (lastSentTs === 0) {
        // First-time subscribers should receive only future posts, not full history.
        const latestPost = posts[0];
        if (latestPost) {
          await bootstrapSubscriberCursor(subscriber, latestPost);
        }
        continue;
      }

      const newPosts = posts.filter((post) => getPostTimestamp(post) > lastSentTs);
      if (newPosts.length === 0) continue;

      const sent = await sendToSubscriber(subscriber, newPosts);
      if (sent) sentCount += 1;
    }
  }

  if (sentCount === 0) {
    console.log("[send:subscribers] No new emails to send.");
    return;
  }

  console.log(`[send:subscribers] Completed. Sent ${sentCount} email(s).`);
}

main().catch((error) => {
  console.error("[send:subscribers] Unexpected error:", error);
  process.exit(1);
});
