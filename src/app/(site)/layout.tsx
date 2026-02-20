import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* SiteHeader reads search params via useSearchParams, which must be wrapped in Suspense for SSG/404 prerender. */}
            <Suspense fallback={null}>
                <SiteHeader />
            </Suspense>
            <main className="flex-1 relative overflow-hidden">
                {children}
            </main>
            {/* SiteFooter reads search params via useSearchParams for language persistence. */}
            <Suspense fallback={null}>
                <SiteFooter />
            </Suspense>
        </>
    );
}
