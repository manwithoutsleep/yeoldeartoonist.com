import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedArtwork } from '@/lib/db/artwork';
import { siteConfig } from '@/config/site';

/**
 * Home page - Hero section with scroll background and navigation card previews
 *
 * Features:
 * - Black background with scroll image
 * - Featured artwork showcase
 * - Navigation cards for main sections
 * - Server-side rendering for SSG/ISR benefits
 */

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function Home() {
    const { data: featured } = await getFeaturedArtwork(1);

    return (
        <div className="bg-black text-white">
            {/* Hero Section with Scroll Background */}
            <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
                <Image
                    src="/images/pages/scroll.jpg"
                    alt="Scroll background"
                    fill
                    sizes="100vw"
                    className="object-contain absolute inset-0"
                    priority
                />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">
                        HUZZAHH!!
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                        Greetings and welcome to my site! Here you&apos;ll find
                        a place to view my art, peruse my wares and keep up to
                        date with upcoming projects. I will also post any events
                        I plan on attending. SKAL!!
                    </p>
                </div>
            </div>

            {/* Navigation Cards Section */}
            <div className="bg-black text-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center mb-12">
                        Explore Our Work
                    </h2>

                    <div className="flex flex-col gap-8">
                        {siteConfig.navigation.cards.map((card) => (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="group block overflow-hidden rounded border-4 border-black hover:shadow-xl transition-shadow"
                            >
                                <div className="relative w-full overflow-hidden">
                                    <Image
                                        src={`/images/section-headers/${card.image}`}
                                        alt={`${card.title}: ${card.description}`}
                                        width={1200}
                                        height={600}
                                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="bg-black text-white p-6 text-center">
                                    <p className="text-xl md:text-2xl font-semibold">
                                        {card.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Artwork Section */}
            {featured && featured.length > 0 && (
                <div className="bg-black text-white py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-center mb-12">
                            Featured Artwork
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            {featured[0]?.image_large_url && (
                                <div className="relative w-full h-96">
                                    <Image
                                        src={featured[0].image_large_url}
                                        alt={featured[0].title}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            <div>
                                <h3 className="text-3xl font-bold mb-4">
                                    {featured[0]?.title}
                                </h3>
                                <p className="text-gray-300 mb-6">
                                    {featured[0]?.description}
                                </p>
                                <Link
                                    href={`/gallery/${featured[0]?.slug}`}
                                    className="inline-block bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    View Artwork
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
