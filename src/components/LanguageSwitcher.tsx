"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { normalizeLang } from "@/lib/i18n";

const LANGUAGES = [
    { code: "en", label: "English", suffix: "" },
    { code: "ja", label: "日本語", suffix: "-ja" },
    { code: "ar", label: "العربية", suffix: "-ar" },
] as const;

interface LanguageSwitcherProps {
    availableLanguages?: string[];
    mode?: "suffix" | "query";
    currentLang?: string;
}

export function LanguageSwitcher({
    availableLanguages,
    mode = "suffix",
    currentLang,
}: LanguageSwitcherProps = {}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // ESLint disable is intentional: this pattern is used for hydration detection
        // and only triggers one render after mount to avoid hydration mismatches
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // Guard: only show on blog post pages
    const isValidPath = pathname?.startsWith('/blog/') ?? false;

    // Render nothing for non-blog pages
    const shouldRender = isValidPath;

    // Render placeholder during SSR and initial client render to avoid hydration mismatch
    const showPlaceholder = !isMounted;

    // Early return patterns using logical operators
    const renderContent = () => (
        shouldRender ? (
            showPlaceholder ? (
                <div className="h-8 w-32" />
            ) : (
                (() => {
                    // Detect current active language from suffix
                    // Regex cleanup: handles path with or without trailing slashes
                    // Example: /blog/post-ar/ -> /blog/post
                    const baseSlugPath = pathname.replace(/\/$/, "").replace(/(-ar|-ja)$/, "");

                    // Filter languages to only show available ones if provided
                    const languagesToShow = availableLanguages
                        ? LANGUAGES.filter((lang) => availableLanguages.includes(lang.code))
                        : LANGUAGES;
                    const queryLang = normalizeLang(currentLang ?? searchParams?.get("lang"));

                    return (
                        <div
                            className="flex items-center gap-2 p-1 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm"
                            dir="ltr"
                        >
                            {languagesToShow.map((lang) => {
                                const targetHref =
                                    mode === "query"
                                        ? lang.code === "en"
                                            ? pathname
                                            : `${pathname}?lang=${lang.code}`
                                        : `${baseSlugPath}${lang.suffix}`;
                                const isActive =
                                    mode === "query"
                                        ? queryLang === lang.code
                                        : pathname === targetHref;

                                return (
                                    <Link
                                        key={lang.code}
                                        href={targetHref}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                                            isActive
                                                ? "bg-white text-purple-700 shadow-sm dark:bg-gray-800 dark:text-purple-300"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        {lang.label}
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })()
            )
        ) : null
    );

    return renderContent();
}
