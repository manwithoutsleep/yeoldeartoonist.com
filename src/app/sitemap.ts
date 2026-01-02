/**
 * Dynamic sitemap generation
 * Generates sitemap.xml with all public pages and artwork
 */

import { MetadataRoute } from 'next';
import { getAllArtworkSlugs } from '@/lib/db/artwork';
import { siteConfig } from '@/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.site.url;

    // Static pages with their priorities and change frequencies
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shoppe`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/in-the-works`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Get all artwork slugs for dynamic gallery pages
    const { data: artworkSlugs } = await getAllArtworkSlugs();

    const artworkPages: MetadataRoute.Sitemap =
        artworkSlugs?.map((artwork) => ({
            url: `${baseUrl}/gallery/${artwork.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })) || [];

    return [...staticPages, ...artworkPages];
}
