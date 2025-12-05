/**
 * Checkout Page
 *
 * Main checkout page for payment processing and order completion.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutProvider } from '@/components/checkout/CheckoutProvider';

/**
 * CheckoutPage orchestrates the checkout flow.
 *
 * Features:
 * - Redirects to cart if empty
 * - Displays checkout form for customer info and payment
 * - Shows order summary
 * - Wraps payment in Stripe Elements provider
 * - Error handling with user feedback
 * - Responsive layout
 *
 * Flow:
 * 1. Check cart not empty (redirect if empty)
 * 2. Show checkout form
 * 3. User fills in details and submits
 * 4. Payment intent created
 * 5. Client secret received
 * 6. Stripe payment form displayed
 * 7. Payment confirmed
 * 8. Redirect to success page
 *
 * @example
 * Navigation: /shoppe/checkout
 */
export default function CheckoutPage() {
    const router = useRouter();
    const { getItemCount } = useCart();
    const [clientSecret, setClientSecret] = useState<string>();
    const [error, setError] = useState<string>();
    const [showPayment, setShowPayment] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (getItemCount() === 0) {
            router.push('/shoppe/cart');
        }
    }, [getItemCount, router]);

    // Don't render if cart is empty (will redirect)
    if (getItemCount() === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 py-16 text-gray-900">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">
                    Checkout
                </h1>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded mb-8">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <CheckoutProvider clientSecret={clientSecret}>
                            <CheckoutForm
                                onClientSecretReceived={(secret) => {
                                    setClientSecret(secret);
                                    setShowPayment(true);
                                }}
                                onError={setError}
                                showPayment={showPayment}
                            />
                        </CheckoutProvider>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                            Order Summary
                        </h2>
                        <CartSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}
