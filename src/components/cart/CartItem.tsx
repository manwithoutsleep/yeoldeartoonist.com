'use client';

/**
 * CartItem Component
 *
 * Displays an individual item in the shopping cart with quantity controls.
 *
 * Features:
 * - Product thumbnail, title, and price
 * - Quantity selector (1-10)
 * - Remove button
 * - Line total calculation
 * - Optimistic UI updates
 * - Accessible controls
 */

import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils/currency';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    const lineTotal = item.price * item.quantity;

    // Calculate available quantity options (max 10 or inventory, whichever is lower)
    // Default to 10 if maxQuantity is not available (e.g., from old cart data)
    const maxSelectableQuantity = Math.min(item.maxQuantity ?? 10, 10);

    return (
        <div className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
            {/* Product Image */}
            <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Item Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">
                        {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {formatCurrency(item.price)}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <select
                        value={item.quantity}
                        onChange={(e) =>
                            updateQuantity(
                                item.artworkId,
                                parseInt(e.target.value)
                            )
                        }
                        aria-label={`Quantity for ${item.title}`}
                        className="text-sm text-black border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        {Array.from(
                            { length: maxSelectableQuantity },
                            (_, i) => i + 1
                        ).map((n) => (
                            <option key={n} value={n}>
                                {n}
                            </option>
                        ))}
                    </select>

                    {/* Remove Button */}
                    <button
                        onClick={() => removeItem(item.artworkId)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="text-sm text-gray-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 rounded px-1"
                    >
                        Remove
                    </button>
                </div>
            </div>

            {/* Line Total */}
            <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                {formatCurrency(lineTotal)}
            </div>
        </div>
    );
}
