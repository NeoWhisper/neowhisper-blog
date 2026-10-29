"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
    interface Window {
        adsbygoogle?: Record<string, unknown>[];
    }
}

type Props = {
    slot: string;
};

function useCookieConsent() {
    const [consented, setConsented] = useState(false);

    useEffect(() => {
        const check = () => {
            try {
                setConsented(localStorage.getItem("cookie-consent") === "accepted");
            } catch {
                setConsented(false);
            }
        };
        check();
        window.addEventListener("storage", check);
        return () => window.removeEventListener("storage", check);
    }, []);

    return consented;
}

export function AdSenseScript({ nonce }: { nonce?: string }) {
    const consented = useCookieConsent();
    const adClientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    if (!adClientId || !consented) {
        return null;
    }

    return (
        <Script
            id="adsense-script"
            nonce={nonce}
            strategy="afterInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`}
            crossOrigin="anonymous"
        />
    );
}

export function AdSenseAd({ slot }: Props) {
    const consented = useCookieConsent();

    useEffect(() => {
        if (!consented) return;
        try {
            // Check if the ad is already initialized to prevent duplicate push calls (common in React Strict Mode)
            const adElement = document.querySelector(`ins[data-ad-slot="${slot}"]`);
            if (adElement && adElement.getAttribute('data-adsbygoogle-status') === 'done') {
                return;
            }

            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            if (process.env.NODE_ENV !== "production") console.error("AdSense error:", err);
        }
    }, [slot, consented]);

    const adClientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    if (!adClientId || !consented) {
        return null;
    }

    return (
        <ins
            className="adsbygoogle adsbygoogle-block"
            data-ad-client={adClientId}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            suppressHydrationWarning
        />
    );
}
