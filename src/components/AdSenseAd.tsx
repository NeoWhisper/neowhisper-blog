"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        adsbygoogle?: Record<string, unknown>[];
    }
}

type Props = {
    slot: string;
};

export function AdSenseAd({ slot }: Props) {
    useEffect(() => {
        try {
            // Check if the ad is already initialized to prevent duplicate push calls (common in React Strict Mode)
            const adElement = document.querySelector(`ins[data-ad-slot="${slot}"]`);
            if (adElement && adElement.getAttribute('data-adsbygoogle-status') === 'done') {
                return;
            }

            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, [slot]);

    const adClientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    if (!adClientId) {
        return null;
    }

    return (
        <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adClientId}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            suppressHydrationWarning
        />
    );
}
