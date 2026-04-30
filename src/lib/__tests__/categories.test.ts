import { categories, buildCategorySlug, type Category } from "../categories";

describe("categories", () => {
  describe("categories array", () => {
    test("should have at least the expected core categories", () => {
      const coreSlugs = [
        "software-development",
        "game-development",
        "translation",
        "next.js",
        "typescript",
        "tech-tips",
        "art-design",
        "product-strategy",
        "apple",
      ];

      const actualSlugs = categories.map((c: Category) => c.slug);
      coreSlugs.forEach((slug: string) => {
        expect(actualSlugs).toContain(slug);
      });
    });

    test("each category should have required fields", () => {
      categories.forEach((category: Category) => {
        expect(category.slug).toBeTruthy();
        expect(category.nameEn).toBeTruthy();
        expect(typeof category.slug).toBe("string");
        expect(typeof category.nameEn).toBe("string");
      });
    });

    test("slugs should be unique", () => {
      const slugs = categories.map((c: Category) => c.slug);
      const uniqueSlugs = [...new Set(slugs)];
      expect(uniqueSlugs).toHaveLength(slugs.length);
    });

    test("slugs should be lowercase and URL-friendly", () => {
      categories.forEach((category: Category) => {
        expect(category.slug).toBe(category.slug.toLowerCase());
        expect(category.slug).not.toContain(" ");
      });
    });

    test("some categories should have localized names", () => {
      const localizedCategories = categories.filter(
        (c: Category) => c.nameJa || c.nameAr,
      );
      expect(localizedCategories.length).toBeGreaterThan(0);

      localizedCategories.forEach((category: Category) => {
        if (category.nameJa) {
          expect(typeof category.nameJa).toBe("string");
        }
        if (category.nameAr) {
          expect(typeof category.nameAr).toBe("string");
        }
      });
    });
  });

  describe("buildCategorySlug", () => {
    test("should match canonical slugs for exact category names", () => {
      expect(buildCategorySlug("Software Development")).toBe(
        "software-development",
      );
      expect(buildCategorySlug("Game Development")).toBe("game-development");
      expect(buildCategorySlug("Translation")).toBe("translation");
      expect(buildCategorySlug("Tech Tips")).toBe("tech-tips");
      expect(buildCategorySlug("TypeScript")).toBe("typescript");
    });

    test("should match canonical slugs for localized names", () => {
      expect(buildCategorySlug("アート＆デザイン")).toBe("art-design");
      expect(buildCategorySlug("プロダクト戦略")).toBe("product-strategy");
      expect(buildCategorySlug("Appleエコシステム")).toBe("apple");
      expect(buildCategorySlug("الفن والتصميم")).toBe("art-design");
      expect(buildCategorySlug("استراتيجية المنتج")).toBe("product-strategy");
      expect(buildCategorySlug("منظومة Apple")).toBe("apple");
    });

    test("should handle Next.js special case with exact case", () => {
      // The special case only matches exact "Next.js" (case-sensitive)
      expect(buildCategorySlug("Next.js")).toBe("next.js");
    });

    test("should handle next.js lowercase via slug generation", () => {
      // Lowercase "next.js" doesn't match the special case, goes through slug generation
      // The dot gets removed by the special character filter
      expect(buildCategorySlug("next.js")).toBe("nextjs");
    });

    test("should normalize input (lowercase, trim)", () => {
      expect(buildCategorySlug("  Software Development  ")).toBe(
        "software-development",
      );
      expect(buildCategorySlug("SOFTWARE DEVELOPMENT")).toBe(
        "software-development",
      );
      expect(buildCategorySlug("software-development")).toBe(
        "software-development",
      );
    });

    test('should convert ampersands to "and" when not matched to category', () => {
      // When it matches a category (like Art & Design), the canonical slug is returned
      expect(buildCategorySlug("Art & Design")).toBe("art-design");
      // For non-matching inputs with ampersands, they get converted to "and"
      expect(buildCategorySlug("Design & UX")).toBe("design-and-ux");
      expect(buildCategorySlug("A ＆ B")).toBe("a-and-b"); // Full-width ampersand
    });

    test("should convert spaces to hyphens", () => {
      expect(buildCategorySlug("tech tips")).toBe("tech-tips");
      expect(buildCategorySlug("multiple   spaces")).toBe("multiple-spaces");
    });

    test("should remove special characters", () => {
      expect(buildCategorySlug("tech@tips")).toBe("techtips");
      expect(buildCategorySlug("tech#tips!")).toBe("techtips");
      expect(buildCategorySlug("tech.tips")).toBe("techtips");
    });

    test("should handle empty or null input gracefully", () => {
      expect(buildCategorySlug("")).toBe("tech-tips"); // Falls back to default
      expect(buildCategorySlug(null as unknown as string)).toBe("tech-tips");
      expect(buildCategorySlug(undefined as unknown as string)).toBe(
        "tech-tips",
      );
    });

    test("should collapse multiple hyphens", () => {
      expect(buildCategorySlug("tech---tips")).toBe("tech-tips");
      expect(buildCategorySlug("tech--tips")).toBe("tech-tips");
    });

    test("should trim leading and trailing hyphens", () => {
      expect(buildCategorySlug("-tech-tips")).toBe("tech-tips");
      expect(buildCategorySlug("tech-tips-")).toBe("tech-tips");
      expect(buildCategorySlug("-tech-tips-")).toBe("tech-tips");
    });

    test("should handle Japanese input with character-based fallback", () => {
      // Japanese characters should be preserved in Unicode mode
      expect(buildCategorySlug("開発")).toBeTruthy();
      expect(buildCategorySlug("テスト")).toBeTruthy();
    });

    test("should handle Arabic input with character-based fallback", () => {
      // Arabic characters should be preserved in Unicode mode
      expect(buildCategorySlug("تطوير")).toBeTruthy();
      expect(buildCategorySlug("اختبار")).toBeTruthy();
    });
  });
});
