'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getArtworkBySlug } from '@/lib/db/artwork';
import type { Database } from '@/types/database';

/**
 * Gallery detail page - Individual artwork view
 *
 * Features:
 * - Large image display
 * - Full description
 * - Back link to gallery
 * - Responsive design
 */

interface GalleryDetailPageProps {
    params: Promise<{ slug: string }>;
}

export default function GalleryDetailPage({ params }: GalleryDetailPageProps) {
    const [slug, setSlug] = useState<string | null>(null);
    const [artwork, setArtwork] = useState<
        Database['public']['Tables']['artwork']['Row'] | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then((p) => setSlug(p.slug));
    }, [params]);

    useEffect(() => {
        if (!slug) return;

        const loadArtwork = async () => {
            try {
                const { data, error: queryError } =
                    await getArtworkBySlug(slug);
                if (queryError) {
                    setError(queryError.message);
                } else if (data) {
                    setArtwork(data);
                } else {
                    setError('Artwork not found');
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load artwork'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadArtwork();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="bg-white text-black min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold">Loading artwork...</p>
                </div>
            </div>
        );
    }

    if (error || !artwork) {
        return (
            <div className="bg-white text-black min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link
                        href="/gallery"
                        className="inline-block text-blue-600 hover:underline mb-8"
                    >
                        ← Back to Gallery
                    </Link>
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded">
                        <p>{error || 'Artwork not found'}</p>
                    </div>
                </div>
            </div>
        );
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
                    <div className="flex items-center justify-center bg-gray-100 rounded border-2 border-black p-4 min-h-96">
                        {artwork.image_large_url ? (
                            <div className="relative w-full h-96">
                                <Image
                                    src={artwork.image_large_url}
                                    alt={artwork.alt_text || artwork.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : artwork.image_url ? (
                            <div className="relative w-full h-96">
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
