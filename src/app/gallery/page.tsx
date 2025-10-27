'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllArtwork } from '@/lib/db/artwork';
import type { Database } from '@/types/database';

/**
 * Gallery page - Display all published artwork in a grid
 *
 * Features:
 * - White background with black text
 * - Responsive grid layout
 * - Clickable artwork cards linking to detail pages
 */

export default function GalleryPage() {
    const [artwork, setArtwork] = useState<
        Database['public']['Tables']['artwork']['Row'][]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadArtwork = async () => {
            try {
                const { data, error: queryError } = await getAllArtwork();
                if (queryError) {
                    setError(queryError.message);
                } else if (data) {
                    setArtwork(data);
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
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white text-black min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold">Loading gallery...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-4">Gallery</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Explore our collection of original artwork and creative
                    pieces
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        <p>Error loading gallery: {error}</p>
                    </div>
                )}

                {artwork.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600">
                            No artwork available yet
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {artwork.map((item) => (
                            <Link
                                key={item.id}
                                href={`/gallery/${item.slug}`}
                                className="group block"
                            >
                                <div className="relative w-full h-64 overflow-hidden rounded border-2 border-black mb-4 bg-gray-100">
                                    {item.image_thumbnail_url ? (
                                        <Image
                                            src={item.image_thumbnail_url}
                                            alt={item.alt_text || item.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-400">
                                                No image
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:underline">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
