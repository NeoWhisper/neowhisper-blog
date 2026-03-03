'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { useEffect, Suspense } from 'react'

import { GA_TRACKING_ID, pageview } from '@/lib/gtag'

function AnalyticsLogic() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname && GA_TRACKING_ID) {
            pageview(pathname)
        }
    }, [pathname, searchParams])

    return null
}

export default function GoogleAnalytics({ nonce }: { nonce?: string }) {
    if (!GA_TRACKING_ID) {
        return null
    }

    return (
        <>
            <Script
                nonce={nonce}
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
                nonce={nonce}
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />

            <Suspense fallback={null}>
                <AnalyticsLogic />
            </Suspense>
        </>
    )
}
