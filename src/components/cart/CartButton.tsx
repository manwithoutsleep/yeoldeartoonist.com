'use client';

/**
 * CartButton Component
 *
 * Displays a shopping cart button in the header with an item count badge.
 * Opens the cart drawer when clicked.
 *
 * Features:
 * - Shopping cart icon with count badge
 * - Badge hidden when cart is empty
 * - Opens CartDrawer on click
 * - Accessible with keyboard navigation
 * - Badge animates when items added
 */

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { CartDrawer } from './CartDrawer';

export function CartButton() {
    const [isOpen, setIsOpen] = useState(false);
    const { getItemCount } = useCart();

    const itemCount = getItemCount();

    return (
        <>
            <button
                data-testid="cart-button"
                onClick={() => setIsOpen(true)}
                aria-label={`Shopping cart with ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
                className="relative p-2 text-black hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
                {/* Shopping Cart Icon (SVG) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                </svg>

                {/* Badge - only show when cart has items */}
                {itemCount > 0 && (
                    <span
                        data-testid="cart-badge"
                        className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in fade-in zoom-in duration-200"
                        aria-live="polite"
                    >
                        {itemCount > 99 ? '99+' : itemCount}
                    </span>
                )}
            </button>

            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
