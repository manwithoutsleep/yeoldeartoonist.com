/**
 * Checkout Cancelled Page
 *
 * Page displayed when payment is cancelled or fails.
 */

import Link from 'next/link';

/**
 * CheckoutCancelledPage handles payment cancellation/failure scenarios.
 *
 * Features:
 * - Clear cancellation message
 * - Reassurance that cart is preserved
 * - Return to cart button (primary action)
 * - Return to shop button (secondary action)
 * - Helpful guidance for next steps
 *
 * Flow:
 * 1. User cancels payment or payment fails
 * 2. Redirected here from Stripe
 * 3. Cart items preserved (not cleared)
 * 4. User can return to cart to try again or continue shopping
 *
 * @example
 * Navigation: /shoppe/checkout/cancelled
 */
export default function CheckoutCancelledPage() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            {/* Cancellation Banner */}
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-8 mb-8">
                <h1 className="text-4xl font-bold text-yellow-800 mb-4">
                    Payment Cancelled
                </h1>
                <p className="text-lg text-yellow-700">
                    Your order was not completed. No charges have been made.
                </p>
            </div>

            {/* What Happened */}
            <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">
                    What would you like to do?
                </h2>
                <p className="text-gray-700 mb-4">
                    Your cart items have been saved. You can return to your cart
                    to try again, or continue shopping.
                </p>

                <div className="space-y-3">
                    {/* Primary Action - Return to Cart */}
                    <Link
                        href="/shoppe/cart"
                        className="block w-full bg-black text-white px-6 py-3 rounded font-semibold hover:bg-gray-800"
                    >
                        Return to Cart
                    </Link>

                    {/* Secondary Action - Return to Shop */}
                    <Link
                        href="/shoppe"
                        className="block w-full bg-white text-black border-2 border-black px-6 py-3 rounded font-semibold hover:bg-gray-100"
                    >
                        Return to Shop
                    </Link>
                </div>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500">
                If you&apos;re experiencing issues with checkout, please contact
                support for assistance.
            </p>
        </div>
    );
}
