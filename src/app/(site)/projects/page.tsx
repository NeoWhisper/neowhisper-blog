import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { normalizeLang, type SupportedLang } from "@/lib/i18n";
import { getProjects } from "@/data/projects";
import { SITE_URL } from "@/lib/site-config";

const baseUrl = SITE_URL;

const copy = {
  en: {
    label: "Projects",
    title: "Proof of Work",
    subtitle: "Shipped implementation first, roadmap second.",
    intro:
      "Current shipped work by NEO WHISPER, a registered IT services sole proprietorship in Tokyo.",
    back: "Back to Home",
    nowLabel: "Now",
    inProgressLabel: "In Progress",
    plannedLabel: "Planned",
    nowSection: "Shipped Work",
    roadmapSection: "Roadmap",
    roadmapIntro: "These items are not yet delivered and are shown as future work only.",
    primaryCta: "Start a Project",
    challengeLabel: "Challenge",
    scopeLabel: "Scope",
    stackLabel: "Stack",
    outcomeLabel: "Outcome",
  },
  ja: {
    label: "プロジェクト",
    title: "実績とロードマップ",
    subtitle: "本番稼働中の実績を先に、将来計画を後に表示します。",
    intro:
      "NEO WHISPER（東京都港区のITサービス個人事業主）の現在の実装実績です。",
    back: "ホームへ戻る",
    nowLabel: "提供中",
    inProgressLabel: "進行中",
    plannedLabel: "計画",
    nowSection: "稼働中の実績",
    roadmapSection: "ロードマップ",
    roadmapIntro: "以下は未提供の将来項目です。現在提供中のサービスではありません。",
    primaryCta: "プロジェクト相談を始める",
    challengeLabel: "課題",
    scopeLabel: "実装範囲",
    stackLabel: "技術構成",
    outcomeLabel: "成果",
  },
  ar: {
    label: "المشاريع",
    title: "الأعمال المنفذة وخارطة الطريق",
    subtitle: "نعرض ما تم تسليمه فعلياً أولاً، ثم العناصر المستقبلية بشكل منفصل.",
    intro:
      "هذه هي الأعمال المنفذة حالياً لدى نيو ويسبر (NEO WHISPER)، وهي مؤسسة فردية مسجلة لخدمات تقنية المعلومات في طوكيو.",
    back: "العودة للرئيسية",
    nowLabel: "متاح الآن",
    inProgressLabel: "قيد التنفيذ",
    plannedLabel: "مخطط",
    nowSection: "أعمال تم تسليمها",
    roadmapSection: "خارطة الطريق",
    roadmapIntro: "العناصر التالية غير مسلّمة بعد وتُعرض كخطط مستقبلية فقط.",
    primaryCta: "ابدأ طلب مشروع",
    challengeLabel: "التحدي",
    scopeLabel: "نطاق التنفيذ",
    stackLabel: "التقنيات",
    outcomeLabel: "النتيجة",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;

  const meta = {
    en: {
      title: "Projects - NeoWhisper | Portfolio & Case Studies",
      description:
        "Explore our portfolio of web platforms, apps, games, and multilingual deliverables. Real-world projects built with Next.js, TypeScript, Unity, and modern tools.",
    },
    ja: {
      title: "プロジェクト - NeoWhisper | ポートフォリオ・実績",
      description:
        "Webプラットフォーム、ゲーム、多言語製品のポートフォリオ。Next.js、TypeScript、Unityなどのモダンツールで構築された実績をご覧ください。",
    },
    ar: {
      title: "المشاريع - NeoWhisper | معرض الأعمال ودراسات الحالة",
      description:
        "استكشف معرض أعمالنا من منصات الويب والألعاب والمنتجات متعددة اللغات. مشاريع واقعية مبنية بـ Next.js وTypeScript وUnity وأدوات حديثة.",
    },
  };

  const { title, description } = meta[currentLang];
  const canonicalPath = currentLang === "en" ? "/projects" : `/projects?lang=${currentLang}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonicalPath}`,
      type: "website",
      locale:
        currentLang === "ja"
          ? "ja_JP"
          : currentLang === "ar"
            ? "ar_SA"
            : "en_US",
      alternateLocale: ["en_US", "ja_JP", "ar_SA"].filter(
        (loc) =>
          loc !==
          (currentLang === "ja"
            ? "ja_JP"
            : currentLang === "ar"
              ? "ar_SA"
              : "en_US"),
      ),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/projects",
        ja: "/projects?lang=ja",
        ar: "/projects?lang=ar",
      },
    },
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const currentLang = normalizeLang(lang) as SupportedLang;
  const t = copy[currentLang];
  const projects = getProjects(currentLang).map((project) => ({
    ...project,
    links: project.links.map((link) => {
      if (!link.href || link.href.startsWith("http")) return link;
      return { ...link, href: `${link.href}?lang=${currentLang}` };
    }),
  }));
  const nowProjects = projects.filter((p) => p.status === "now");
  const roadmapProjects = projects.filter((p) => p.status !== "now");
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 px-4 py-16 sm:px-6 lg:px-8"
      dir={currentLang === "ar" ? "rtl" : "ltr"}
      lang={currentLang}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
              {t.label}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {t.subtitle}
            </p>
            <p className="mt-6 max-w-2xl rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-sm font-medium text-purple-700 dark:text-purple-300">
              {t.intro}
            </p>
          </div>
          <Link
            href={`/?lang=${currentLang}`}
            className="rounded-full border border-white/20 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            {t.back}
          </Link>
        </div>

        {/* Shipped Projects Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            {t.nowSection}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {nowProjects.map((project) => (
                <article
                  key={project.title}
                  className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h2>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                  {project.proof && (
                    <dl className="mt-4 grid gap-2 rounded-2xl border border-white/20 bg-white/60 p-4 text-xs dark:border-white/10 dark:bg-white/5">
                      <div>
                        <dt className="font-semibold text-gray-700 dark:text-gray-200">{t.challengeLabel}</dt>
                        <dd className="text-gray-600 dark:text-gray-300">{project.proof.challenge}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-700 dark:text-gray-200">{t.scopeLabel}</dt>
                        <dd className="text-gray-600 dark:text-gray-300">{project.proof.scope}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-700 dark:text-gray-200">{t.stackLabel}</dt>
                        <dd className="text-gray-600 dark:text-gray-300">{project.proof.stack}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-gray-700 dark:text-gray-200">{t.outcomeLabel}</dt>
                        <dd className="text-gray-600 dark:text-gray-300">{project.proof.outcome}</dd>
                      </div>
                    </dl>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {project.links.map((link) => {
                      if (!link.href) {
                        return (
                          <span
                            key={link.label}
                            className="rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-500 dark:border-white/10 dark:bg-white/10 dark:text-gray-400"
                          >
                            {link.label}
                          </span>
                        );
                      }

                      const isExternal = link.href.startsWith("http");
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          className="rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
                          {...(isExternal
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {link.label}
                        </a>
                      );
                    })}
                  </div>
                </article>
              ))}
          </div>
        </section>

        {/* Roadmap Section */}
        {roadmapProjects.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                {t.roadmapSection}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t.roadmapIntro}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roadmapProjects.map((project) => (
                  <article
                    key={project.title}
                    className="rounded-2xl border border-white/20 bg-white/40 p-5 opacity-70 transition-all duration-300 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {project.title}
                      </h3>
                      <span className="rounded-full border border-white/30 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:border-white/10 dark:bg-white/10 dark:text-gray-400">
                        {project.status === "in_progress" ? t.inProgressLabel : t.plannedLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href={`/contact?lang=${currentLang}`}
            className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
          >
            {t.primaryCta}
          </Link>
        </div>
      </div>
    </div>
  );
}
