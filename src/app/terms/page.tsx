import type { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";

const LAST_UPDATED = "2026-02-16";

const copyByLang: Record<
  SupportedLang,
  {
    title: string;
    description: string;
    updated: string;
    points: string[];
  }
> = {
  en: {
    title: "Terms of Service",
    description:
      "Terms for using NeoWhisper's website, content, and inquiry channels.",
    updated: `Last updated: ${LAST_UPDATED}`,
    points: [
      "By using this website, you agree to use it lawfully and respect applicable intellectual property rights.",
      "Content is provided for informational purposes. While we try to keep technical content accurate, NeoWhisper does not guarantee completeness and may update content without prior notice.",
      "You may not abuse contact forms, attempt unauthorized access, or interfere with service availability.",
      "Service engagements are governed by separate project agreements. For terms inquiries, contact neowhisperhq@gmail.com.",
    ],
  },
  ja: {
    title: "利用規約",
    description:
      "NeoWhisperのWebサイト、コンテンツ、お問い合わせ窓口の利用条件。",
    updated: `最終更新日: ${LAST_UPDATED}`,
    points: [
      "本サイトの利用にあたり、法令を遵守し、知的財産権を尊重するものとします。",
      "コンテンツは情報提供目的であり、正確性向上に努めますが、完全性を保証するものではありません。内容は予告なく更新される場合があります。",
      "お問い合わせフォームの不正利用、無断アクセス、サービス妨害行為は禁止します。",
      "個別案件の提供条件は別途契約により定めます。規約に関するお問い合わせは neowhisperhq@gmail.com までご連絡ください。",
    ],
  },
  ar: {
    title: "شروط الاستخدام",
    description:
      "شروط استخدام موقع NeoWhisper والمحتوى وقنوات التواصل.",
    updated: `آخر تحديث: ${LAST_UPDATED}`,
    points: [
      "باستخدامك لهذا الموقع، فإنك توافق على الاستخدام القانوني واحترام حقوق الملكية الفكرية المعمول بها.",
      "المحتوى منشور لأغراض معلوماتية. نسعى للدقة، لكن NeoWhisper لا يضمن الاكتمال، وقد يتم تحديث المحتوى دون إشعار مسبق.",
      "يُمنع إساءة استخدام نماذج التواصل أو محاولة الوصول غير المصرح به أو تعطيل توفر الخدمة.",
      "شروط تنفيذ المشاريع تُحدَّد ضمن اتفاقيات مستقلة. للاستفسار عن الشروط راسلنا على neowhisperhq@gmail.com.",
    ],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];

  return {
    title: `${copy.title} | NeoWhisper`,
    description: copy.description,
    alternates: {
      languages: {
        en: "/terms?lang=en",
        ja: "/terms?lang=ja",
        ar: "/terms?lang=ar",
      },
    },
  };
}

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const copy = copyByLang[currentLang];
  const isRTL = currentLang === "ar";

  return (
    <main
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
      dir={isRTL ? "rtl" : "ltr"}
      lang={currentLang}
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {copy.title}
      </h1>
      <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
        {copy.updated}
      </p>

      <section className="mt-8 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
        <ul className="space-y-3">
          {copy.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
