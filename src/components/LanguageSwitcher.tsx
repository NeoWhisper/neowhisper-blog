'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ];

    return (
        <div className="flex gap-2">
            {languages.map((lang) => (
                <Link
                    key={lang.code}
                    href={pathname.replace(`/${currentLang}`, `/${lang.code}`)}
                    className={`px-3 py-1 rounded-full text-sm ${currentLang === lang.code
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                >
                    {lang.flag} {lang.name}
                </Link>
            ))}
        </div>
    );
}
