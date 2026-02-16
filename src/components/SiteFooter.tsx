"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { normalizeLang, type SupportedLang, withLang } from "@/lib/i18n";

function getLabel(key: "privacy" | "terms" | "contact", lang: SupportedLang) {
  const labels: Record<SupportedLang, Record<typeof key, string>> = {
    en: { privacy: "Privacy", terms: "Terms", contact: "Contact" },
    ja: { privacy: "プライバシー", terms: "利用規約", contact: "お問い合わせ" },
    ar: { privacy: "الخصوصية", terms: "الشروط", contact: "تواصل" },
  };

  return labels[lang][key];
}

export default function SiteFooter() {
  const searchParams = useSearchParams();
  const currentLang = normalizeLang(searchParams?.get("lang")) as SupportedLang;

  return (
    <footer className="border-t border-white/5 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">NEO WHISPER</h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Individual business (個人事業主) registered in Japan. <br />
              開業届 filed December 2025. Based in Tokyo.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/NeoWhisper" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Trust Signals</h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Official Registration Minato-ku
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Links</h3>
            <div className="flex flex-col gap-2" dir="ltr">
              <Link className="hover:text-white transition-colors text-zinc-400" href={withLang("/privacy", currentLang)}>
                {getLabel("privacy", currentLang)}
              </Link>
              <Link className="hover:text-white transition-colors text-zinc-400" href={withLang("/terms", currentLang)}>
                {getLabel("terms", currentLang)}
              </Link>
              <Link className="hover:text-white transition-colors text-zinc-400" href={withLang("/contact", currentLang)}>
                {getLabel("contact", currentLang)}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center sm:text-left">
          <span className="text-zinc-500">© 2026 NEO WHISPER. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

