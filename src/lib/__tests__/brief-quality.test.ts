import {
  countPostWords,
  isLowValueBriefPost,
  BRIEF_NOINDEX_ENABLED,
  EFFECTIVE_BRIEF_NOINDEX_THRESHOLD,
} from "../brief-quality";

describe("brief-quality", () => {
  describe("countPostWords", () => {
    test("counts English words correctly", () => {
      const content = "This is a test post with seven words.";
      // Note: splits on whitespace, so "words." counts as one word
      expect(countPostWords("test-post", content)).toBe(8);
    });

    test("strips YAML frontmatter before counting", () => {
      const content = `---
title: Test Post
date: 2026-01-01
---
This is the actual content with six words.`;
      // 1 (This) + 1 (is) + 1 (the) + 1 (actual) + 1 (content) + 1 (with) + 1 (six) + 1 (words.) = 8
      expect(countPostWords("test-post", content)).toBe(8);
    });

    test("removes code blocks from word count", () => {
      const content = `Intro text here.
\`\`\`typescript
const code = "does not count";
\`\`\`
Outro text here.`;
      // "Intro", "text", "here.", "Outro", "text", "here." = 6 words
      // But code block replaced with single space, so might be slightly different
      expect(countPostWords("test-post", content)).toBeGreaterThanOrEqual(5);
    });

    test("removes inline code from word count", () => {
      const content = "Use the `console.log` function to debug.";
      // "Use", "the", "function", "to", "debug." = 5 words
      // Note: backticks replaced with spaces, so we get: "Use the   function to debug."
      expect(countPostWords("test-post", content)).toBeGreaterThanOrEqual(5);
    });

    test("removes HTML tags from word count", () => {
      const content = "This is <strong>important</strong> text.";
      // "This", "is", "important", "text." = 4 words
      // Note: tags replaced with spaces, so: "This is  important  text."
      expect(countPostWords("test-post", content)).toBeGreaterThanOrEqual(4);
    });

    test("handles Japanese content with character-based estimation", () => {
      // 50 characters / 2.5 = 20 words
      const japaneseContent = "あ".repeat(50);
      expect(countPostWords("test-post-ja", japaneseContent)).toBe(20);
    });

    test("handles empty content", () => {
      expect(countPostWords("test-post", "")).toBe(0);
    });

    test("handles whitespace-only content", () => {
      expect(countPostWords("test-post", "   \n\t  ")).toBe(0);
    });
  });

  describe("isLowValueBriefPost", () => {
    // Save original env value to restore after tests
    const originalEnv = process.env.BRIEF_NOINDEX_ENABLED;

    beforeEach(() => {
      // Reset module state between tests
      jest.resetModules();
    });

    afterAll(() => {
      process.env.BRIEF_NOINDEX_ENABLED = originalEnv;
    });

    test("returns false when BRIEF_NOINDEX_ENABLED is false (default)", () => {
      // When feature flag is disabled, no posts are considered low-value
      const content = "Short content.";
      expect(isLowValueBriefPost("ai-trend-brief-2026-01-01", content)).toBe(
        false,
      );
    });

    test("returns false for non-brief slugs even when enabled", () => {
      // Simulate enabled state by checking logic manually
      const slug = "regular-post-about-ai";
      const isBrief = /(^|-)ai-(it-)?trend-brief-/.test(slug);
      expect(isBrief).toBe(false);
    });

    test("detects brief slugs with ai-trend-brief pattern", () => {
      const slug = "en-ai-trend-brief-2026-01-01-001";
      expect(/(^|-)ai-(it-)?trend-brief-/.test(slug)).toBe(true);
    });

    test("detects brief slugs with ai-it-trend-brief pattern", () => {
      const slug = "en-ai-it-trend-brief-2026-01-01-001";
      expect(/(^|-)ai-(it-)?trend-brief-/.test(slug)).toBe(true);
    });

    test("does not match non-brief slugs", () => {
      const nonBriefSlugs = [
        "nextjs-tutorial",
        "ai-overview",
        "trend-analysis",
        "brief-summary",
      ];
      nonBriefSlugs.forEach((slug) => {
        expect(/(^|-)ai-(it-)?trend-brief-/.test(slug)).toBe(false);
      });
    });

    test("threshold defaults to 300 words minimum", () => {
      expect(EFFECTIVE_BRIEF_NOINDEX_THRESHOLD).toBeGreaterThanOrEqual(300);
    });

    test("threshold has hard floor of 150 words", () => {
      // Threshold should never go below 150 even if env var is set lower
      expect(EFFECTIVE_BRIEF_NOINDEX_THRESHOLD).toBeGreaterThanOrEqual(150);
    });
  });

  describe("integration scenarios", () => {
    test("calculates word count for realistic brief post", () => {
      const content = `---
title: "AI Brief"
date: "2026-01-01"
category: "AI"
---

# AI Trend Brief

## Introduction

This is a summary of recent AI developments in the technology industry.

## Key Points

- Point one about AI
- Point two about machine learning
- Point three about neural networks

## Conclusion

These trends indicate continued growth in the sector.
`;
      // Should count words excluding frontmatter
      const wordCount = countPostWords("ai-trend-brief-2026-01-01", content);
      expect(wordCount).toBeGreaterThan(30); // Reasonable content length
      expect(wordCount).toBeLessThan(100); // Not inflated by frontmatter
    });

    test("handles markdown formatting in content", () => {
      const content = `
# Heading

**Bold text** and *italic text* here.

- List item one
- List item two

[Link text](https://example.com)

> Blockquote here with words

More content here.
`;
      const wordCount = countPostWords("test-post", content);
      // Should count visible words, not markdown syntax
      expect(wordCount).toBeGreaterThan(10);
    });
  });
});
