/**
 * Cart Page
 *
 * Displays the user's shopping cart with items and checkout options.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

/**
 * CartPage displays the shopping cart and allows cart management.
 *
 * Features:
 * - Empty state when cart is empty
 * - List of cart items with management controls
 * - Cart summary with totals
 * - Proceed to checkout button
 * - Continue shopping link
 * - Responsive layout
 *
 * @example
 * Navigation: /shoppe/cart
 */
export default function CartPage() {
    const { cart, getItemCount } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.items,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to create checkout session'
                );
            }

            const { url } = await response.json();

            // Redirect to Stripe Checkout
            window.location.href = url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setIsLoading(false);
        }
    };

    // Empty cart state
    if (getItemCount() === 0) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold mb-4 text-black">
                        Your Cart
                    </h1>
                    <p
                        className="text-gray-600 mb-8"
                        data-testid="empty-cart-message"
                    >
                        Your cart is empty
                    </p>
                    <Link
                        href="/shoppe"
                        data-testid="continue-shopping-link"
                        className="inline-block bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // Cart with items
    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8 text-black">
                    Your Cart
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => (
                            <CartItem key={item.artworkId} item={item} />
                        ))}
                    </div>

                    {/* Cart Summary and Actions */}
                    <div className="lg:col-span-1">
                        <CartSummary />
                        {error && (
                            <div
                                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mt-4"
                                data-testid="checkout-error"
                            >
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            data-testid="checkout-btn"
                            className="block w-full bg-black text-white text-center px-6 py-3 rounded font-semibold hover:bg-gray-800 mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading
                                ? 'Redirecting to checkout...'
                                : 'Proceed to Checkout'}
                        </button>
                        <Link
                            href="/shoppe"
                            data-testid="continue-shopping-link"
                            className="block w-full text-center px-6 py-3 mt-2 text-gray-600 hover:text-black"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
