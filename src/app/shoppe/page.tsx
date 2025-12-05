import { getAllArtwork } from '@/lib/db/artwork';
import { ProductCard } from '@/components/shoppe/ProductCard';

/**
 * Shoppe page - Product listing for shop items
 *
 * Features:
 * - White background with black text
 * - Responsive grid layout
 * - Product cards with Add to Cart functionality
 * - Server-side rendering for SSG/ISR benefits
 */

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ShoppePage() {
    const { data: allArtwork, error } = await getAllArtwork();
    // Filter to only items with inventory > 0
    const products =
        allArtwork?.filter((item) => item.inventory_count > 0) || [];

    return (
        <div className="bg-white text-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-5xl font-bold text-center mb-4">Shoppe</h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                    Greetings travelers! Feel free to peruse my prints & curios.
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        <p>Error loading products: {error.message}</p>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600">
                            New products coming soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={product.title}
                                description={product.description}
                                price={product.price}
                                originalPrice={product.original_price}
                                inventoryCount={product.inventory_count}
                                imageThumbnailUrl={product.image_thumbnail_url}
                                altText={product.alt_text}
                                slug={product.slug}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
