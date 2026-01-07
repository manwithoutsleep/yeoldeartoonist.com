import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArtworkBySlug, getAllArtworkSlugs } from '@/lib/db/artwork';
import { siteConfig } from '@/config/site';
import { StructuredData } from '@/components/seo/StructuredData';
import { getWebPageSchema, getProductSchema } from '@/lib/seo/structured-data';
import { AddToCartButton } from '@/components/shoppe/AddToCartButton';
import { ShoppeDetailClient } from './ShoppeDetailClient';
import type { Database } from '@/types/database';

/**
 * Shoppe detail page - Individual product view
 *
 * Features:
 * - Large image display with lightbox
 * - Full description
 * - E-commerce metadata (price, inventory, SKU)
 * - Artwork metadata (medium, dimensions, year, tags)
 * - Add to Cart functionality
 * - Back link to shoppe
 * - Responsive design
 * - Server-side rendering with static generation
 */

type ArtworkRow = Database['public']['Tables']['artwork']['Row'];

interface ShoppeDetailPageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Gets the appropriate image URL for a product with fallback chain.
 * Used for Open Graph images, Twitter cards, and structured data.
 *
 * Fallback priority:
 * 1. image_large_url (1600px) - optimal for social media previews
 * 2. image_url (800px) - medium resolution fallback
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
 * Generates metadata for the shoppe detail page including Open Graph and Twitter cards.
 * Creates SEO-optimized metadata with Product schema, pricing, and availability.
 *
 * @param params - Page parameters containing the product slug
 * @returns Metadata object for Next.js head
 */
export async function generateMetadata({
    params,
}: ShoppeDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const { data: artwork } = await getArtworkBySlug(slug);

    if (!artwork) {
        return {
            title: 'Product Not Found',
        };
    }

    // Truncate description to 160 characters for meta description
    const metaDescription = artwork.description
        ? artwork.description.length > 160
            ? `${artwork.description.substring(0, 157)}...`
            : artwork.description
        : `Shop ${artwork.title} by ${siteConfig.artist.name}. Price: $${artwork.price}`;

    const imageUrl = getArtworkImageUrl(artwork);

    return {
        title: artwork.title,
        description: metaDescription,
        openGraph: {
            title: `${artwork.title} - ${siteConfig.site.title}`,
            description: metaDescription,
            url: `${siteConfig.site.url}/shoppe/${slug}`,
            type: 'website', // Changed from 'article' to 'website' for product pages
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
 * Generates static paths for all product pages at build time.
 * Enables Static Site Generation (SSG) for better performance.
 *
 * @returns Array of slug parameters for static generation
 */
export async function generateStaticParams() {
    const { data: slugs } = await getAllArtworkSlugs();
    return (slugs || []).map((item) => ({ slug: item.slug }));
}

/**
 * Shoppe detail page component - displays individual product.
 *
 * Server component that fetches product data and renders:
 * - Large product image with lightbox functionality (via ShoppeDetailClient)
 * - Product metadata (title, description, price, inventory, SKU)
 * - Artwork metadata (medium, dimensions, year, tags)
 * - Add to Cart functionality
 * - Back navigation to shoppe
 * - SEO structured data (WebPage and Product schemas)
 *
 * Uses ISR (Incremental Static Regeneration) with 1-hour revalidation.
 *
 * @param params - Page parameters containing the product slug
 * @returns Shoppe detail page component or 404 if product not found
 */
export default async function ShoppeDetailPage({
    params,
}: ShoppeDetailPageProps) {
    const { slug } = await params;
    const { data: artwork, error } = await getArtworkBySlug(slug);

    if (error || !artwork) {
        notFound();
    }

    const imageUrl = getArtworkImageUrl(artwork);

    // Determine availability status for structured data
    const availability = artwork.inventory_count > 0 ? 'InStock' : 'OutOfStock';

    return (
        <div className="bg-white text-black">
            <StructuredData
                data={[
                    getWebPageSchema({
                        name: artwork.title,
                        description:
                            artwork.description ||
                            `Shop ${artwork.title} by ${siteConfig.artist.name}`,
                        url: `${siteConfig.site.url}/shoppe/${slug}`,
                    }),
                    getProductSchema({
                        name: artwork.title,
                        description:
                            artwork.description ||
                            `Shop ${artwork.title} by ${siteConfig.artist.name}`,
                        image: imageUrl,
                        price: parseFloat(artwork.price),
                        availability,
                        url: `${siteConfig.site.url}/shoppe/${slug}`,
                        sku: artwork.sku || undefined,
                    }),
                ]}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link
                    href="/shoppe"
                    className="inline-block text-blue-600 hover:underline mb-8"
                >
                    ← Back to Shoppe
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(auto,800px)_1fr] gap-12">
                    {/* Image with Lightbox (Client Component) */}
                    <ShoppeDetailClient artwork={artwork} />

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

                        {/* E-commerce Metadata Section */}
                        <div className="border-t border-gray-300 pt-6 mb-8">
                            <div className="mb-4">
                                <p className="text-3xl font-bold">
                                    ${artwork.price}
                                </p>
                                {artwork.original_price && (
                                    <p className="text-gray-500 line-through">
                                        ${artwork.original_price}
                                    </p>
                                )}
                            </div>

                            {artwork.inventory_count < 5 &&
                                artwork.inventory_count > 0 && (
                                    <p className="text-red-600 font-semibold mb-4">
                                        Only {artwork.inventory_count} left in
                                        stock
                                    </p>
                                )}

                            {artwork.inventory_count === 0 && (
                                <p className="text-red-600 font-bold mb-4">
                                    Out of Stock
                                </p>
                            )}

                            {artwork.sku && (
                                <p className="text-sm text-gray-600 mb-4">
                                    SKU: {artwork.sku}
                                </p>
                            )}

                            {/* Add to Cart Button */}
                            <AddToCartButton
                                artworkId={artwork.id}
                                title={artwork.title}
                                price={artwork.price}
                                slug={artwork.slug}
                                imageUrl={
                                    artwork.image_thumbnail_url || undefined
                                }
                                maxQuantity={artwork.inventory_count}
                            />
                        </div>

                        {/* Artwork Metadata */}
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
