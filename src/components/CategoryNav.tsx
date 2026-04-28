'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { withLang, type SupportedLang } from "@/lib/i18n";

interface Category {
    name: string;
    slug: string;
    count?: number;
}

export default function CategoryNav({
    categories,
    lang,
    showCounts = true,
}: {
    categories: Category[];
    lang?: SupportedLang;
    showCounts?: boolean;
}) {
    const pathname = usePathname();

    return (
        <nav className="w-full mb-12 relative z-10">
            <div className="flex flex-wrap justify-center gap-3 px-2">
                {categories.map((cat) => {
                    const categoryPath = `/category/${cat.slug}`;
                    const href = lang ? withLang(categoryPath, lang) : categoryPath;
                    const normalizedPathname = pathname.replace(/\/$/, "");
                    const normalizedCategoryPath = categoryPath.replace(/\/$/, "");

                    // Handle encoded paths for Japanese categories
                    const isActive = normalizedPathname === normalizedCategoryPath ||
                        normalizedPathname === encodeURI(normalizedCategoryPath);

                    return (
                        <Link
                            key={cat.slug}
                            href={href}
                            className={cn(
                                "whitespace-nowrap px-6 py-3 rounded-2xl transition-all duration-300 shadow-sm border text-sm font-bold cursor-pointer",
                                "backdrop-blur-md",
                                isActive
                                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.3)] scale-105"
                                    : "bg-white/40 dark:bg-white/5 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-purple-500/10 hover:border-purple-500/30 dark:hover:bg-purple-500/20 dark:hover:border-purple-500/50 hover:scale-105"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {cat.name}
                                {showCounts && cat.count !== undefined && (
                                    <span className={cn(
                                        "rounded-full px-2 py-0.5 text-xs font-medium",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                    )}>
                                        {cat.count}
                                    </span>
                                )}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
