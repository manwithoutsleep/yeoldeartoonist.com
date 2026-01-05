/**
 * ProductCard Component
 *
 * Displays a single product with image, details, and Add to Cart functionality.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AddToCartButton } from './AddToCartButton';

export interface ProductCardProps {
    id: string;
    title: string;
    description: string | null;
    price: string;
    originalPrice: string | null;
    inventoryCount: number;
    imageThumbnailUrl: string | null;
    altText: string | null;
    slug: string;
    headingLevel?: 'h2' | 'h3';
}

/**
 * ProductCard displays a single shop item with purchase options.
 *
 * Features:
 * - Product image with hover zoom
 * - Title and description
 * - Price display with sale pricing
 * - Low stock warning
 * - Add to cart functionality
 * - View details link
 *
 * @example
 * ```tsx
 * <ProductCard
 *   id="123"
 *   title="Medieval Dragon Print"
 *   description="Hand-drawn medieval dragon"
 *   price={29.99}
 *   originalPrice={39.99}
 *   inventoryCount={3}
 *   imageThumbnailUrl="/images/dragon.jpg"
 *   altText="Medieval dragon illustration"
 *   slug="medieval-dragon"
 * />
 * ```
 */
export function ProductCard({
    id,
    title,
    description,
    price,
    originalPrice,
    inventoryCount,
    imageThumbnailUrl,
    altText,
    slug,
    headingLevel = 'h2',
}: ProductCardProps) {
    const HeadingTag = headingLevel;

    return (
        <div className="border-2 border-black rounded overflow-hidden hover:shadow-lg transition-shadow">
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                {imageThumbnailUrl ? (
                    <Image
                        src={imageThumbnailUrl}
                        alt={altText || title}
                        fill
                        className="object-contain hover:scale-110 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No image</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-6">
                <HeadingTag className="text-xl font-bold mb-2">
                    {title}
                </HeadingTag>

                {description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Price */}
                <div className="mb-6 border-t border-gray-300 pt-4">
                    <p className="text-2xl font-bold text-black">${price}</p>
                    {originalPrice && (
                        <p className="text-sm text-gray-500 line-through">
                            ${originalPrice}
                        </p>
                    )}
                </div>

                {/* Inventory Status */}
                {inventoryCount < 5 && (
                    <p className="text-red-600 text-sm font-semibold mb-4">
                        Only {inventoryCount} left in stock
                    </p>
                )}

                {/* Add to Cart */}
                <AddToCartButton
                    artworkId={id}
                    title={title}
                    price={price}
                    slug={slug}
                    imageUrl={imageThumbnailUrl || undefined}
                    maxQuantity={inventoryCount}
                />

                {/* View Details Link */}
                <Link
                    href={`/gallery/${slug}`}
                    className="block w-full text-center bg-white text-black border-2 border-black px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors mt-3"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
