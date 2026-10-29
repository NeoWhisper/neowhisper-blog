import { buildCategorySlug } from "@/lib/categories";
import type { SupportedLang } from "@/lib/i18n";

export interface AffiliateAdItem {
  id: string;
  /**
   * Category slugs (normalized via buildCategorySlug) where this ad should appear.
   * Use ["*"] to match all categories as a fallback.
   */
  categories: string[];
  /**
   * Optional list of locales where this ad should appear (e.g. ["ja"] for Japanese A8.net ads).
   * If omitted, the ad is eligible across all locales.
   */
  locales?: SupportedLang[];
  /**
   * Affiliate click URL (e.g. https://px.a8.net/svt/ejp?a8mat=...)
   */
  href: string;
  /**
   * Banner image URL (e.g. https://www27.a8.net/svt/bgt?...)
   */
  imageSrc?: string;
  width?: number;
  height?: number;
  alt?: string;
  /**
   * Optional text label for text-link ads or caption
   */
  text?: string;
  /**
   * 1x1 impression tracking pixel URL (e.g. https://www12.a8.net/0.gif?a8mat=...)
   */
  trackingPixelSrc?: string;
}

/**
 * Category-targeted affiliate ads configuration.
 * Add new A8.net banners or text links here and assign them to category slugs.
 */
export const AFFILIATE_ADS: AffiliateAdItem[] = [
  {
    id: "a8-tech-banner-4beraa",
    categories: [
      "next.js",
      "software-development",
      "tech-tips",
      "typescript",
      "performance",
      "ai",
      "ai-and-machine-learning",
      "ai機械学習",
    ],
    locales: ["ja"],
    href: "https://px.a8.net/svt/ejp?a8mat=4BERAA+AABN1U+7QW+1ZJNRL",
    imageSrc:
      "https://www27.a8.net/svt/bgt?aid=261029026622&wid=001&eno=01&mid=s00000001004012017000&mc=1",
    width: 336,
    height: 280,
    alt: "",
    trackingPixelSrc:
      "https://www12.a8.net/0.gif?a8mat=4BERAA+AABN1U+7QW+1ZJNRL",
  },
];

export function getAffiliateAdsForPost(
  category: string | null | undefined,
  lang: SupportedLang,
): AffiliateAdItem[] {
  const categorySlug = category ? buildCategorySlug(category) : "";

  const matched = AFFILIATE_ADS.filter((ad) => {
    const localeMatches = !ad.locales || ad.locales.includes(lang);
    if (!localeMatches) return false;

    return (
      Boolean(categorySlug) &&
      ad.categories.some((c) => c.toLowerCase() === categorySlug.toLowerCase())
    );
  });

  if (matched.length > 0) {
    return matched;
  }

  // Fallback to wildcard ("*") ads if no category-specific ad matched
  return AFFILIATE_ADS.filter((ad) => {
    const localeMatches = !ad.locales || ad.locales.includes(lang);
    return localeMatches && ad.categories.includes("*");
  });
}
