/**
 * Payment Form Component
 *
 * Stripe Elements payment form for checkout.
 * Handles payment confirmation with Stripe.
 */

'use client';

import React, { useState, FormEvent } from 'react';
import {
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';

export interface PaymentFormProps {
    /**
     * Callback invoked when payment succeeds
     */
    onSuccess: () => void;

    /**
     * Callback invoked when payment fails
     * @param error - Error message from Stripe
     */
    onError: (error: string) => void;
}

/**
 * PaymentForm displays Stripe payment form and handles payment confirmation.
 *
 * This component:
 * - Renders Stripe PaymentElement for collecting payment details
 * - Confirms payment with Stripe when submitted
 * - Redirects to success page on successful payment
 * - Calls error handler on payment failure
 *
 * **Requirements**:
 * - Must be wrapped in Stripe Elements provider
 * - Elements provider must have a clientSecret
 *
 * @example
 * ```tsx
 * <Elements stripe={stripePromise} options={{ clientSecret }}>
 *   <PaymentForm
 *     onSuccess={() => router.push('/checkout/success')}
 *     onError={(error) => alert(error)}
 *   />
 * </Elements>
 * ```
 */
export function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Handles payment form submission
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Stripe.js hasn't loaded yet
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            // Confirm payment with Stripe
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/shoppe/checkout/success`,
                },
            });

            if (error) {
                // Payment failed - show error
                onError(error.message || 'Payment failed');
                setIsProcessing(false);
            } else {
                // Payment succeeded - Stripe will redirect to return_url
                onSuccess();
            }
        } catch (err) {
            // Unexpected error
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred';
            onError(errorMessage);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-element-container">
                <PaymentElement />
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="payment-submit-button"
                aria-busy={isProcessing}
            >
                {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}
