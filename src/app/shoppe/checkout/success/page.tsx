/**
 * Checkout Success Page
 *
 * Order confirmation page displayed after successful payment.
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

/**
 * CheckoutSuccessContent - Inner component that uses useSearchParams
 */
function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const sessionId = searchParams.get('session_id');
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [loading, setLoading] = useState(!!sessionId);

    // Clear cart and fetch order details after successful payment
    useEffect(() => {
        clearCart();

        if (!sessionId) {
            return;
        }

        fetch(`/api/checkout/session/${sessionId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.order) {
                    setOrderNumber(data.order.order_number);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [clearCart, sessionId]);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                {/* Success Banner */}
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold text-green-800 mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-lg text-green-700">
                        Thank you for your purchase. Your order has been
                        successfully placed.
                    </p>
                </div>

                {/* Order Number */}
                {loading ? (
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 mb-8">
                        <p className="text-gray-600 text-center">
                            Loading order details...
                        </p>
                    </div>
                ) : orderNumber ? (
                    <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
                        <h2 className="text-2xl text-black font-bold mb-4">
                            Order Number
                        </h2>
                        <p className="text-3xl font-mono text-center text-black">
                            {orderNumber}
                        </p>
                    </div>
                ) : null}

                {/* What's Next */}
                <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
                    <h2 className="text-2xl text-black font-bold mb-4">
                        What&apos;s Next?
                    </h2>
                    <ul className="text-left space-y-2 text-gray-700">
                        <li>
                            ✅ You&apos;ll receive an order confirmation email
                            shortly
                        </li>
                        <li>✅ We&apos;ll notify you when your order ships</li>
                        <li>✅ Track your order status in your email</li>
                    </ul>
                </div>

                {/* Return to Gallery */}
                <Link
                    href="/gallery"
                    className="inline-block bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800"
                >
                    Return to Gallery
                </Link>
            </div>
        </div>
    );
}

/**
 * CheckoutSuccessPage confirms successful order completion.
 *
 * Features:
 * - Success confirmation message
 * - Order details (from payment_intent query param)
 * - Next steps information
 * - Return to gallery link
 * - Auto-clears cart on mount
 *
 * Flow:
 * 1. User redirected here after successful Stripe payment
 * 2. Cart automatically cleared
 * 3. Confirmation displayed
 * 4. User can return to gallery
 *
 * @example
 * Navigation: /shoppe/checkout/success?payment_intent=pi_123
 */
export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="bg-white min-h-screen">
                    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-8">
                            <h1 className="text-4xl font-bold text-green-800">
                                Processing...
                            </h1>
                        </div>
                    </div>
                </div>
            }
        >
            <CheckoutSuccessContent />
        </Suspense>
    );
}
