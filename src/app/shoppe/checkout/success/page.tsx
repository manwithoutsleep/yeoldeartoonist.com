/**
 * Checkout Success Page
 *
 * Order confirmation page displayed after successful Stripe payment.
 *
 * **Race Condition Problem:**
 * When Stripe redirects users to this success page, the webhook that creates
 * the order in our database may not have completed yet. This creates a race
 * condition where the page loads before the order exists.
 *
 * **Solution: Polling with Exponential Backoff:**
 * This page uses the `useOrderPolling` hook to poll the order API with
 * exponential backoff (1s, 2s, 4s, 8s, 16s) for up to 5 attempts (~31 seconds total).
 * This gives the webhook sufficient time to create the order while providing
 * immediate feedback to the user.
 *
 * **User Experience:**
 * - Success banner shown immediately (payment confirmed)
 * - "Loading order details..." shown while polling
 * - Order number displayed when found
 * - Friendly error message if order not found after max attempts
 * - Cart cleared automatically on mount
 *
 * **Error Handling:**
 * - Network/API errors: Stop polling, show graceful error
 * - Order not found after 5 attempts: Show message suggesting user check email
 * - Missing session_id: Skips polling (invalid checkout session)
 *
 * @see {@link useOrderPolling} for polling implementation details
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useOrderPolling } from '@/hooks/useOrderPolling';

/**
 * CheckoutSuccessContent - Inner component that uses useSearchParams
 *
 * This component handles the actual success page logic with polling for order details.
 *
 * **Polling Flow:**
 * 1. Extract `session_id` from URL query params (provided by Stripe redirect)
 * 2. Pass session_id to `useOrderPolling` hook
 * 3. Hook polls `/api/orders/by-session` endpoint with exponential backoff
 * 4. Display loading state while polling (shows "Loading order details...")
 * 5. Display order number when found
 * 6. Display friendly error if not found after 5 attempts or on API error
 *
 * **States:**
 * - loading=true: Polling in progress, show loading message
 * - order found: Display order number
 * - error (not_found): Show message suggesting user check email
 * - error (api_error): Show message that payment was successful but details unavailable
 *
 * **Side Effects:**
 * - Clears cart on mount (cleanup after successful purchase)
 * - Polling stops automatically on success or error
 * - Cleans up timeouts on unmount (no memory leaks)
 *
 * @see {@link useOrderPolling} for detailed polling implementation
 */
function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const sessionId = searchParams.get('session_id');

    // Use polling hook for order retrieval
    const { order, loading, error } = useOrderPolling(sessionId);

    // Extract order number from order object
    const orderNumber = order?.orderNumber ?? null;

    // Clear cart on mount
    useEffect(() => {
        clearCart();
    }, [clearCart]);

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
                ) : error ? (
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
                        <p className="text-yellow-800">
                            {error.type === 'not_found'
                                ? "We're still processing your order. You'll receive a confirmation email shortly."
                                : "Unable to retrieve order details right now. Don't worry - your payment was successful."}
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
 * CheckoutSuccessPage confirms successful order completion with polling strategy.
 *
 * **Features:**
 * - Success confirmation message (shown immediately)
 * - Order number with polling fallback (handles race condition)
 * - Next steps information
 * - Return to gallery link
 * - Auto-clears cart on mount
 *
 * **Flow:**
 * 1. User redirected here after successful Stripe payment
 * 2. Cart automatically cleared
 * 3. Success banner shown immediately (payment confirmed)
 * 4. Order number polled with exponential backoff (race condition mitigation)
 * 5. User can return to gallery
 *
 * **Polling Strategy:**
 * Uses `useOrderPolling` hook to handle race condition between page load
 * and webhook completion. Polls for up to ~31 seconds (5 attempts with
 * exponential backoff: 1s, 2s, 4s, 8s, 16s).
 *
 * @example
 * // User redirected from Stripe checkout
 * Navigation: /shoppe/checkout/success?session_id=cs_test_123abc
 *
 * @example
 * // Success case: Order found on first attempt
 * URL: /shoppe/checkout/success?session_id=cs_test_123
 * Result: Order #ORD-20260111-ABC123 displayed immediately
 *
 * @example
 * // Polling case: Order created after 3 seconds
 * URL: /shoppe/checkout/success?session_id=cs_test_456
 * Flow: Loading... (1s) → Loading... (2s) → Order #ORD-20260111-XYZ789 displayed
 *
 * @example
 * // Error case: Order not found after 5 attempts
 * URL: /shoppe/checkout/success?session_id=cs_test_789
 * Result: "We're still processing your order. You'll receive a confirmation email shortly."
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
