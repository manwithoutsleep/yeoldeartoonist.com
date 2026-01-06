import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArtworkBySlug, getAllArtworkSlugs } from '@/lib/db/artwork';
import { siteConfig } from '@/config/site';
import { StructuredData } from '@/components/seo/StructuredData';
import {
    getImageObjectSchema,
    getWebPageSchema,
} from '@/lib/seo/structured-data';
import { GalleryDetailClient } from './GalleryDetailClient';
import type { Database } from '@/types/database';

/**
 * Gallery detail page - Individual artwork view
 *
 * Features:
 * - Large image display
 * - Full description
 * - Back link to gallery
 * - Responsive design
 * - Server-side rendering with static generation
 */

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

interface GalleryDetailPageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Gets the appropriate image URL for an artwork with fallback chain.
 * Used for Open Graph images, Twitter cards, and structured data.
 *
 * Fallback priority:
 * 1. image_large_url (800px) - optimal for social media previews
 * 2. image_url (1600px) - full resolution fallback
 * 3. /og-image.jpg - site default
 *
 * @param artwork - The artwork record
 * @returns Image URL string for metadata
 */
function getArtworkImageUrl(artwork: ArtworkRow): string {
    return artwork.image_large_url || artwork.image_url || '/og-image.jpg';
}

export const revalidate = 3600; // Revalidate every hour (ISR)

/**
 * Generates metadata for the gallery detail page including Open Graph and Twitter cards.
 * Creates SEO-optimized metadata with appropriate image URLs and descriptions.
 *
 * @param params - Page parameters containing the artwork slug
 * @returns Metadata object for Next.js head
 */
export async function generateMetadata({
    params,
}: GalleryDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data: artwork } = await getArtworkBySlug(slug);

    if (!artwork) {
        return {
            title: 'Artwork Not Found',
        };
    }

    // Truncate description to 160 characters for meta description
    const metaDescription = artwork.description
        ? artwork.description.length > 160
            ? `${artwork.description.substring(0, 157)}...`
            : artwork.description
        : `View ${artwork.title} by ${siteConfig.artist.name}`;

    const imageUrl = getArtworkImageUrl(artwork);

    return {
        title: artwork.title,
        description: metaDescription,
        openGraph: {
            title: `${artwork.title} - ${siteConfig.site.title}`,
            description: metaDescription,
            url: `${siteConfig.site.url}/gallery/${slug}`,
            type: 'article',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: artwork.alt_text || artwork.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${artwork.title} - ${siteConfig.site.title}`,
            description: metaDescription,
            images: [imageUrl],
        },
    };
}

/**
 * Generates static paths for all artwork pages at build time.
 * Enables Static Site Generation (SSG) for better performance.
 *
 * @returns Array of slug parameters for static generation
 */
export async function generateStaticParams() {
    const { data: slugs } = await getAllArtworkSlugs();
    return (slugs || []).map((item) => ({ slug: item.slug }));
}

/**
 * Gallery detail page component - displays individual artwork.
 *
 * Server component that fetches artwork data and renders:
 * - Large artwork image with lightbox functionality (via GalleryDetailClient)
 * - Artwork metadata (title, description, medium, dimensions, year, tags)
 * - Back navigation to gallery
 * - SEO structured data (WebPage and ImageObject schemas)
 *
 * Uses ISR (Incremental Static Regeneration) with 1-hour revalidation.
 *
 * @param params - Page parameters containing the artwork slug
 * @returns Gallery detail page component or 404 if artwork not found
 */
export default async function GalleryDetailPage({
    params,
}: GalleryDetailPageProps) {
    const { slug } = await params;
    const { data: artwork, error } = await getArtworkBySlug(slug);

    if (error || !artwork) {
        notFound();
    }

    const imageUrl = getArtworkImageUrl(artwork);

    return (
        <div className="bg-white text-black">
            <StructuredData
                data={[
                    getWebPageSchema({
                        name: artwork.title,
                        description:
                            artwork.description ||
                            `View ${artwork.title} by ${siteConfig.artist.name}`,
                        url: `${siteConfig.site.url}/gallery/${slug}`,
                    }),
                    getImageObjectSchema({
                        name: artwork.title,
                        description: artwork.description || undefined,
                        url: imageUrl,
                        author: siteConfig.artist.name,
                    }),
                ]}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link
                    href="/gallery"
                    className="inline-block text-blue-600 hover:underline mb-8"
                >
                    ← Back to Gallery
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image with Lightbox (Client Component) */}
                    <GalleryDetailClient artwork={artwork} />

                    {/* Details */}
                    <div>
                        <h1 className="text-4xl font-bold mb-4">
                            {artwork.title}
                        </h1>

                        {artwork.description && (
                            <p className="text-gray-600 text-lg mb-8">
                                {artwork.description}
                            </p>
                        )}

                        {/* Metadata */}
                        <div className="border-t border-gray-300 pt-6 space-y-4">
                            {artwork.medium && (
                                <div>
                                    <h3 className="font-semibold text-black">
                                        Medium
                                    </h3>
                                    <p className="text-gray-600">
                                        {artwork.medium}
                                    </p>
                                </div>
                            )}

                            {artwork.dimensions && (
                                <div>
                                    <h3 className="font-semibold text-black">
                                        Dimensions
                                    </h3>
                                    <p className="text-gray-600">
                                        {artwork.dimensions}
                                    </p>
                                </div>
                            )}

                            {artwork.year_created && (
                                <div>
                                    <h3 className="font-semibold text-black">
                                        Year Created
                                    </h3>
                                    <p className="text-gray-600">
                                        {artwork.year_created}
                                    </p>
                                </div>
                            )}

                            {artwork.tags && artwork.tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-black">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {artwork.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-gray-200 text-black px-3 py-1 rounded text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
