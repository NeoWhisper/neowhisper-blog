import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/content-planning/', '/.git/'],
        },
        sitemap: 'https://www.neowhisper.net/sitemap.xml',
    };
}
