import type { MetadataRoute } from 'next';

/**
 * Robots.txt configuration for Ye Olde Artoonist
 * Controls search engine crawler access
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/shoppe/checkout/'],
            },
        ],
        sitemap: 'https://yeoldeartoonist.com/sitemap.xml',
    };
}
