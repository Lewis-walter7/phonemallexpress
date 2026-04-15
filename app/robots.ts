import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.phonemallexpress.com';

    return {
        rules: [
            {
                // Public crawlers — allow everything except private/transactional pages
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/cart/',
                    '/checkout/',
                    '/account/',
                    '/wishlist/',
                    '/order-confirmation/',
                    '/search/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
