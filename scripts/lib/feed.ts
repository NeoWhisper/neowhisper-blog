import stripTags from "striptags";
import he from "he";

const FEED_ITEM_REGEX = /<item>([\s\S]*?)<\/item>/gi;
const TITLE_REGEX = /<title>([\s\S]*?)<\/title>/i;
const LINK_REGEX = /<link>([\s\S]*?)<\/link>/i;
const DESCRIPTION_REGEX = /<description>([\s\S]*?)<\/description>/i;

const sanitizeFeedText = (raw) =>
  raw
    ? he.decode(stripTags(raw))
    : raw;

const extractFeedItem = (itemXml, feedName) => {
  const title = sanitizeFeedText(itemXml.match(TITLE_REGEX)?.[1]);
  const link = itemXml.match(LINK_REGEX)?.[1];
  const description = sanitizeFeedText(itemXml.match(DESCRIPTION_REGEX)?.[1]);

  return (title && link)
    ? { feed: feedName, title, link, description }
    : null;
};

export async function fetchFeed(feedConfig) {
  const response = await fetch(feedConfig.url, {
    headers: { "User-Agent": "NeoWhisper/1.0" }
  });

  return response.ok
    ? (await response.text())
      .match(FEED_ITEM_REGEX)
      ?.map(itemXml => extractFeedItem(itemXml, feedConfig.name))
      .filter(Boolean) ?? []
    : Promise.reject(new Error(`${feedConfig.name} error`));
}