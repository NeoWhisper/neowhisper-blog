'use client';

import { useEffect } from 'react';

interface AdSenseProps {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
}

export default function AdSense({
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    style = { display: 'block' }
}: AdSenseProps) {
    useEffect(() => {
        try {
            // @ts-expect-error - Google AdSense library not typed
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your AdSense client ID
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive.toString()}
        />
    );
}
