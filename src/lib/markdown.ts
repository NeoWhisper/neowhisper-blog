import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

const ALLOWED_ATTR = ["alt", "class", "href", "rel", "src", "target", "title"];

export function renderMarkdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown ?? "") as string;

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    KEEP_CONTENT: true,
  });
}
