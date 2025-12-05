/**
 * AddToCartButton Component
 *
 * Client-side button for adding products to the shopping cart.
 * Provides quantity selection and visual feedback on add.
 */

'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/types/cart';

export interface AddToCartButtonProps {
    /**
     * Unique identifier for the artwork
     */
    artworkId: string;

    /**
     * Display title of the artwork
     */
    title: string;

    /**
     * Price per unit in dollars (as string from database)
     */
    price: string;

    /**
     * URL slug for the artwork detail page
     */
    slug: string;

    /**
     * Optional thumbnail image URL
     */
    imageUrl?: string;

    /**
     * Maximum quantity available for purchase
     */
    maxQuantity: number;
}

/**
 * AddToCartButton allows users to select a quantity and add an item to their cart.
 *
 * Features:
 * - Quantity selector (1 to min(maxQuantity, 10))
 * - Add to cart button with loading state
 * - Success feedback ("Added!" message)
 * - Integrates with CartContext for state management
 *
 * @example
 * ```tsx
 * <AddToCartButton
 *   artworkId="123"
 *   title="Medieval Dragon"
 *   price={29.99}
 *   slug="medieval-dragon"
 *   imageUrl="/images/dragon.jpg"
 *   maxQuantity={5}
 * />
 * ```
 */
export function AddToCartButton({
    artworkId,
    title,
    price,
    slug,
    imageUrl,
    maxQuantity,
}: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addItem } = useCart();

    /**
     * Handles adding the selected item to the cart
     */
    const handleAddToCart = () => {
        setIsAdding(true);

        const item: CartItem = {
            artworkId,
            title,
            price: parseFloat(price), // Convert string to number for cart
            quantity,
            slug,
            imageUrl,
            maxQuantity,
        };

        addItem(item);

        // Show success feedback for 500ms
        setTimeout(() => {
            setIsAdding(false);
        }, 500);
    };

    // Calculate available quantity options (max 10)
    const quantityOptions = Math.min(maxQuantity, 10);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <label
                    htmlFor={`quantity-${artworkId}`}
                    className="text-sm font-semibold"
                >
                    Quantity:
                </label>
                <select
                    id={`quantity-${artworkId}`}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="border-2 border-black rounded px-2 py-1 text-black"
                >
                    {Array.from(
                        { length: quantityOptions },
                        (_, i) => i + 1
                    ).map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                data-testid="add-to-cart-btn"
                className="w-full bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isAdding ? 'Added!' : 'Add to Cart'}
            </button>
        </div>
    );
}
