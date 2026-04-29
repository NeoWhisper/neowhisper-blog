import { getPostLanguage, getBaseSlug } from "../posts";
import { isLocalizedSlug } from "../slug";

// Mock fs module to avoid reading actual files
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock gray-matter
jest.mock("gray-matter", () =>
  jest.fn((content: string) => {
    // Simple frontmatter parser for testing
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (match) {
      const frontmatter: Record<string, string> = {};
      match[1].split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          frontmatter[key.trim()] = valueParts.join(":").trim();
        }
      });
      return { data: frontmatter, content: match[2] };
    }
    return { data: {}, content };
  }),
);

describe("posts utilities", () => {
  describe("getPostLanguage", () => {
    test("detects Arabic slugs", () => {
      expect(getPostLanguage("my-post-ar")).toBe("ar");
      expect(getPostLanguage("post-name-ar")).toBe("ar");
    });

    test("detects Japanese slugs", () => {
      expect(getPostLanguage("my-post-ja")).toBe("ja");
      expect(getPostLanguage("post-name-ja")).toBe("ja");
    });

    test("defaults to English for non-localized slugs", () => {
      expect(getPostLanguage("my-post")).toBe("en");
      expect(getPostLanguage("post-name-en")).toBe("en");
    });

    test("handles slugs with multiple hyphens", () => {
      expect(getPostLanguage("very-long-post-name-ja")).toBe("ja");
      expect(getPostLanguage("very-long-post-name-ar")).toBe("ar");
      expect(getPostLanguage("very-long-post-name")).toBe("en");
    });
  });

  describe("getBaseSlug", () => {
    test("removes Japanese suffix", () => {
      expect(getBaseSlug("my-post-ja")).toBe("my-post");
    });

    test("removes Arabic suffix", () => {
      expect(getBaseSlug("my-post-ar")).toBe("my-post");
    });

    test("keeps English slug unchanged", () => {
      expect(getBaseSlug("my-post")).toBe("my-post");
      // Note: getBaseSlug only removes -ja and -ar, not -en
      expect(getBaseSlug("my-post-en")).toBe("my-post-en");
    });

    test("handles empty string", () => {
      expect(getBaseSlug("")).toBe("");
    });
  });

  describe("isLocalizedSlug", () => {
    test("detects Japanese localization", () => {
      expect(isLocalizedSlug("post-ja")).toBe(true);
    });

    test("detects Arabic localization", () => {
      expect(isLocalizedSlug("post-ar")).toBe(true);
    });

    test("does not detect English as localized", () => {
      expect(isLocalizedSlug("post-en")).toBe(false);
    });

    test("does not detect non-localized slugs", () => {
      expect(isLocalizedSlug("post")).toBe(false);
      expect(isLocalizedSlug("my-blog-post")).toBe(false);
    });

    test("handles empty string", () => {
      expect(isLocalizedSlug("")).toBe(false);
    });
  });

  describe("language consistency across functions", () => {
    test("getPostLanguage and getBaseSlug work together correctly", () => {
      const testCases = [
        {
          slug: "nextjs-tutorial",
          expectedLang: "en",
          expectedBase: "nextjs-tutorial",
        },
        {
          slug: "nextjs-tutorial-ja",
          expectedLang: "ja",
          expectedBase: "nextjs-tutorial",
        },
        {
          slug: "nextjs-tutorial-ar",
          expectedLang: "ar",
          expectedBase: "nextjs-tutorial",
        },
        // Note: -en suffix is NOT removed by getBaseSlug (only -ja and -ar are)
        {
          slug: "ai-trend-brief-2026-01-01-en",
          expectedLang: "en",
          expectedBase: "ai-trend-brief-2026-01-01-en",
        },
        {
          slug: "ai-trend-brief-2026-01-01-ja",
          expectedLang: "ja",
          expectedBase: "ai-trend-brief-2026-01-01",
        },
      ];

      testCases.forEach(({ slug, expectedLang, expectedBase }) => {
        expect(getPostLanguage(slug)).toBe(expectedLang);
        expect(getBaseSlug(slug)).toBe(expectedBase);
      });
    });

    test("isLocalizedSlug correctly identifies localized versions", () => {
      const localizedSlugs = [
        "post-ja",
        "post-ar",
        "my-long-post-ja",
        "my-long-post-ar",
      ];
      const nonLocalizedSlugs = ["post", "my-long-post"];

      localizedSlugs.forEach((slug) => {
        expect(isLocalizedSlug(slug)).toBe(true);
      });

      nonLocalizedSlugs.forEach((slug) => {
        expect(isLocalizedSlug(slug)).toBe(false);
      });
    });
  });

  describe("edge cases", () => {
    test("handles slugs ending with partial language codes", () => {
      // "jar" ends with "ar" but is not "-ar" exactly
      expect(getPostLanguage("my-jar")).toBe("en"); // "my-jar" doesn't end with "-ar"
      expect(isLocalizedSlug("my-jar")).toBe(false); // Not exactly "-ja" or "-ar"
    });

    test("handles slugs with embedded language codes", () => {
      expect(getPostLanguage("japanese-post")).toBe("en");
      expect(getPostLanguage("arabic-culture")).toBe("en");
    });
  });
});
