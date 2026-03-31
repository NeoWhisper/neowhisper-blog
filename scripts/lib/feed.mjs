import stripTags from "striptags";

function sanitizeFeedText(raw) {
  if (!raw) return raw;
  const withoutTags = stripTags(raw);
  return withoutTags
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

export async function fetchFeed(f) {
  const r = await fetch(f.url, { headers: { "User-Agent": "NeoWhisper/1.0" } });
  if (!r.ok) throw new Error(`${f.name} error`);
  const xml = await r.text();
  const res = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const i = m[1];
    const tMatch = i.match(/<title>([\s\S]*?)<\/title>/i);
    const lMatch = i.match(/<link>([\s\S]*?)<\/link>/i);
    const dMatch = i.match(/<description>([\s\S]*?)<\/description>/i);
    const t = sanitizeFeedText(tMatch?.[1]);
    const l = lMatch?.[1];
    const d = dMatch?.[1] ? stripTags(dMatch[1]) : undefined;

    if (t && l) res.push({ feed: f.name, title: t, link: l, description: d });
  }
  return res;
}