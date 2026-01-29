"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LANGUAGES = [
    { code: "en", label: "English", suffix: "" },
    { code: "ar", label: "العربية", suffix: "-ar" },
    { code: "ja", label: "日本語", suffix: "-ja" },
] as const;

export function LanguageSwitcher() {
    const pathname = usePathname();

    // Guard: if pathname is not string or doesn't look like a blog post, just return null or default
    if (!pathname || !pathname.startsWith('/blog/')) {
        return null;
    }

    // Detect current active language from suffix
    // Regex to remove optional -ar or -ja from the end of string
    // It handles:
    // /blog/slug-ar -> /blog/slug
    // /blog/slug-ja -> /blog/slug
    // /blog/slug    -> /blog/slug
    const baseSlugPath = pathname.replace(/(-ar|-ja)$/, "");

    return (
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
            {LANGUAGES.map((lang) => {
                const targetHref = `${baseSlugPath}${lang.suffix}`;
                const isActive = pathname === targetHref;

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
}
