import { getAffiliateAdsForPost } from "@/lib/affiliate-ads";
import type { SupportedLang } from "@/lib/i18n";

interface AffiliateAdProps {
  category?: string | null;
  lang: SupportedLang;
}

const AD_LABELS: Record<SupportedLang, string> = {
  ja: "広告",
  en: "Sponsored",
  ar: "إعلان",
};

export default function AffiliateAd({ category, lang }: AffiliateAdProps) {
  const ads = getAffiliateAdsForPost(category, lang);

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 pt-8 border-t border-gray-200/70 dark:border-gray-800/70 flex flex-col items-center gap-6">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-800">
        {AD_LABELS[lang] ?? AD_LABELS.en}
      </span>

      <div className="flex flex-wrap justify-center items-center gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="inline-flex flex-col items-center">
            <a
              href={ad.href}
              target="_blank"
              rel="nofollow noopener"
              className="inline-block rounded-xl overflow-hidden transition-transform hover:scale-[1.01]"
            >
              {ad.imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ad.imageSrc}
                  width={ad.width}
                  height={ad.height}
                  alt={ad.alt ?? ""}
                  className="max-w-full h-auto border-0 block"
                />
              ) : (
                <span className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                  {ad.text}
                </span>
              )}
            </a>
            {ad.trackingPixelSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.trackingPixelSrc}
                width={1}
                height={1}
                alt=""
                className="inline-block w-px h-px border-0 m-0 p-0 pointer-events-none"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
