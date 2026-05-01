import {
  normalizeLang,
  withLang,
  supportedLangs,
  type SupportedLang,
} from "../i18n";

describe("i18n utilities", () => {
  describe("supportedLangs", () => {
    test("should contain exactly three languages", () => {
      expect(supportedLangs).toHaveLength(3);
      expect(supportedLangs).toContain("en");
      expect(supportedLangs).toContain("ja");
      expect(supportedLangs).toContain("ar");
    });

    test("should be readonly tuple type", () => {
      // Type-level test: supportedLangs should be readonly at compile time
      expect(supportedLangs).toEqual(["en", "ja", "ar"]);
      // Runtime immutability is enforced by the `as const` assertion
    });
  });

  describe("normalizeLang", () => {
    test("should return correct language codes for valid inputs", () => {
      expect(normalizeLang("en")).toBe("en");
      expect(normalizeLang("ja")).toBe("ja");
      expect(normalizeLang("ar")).toBe("ar");
    });

    test('should default to "en" for invalid or missing inputs', () => {
      expect(normalizeLang("unknown")).toBe("en");
      expect(normalizeLang("fr")).toBe("en");
      expect(normalizeLang("")).toBe("en");
      expect(normalizeLang(null)).toBe("en");
      expect(normalizeLang(undefined)).toBe("en");
    });

    test("should handle case variations", () => {
      // Note: current implementation doesn't handle case, but tests document expected behavior
      expect(normalizeLang("JA")).toBe("en"); // Falls back to en since not exact match
      expect(normalizeLang("AR")).toBe("en");
      expect(normalizeLang("EN")).toBe("en");
    });

    test("should handle whitespace", () => {
      expect(normalizeLang(" ja ")).toBe("en"); // Falls back to en
      expect(normalizeLang("ja ")).toBe("en");
      expect(normalizeLang(" ja")).toBe("en");
    });
  });

  describe("withLang", () => {
    test("should append lang query param to simple paths", () => {
      expect(withLang("/blog", "ja")).toBe("/blog?lang=ja");
      expect(withLang("/about", "ar")).toBe("/about?lang=ar");
      expect(withLang("/contact", "en")).toBe("/contact?lang=en");
    });

    test("should append with & when query params exist", () => {
      expect(withLang("/blog?page=1", "ja")).toBe("/blog?page=1&lang=ja");
      expect(withLang("/search?q=test", "ar")).toBe("/search?q=test&lang=ar");
      expect(withLang("/blog?tag=tech&sort=date", "ja")).toBe(
        "/blog?tag=tech&sort=date&lang=ja",
      );
    });

    test("should handle hash fragments correctly", () => {
      expect(withLang("/blog#section", "ja")).toBe("/blog?lang=ja#section");
      expect(withLang("/about#team", "ar")).toBe("/about?lang=ar#team");
    });

    test("should handle both query params and hash fragments", () => {
      expect(withLang("/blog?page=1#comments", "ja")).toBe(
        "/blog?page=1&lang=ja#comments",
      );
      expect(withLang("/search?q=ai#results", "ar")).toBe(
        "/search?q=ai&lang=ar#results",
      );
    });

    test("should handle empty or root path", () => {
      expect(withLang("/", "ja")).toBe("/?lang=ja");
      expect(withLang("", "ar")).toBe("?lang=ar");
    });

    test("should handle URLs with multiple query parameters and hash", () => {
      const complexUrl = "/blog?category=tech&author=john&page=2#comments";
      expect(withLang(complexUrl, "ja")).toBe(
        "/blog?category=tech&author=john&page=2&lang=ja#comments",
      );
    });

    test("should work with all supported languages", () => {
      supportedLangs.forEach((lang: SupportedLang) => {
        expect(withLang("/test", lang)).toBe(`/test?lang=${lang}`);
      });
    });
  });
});
