import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArtworkBySlug, getAllArtworkSlugs } from '@/lib/db/artwork';

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

interface GalleryDetailPageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Revalidate every hour (ISR)

export async function generateStaticParams() {
    const { data: slugs } = await getAllArtworkSlugs();
    return (slugs || []).map((item) => ({ slug: item.slug }));
}

export default async function GalleryDetailPage({
    params,
}: GalleryDetailPageProps) {
    const { slug } = await params;
    const { data: artwork, error } = await getArtworkBySlug(slug);

    if (error || !artwork) {
        notFound();
    }

    return (
        <div className="bg-white text-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link
                    href="/gallery"
                    className="inline-block text-blue-600 hover:underline mb-8"
                >
                    ← Back to Gallery
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="flex items-center justify-center bg-gray-100 rounded border-2 border-black p-4 aspect-square">
                        {artwork.image_large_url ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={artwork.image_large_url}
                                    alt={artwork.alt_text || artwork.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : artwork.image_url ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={artwork.image_url}
                                    alt={artwork.alt_text || artwork.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="text-gray-400 text-center">
                                No image available
                            </div>
                        )}
                    </div>

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
