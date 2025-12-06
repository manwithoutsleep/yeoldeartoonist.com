/**
 * Stripe Checkout Session API Route
 *
 * Creates a Stripe Checkout session for the shopping cart.
 * Handles:
 * - Cart validation
 * - Session creation with line items
 * - Automatic tax calculation
 * - Shipping options
 * - Address collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { validateCart } from '@/lib/cart/validation';

/**
 * Constants for checkout session configuration
 */
const SHIPPING_COST_CENTS = 500; // $5.00 flat rate shipping
const ALLOWED_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
    ['US'];
const SHIPPING_DISPLAY_NAME = 'Standard Shipping';

/**
 * Checkout session request schema
 */
const CheckoutSessionSchema = z.object({
    items: z.array(
        z.object({
            artworkId: z.string().uuid(),
            title: z.string(),
            price: z.number().positive(),
            quantity: z.number().int().positive(),
            slug: z.string(),
        })
    ),
    customerEmail: z.string().email().optional(),
});

/**
 * POST /api/checkout/session
 *
 * Creates a Stripe Checkout session for the provided cart items.
 *
 * Request Body:
 * - items: Array of cart items with artworkId, title, price, quantity, slug
 * - customerEmail (optional): Pre-fill customer email in checkout
 *
 * Response:
 * - 200: { url: string } - Stripe Checkout URL to redirect to
 * - 400: { error: string, message: string, details?: any } - Validation error (details only in dev)
 * - 500: { error: string, message: string } - Server error
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/checkout/session', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     items: [
 *       { artworkId: '123', title: 'Art', price: 50, quantity: 2, slug: 'art' }
 *     ],
 *     customerEmail: 'customer@example.com'
 *   })
 * });
 * const { url } = await response.json();
 * window.location.href = url; // Redirect to Stripe Checkout
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CheckoutSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { items, customerEmail } = parsed.data;

        // Validate cart server-side
        const validatedCart = await validateCart(items);

        if (!validatedCart.isValid) {
            // Log detailed errors for debugging
            console.error('Cart validation failed:', validatedCart.errors);

            // Return user-friendly error message
            return NextResponse.json(
                {
                    error: 'Unable to process checkout',
                    message:
                        'Some items in your cart are no longer available or have changed. Please review your cart and try again.',
                    // Only include details in development mode
                    ...(process.env.NODE_ENV === 'development' && {
                        details: validatedCart.errors,
                    }),
                },
                { status: 400 }
            );
        }

        // Create Stripe Checkout Session
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            success_url: `${baseUrl}/shoppe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/shoppe/cart`,
            customer_email: customerEmail,
            line_items: validatedCart.items.map((item) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.title,
                        tax_code: 'txcd_99999999', // General - Tangible Goods (physical products)
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            })),
            // Add shipping as a separate line item
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: SHIPPING_COST_CENTS,
                            currency: 'usd',
                        },
                        display_name: SHIPPING_DISPLAY_NAME,
                    },
                },
            ],
            automatic_tax: {
                enabled: true,
            },
            shipping_address_collection: {
                allowed_countries: ALLOWED_SHIPPING_COUNTRIES,
            },
            billing_address_collection: 'required',
            metadata: {
                // Store cart data for webhook processing
                cartItems: JSON.stringify(
                    validatedCart.items.map((item) => ({
                        artworkId: item.artworkId,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                ),
            },
        });

        if (!session.url) {
            console.error(
                'Checkout session created but no URL returned:',
                session.id
            );
            return NextResponse.json(
                {
                    error: 'Failed to create checkout session',
                    message: 'No checkout URL was generated',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                message:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
