import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Admin — NeoWhisper",
    description: "NeoWhisper admin workspace.",
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div lang="en" className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900">
            {/* Admin top bar */}
            <header className="border-b border-white/8 bg-black/20 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/20 ring-1 ring-purple-500/40">
                            <svg className="h-3 w-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            NeoWhisper <span className="text-purple-400">/</span> Admin
                        </span>
                    </div>

                    <Link
                        href="/"
                        className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                    >
                        ← Back to site
                    </Link>
                </div>
            </header>

            {/* Page content */}
            <div className="flex-1">
                {children}
            </div>

            {/* Admin footer */}
            <footer className="border-t border-white/8 py-4 text-center">
                <p className="text-xs text-gray-700">
                    NeoWhisper Admin · Internal use only
                </p>
            </footer>
        </div>
    );
}
