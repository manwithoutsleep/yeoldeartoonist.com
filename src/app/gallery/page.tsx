import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllArtwork } from '@/lib/db/artwork';
import { siteConfig } from '@/config/site';
import { StructuredData } from '@/components/seo/StructuredData';
import { getWebPageSchema } from '@/lib/seo/structured-data';

/**
 * Gallery page - Display all published artwork in a grid
 *
 * Features:
 * - White background with black text
 * - Responsive grid layout
 * - Clickable artwork cards linking to detail pages
 * - Server-side rendering for SSG/ISR benefits
 */

export const revalidate = 3600; // Revalidate every hour (ISR)

export const metadata: Metadata = {
    title: 'Gallery',
    description: `Browse original artwork and illustrations by ${siteConfig.artist.name}. Explore the landscape of imagination with unique art pieces.`,
    openGraph: {
        title: `Gallery - ${siteConfig.site.title}`,
        description: `Browse original artwork and illustrations by ${siteConfig.artist.name}`,
        url: `${siteConfig.site.url}/gallery`,
        type: 'website',
        images: [
            {
                url: '/images/section-headers/gallery.webp',
                width: 1200,
                height: 630,
                alt: 'Ye Olde Artoonist Gallery',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Gallery - ${siteConfig.site.title}`,
        description: `Browse original artwork and illustrations by ${siteConfig.artist.name}`,
        images: ['/images/section-headers/gallery.webp'],
    },
};

export default async function GalleryPage() {
    const { data: artwork, error } = await getAllArtwork();

    return (
        <div className="bg-white text-black">
            <StructuredData
                data={getWebPageSchema({
                    name: 'Gallery',
                    description: `Browse original artwork and illustrations by ${siteConfig.artist.name}`,
                    url: `${siteConfig.site.url}/gallery`,
                })}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-4">Gallery</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Welcome to the landscape of my imagination!
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        <p>Error loading gallery: {error.message}</p>
                    </div>
                )}

                {!artwork || artwork.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600">
                            Artwork is on its way!
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
                                <div className="relative w-full aspect-square overflow-hidden rounded border-2 border-black mb-4 bg-gray-100">
                                    {item.image_thumbnail_url ? (
                                        <Image
                                            src={item.image_thumbnail_url}
                                            alt={item.alt_text || item.title}
                                            fill
                                            className="object-contain group-hover:scale-110 transition-transform"
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
                                    <h2 className="text-xl font-bold mb-2 group-hover:underline">
                                        {item.title}
                                    </h2>
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
