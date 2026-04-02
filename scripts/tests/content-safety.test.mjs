import assert from "node:assert/strict";
import test from "node:test";
import safety from "../lib/content-safety.ts";

const { normalizeMetadataText, sanitizeGeneratedMarkdown } = safety;

test("sanitizeGeneratedMarkdown escapes angle-bracket numeric tokens", () => {
  const input = "| Gemini | <50ms | Real-time |";
  const output = sanitizeGeneratedMarkdown(input);
  assert.equal(output, "| Gemini | &lt;50ms | Real-time |");
});

test("sanitizeGeneratedMarkdown keeps normal HTML tags unchanged", () => {
  const input = "Paragraph with <strong>important</strong> text.";
  const output = sanitizeGeneratedMarkdown(input);
  assert.equal(output, input);
});

test("normalizeMetadataText returns fallback for object-like junk", () => {
  const output = normalizeMetadataText({ foo: "bar" }, "fallback text");
  assert.equal(output, "fallback text");
});

test("normalizeMetadataText avoids [object Object] string", () => {
  const output = normalizeMetadataText("[object Object]", "fallback text");
  assert.equal(output, "fallback text");
});
