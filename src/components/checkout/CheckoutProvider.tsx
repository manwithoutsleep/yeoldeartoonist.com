/**
 * Checkout Provider Component
 *
 * Provides Stripe Elements context for checkout flow.
 * Wraps checkout pages with Stripe payment form components.
 */

'use client';

import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

/**
 * Load Stripe.js with publishable key
 * This is cached by Stripe and only loads once
 */
const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export interface CheckoutProviderProps {
    /**
     * Stripe client secret from payment intent
     * If not provided, Stripe Elements won't be available
     */
    clientSecret?: string;

    /**
     * Child components to render
     */
    children: ReactNode;
}

/**
 * CheckoutProvider wraps checkout flow with Stripe Elements context.
 *
 * This component:
 * - Loads Stripe.js library
 * - Provides Stripe Elements context to children
 * - Configures Elements appearance theme
 * - Only renders Elements if clientSecret is provided
 *
 * **Usage**:
 * 1. Fetch client secret from `/api/checkout` API
 * 2. Pass client secret to CheckoutProvider
 * 3. Render PaymentForm inside this provider
 *
 * @example
 * ```tsx
 * const [clientSecret, setClientSecret] = useState<string>();
 *
 * // Fetch client secret
 * const response = await fetch('/api/checkout', {
 *   method: 'POST',
 *   body: JSON.stringify({ items, customerName, customerEmail })
 * });
 * const { clientSecret } = await response.json();
 * setClientSecret(clientSecret);
 *
 * return (
 *   <CheckoutProvider clientSecret={clientSecret}>
 *     <PaymentForm onSuccess={...} onError={...} />
 *   </CheckoutProvider>
 * );
 * ```
 */
export function CheckoutProvider({
    clientSecret,
    children,
}: CheckoutProviderProps) {
    // If no client secret, render children without Stripe Elements
    if (!clientSecret) {
        return <>{children}</>;
    }

    // Configure Stripe Elements appearance
    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#000000',
                colorBackground: '#ffffff',
                colorText: '#000000',
                colorDanger: '#df1b41',
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '4px',
            },
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            {children}
        </Elements>
    );
}
