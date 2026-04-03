import stripTags from "striptags";
import he from "he";
import type { FeedConfig } from "../config/feeds";

const FEED_ITEM_REGEX = /<item>([\s\S]*?)<\/item>/gi;
const TITLE_REGEX = /<title>([\s\S]*?)<\/title>/i;
const LINK_REGEX = /<link>([\s\S]*?)<\/link>/i;
const DESCRIPTION_REGEX = /<description>([\s\S]*?)<\/description>/i;
const PUB_DATE_REGEX = /<pubDate>([\s\S]*?)<\/pubDate>/i;
const UPDATED_REGEX = /<updated>([\s\S]*?)<\/updated>/i;
const DC_DATE_REGEX = /<dc:date>([\s\S]*?)<\/dc:date>/i;

export type FeedItem = {
  feed: string;
  title: string;
  link: string;
  description?: string;
  publishedAt?: string;
};

const sanitizeFeedText = (raw?: string) =>
  raw
    ? he.decode(stripTags(raw))
    : raw;

const normalizePublishedAt = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const extractFeedItem = (itemXml: string, feedName: string): FeedItem | null => {
  const title = sanitizeFeedText(itemXml.match(TITLE_REGEX)?.[1]);
  const link = itemXml.match(LINK_REGEX)?.[1];
  const description = sanitizeFeedText(itemXml.match(DESCRIPTION_REGEX)?.[1]);
  const publishedAt = normalizePublishedAt(
    itemXml.match(PUB_DATE_REGEX)?.[1]
      ?? itemXml.match(UPDATED_REGEX)?.[1]
      ?? itemXml.match(DC_DATE_REGEX)?.[1]
  );

  return (title && link)
    ? { feed: feedName, title, link, description, publishedAt }
    : null;
};

const isFeedItem = (value: FeedItem | null): value is FeedItem => value !== null;

export async function fetchFeed(feedConfig: FeedConfig): Promise<FeedItem[]> {
  const response = await fetch(feedConfig.url, {
    headers: { "User-Agent": "NeoWhisper/1.0" }
  });

  return response.ok
    ? (await response.text())
      .match(FEED_ITEM_REGEX)
      ?.map(itemXml => extractFeedItem(itemXml, feedConfig.name))
      .filter(isFeedItem) ?? []
    : Promise.reject(new Error(`${feedConfig.name} error`));
}
