import Image from 'next/image';
import Link from 'next/link';
import { getAllArtwork } from '@/lib/db/artwork';

/**
 * Shoppe page - Product listing for shop items
 *
 * Features:
 * - White background with black text
 * - Responsive grid layout
 * - Product card with price
 * - Add to cart button (non-functional for MVP)
 * - Quantity selector UI
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
                    Purchase original artwork and unique pieces from Ye Olde
                    Artoonist
                </p>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        <p>Error loading products: {error.message}</p>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-gray-600">
                            No products available at the moment
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="border-2 border-black rounded overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Product Image */}
                                <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                                    {product.image_thumbnail_url ? (
                                        <Image
                                            src={product.image_thumbnail_url}
                                            alt={
                                                product.alt_text ||
                                                product.title
                                            }
                                            fill
                                            className="object-cover hover:scale-110 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-400">
                                                No image
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">
                                        {product.title}
                                    </h3>

                                    {product.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    {/* Price */}
                                    <div className="mb-6 border-t border-gray-300 pt-4">
                                        <p className="text-2xl font-bold text-black">
                                            ${product.price}
                                        </p>
                                        {product.original_price && (
                                            <p className="text-sm text-gray-500 line-through">
                                                ${product.original_price}
                                            </p>
                                        )}
                                    </div>

                                    {/* Inventory Status */}
                                    {product.inventory_count < 5 && (
                                        <p className="text-red-600 text-sm font-semibold mb-4">
                                            Only {product.inventory_count} left
                                            in stock
                                        </p>
                                    )}

                                    {/* Quantity Selector and Add to Cart (Placeholder) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-semibold">
                                                Quantity:
                                            </label>
                                            <select className="border-2 border-black rounded px-2 py-1 text-black">
                                                {[1, 2, 3, 4, 5].map((num) => (
                                                    <option
                                                        key={num}
                                                        value={num}
                                                        disabled={
                                                            num >
                                                            product.inventory_count
                                                        }
                                                    >
                                                        {num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            disabled
                                            className="w-full bg-gray-400 text-white px-4 py-2 rounded font-semibold cursor-not-allowed opacity-50"
                                            title="Cart functionality coming in Phase 3"
                                        >
                                            Add to Cart
                                        </button>

                                        <Link
                                            href={`/gallery/${product.slug}`}
                                            className="block w-full text-center bg-white text-black border-2 border-black px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
